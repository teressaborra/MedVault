package com.medvault.medvault.repository;

import com.medvault.medvault.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    java.util.List<User> findByRoles(String roles);
    long countByRoles(String roles);
}
