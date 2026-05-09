package com.trafficpay.service;

import com.trafficpay.dto.request.LoginRequest;
import com.trafficpay.dto.response.AuthResponse;
import com.trafficpay.model.User;
import com.trafficpay.repository.UserRepository;
import com.trafficpay.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByBadgeNumber(request.getBadgeNumber())
                .orElseThrow(() -> new BadCredentialsException("Invalid badge number or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid badge number or password");
        }

        String token = jwtTokenProvider.generateToken(user.getBadgeNumber(), user.getRole().name());
        return new AuthResponse(token, user.getBadgeNumber(), user.getFullName(),
                user.getRole().name(), user.getDistrict());
    }
}
