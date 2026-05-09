package com.trafficpay.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class DistrictStatResponse {
    private String district;
    private long count;
    private BigDecimal totalAmount;
}
