package com.trafficpay.service;

import com.trafficpay.dto.request.ConfirmPaymentRequest;
import com.trafficpay.dto.request.InitiatePaymentRequest;
import com.trafficpay.dto.response.FineResponse;
import com.trafficpay.dto.response.PaymentResponse;
import com.trafficpay.model.Fine;
import com.trafficpay.model.Payment;
import com.trafficpay.repository.FineRepository;
import com.trafficpay.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final FineRepository fineRepository;
    private final PaymentRepository paymentRepository;
    private final FineService fineService;
    private final SmsService smsService;

    public FineResponse initiatePayment(InitiatePaymentRequest request) {
        return fineService.lookupFine(request.getReferenceNumber(), request.getCategoryCode());
    }

    public PaymentResponse confirmPayment(ConfirmPaymentRequest request) {
        Fine fine = fineRepository.findByReferenceAndCategoryCode(
                request.getReferenceNumber(), request.getCategoryCode())
                .orElseThrow(() -> new RuntimeException("Fine not found"));

        if ("PAID".equals(fine.getStatus())) throw new IllegalStateException("ALREADY_PAID");

        Payment payment = new Payment();
        payment.setFineId(fine.getId());
        payment.setReferenceNumber(fine.getReferenceNumber());
        payment.setAmount(fine.getAmount());
        payment.setPayerName(request.getPayerName());
        payment.setPayerPhone(request.getPayerPhone());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setVehicleNumber(fine.getVehicleNumber());
        payment.setDriverName(fine.getDriverName());
        payment.setCategoryDescription(fine.getCategoryDescription());
        payment.setPaidAt(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);

        fine.setStatus("PAID");
        fineRepository.save(fine);

        smsService.notifyOfficer(fine.getOfficerPhone(), fine.getReferenceNumber(),
                fine.getVehicleNumber(), fine.getAmount().toString());

        return toResponse(saved);
    }

    public PaymentResponse getReceipt(String paymentId) {
        Payment p = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return toResponse(p);
    }

    public PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .transactionId(p.getTransactionId())
                .referenceNumber(p.getReferenceNumber())
                .amount(p.getAmount())
                .payerName(p.getPayerName())
                .payerPhone(p.getPayerPhone())
                .paymentMethod(p.getPaymentMethod())
                .paidAt(p.getPaidAt())
                .vehicleNumber(p.getVehicleNumber())
                .driverName(p.getDriverName())
                .categoryDescription(p.getCategoryDescription())
                .build();
    }
}
