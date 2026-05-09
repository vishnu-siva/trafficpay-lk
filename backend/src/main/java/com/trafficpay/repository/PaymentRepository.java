package com.trafficpay.repository;

import com.trafficpay.model.Payment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paidAt BETWEEN :from AND :to")
    BigDecimal getTotalCollected(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT p FROM Payment p ORDER BY p.paidAt DESC")
    List<Payment> findRecentPayments(Pageable pageable);
}
