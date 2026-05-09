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
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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
        long paid = all.stream().filter(f -> f.getStatus() == Fine.Status.PAID).count();
        long pending = all.stream().filter(f -> f.getStatus() == Fine.Status.PENDING).count();
        long cancelled = all.stream().filter(f -> f.getStatus() == Fine.Status.CANCELLED).count();
        BigDecimal collected = paymentRepository.getTotalCollected(from, to);
        return DashboardSummaryResponse.builder()
                .totalFines(total)
                .paidFines(paid)
                .pendingFines(pending)
                .cancelledFines(cancelled)
                .totalCollected(collected != null ? collected : BigDecimal.ZERO)
                .build();
    }

    public List<DistrictStatResponse> getByDistrict(LocalDateTime from, LocalDateTime to) {
        List<Fine> fines = fineRepository.findByIssuedAtBetween(from, to);
        Map<Long, BigDecimal> paymentMap = paymentRepository.findAll().stream()
                .collect(Collectors.toMap(p -> p.getFine().getId(), Payment::getAmount));

        return fines.stream()
                .collect(Collectors.groupingBy(Fine::getDistrict))
                .entrySet().stream()
                .map(e -> {
                    long count = e.getValue().size();
                    BigDecimal total = e.getValue().stream()
                            .map(f -> paymentMap.getOrDefault(f.getId(), BigDecimal.ZERO))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new DistrictStatResponse(e.getKey(), count, total);
                })
                .collect(Collectors.toList());
    }

    public List<CategoryStatResponse> getByCategory(LocalDateTime from, LocalDateTime to, String district) {
        List<Fine> fines = fineRepository.findByIssuedAtBetween(from, to).stream()
                .filter(f -> district == null || f.getDistrict().equals(district))
                .collect(Collectors.toList());
        Map<Long, BigDecimal> paymentMap = paymentRepository.findAll().stream()
                .collect(Collectors.toMap(p -> p.getFine().getId(), Payment::getAmount));

        return fines.stream()
                .collect(Collectors.groupingBy(f -> f.getCategory().getDescription()))
                .entrySet().stream()
                .map(e -> {
                    long count = e.getValue().size();
                    BigDecimal total = e.getValue().stream()
                            .map(f -> paymentMap.getOrDefault(f.getId(), BigDecimal.ZERO))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new CategoryStatResponse(e.getKey(), count, total);
                })
                .collect(Collectors.toList());
    }

    public List<PaymentResponse> getRecentPayments() {
        return paymentRepository.findRecentPayments(PageRequest.of(0, 10))
                .stream().map(this::toPaymentResponse).collect(Collectors.toList());
    }

    public List<FineResponse> getAllFines(String district, String status) {
        return fineRepository.findByFilters(district, status)
                .stream().map(fineService::toResponse).collect(Collectors.toList());
    }

    public OfficerResponse createOfficer(CreateOfficerRequest request) {
        if (userRepository.existsByBadgeNumber(request.getBadgeNumber())) {
            throw new IllegalArgumentException("Badge number already exists");
        }
        User user = new User();
        user.setBadgeNumber(request.getBadgeNumber());
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDistrict(request.getDistrict());
        user.setStation(request.getStation());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(User.Role.OFFICER);
        User saved = userRepository.save(user);
        return toOfficerResponse(saved);
    }

    public List<OfficerResponse> getOfficers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.OFFICER)
                .map(this::toOfficerResponse)
                .collect(Collectors.toList());
    }

    private OfficerResponse toOfficerResponse(User u) {
        return new OfficerResponse(u.getId(), u.getBadgeNumber(),
                u.getFullName(), u.getDistrict(), u.getStation(), u.getPhoneNumber());
    }

    private PaymentResponse toPaymentResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .transactionId(p.getTransactionId())
                .referenceNumber(p.getFine().getReferenceNumber())
                .amount(p.getAmount())
                .payerName(p.getPayerName())
                .payerPhone(p.getPayerPhone())
                .paymentMethod(p.getPaymentMethod())
                .paidAt(p.getPaidAt())
                .vehicleNumber(p.getFine().getVehicleNumber())
                .driverName(p.getFine().getDriverName())
                .categoryDescription(p.getFine().getCategory().getDescription())
                .build();
    }
}
