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

    // Lifestyle Information
    @Column(name = "smoking_habit")
    private String smokingHabit; // NEVER, OCCASIONAL, WEEKLY, DAILY

    @Column(name = "alcohol_habit")
    private String alcoholHabit; // NEVER, OCCASIONAL, WEEKLY, DAILY

    @Column(name = "diet_type")
    private String dietType; // VEGETARIAN, NON_VEGETARIAN, VEGAN, EGGETARIAN

    @Column(name = "physical_activity")
    private String physicalActivity; // SEDENTARY, LIGHT, MODERATE, ACTIVE, VERY_ACTIVE

    @Column(name = "sleep_hours")
    private String sleepHours; // e.g., "6-7", "7-8", "8+"

    @Column(name = "stress_level")
    private String stressLevel; // LOW, MODERATE, HIGH, VERY_HIGH

    @Column(name = "sleep_quality")
    private String sleepQuality; // POOR, FAIR, GOOD, EXCELLENT

    // Current Health Data
    @Column(name = "weight")
    private Double weight; // in kg

    @Column(name = "height")
    private Double height; // in cm

    @Column(name = "bmi")
    private Double bmi;

    @Column(name = "blood_pressure_systolic")
    private Integer bloodPressureSystolic;

    @Column(name = "blood_pressure_diastolic")
    private Integer bloodPressureDiastolic;

    @Column(name = "pulse_rate")
    private Integer pulseRate;

    @Column(name = "temperature")
    private Double temperature; // in Fahrenheit

    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;

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

    // Lifestyle getters and setters
    public String getSmokingHabit() { return smokingHabit; }
    public void setSmokingHabit(String smokingHabit) { this.smokingHabit = smokingHabit; }

    public String getAlcoholHabit() { return alcoholHabit; }
    public void setAlcoholHabit(String alcoholHabit) { this.alcoholHabit = alcoholHabit; }

    public String getDietType() { return dietType; }
    public void setDietType(String dietType) { this.dietType = dietType; }

    public String getPhysicalActivity() { return physicalActivity; }
    public void setPhysicalActivity(String physicalActivity) { this.physicalActivity = physicalActivity; }

    public String getSleepHours() { return sleepHours; }
    public void setSleepHours(String sleepHours) { this.sleepHours = sleepHours; }

    public String getStressLevel() { return stressLevel; }
    public void setStressLevel(String stressLevel) { this.stressLevel = stressLevel; }

    public String getSleepQuality() { return sleepQuality; }
    public void setSleepQuality(String sleepQuality) { this.sleepQuality = sleepQuality; }

    // Health data getters and setters
    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }

    public Double getBmi() { return bmi; }
    public void setBmi(Double bmi) { this.bmi = bmi; }

    public Integer getBloodPressureSystolic() { return bloodPressureSystolic; }
    public void setBloodPressureSystolic(Integer bloodPressureSystolic) { this.bloodPressureSystolic = bloodPressureSystolic; }

    public Integer getBloodPressureDiastolic() { return bloodPressureDiastolic; }
    public void setBloodPressureDiastolic(Integer bloodPressureDiastolic) { this.bloodPressureDiastolic = bloodPressureDiastolic; }

    public Integer getPulseRate() { return pulseRate; }
    public void setPulseRate(Integer pulseRate) { this.pulseRate = pulseRate; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Integer getRespiratoryRate() { return respiratoryRate; }
    public void setRespiratoryRate(Integer respiratoryRate) { this.respiratoryRate = respiratoryRate; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
