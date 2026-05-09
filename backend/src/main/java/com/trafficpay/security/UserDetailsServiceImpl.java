package com.trafficpay.security;

import com.trafficpay.model.User;
import com.trafficpay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String badgeNumber) throws UsernameNotFoundException {
        User user = userRepository.findByBadgeNumber(badgeNumber)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + badgeNumber));
        return new org.springframework.security.core.userdetails.User(
                user.getBadgeNumber(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
