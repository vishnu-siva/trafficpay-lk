package com.trafficpay.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    private String id;
    private String fineId;
    private String referenceNumber;
    private BigDecimal amount;
    private String payerName;
    private String payerPhone;
    private String paymentMethod;
    private LocalDateTime paidAt;
    private String transactionId;
    private String vehicleNumber;
    private String driverName;
    private String categoryDescription;
}
