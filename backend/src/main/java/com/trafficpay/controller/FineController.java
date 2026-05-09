package com.trafficpay.controller;

import com.trafficpay.dto.request.CancelFineRequest;
import com.trafficpay.dto.request.IssueFineRequest;
import com.trafficpay.dto.response.FineCategoryResponse;
import com.trafficpay.dto.response.FineResponse;
import com.trafficpay.service.FineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FineController {

    private final FineService fineService;

    @GetMapping("/api/v1/fines/lookup")
    public ResponseEntity<FineResponse> lookup(@RequestParam String ref, @RequestParam String cat) {
        return ResponseEntity.ok(fineService.lookupFine(ref, cat));
    }

    @PostMapping("/api/v1/fines")
    @PreAuthorize("hasRole('OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<FineResponse> issueFine(@Valid @RequestBody IssueFineRequest request,
                                                   Authentication authentication) {
        return ResponseEntity.ok(fineService.issueFine(request, authentication.getName()));
    }

    @PatchMapping("/api/v1/fines/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FineResponse> cancelFine(@PathVariable String id,
                                                    @Valid @RequestBody CancelFineRequest request) {
        return ResponseEntity.ok(fineService.cancelFine(id, request));
    }

    @GetMapping("/api/v1/categories")
    public ResponseEntity<List<FineCategoryResponse>> getCategories() {
        return ResponseEntity.ok(fineService.getCategories());
    }
}
