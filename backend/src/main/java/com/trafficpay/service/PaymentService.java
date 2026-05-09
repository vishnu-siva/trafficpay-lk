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
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public PaymentResponse confirmPayment(ConfirmPaymentRequest request) {
        Fine fine = fineRepository.findByReferenceAndCategoryCode(
                request.getReferenceNumber(), request.getCategoryCode())
                .orElseThrow(() -> new RuntimeException("Fine not found"));

        if (fine.getStatus() == Fine.Status.PAID) {
            throw new IllegalStateException("ALREADY_PAID");
        }

        Payment payment = new Payment();
        payment.setFine(fine);
        payment.setAmount(fine.getCategory().getAmount());
        payment.setPayerName(request.getPayerName());
        payment.setPayerPhone(request.getPayerPhone());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        Payment saved = paymentRepository.save(payment);

        fine.setStatus(Fine.Status.PAID);
        fineRepository.save(fine);

        smsService.notifyOfficer(
                fine.getOfficer().getPhoneNumber(),
                fine.getReferenceNumber(),
                fine.getVehicleNumber(),
                fine.getCategory().getAmount().toString()
        );

        return toResponse(saved);
    }

    public PaymentResponse getReceipt(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return toResponse(payment);
    }

    public PaymentResponse toResponse(Payment p) {
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
