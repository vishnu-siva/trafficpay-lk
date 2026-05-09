package com.trafficpay.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private String id;
    private String transactionId;
    private String referenceNumber;
    private BigDecimal amount;
    private String payerName;
    private String payerPhone;
    private String paymentMethod;
    private LocalDateTime paidAt;
    private String vehicleNumber;
    private String driverName;
    private String categoryDescription;
}
