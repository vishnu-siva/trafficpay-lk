package com.trafficpay.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String badgeNumber;
    @NotBlank
    private String password;
}
