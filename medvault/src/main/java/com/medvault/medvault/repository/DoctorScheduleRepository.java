package com.medvault.medvault.repository;

import com.medvault.medvault.model.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {
    List<DoctorSchedule> findByDoctorUserIdOrderByDateAsc(Long doctorUserId);
}
