package com.medvault.medvault.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    private String roles;

    @Column(name = "is_approved")
    private Boolean isApproved = false;

    private String status;

    @Column(name = "first_login_required")
    private Boolean firstLoginRequired = false;

    @Column(name = "identification_id", unique = true)
    private String identificationId; // PID-xxx for patients, DID-xxx for doctors

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    @JsonIgnore
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Boolean getIsApproved() { return isApproved; }
    public void setIsApproved(Boolean isApproved) { this.isApproved = isApproved; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getFirstLoginRequired() { return firstLoginRequired; }
    public void setFirstLoginRequired(Boolean firstLoginRequired) { this.firstLoginRequired = firstLoginRequired; }

    public String getIdentificationId() { return identificationId; }
    public void setIdentificationId(String identificationId) { this.identificationId = identificationId; }

    public String getRoles() { return roles; }
    public void setRoles(String roles) { this.roles = roles; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
