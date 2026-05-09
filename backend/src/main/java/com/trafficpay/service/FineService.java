package com.trafficpay.service;

import com.trafficpay.dto.request.CancelFineRequest;
import com.trafficpay.dto.request.IssueFineRequest;
import com.trafficpay.dto.response.FineCategoryResponse;
import com.trafficpay.dto.response.FineResponse;
import com.trafficpay.model.Fine;
import com.trafficpay.model.FineCategory;
import com.trafficpay.model.User;
import com.trafficpay.repository.FineCategoryRepository;
import com.trafficpay.repository.FineRepository;
import com.trafficpay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FineService {

    private final FineRepository fineRepository;
    private final FineCategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public FineResponse lookupFine(String ref, String cat) {
        Fine fine = fineRepository.findByReferenceAndCategoryCode(ref, cat)
                .orElseThrow(() -> new RuntimeException("Fine not found"));
        if ("PAID".equals(fine.getStatus())) throw new IllegalStateException("ALREADY_PAID");
        if ("CANCELLED".equals(fine.getStatus())) throw new IllegalStateException("Fine is cancelled");
        return toResponse(fine);
    }

    public FineResponse issueFine(IssueFineRequest request, String officerBadge) {
        User officer = userRepository.findByBadgeNumber(officerBadge)
                .orElseThrow(() -> new RuntimeException("Officer not found"));
        FineCategory category = categoryRepository.findByCode(request.getCategoryCode())
                .orElseThrow(() -> new RuntimeException("Category not found: " + request.getCategoryCode()));

        Fine fine = new Fine();
        fine.setReferenceNumber(generateReference(officer.getDistrict()));
        fine.setCategoryId(category.getId());
        fine.setCategoryCode(category.getCode());
        fine.setCategoryDescription(category.getDescription());
        fine.setAmount(category.getAmount());
        fine.setOfficerId(officer.getId());
        fine.setOfficerBadge(officer.getBadgeNumber());
        fine.setOfficerName(officer.getFullName());
        fine.setOfficerPhone(officer.getPhoneNumber());
        fine.setDriverName(request.getDriverName());
        fine.setDriverNic(request.getDriverNic());
        fine.setVehicleNumber(request.getVehicleNumber().toUpperCase());
        fine.setDistrict(officer.getDistrict());
        fine.setStatus("PENDING");
        fine.setIssuedAt(LocalDateTime.now());

        return toResponse(fineRepository.save(fine));
    }

    public FineResponse cancelFine(String fineId, CancelFineRequest request) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("Fine not found"));
        if (!"PENDING".equals(fine.getStatus()))
            throw new IllegalStateException("Only PENDING fines can be cancelled");
        fine.setStatus("CANCELLED");
        fine.setCancelReason(request.getReason());
        return toResponse(fineRepository.save(fine));
    }

    public List<FineResponse> getAllFines(String district, String status) {
        return fineRepository.findByFilters(district, status)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<FineCategoryResponse> getCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> new FineCategoryResponse(c.getId(), c.getCode(), c.getDescription(), c.getAmount()))
                .collect(Collectors.toList());
    }

    private String generateReference(String district) {
        String prefix = district.substring(0, Math.min(3, district.length())).toUpperCase();
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = fineRepository.count() + 1;
        return prefix + "-" + date + "-" + String.format("%04d", count);
    }

    public FineResponse toResponse(Fine f) {
        return FineResponse.builder()
                .id(f.getId())
                .referenceNumber(f.getReferenceNumber())
                .categoryCode(f.getCategoryCode())
                .categoryDescription(f.getCategoryDescription())
                .amount(f.getAmount())
                .driverName(f.getDriverName())
                .driverNic(f.getDriverNic())
                .vehicleNumber(f.getVehicleNumber())
                .district(f.getDistrict())
                .officerName(f.getOfficerName())
                .officerBadge(f.getOfficerBadge())
                .status(f.getStatus())
                .issuedAt(f.getIssuedAt())
                .build();
    }
}
