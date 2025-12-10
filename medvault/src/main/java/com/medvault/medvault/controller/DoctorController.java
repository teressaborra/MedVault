package com.medvault.medvault.controller;

import com.medvault.medvault.model.Doctor;
import com.medvault.medvault.model.User;
import com.medvault.medvault.service.DoctorService;
import com.medvault.medvault.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctor")
@CrossOrigin(origins = "http://localhost:3000")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private UserService userService;

    // Get doctor profile by user ID
    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getDoctorProfile(@PathVariable Long userId) {
        System.out.println("=== DOCTOR PROFILE REQUEST ===");
        System.out.println("Received userId: " + userId);
        Optional<Doctor> doctor = doctorService.getDoctorByUserId(userId);
        System.out.println("Doctor found: " + doctor.isPresent());
        if (doctor.isPresent()) {
            System.out.println("Returning doctor: " + doctor.get().getFullName());
            return ResponseEntity.ok(doctor.get());
        }
        System.out.println("Doctor not found, returning error response");
        return ResponseEntity.ok(new ApiResponse(false, "Doctor profile not found"));
    }

    // Create or update doctor profile
    @PostMapping("/profile")
    public ResponseEntity<?> saveDoctorProfile(@RequestBody DoctorProfileRequest request) {
        try {
            System.out.println("Received request: " + request.getUserId());
            System.out.println("Full Name: " + request.getFullName());
            
            Optional<User> userOpt = userService.findById(request.getUserId());
            if (userOpt.isEmpty()) {
                System.out.println("User not found for ID: " + request.getUserId());
                return ResponseEntity.badRequest().body(new ApiResponse(false, "User not found"));
            }

            User user = userOpt.get();
            System.out.println("User found: " + user.getUsername());
            
            // Check if profile already exists
            Optional<Doctor> existingDoctor = doctorService.getDoctorByUserId(request.getUserId());
            Doctor doctor = existingDoctor.orElse(new Doctor());
            
            doctor.setUser(user);
            doctor.setFullName(request.getFullName());
            doctor.setSpecialization(request.getSpecialization());
            doctor.setQualification(request.getQualification());
            doctor.setYearsOfExperience(request.getYearsOfExperience());
            doctor.setLicenseNumber(request.getLicenseNumber());
            doctor.setMobileNumber(request.getMobileNumber());
            doctor.setAlternatePhone(request.getAlternatePhone());
            doctor.setAddress(request.getAddress());
            doctor.setCity(request.getCity());
            doctor.setState(request.getState());
            doctor.setPostalCode(request.getPostalCode());
            doctor.setClinicHospitalName(request.getClinicHospitalName());
            doctor.setConsultationFee(request.getConsultationFee());
            doctor.setAvailabilitySchedule(request.getAvailabilitySchedule());
            doctor.setDocumentPath(request.getDocumentPath());
            doctor.setBio(request.getBio());

            Doctor savedDoctor = doctorService.createOrUpdateDoctor(doctor);
            System.out.println("Doctor profile saved successfully");
            return ResponseEntity.ok(new ApiResponse(true, "Profile saved successfully", savedDoctor));
        } catch (Exception e) {
            System.out.println("ERROR saving doctor profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Error saving profile: " + e.getMessage()));
        }
    }

    // Get all doctors (for admin and patient search)
    @GetMapping("/all")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    // Verify doctor profile (admin only)
    @PostMapping("/profile/{userId}/verify")
    public ResponseEntity<?> verifyDoctorProfile(@PathVariable Long userId) {
        try {
            Optional<Doctor> doctorOpt = doctorService.getDoctorByUserId(userId);
            if (doctorOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Doctor profile not found"));
            }
            
            Doctor doctor = doctorOpt.get();
            doctor.setDocumentVerificationStatus("VERIFIED");
            Doctor savedDoctor = doctorService.createOrUpdateDoctor(doctor);
            
            return ResponseEntity.ok(new ApiResponse(true, "Profile verified successfully", savedDoctor));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Error verifying profile: " + e.getMessage()));
        }
    }

    // Inner classes for request/response
    static class DoctorProfileRequest {
        private Long userId;
        private String fullName;
        private String specialization;
        private String qualification;
        private Integer yearsOfExperience;
        private String licenseNumber;
        private String mobileNumber;
        private String alternatePhone;
        private String address;
        private String city;
        private String state;
        private String postalCode;
        private String clinicHospitalName;
        private Double consultationFee;
        private String availabilitySchedule;
        private String documentPath;
        private String bio;

        // Getters and Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

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

        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
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
