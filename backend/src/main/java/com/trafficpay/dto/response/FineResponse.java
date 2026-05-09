package com.trafficpay.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class FineResponse {
    private Long id;
    private String referenceNumber;
    private String categoryCode;
    private String categoryDescription;
    private BigDecimal amount;
    private String driverName;
    private String driverNic;
    private String vehicleNumber;
    private String district;
    private String officerName;
    private String officerBadge;
    private String status;
    private LocalDateTime issuedAt;
}
