package com.medvault.medvault.controller;

import com.medvault.medvault.model.DocumentAccessRequest;
import com.medvault.medvault.model.HealthDocument;
import com.medvault.medvault.model.Patient;
import com.medvault.medvault.repository.DocumentAccessRequestRepository;
import com.medvault.medvault.repository.HealthDocumentRepository;
import com.medvault.medvault.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class DocumentAccessRequestController {

    @Autowired
    private DocumentAccessRequestRepository repo;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private HealthDocumentRepository healthDocumentRepository;

    static class CreateRequest {
        public Long documentId;
        public Long patientId;
        public Long requesterId;
        public String requesterName;
        public String note;
        public String documentName;
    }

    @PostMapping("/api/document-requests")
    public ResponseEntity<?> createRequest(@RequestBody CreateRequest req) {
        System.out.println("[DocumentAccessRequestController] createRequest called: " + req);
        if (req == null || req.patientId == null) {
            Map<String,Object> m = new HashMap<>();
            m.put("success", false);
            m.put("message", "patientId required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(m);
        }
        // The frontend commonly sends a userId (the User.id) as patientId. Try finding patient by userId first.
        Optional<Patient> pOpt = patientRepository.findByUserId(req.patientId);
        if (pOpt.isEmpty()) {
            // fallback: try direct patient id
            pOpt = patientRepository.findById(req.patientId);
        }

        if (pOpt.isEmpty()) {
            Map<String,Object> m = new HashMap<>();
            m.put("success", false);
            m.put("message", "Patient not found");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(m);
        }

        DocumentAccessRequest dar = new DocumentAccessRequest();
        dar.setPatient(pOpt.get());
        dar.setRequesterId(req.requesterId);
        dar.setRequesterName(req.requesterName);
        dar.setNote(req.note);
        dar.setStatus("PENDING");

        if (req.documentId != null) {
            Optional<HealthDocument> hd = healthDocumentRepository.findById(req.documentId);
            hd.ifPresent(dar::setDocument);
        }

        DocumentAccessRequest saved = repo.save(dar);
        Map<String,Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("id", saved.getId());
        resp.put("data", saved);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/api/document-requests/patient/{patientId}")
    public ResponseEntity<?> listForPatient(@PathVariable Long patientId) {
        // patientId may be a User.id (frontend uses user.userId). Try lookup by userId first.
        Optional<Patient> pOpt = patientRepository.findByUserId(patientId);
        Long pid = null;
        if (pOpt.isPresent()) pid = pOpt.get().getId();
        else {
            // fallback: treat as patient primary id
            pid = patientId;
        }

        List<DocumentAccessRequest> list = repo.findByPatientIdOrderByCreatedAtDesc(pid);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/api/document-requests/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        Optional<DocumentAccessRequest> o = repo.findById(id);
        if (!o.isPresent()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Not found"));
        DocumentAccessRequest dar = o.get();
        dar.setStatus("APPROVED");
        repo.save(dar);
        return ResponseEntity.ok(Map.of("success", true, "data", dar));
    }

    @PostMapping("/api/document-requests/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        Optional<DocumentAccessRequest> o = repo.findById(id);
        if (!o.isPresent()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Not found"));
        DocumentAccessRequest dar = o.get();
        dar.setStatus("REJECTED");
        repo.save(dar);
        return ResponseEntity.ok(Map.of("success", true, "data", dar));
    }
}
