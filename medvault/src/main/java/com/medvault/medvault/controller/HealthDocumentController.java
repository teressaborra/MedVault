package com.medvault.medvault.controller;

import com.medvault.medvault.model.HealthDocument;
import com.medvault.medvault.model.Patient;
import com.medvault.medvault.service.PatientService;
import com.medvault.medvault.repository.HealthDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/health-documents")
@CrossOrigin(origins = "http://localhost:3000")
public class HealthDocumentController {

    @Autowired
    private HealthDocumentRepository healthDocumentRepository;

    @Autowired
    private PatientService patientService;

    // Get all documents for a patient
    @GetMapping("/patient/{userId}")
    public ResponseEntity<?> getDocumentsByPatient(@PathVariable Long userId) {
        try {
            Optional<Patient> patientOpt = patientService.getPatientByUserId(userId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.ok(List.of()); // Return empty list if no patient found
            }
            
            List<HealthDocument> documents = healthDocumentRepository.findByPatientIdOrderByDocumentDateDesc(patientOpt.get().getId());
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching documents: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Add a new document
    @PostMapping
    public ResponseEntity<?> addDocument(@RequestBody DocumentRequest request) {
        try {
            Optional<Patient> patientOpt = patientService.getPatientByUserId(request.getUserId());
            if (patientOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Patient profile not found. Please create a profile first.");
                return ResponseEntity.badRequest().body(error);
            }

            HealthDocument document = new HealthDocument();
            document.setPatient(patientOpt.get());
            document.setDocumentName(request.getDocumentName());
            document.setDocumentType(request.getDocumentType());
            document.setDocumentUrl(request.getDocumentUrl());
            document.setDocumentDate(request.getDocumentDate());
            document.setDoctorName(request.getDoctorName());
            document.setHospitalName(request.getHospitalName());
            document.setNotes(request.getNotes());

            HealthDocument savedDocument = healthDocumentRepository.save(document);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Document added successfully");
            response.put("data", savedDocument);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error adding document: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Delete a document
    @DeleteMapping("/{documentId}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long documentId) {
        try {
            if (!healthDocumentRepository.existsById(documentId)) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Document not found");
                return ResponseEntity.badRequest().body(error);
            }
            
            healthDocumentRepository.deleteById(documentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Document deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error deleting document: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Request class
    static class DocumentRequest {
        private Long userId;
        private String documentName;
        private String documentType;
        private String documentUrl;
        private LocalDate documentDate;
        private String doctorName;
        private String hospitalName;
        private String notes;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getDocumentName() { return documentName; }
        public void setDocumentName(String documentName) { this.documentName = documentName; }

        public String getDocumentType() { return documentType; }
        public void setDocumentType(String documentType) { this.documentType = documentType; }

        public String getDocumentUrl() { return documentUrl; }
        public void setDocumentUrl(String documentUrl) { this.documentUrl = documentUrl; }

        public LocalDate getDocumentDate() { return documentDate; }
        public void setDocumentDate(LocalDate documentDate) { this.documentDate = documentDate; }

        public String getDoctorName() { return doctorName; }
        public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

        public String getHospitalName() { return hospitalName; }
        public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}
