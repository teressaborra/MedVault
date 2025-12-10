package com.medvault.medvault.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "patients")
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "father_guardian_name")
    private String fatherGuardianName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String gender;

    @Column(name = "blood_group")
    private String bloodGroup;

    @Column(name = "mobile_number")
    private String mobileNumber;

    @Column(name = "alternate_phone")
    private String alternatePhone;

    private String address;
    private String city;
    private String state;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "government_id_type")
    private String governmentIdType; // AADHAR, PASSPORT, DRIVING_LICENSE

    @Column(name = "government_id_number")
    private String governmentIdNumber;

    @Column(name = "document_path")
    private String documentPath;

    @Column(name = "document_verification_status")
    private String documentVerificationStatus = "PENDING"; // PENDING, VERIFIED, REJECTED

    @Column(name = "existing_conditions")
    private String existingConditions;

    private String allergies;

    @Column(name = "current_medications")
    private String currentMedications;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
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

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getFatherGuardianName() { return fatherGuardianName; }
    public void setFatherGuardianName(String fatherGuardianName) { this.fatherGuardianName = fatherGuardianName; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getAlternatePhone() { return alternatePhone; }
    public void setAlternatePhone(String alternatePhone) { this.alternatePhone = alternatePhone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getGovernmentIdType() { return governmentIdType; }
    public void setGovernmentIdType(String governmentIdType) { this.governmentIdType = governmentIdType; }

    public String getGovernmentIdNumber() { return governmentIdNumber; }
    public void setGovernmentIdNumber(String governmentIdNumber) { this.governmentIdNumber = governmentIdNumber; }

    public String getDocumentPath() { return documentPath; }
    public void setDocumentPath(String documentPath) { this.documentPath = documentPath; }

    public String getDocumentVerificationStatus() { return documentVerificationStatus; }
    public void setDocumentVerificationStatus(String documentVerificationStatus) { this.documentVerificationStatus = documentVerificationStatus; }

    public String getExistingConditions() { return existingConditions; }
    public void setExistingConditions(String existingConditions) { this.existingConditions = existingConditions; }

    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }

    public String getCurrentMedications() { return currentMedications; }
    public void setCurrentMedications(String currentMedications) { this.currentMedications = currentMedications; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
