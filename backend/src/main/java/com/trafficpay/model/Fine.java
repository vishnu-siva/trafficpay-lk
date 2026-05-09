package com.trafficpay.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "fines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Fine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String referenceNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private FineCategory category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "officer_id", nullable = false)
    private User officer;

    @Column(nullable = false)
    private String driverName;

    @Column(nullable = false)
    private String driverNic;

    @Column(nullable = false)
    private String vehicleNumber;

    @Column(nullable = false)
    private String district;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    @Column(nullable = false)
    private LocalDateTime issuedAt;

    private String cancelReason;

    @OneToOne(mappedBy = "fine", fetch = FetchType.LAZY)
    private Payment payment;

    public enum Status {
        PENDING, PAID, CANCELLED
    }

    @PrePersist
    protected void onCreate() {
        issuedAt = LocalDateTime.now();
    }
}
