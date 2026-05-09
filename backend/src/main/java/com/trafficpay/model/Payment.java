package com.trafficpay.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "fine_id", unique = true, nullable = false)
    private Fine fine;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String payerName;

    @Column(nullable = false)
    private String payerPhone;

    @Column(nullable = false)
    private String paymentMethod;

    @Column(nullable = false)
    private LocalDateTime paidAt;

    @Column(unique = true, nullable = false)
    private String transactionId;

    @PrePersist
    protected void onCreate() {
        paidAt = LocalDateTime.now();
    }
}
