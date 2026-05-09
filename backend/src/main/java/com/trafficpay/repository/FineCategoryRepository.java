package com.trafficpay.repository;

import com.google.cloud.firestore.*;
import com.trafficpay.model.FineCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class FineCategoryRepository {

    private final Firestore firestore;
    private static final String COL = "fine_categories";

    public Optional<FineCategory> findByCode(String code) {
        try {
            QuerySnapshot snap = firestore.collection(COL)
                    .whereEqualTo("code", code).get().get();
            if (snap.isEmpty()) return Optional.empty();
            return Optional.of(toCategory(snap.getDocuments().get(0)));
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to query category", e);
        }
    }

    public List<FineCategory> findAll() {
        try {
            return firestore.collection(COL).get().get().getDocuments()
                    .stream().map(this::toCategory).collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to fetch categories", e);
        }
    }

    public long count() {
        try {
            return firestore.collection(COL).get().get().size();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to count categories", e);
        }
    }

    public FineCategory save(FineCategory cat) {
        try {
            if (cat.getId() == null) {
                DocumentReference ref = firestore.collection(COL).document();
                cat.setId(ref.getId());
            }
            firestore.collection(COL).document(cat.getId()).set(toMap(cat)).get();
            return cat;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to save category", e);
        }
    }

    private FineCategory toCategory(DocumentSnapshot d) {
        FineCategory cat = new FineCategory();
        cat.setId(d.getId());
        cat.setCode(d.getString("code"));
        cat.setDescription(d.getString("description"));
        Number amount = (Number) d.get("amount");
        cat.setAmount(amount != null ? new BigDecimal(amount.toString()) : BigDecimal.ZERO);
        return cat;
    }

    private Map<String, Object> toMap(FineCategory cat) {
        Map<String, Object> m = new HashMap<>();
        m.put("code", cat.getCode());
        m.put("description", cat.getDescription());
        m.put("amount", cat.getAmount());
        return m;
    }
}
