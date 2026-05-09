package com.trafficpay.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class CategoryStatResponse {
    private String category;
    private long count;
    private BigDecimal totalAmount;
}
