package com.medvault.medvault.repository;

import com.medvault.medvault.model.HealthDocument;
import com.medvault.medvault.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthDocumentRepository extends JpaRepository<HealthDocument, Long> {
    List<HealthDocument> findByPatientOrderByDocumentDateDesc(Patient patient);
    List<HealthDocument> findByPatientIdOrderByDocumentDateDesc(Long patientId);
    List<HealthDocument> findByPatientAndDocumentType(Patient patient, String documentType);
}
