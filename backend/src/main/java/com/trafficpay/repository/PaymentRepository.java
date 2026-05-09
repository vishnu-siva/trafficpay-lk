package com.trafficpay.repository;

import com.google.cloud.firestore.*;
import com.trafficpay.model.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class PaymentRepository {

    private final Firestore firestore;
    private static final String COL = "payments";

    public Optional<Payment> findById(String id) {
        try {
            DocumentSnapshot doc = firestore.collection(COL).document(id).get().get();
            if (!doc.exists()) return Optional.empty();
            return Optional.of(toPayment(doc));
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to fetch payment", e);
        }
    }

    public List<Payment> findAll() {
        try {
            return firestore.collection(COL).get().get().getDocuments()
                    .stream().map(this::toPayment).collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to fetch payments", e);
        }
    }

    public BigDecimal getTotalCollected(LocalDateTime from, LocalDateTime to) {
        try {
            Date fromDate = Date.from(from.atZone(ZoneId.systemDefault()).toInstant());
            Date toDate = Date.from(to.atZone(ZoneId.systemDefault()).toInstant());
            return firestore.collection(COL)
                    .whereGreaterThanOrEqualTo("paidAt", fromDate)
                    .whereLessThanOrEqualTo("paidAt", toDate)
                    .get().get().getDocuments().stream()
                    .map(d -> {
                        Number a = (Number) d.get("amount");
                        return a != null ? new BigDecimal(a.toString()) : BigDecimal.ZERO;
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to calculate total", e);
        }
    }

    public List<Payment> findRecentPayments(int limit) {
        try {
            return firestore.collection(COL)
                    .orderBy("paidAt", Query.Direction.DESCENDING)
                    .limit(limit)
                    .get().get().getDocuments()
                    .stream().map(this::toPayment).collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to fetch recent payments", e);
        }
    }

    public Payment save(Payment payment) {
        try {
            if (payment.getId() == null) {
                DocumentReference ref = firestore.collection(COL).document();
                payment.setId(ref.getId());
            }
            firestore.collection(COL).document(payment.getId()).set(toMap(payment)).get();
            return payment;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to save payment", e);
        }
    }

    private Payment toPayment(DocumentSnapshot d) {
        Payment p = new Payment();
        p.setId(d.getId());
        p.setFineId(d.getString("fineId"));
        p.setReferenceNumber(d.getString("referenceNumber"));
        Number amount = (Number) d.get("amount");
        p.setAmount(amount != null ? new BigDecimal(amount.toString()) : BigDecimal.ZERO);
        p.setPayerName(d.getString("payerName"));
        p.setPayerPhone(d.getString("payerPhone"));
        p.setPaymentMethod(d.getString("paymentMethod"));
        p.setTransactionId(d.getString("transactionId"));
        p.setVehicleNumber(d.getString("vehicleNumber"));
        p.setDriverName(d.getString("driverName"));
        p.setCategoryDescription(d.getString("categoryDescription"));
        Date paidAt = d.getDate("paidAt");
        if (paidAt != null)
            p.setPaidAt(paidAt.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
        return p;
    }

    private Map<String, Object> toMap(Payment p) {
        Map<String, Object> m = new HashMap<>();
        m.put("fineId", p.getFineId());
        m.put("referenceNumber", p.getReferenceNumber());
        m.put("amount", p.getAmount());
        m.put("payerName", p.getPayerName());
        m.put("payerPhone", p.getPayerPhone());
        m.put("paymentMethod", p.getPaymentMethod());
        m.put("transactionId", p.getTransactionId());
        m.put("vehicleNumber", p.getVehicleNumber());
        m.put("driverName", p.getDriverName());
        m.put("categoryDescription", p.getCategoryDescription());
        if (p.getPaidAt() != null)
            m.put("paidAt", Date.from(p.getPaidAt().atZone(ZoneId.systemDefault()).toInstant()));
        return m;
    }
}
