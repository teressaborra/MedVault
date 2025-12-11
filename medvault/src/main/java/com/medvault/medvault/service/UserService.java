package com.medvault.medvault.service;

import com.medvault.medvault.model.User;
import com.medvault.medvault.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(String username, String email, String plainPassword, String role) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setPasswordHash(passwordEncoder.encode(plainPassword));
        // Store role as uppercase role name (e.g. PATIENT / DOCTOR / ADMIN)
        if (role != null) {
            u.setRoles(role.toUpperCase());
        } else {
            u.setRoles("USER");
        }
        
        // Generate unique identification ID based on role
        String prefix = "PATIENT".equalsIgnoreCase(role) ? "PID" : 
                       "DOCTOR".equalsIgnoreCase(role) ? "DID" : "UID";
        long count = userRepository.countByRoles(role != null ? role.toUpperCase() : "USER");
        u.setIdentificationId(prefix + "-" + String.format("%05d", count + 1));
        
        return userRepository.save(u);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean checkPassword(User user, String plainPassword) {
        return passwordEncoder.matches(plainPassword, user.getPasswordHash());
    }

    public Optional<User> findById(Long id) { return userRepository.findById(id); }

    public java.util.List<User> findByRole(String role) { return userRepository.findByRoles(role); }

    public User setApproval(Long id, boolean approved, String status) {
        User u = userRepository.findById(id).orElseThrow(() -> new java.util.NoSuchElementException("User not found"));
        u.setIsApproved(approved);
        u.setStatus(status);
        return userRepository.save(u);
    }
}


