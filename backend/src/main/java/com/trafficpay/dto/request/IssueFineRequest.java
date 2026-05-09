package com.trafficpay.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IssueFineRequest {
    @NotBlank
    private String categoryCode;
    @NotBlank
    private String driverName;
    @NotBlank
    private String driverNic;
    @NotBlank
    private String vehicleNumber;
}
