package com.trafficpay.controller;

import com.trafficpay.dto.request.ConfirmPaymentRequest;
import com.trafficpay.dto.request.InitiatePaymentRequest;
import com.trafficpay.dto.response.FineResponse;
import com.trafficpay.dto.response.PaymentResponse;
import com.trafficpay.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<FineResponse> initiate(@Valid @RequestBody InitiatePaymentRequest request) {
        return ResponseEntity.ok(paymentService.initiatePayment(request));
    }

    @PostMapping("/confirm")
    public ResponseEntity<PaymentResponse> confirm(@Valid @RequestBody ConfirmPaymentRequest request) {
        return ResponseEntity.ok(paymentService.confirmPayment(request));
    }

    @GetMapping("/{paymentId}/receipt")
    public ResponseEntity<PaymentResponse> receipt(@PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentService.getReceipt(paymentId));
    }
}
