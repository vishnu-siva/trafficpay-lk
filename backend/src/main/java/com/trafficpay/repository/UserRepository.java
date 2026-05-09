package com.trafficpay.repository;

import com.google.cloud.firestore.*;
import com.trafficpay.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class UserRepository {

    private final Firestore firestore;
    private static final String COL = "users";

    public Optional<User> findByBadgeNumber(String badgeNumber) {
        try {
            QuerySnapshot snap = firestore.collection(COL)
                    .whereEqualTo("badgeNumber", badgeNumber).get().get();
            if (snap.isEmpty()) return Optional.empty();
            return Optional.of(toUser(snap.getDocuments().get(0)));
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to query user", e);
        }
    }

    public boolean existsByBadgeNumber(String badgeNumber) {
        return findByBadgeNumber(badgeNumber).isPresent();
    }

    public List<User> findAll() {
        try {
            return firestore.collection(COL).get().get().getDocuments()
                    .stream().map(this::toUser).collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to fetch users", e);
        }
    }

    public User save(User user) {
        try {
            if (user.getId() == null) {
                DocumentReference ref = firestore.collection(COL).document();
                user.setId(ref.getId());
            }
            firestore.collection(COL).document(user.getId()).set(toMap(user)).get();
            return user;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to save user", e);
        }
    }

    private User toUser(DocumentSnapshot d) {
        User u = new User();
        u.setId(d.getId());
        u.setBadgeNumber(d.getString("badgeNumber"));
        u.setPassword(d.getString("password"));
        u.setFullName(d.getString("fullName"));
        u.setDistrict(d.getString("district"));
        u.setStation(d.getString("station"));
        u.setPhoneNumber(d.getString("phoneNumber"));
        u.setRole(d.getString("role"));
        return u;
    }

    private Map<String, Object> toMap(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("badgeNumber", u.getBadgeNumber());
        m.put("password", u.getPassword());
        m.put("fullName", u.getFullName());
        m.put("district", u.getDistrict());
        m.put("station", u.getStation());
        m.put("phoneNumber", u.getPhoneNumber());
        m.put("role", u.getRole());
        return m;
    }
}
