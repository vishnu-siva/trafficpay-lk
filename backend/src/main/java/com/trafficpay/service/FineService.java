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
        if (fine.getStatus() == Fine.Status.PAID) {
            throw new IllegalStateException("ALREADY_PAID");
        }
        if (fine.getStatus() == Fine.Status.CANCELLED) {
            throw new IllegalStateException("Fine is cancelled");
        }
        return toResponse(fine);
    }

    public FineResponse issueFine(IssueFineRequest request, String officerBadge) {
        User officer = userRepository.findByBadgeNumber(officerBadge)
                .orElseThrow(() -> new RuntimeException("Officer not found"));
        FineCategory category = categoryRepository.findByCode(request.getCategoryCode())
                .orElseThrow(() -> new RuntimeException("Category not found: " + request.getCategoryCode()));

        Fine fine = new Fine();
        fine.setReferenceNumber(generateReference(officer.getDistrict()));
        fine.setCategory(category);
        fine.setOfficer(officer);
        fine.setDriverName(request.getDriverName());
        fine.setDriverNic(request.getDriverNic());
        fine.setVehicleNumber(request.getVehicleNumber().toUpperCase());
        fine.setDistrict(officer.getDistrict());
        fine.setStatus(Fine.Status.PENDING);

        return toResponse(fineRepository.save(fine));
    }

    public FineResponse cancelFine(Long fineId, CancelFineRequest request) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("Fine not found"));
        if (fine.getStatus() != Fine.Status.PENDING) {
            throw new IllegalStateException("Only PENDING fines can be cancelled");
        }
        fine.setStatus(Fine.Status.CANCELLED);
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

    public FineResponse toResponse(Fine fine) {
        return FineResponse.builder()
                .id(fine.getId())
                .referenceNumber(fine.getReferenceNumber())
                .categoryCode(fine.getCategory().getCode())
                .categoryDescription(fine.getCategory().getDescription())
                .amount(fine.getCategory().getAmount())
                .driverName(fine.getDriverName())
                .driverNic(fine.getDriverNic())
                .vehicleNumber(fine.getVehicleNumber())
                .district(fine.getDistrict())
                .officerName(fine.getOfficer().getFullName())
                .officerBadge(fine.getOfficer().getBadgeNumber())
                .status(fine.getStatus().name())
                .issuedAt(fine.getIssuedAt())
                .build();
    }
}
