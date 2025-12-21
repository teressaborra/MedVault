package com.medvault.medvault.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "doctor_schedules")
public class DoctorSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // store the doctor's user id (matches Doctor.user.id)
    @Column(name = "doctor_user_id")
    private Long doctorUserId;

    @Column(name = "doctor_name")
    private String doctorName;

    private String specialization;

    private LocalDate date;

    @Column(columnDefinition = "text")
    private String slotsJson; // JSON array of slots {id,time,active}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDoctorUserId() { return doctorUserId; }
    public void setDoctorUserId(Long doctorUserId) { this.doctorUserId = doctorUserId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getSlotsJson() { return slotsJson; }
    public void setSlotsJson(String slotsJson) { this.slotsJson = slotsJson; }
}
