package com.medvault.medvault.controller;

import com.medvault.medvault.model.Patient;
import com.medvault.medvault.model.User;
import com.medvault.medvault.service.PatientService;
import com.medvault.medvault.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/patient")
@CrossOrigin(origins = "http://localhost:3000")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private UserService userService;

    // Get patient profile by user ID
    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getPatientProfile(@PathVariable Long userId) {
        System.out.println("=== PATIENT PROFILE REQUEST ===");
        System.out.println("Received userId: " + userId);
        Optional<Patient> patient = patientService.getPatientByUserId(userId);
        System.out.println("Patient found: " + patient.isPresent());
        if (patient.isPresent()) {
            System.out.println("Returning patient: " + patient.get().getFullName());
            return ResponseEntity.ok(patient.get());
        }
        System.out.println("Patient not found, returning error response");
        return ResponseEntity.ok(new ApiResponse(false, "Patient profile not found"));
    }

    // Create or update patient profile
    @PostMapping("/profile")
    public ResponseEntity<?> savePatientProfile(@RequestBody PatientProfileRequest request) {
        try {
            Optional<User> userOpt = userService.findById(request.getUserId());
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "User not found"));
            }

            User user = userOpt.get();
            
            // Check if profile already exists
            Optional<Patient> existingPatient = patientService.getPatientByUserId(request.getUserId());
            Patient patient = existingPatient.orElse(new Patient());
            
            patient.setUser(user);
            patient.setFullName(request.getFullName());
            patient.setFatherGuardianName(request.getFatherGuardianName());
            patient.setDateOfBirth(request.getDateOfBirth());
            patient.setGender(request.getGender());
            patient.setBloodGroup(request.getBloodGroup());
            patient.setMobileNumber(request.getMobileNumber());
            patient.setAlternatePhone(request.getAlternatePhone());
            patient.setAddress(request.getAddress());
            patient.setCity(request.getCity());
            patient.setState(request.getState());
            patient.setPostalCode(request.getPostalCode());
            patient.setGovernmentIdType(request.getGovernmentIdType());
            patient.setGovernmentIdNumber(request.getGovernmentIdNumber());
            patient.setDocumentPath(request.getDocumentPath());
            patient.setExistingConditions(request.getExistingConditions());
            patient.setAllergies(request.getAllergies());
            patient.setCurrentMedications(request.getCurrentMedications());

            Patient savedPatient = patientService.createOrUpdatePatient(patient);
            return ResponseEntity.ok(new ApiResponse(true, "Profile saved successfully", savedPatient));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Error saving profile: " + e.getMessage()));
        }
    }

    // Get all patients (for admin)
    @GetMapping("/all")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    // Verify patient profile (admin only)
    @PostMapping("/profile/{userId}/verify")
    public ResponseEntity<?> verifyPatientProfile(@PathVariable Long userId) {
        try {
            Optional<Patient> patientOpt = patientService.getPatientByUserId(userId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Patient profile not found"));
            }
            
            Patient patient = patientOpt.get();
            patient.setDocumentVerificationStatus("VERIFIED");
            Patient savedPatient = patientService.createOrUpdatePatient(patient);
            
            return ResponseEntity.ok(new ApiResponse(true, "Profile verified successfully", savedPatient));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Error verifying profile: " + e.getMessage()));
        }
    }

    // Inner classes for request/response
    static class PatientProfileRequest {
        private Long userId;
        private String fullName;
        private String fatherGuardianName;
        private java.time.LocalDate dateOfBirth;
        private String gender;
        private String bloodGroup;
        private String mobileNumber;
        private String alternatePhone;
        private String address;
        private String city;
        private String state;
        private String postalCode;
        private String governmentIdType;
        private String governmentIdNumber;
        private String documentPath;
        private String existingConditions;
        private String allergies;
        private String currentMedications;

        // Getters and Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getFatherGuardianName() { return fatherGuardianName; }
        public void setFatherGuardianName(String fatherGuardianName) { this.fatherGuardianName = fatherGuardianName; }

        public java.time.LocalDate getDateOfBirth() { return dateOfBirth; }
        public void setDateOfBirth(java.time.LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

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

        public String getExistingConditions() { return existingConditions; }
        public void setExistingConditions(String existingConditions) { this.existingConditions = existingConditions; }

        public String getAllergies() { return allergies; }
        public void setAllergies(String allergies) { this.allergies = allergies; }

        public String getCurrentMedications() { return currentMedications; }
        public void setCurrentMedications(String currentMedications) { this.currentMedications = currentMedications; }
    }

    static class ApiResponse {
        private boolean success;
        private String message;
        private Object data;

        public ApiResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public ApiResponse(boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public Object getData() { return data; }
    }
}
