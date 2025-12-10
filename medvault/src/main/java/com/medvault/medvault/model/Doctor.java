package com.medvault.medvault.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "doctors")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "full_name")
    private String fullName;

    private String specialization;

    private String qualification;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "license_number")
    private String licenseNumber;

    @Column(name = "mobile_number")
    private String mobileNumber;

    @Column(name = "alternate_phone")
    private String alternatePhone;

    private String address;
    private String city;
    private String state;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "clinic_hospital_name")
    private String clinicHospitalName;

    @Column(name = "consultation_fee")
    private Double consultationFee;

    @Column(name = "availability_schedule", length = 1000)
    private String availabilitySchedule; // JSON or text format

    @Column(name = "document_path")
    private String documentPath; // Medical license/degree certificate

    @Column(name = "document_verification_status")
    private String documentVerificationStatus = "PENDING"; // PENDING, VERIFIED, REJECTED

    @Column(length = 1000)
    private String bio;

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

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

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

    public String getClinicHospitalName() { return clinicHospitalName; }
    public void setClinicHospitalName(String clinicHospitalName) { this.clinicHospitalName = clinicHospitalName; }

    public Double getConsultationFee() { return consultationFee; }
    public void setConsultationFee(Double consultationFee) { this.consultationFee = consultationFee; }

    public String getAvailabilitySchedule() { return availabilitySchedule; }
    public void setAvailabilitySchedule(String availabilitySchedule) { this.availabilitySchedule = availabilitySchedule; }

    public String getDocumentPath() { return documentPath; }
    public void setDocumentPath(String documentPath) { this.documentPath = documentPath; }

    public String getDocumentVerificationStatus() { return documentVerificationStatus; }
    public void setDocumentVerificationStatus(String documentVerificationStatus) { this.documentVerificationStatus = documentVerificationStatus; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
