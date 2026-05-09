package com.trafficpay.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String id;
    private String badgeNumber;
    private String password;
    private String fullName;
    private String district;
    private String station;
    private String phoneNumber;
    private String role; // OFFICER or ADMIN
}
