package com.medvault.medvault.repository;

import com.medvault.medvault.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientUserIdOrderByCreatedAtDesc(Long patientUserId);
    List<Appointment> findByDoctorUserIdOrderByCreatedAtDesc(Long doctorUserId);
}
