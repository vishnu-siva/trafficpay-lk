package com.trafficpay.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OfficerResponse {
    private String id;
    private String badgeNumber;
    private String fullName;
    private String district;
    private String station;
    private String phoneNumber;
}
