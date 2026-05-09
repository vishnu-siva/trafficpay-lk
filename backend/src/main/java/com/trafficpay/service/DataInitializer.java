package com.trafficpay.service;

import com.trafficpay.model.FineCategory;
import com.trafficpay.model.User;
import com.trafficpay.repository.FineCategoryRepository;
import com.trafficpay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FineCategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createAdminIfAbsent();
        createSampleOfficerIfAbsent();
        createCategoriesIfAbsent();
    }

    private void createAdminIfAbsent() {
        if (!userRepository.existsByBadgeNumber("ADMIN001")) {
            User admin = new User();
            admin.setBadgeNumber("ADMIN001");
            admin.setFullName("System Admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setDistrict("Colombo");
            admin.setStation("HQ");
            admin.setPhoneNumber("+94771234567");
            admin.setRole("ADMIN");
            userRepository.save(admin);
            log.info("Admin created — badge: ADMIN001, password: admin123");
        }
    }

    private void createSampleOfficerIfAbsent() {
        if (!userRepository.existsByBadgeNumber("OFF001")) {
            User officer = new User();
            officer.setBadgeNumber("OFF001");
            officer.setFullName("Kamal Perera");
            officer.setPassword(passwordEncoder.encode("officer123"));
            officer.setDistrict("Colombo");
            officer.setStation("Wellawatte");
            officer.setPhoneNumber("+94777654321");
            officer.setRole("OFFICER");
            userRepository.save(officer);
            log.info("Sample officer created — badge: OFF001, password: officer123");
        }
    }

    private void createCategoriesIfAbsent() {
        if (categoryRepository.count() == 0) {
            save("SPEED_OVER_100",  "Exceeding speed limit over 100 km/h",  5000);
            save("SPEED_OVER_70",   "Exceeding speed limit over 70 km/h",   3000);
            save("NO_HELMET",       "Riding without helmet",                 2500);
            save("NO_SEATBELT",     "Driving without seatbelt",              2000);
            save("PHONE_DRIVING",   "Using mobile phone while driving",      3000);
            save("DRUNK_DRIVING",   "Driving under influence of alcohol",   25000);
            save("WRONG_LANE",      "Wrong lane driving",                    2000);
            save("NO_LICENSE",      "Driving without a valid license",      10000);
            save("SIGNAL_VIOLATION","Traffic signal violation",              2500);
            save("OVERLOADING",     "Vehicle overloading",                   5000);
            log.info("10 fine categories initialized");
        }
    }

    private void save(String code, String description, int amount) {
        FineCategory cat = new FineCategory();
        cat.setCode(code);
        cat.setDescription(description);
        cat.setAmount(new BigDecimal(amount));
        categoryRepository.save(cat);
    }
}
