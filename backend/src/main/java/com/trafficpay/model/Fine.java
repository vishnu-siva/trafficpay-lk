package com.trafficpay.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Fine {
    private String id;
    private String referenceNumber;

    // Category fields (denormalized)
    private String categoryId;
    private String categoryCode;
    private String categoryDescription;
    private BigDecimal amount;

    // Officer fields (denormalized)
    private String officerId;
    private String officerBadge;
    private String officerName;
    private String officerPhone;

    private String driverName;
    private String driverNic;
    private String vehicleNumber;
    private String district;
    private String status; // PENDING, PAID, CANCELLED
    private String cancelReason;
    private LocalDateTime issuedAt;
}
