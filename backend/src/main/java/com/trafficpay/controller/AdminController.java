package com.trafficpay.controller;

import com.trafficpay.dto.request.CreateOfficerRequest;
import com.trafficpay.dto.response.*;
import com.trafficpay.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        if (from == null) from = LocalDateTime.now().minusMonths(1);
        if (to == null) to = LocalDateTime.now();
        return ResponseEntity.ok(adminService.getSummary(from, to));
    }

    @GetMapping("/dashboard/by-district")
    public ResponseEntity<List<DistrictStatResponse>> getByDistrict(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        if (from == null) from = LocalDateTime.now().minusMonths(1);
        if (to == null) to = LocalDateTime.now();
        return ResponseEntity.ok(adminService.getByDistrict(from, to));
    }

    @GetMapping("/dashboard/by-category")
    public ResponseEntity<List<CategoryStatResponse>> getByCategory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) String district) {
        if (from == null) from = LocalDateTime.now().minusMonths(1);
        if (to == null) to = LocalDateTime.now();
        return ResponseEntity.ok(adminService.getByCategory(from, to, district));
    }

    @GetMapping("/dashboard/recent-payments")
    public ResponseEntity<List<PaymentResponse>> getRecentPayments() {
        return ResponseEntity.ok(adminService.getRecentPayments());
    }

    @GetMapping("/fines")
    public ResponseEntity<List<FineResponse>> getAdminFines(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getAllFines(district, status));
    }

    @GetMapping("/officers")
    public ResponseEntity<List<OfficerResponse>> getOfficers() {
        return ResponseEntity.ok(adminService.getOfficers());
    }

    @PostMapping("/officers")
    public ResponseEntity<OfficerResponse> createOfficer(@Valid @RequestBody CreateOfficerRequest request) {
        return ResponseEntity.ok(adminService.createOfficer(request));
    }
}
