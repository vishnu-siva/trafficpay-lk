package com.trafficpay.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateOfficerRequest {
    @NotBlank
    private String badgeNumber;
    @NotBlank
    private String fullName;
    @NotBlank
    private String password;
    @NotBlank
    private String district;
    private String station;
    @NotBlank
    private String phoneNumber;
}
