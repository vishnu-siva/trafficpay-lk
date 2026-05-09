package com.trafficpay.repository;

import com.trafficpay.model.Fine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FineRepository extends JpaRepository<Fine, Long> {

    @Query("SELECT f FROM Fine f WHERE f.referenceNumber = :ref AND f.category.code = :cat")
    Optional<Fine> findByReferenceAndCategoryCode(@Param("ref") String ref, @Param("cat") String cat);

    List<Fine> findByIssuedAtBetween(LocalDateTime from, LocalDateTime to);

    @Query("SELECT f FROM Fine f WHERE " +
           "(:district IS NULL OR f.district = :district) AND " +
           "(:status IS NULL OR CAST(f.status AS string) = :status)")
    List<Fine> findByFilters(@Param("district") String district, @Param("status") String status);
}
