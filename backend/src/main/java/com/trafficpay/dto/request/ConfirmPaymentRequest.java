package com.trafficpay.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConfirmPaymentRequest {
    @NotBlank
    private String referenceNumber;
    @NotBlank
    private String categoryCode;
    @NotBlank
    private String payerName;
    @NotBlank
    private String payerPhone;
    @NotBlank
    private String paymentMethod;
}
