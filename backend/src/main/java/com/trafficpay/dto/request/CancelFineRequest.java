package com.trafficpay.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CancelFineRequest {
    @NotBlank
    private String reason;
}
