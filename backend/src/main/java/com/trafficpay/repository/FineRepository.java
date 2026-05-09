package com.trafficpay.repository;

import com.google.cloud.firestore.*;
import com.trafficpay.model.Fine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class FineRepository {

    private final Firestore firestore;
    private static final String COL = "fines";

    public Optional<Fine> findByReferenceAndCategoryCode(String ref, String cat) {
        try {
            QuerySnapshot snap = firestore.collection(COL)
                    .whereEqualTo("referenceNumber", ref)
                    .whereEqualTo("categoryCode", cat)
                    .get().get();
            if (snap.isEmpty()) return Optional.empty();
            return Optional.of(toFine(snap.getDocuments().get(0)));
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to query fine", e);
        }
    }

    public Optional<Fine> findById(String id) {
        try {
            DocumentSnapshot doc = firestore.collection(COL).document(id).get().get();
            if (!doc.exists()) return Optional.empty();
            return Optional.of(toFine(doc));
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to fetch fine", e);
        }
    }

    public List<Fine> findAll() {
        try {
            return firestore.collection(COL).get().get().getDocuments()
                    .stream().map(this::toFine).collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to fetch fines", e);
        }
    }

    public List<Fine> findByIssuedAtBetween(LocalDateTime from, LocalDateTime to) {
        try {
            Date fromDate = Date.from(from.atZone(ZoneId.systemDefault()).toInstant());
            Date toDate = Date.from(to.atZone(ZoneId.systemDefault()).toInstant());
            return firestore.collection(COL)
                    .whereGreaterThanOrEqualTo("issuedAt", fromDate)
                    .whereLessThanOrEqualTo("issuedAt", toDate)
                    .get().get().getDocuments()
                    .stream().map(this::toFine).collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to query fines by date", e);
        }
    }

    public List<Fine> findByFilters(String district, String status) {
        return findAll().stream()
                .filter(f -> district == null || district.isEmpty() || district.equals(f.getDistrict()))
                .filter(f -> status == null || status.isEmpty() || status.equals(f.getStatus()))
                .collect(Collectors.toList());
    }

    public long count() {
        try {
            return firestore.collection(COL).get().get().size();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to count fines", e);
        }
    }

    public Fine save(Fine fine) {
        try {
            if (fine.getId() == null) {
                DocumentReference ref = firestore.collection(COL).document();
                fine.setId(ref.getId());
            }
            firestore.collection(COL).document(fine.getId()).set(toMap(fine)).get();
            return fine;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to save fine", e);
        }
    }

    private Fine toFine(DocumentSnapshot d) {
        Fine f = new Fine();
        f.setId(d.getId());
        f.setReferenceNumber(d.getString("referenceNumber"));
        f.setCategoryId(d.getString("categoryId"));
        f.setCategoryCode(d.getString("categoryCode"));
        f.setCategoryDescription(d.getString("categoryDescription"));
        Number amount = (Number) d.get("amount");
        f.setAmount(amount != null ? new BigDecimal(amount.toString()) : BigDecimal.ZERO);
        f.setOfficerId(d.getString("officerId"));
        f.setOfficerBadge(d.getString("officerBadge"));
        f.setOfficerName(d.getString("officerName"));
        f.setOfficerPhone(d.getString("officerPhone"));
        f.setDriverName(d.getString("driverName"));
        f.setDriverNic(d.getString("driverNic"));
        f.setVehicleNumber(d.getString("vehicleNumber"));
        f.setDistrict(d.getString("district"));
        f.setStatus(d.getString("status"));
        f.setCancelReason(d.getString("cancelReason"));
        Date issuedAt = d.getDate("issuedAt");
        if (issuedAt != null)
            f.setIssuedAt(issuedAt.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
        return f;
    }

    private Map<String, Object> toMap(Fine f) {
        Map<String, Object> m = new HashMap<>();
        m.put("referenceNumber", f.getReferenceNumber());
        m.put("categoryId", f.getCategoryId());
        m.put("categoryCode", f.getCategoryCode());
        m.put("categoryDescription", f.getCategoryDescription());
        m.put("amount", f.getAmount());
        m.put("officerId", f.getOfficerId());
        m.put("officerBadge", f.getOfficerBadge());
        m.put("officerName", f.getOfficerName());
        m.put("officerPhone", f.getOfficerPhone());
        m.put("driverName", f.getDriverName());
        m.put("driverNic", f.getDriverNic());
        m.put("vehicleNumber", f.getVehicleNumber());
        m.put("district", f.getDistrict());
        m.put("status", f.getStatus());
        m.put("cancelReason", f.getCancelReason());
        if (f.getIssuedAt() != null)
            m.put("issuedAt", Date.from(f.getIssuedAt().atZone(ZoneId.systemDefault()).toInstant()));
        return m;
    }
}
