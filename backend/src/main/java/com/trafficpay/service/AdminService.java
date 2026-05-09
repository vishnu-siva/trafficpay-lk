package com.trafficpay.service;

import com.trafficpay.dto.request.CreateOfficerRequest;
import com.trafficpay.dto.response.*;
import com.trafficpay.model.Fine;
import com.trafficpay.model.Payment;
import com.trafficpay.model.User;
import com.trafficpay.repository.FineRepository;
import com.trafficpay.repository.PaymentRepository;
import com.trafficpay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final FineRepository fineRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FineService fineService;

    public DashboardSummaryResponse getSummary(LocalDateTime from, LocalDateTime to) {
        List<Fine> all = fineRepository.findAll();
        long total = all.size();
        long paid = all.stream().filter(f -> "PAID".equals(f.getStatus())).count();
        long pending = all.stream().filter(f -> "PENDING".equals(f.getStatus())).count();
        long cancelled = all.stream().filter(f -> "CANCELLED".equals(f.getStatus())).count();
        BigDecimal collected = paymentRepository.getTotalCollected(from, to);
        return DashboardSummaryResponse.builder()
                .totalFines(total).paidFines(paid).pendingFines(pending)
                .cancelledFines(cancelled)
                .totalCollected(collected != null ? collected : BigDecimal.ZERO)
                .build();
    }

    public List<DistrictStatResponse> getByDistrict(LocalDateTime from, LocalDateTime to) {
        List<Fine> fines = fineRepository.findByIssuedAtBetween(from, to);
        List<Payment> payments = paymentRepository.findAll();

        return fines.stream()
                .collect(Collectors.groupingBy(Fine::getDistrict))
                .entrySet().stream()
                .map(e -> {
                    long count = e.getValue().size();
                    BigDecimal total = payments.stream()
                            .filter(p -> e.getValue().stream().anyMatch(f -> f.getId().equals(p.getFineId())))
                            .map(Payment::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new DistrictStatResponse(e.getKey(), count, total);
                })
                .collect(Collectors.toList());
    }

    public List<CategoryStatResponse> getByCategory(LocalDateTime from, LocalDateTime to, String district) {
        List<Fine> fines = fineRepository.findByIssuedAtBetween(from, to).stream()
                .filter(f -> district == null || district.isEmpty() || district.equals(f.getDistrict()))
                .collect(Collectors.toList());
        List<Payment> payments = paymentRepository.findAll();

        return fines.stream()
                .collect(Collectors.groupingBy(Fine::getCategoryDescription))
                .entrySet().stream()
                .map(e -> {
                    long count = e.getValue().size();
                    BigDecimal total = payments.stream()
                            .filter(p -> e.getValue().stream().anyMatch(f -> f.getId().equals(p.getFineId())))
                            .map(Payment::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new CategoryStatResponse(e.getKey(), count, total);
                })
                .collect(Collectors.toList());
    }

    public List<PaymentResponse> getRecentPayments() {
        return paymentRepository.findRecentPayments(10).stream()
                .map(this::toPaymentResponse).collect(Collectors.toList());
    }

    public List<FineResponse> getAllFines(String district, String status) {
        return fineRepository.findByFilters(district, status)
                .stream().map(fineService::toResponse).collect(Collectors.toList());
    }

    public OfficerResponse createOfficer(CreateOfficerRequest request) {
        if (userRepository.existsByBadgeNumber(request.getBadgeNumber()))
            throw new IllegalArgumentException("Badge number already exists");
        User user = new User();
        user.setBadgeNumber(request.getBadgeNumber());
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDistrict(request.getDistrict());
        user.setStation(request.getStation());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole("OFFICER");
        User saved = userRepository.save(user);
        return toOfficerResponse(saved);
    }

    public List<OfficerResponse> getOfficers() {
        return userRepository.findAll().stream()
                .filter(u -> "OFFICER".equals(u.getRole()))
                .map(this::toOfficerResponse).collect(Collectors.toList());
    }

    private OfficerResponse toOfficerResponse(User u) {
        return new OfficerResponse(u.getId(), u.getBadgeNumber(),
                u.getFullName(), u.getDistrict(), u.getStation(), u.getPhoneNumber());
    }

    private PaymentResponse toPaymentResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId()).transactionId(p.getTransactionId())
                .referenceNumber(p.getReferenceNumber()).amount(p.getAmount())
                .payerName(p.getPayerName()).payerPhone(p.getPayerPhone())
                .paymentMethod(p.getPaymentMethod()).paidAt(p.getPaidAt())
                .vehicleNumber(p.getVehicleNumber()).driverName(p.getDriverName())
                .categoryDescription(p.getCategoryDescription()).build();
    }
}
