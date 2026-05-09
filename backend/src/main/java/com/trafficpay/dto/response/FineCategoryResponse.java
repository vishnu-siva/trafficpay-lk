package com.trafficpay.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class FineCategoryResponse {
    private Long id;
    private String code;
    private String description;
    private BigDecimal amount;
}
