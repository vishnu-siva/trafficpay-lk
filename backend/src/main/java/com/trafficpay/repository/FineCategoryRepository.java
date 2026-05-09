package com.trafficpay.repository;

import com.trafficpay.model.FineCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FineCategoryRepository extends JpaRepository<FineCategory, Long> {
    Optional<FineCategory> findByCode(String code);
}
