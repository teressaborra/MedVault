package com.medvault.medvault.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_user_id")
    private Long patientUserId;

    @Column(name = "doctor_user_id")
    private Long doctorUserId;

    @Column(name = "doctor_name")
    private String doctorName;

    private String date; // YYYY-MM-DD

    @Column(name = "slot_time")
    private String slotTime; // e.g., 18:00-18:30

    @Column(name = "schedule_id")
    private Long scheduleId;

    @Column(name = "slot_id")
    private String slotId;

    private String status;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPatientUserId() { return patientUserId; }
    public void setPatientUserId(Long patientUserId) { this.patientUserId = patientUserId; }

    public Long getDoctorUserId() { return doctorUserId; }
    public void setDoctorUserId(Long doctorUserId) { this.doctorUserId = doctorUserId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getSlotTime() { return slotTime; }
    public void setSlotTime(String slotTime) { this.slotTime = slotTime; }

    public Long getScheduleId() { return scheduleId; }
    public void setScheduleId(Long scheduleId) { this.scheduleId = scheduleId; }

    public String getSlotId() { return slotId; }
    public void setSlotId(String slotId) { this.slotId = slotId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
}
