package com.trafficpay.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FineCategory {
    private String id;
    private String code;
    private String description;
    private BigDecimal amount;
}
