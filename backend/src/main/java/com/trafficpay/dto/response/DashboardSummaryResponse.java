package com.trafficpay.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class DashboardSummaryResponse {
    private long totalFines;
    private long paidFines;
    private long pendingFines;
    private long cancelledFines;
    private BigDecimal totalCollected;
}
