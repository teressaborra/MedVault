package com.medvault.medvault.repository;

import com.medvault.medvault.model.DocumentAccessRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentAccessRequestRepository extends JpaRepository<DocumentAccessRequest, Long> {
    List<DocumentAccessRequest> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
