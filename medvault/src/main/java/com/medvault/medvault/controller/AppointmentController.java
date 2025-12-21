package com.medvault.medvault.controller;

import com.medvault.medvault.model.Appointment;
import com.medvault.medvault.model.DoctorSchedule;
import com.medvault.medvault.repository.AppointmentRepository;
import com.medvault.medvault.repository.DoctorScheduleRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.time.Instant;
import java.time.format.DateTimeParseException;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorScheduleRepository scheduleRepository;

    @Autowired
    private EntityManager em;

    private final ObjectMapper mapper = new ObjectMapper();

    static class CreateReq {
        public Long scheduleId;
        public String slotId;
        public Long patientUserId;
        public Long doctorUserId;
        public String doctorName;
        public String date;
        public String slotTime;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createAppointment(@RequestBody CreateReq req) {
        try {
            // If scheduleId provided, lock the schedule row for update
            DoctorSchedule schedule = null;
            List<Map<String,Object>> slots = null;
            if (req.scheduleId != null) {
                schedule = em.find(DoctorSchedule.class, req.scheduleId, LockModeType.PESSIMISTIC_WRITE);
                if (schedule == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Schedule not found"));
                slots = mapper.readValue(schedule.getSlotsJson(), new TypeReference<List<Map<String,Object>>>(){});
                // find the slot
                boolean found = false;
                for (Map<String,Object> slot : slots) {
                    Object id = slot.get("id");
                    if (id != null && id.toString().equals(req.slotId)) {
                        // check availability
                        Boolean active = (Boolean) slot.getOrDefault("active", true);
                        String reservedUntil = (String) slot.get("reservedUntil");
                        if (!active) {
                            return ResponseEntity.status(409).body(Map.of("success", false, "message", "Slot not available"));
                        }
                        if (reservedUntil != null) {
                            // if reservedUntil in future, reject
                                try {
                                    Instant ru = Instant.parse(reservedUntil);
                                    if (ru.isAfter(Instant.now())) {
                                        return ResponseEntity.status(409).body(Map.of("success", false, "message", "Slot temporarily reserved"));
                                    }
                                } catch (DateTimeParseException ex) {
                                    // ignore parse errors
                                }
                        }
                        // mark inactive (booked)
                        slot.put("active", false);
                        slot.remove("reservedUntil");
                        slot.remove("reservedBy");
                        found = true;
                        break;
                    }
                }
                if (!found) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Slot not found"));
                schedule.setSlotsJson(mapper.writeValueAsString(slots));
                scheduleRepository.save(schedule);
            }

            // create appointment
            Appointment appt = new Appointment();
            appt.setPatientUserId(req.patientUserId);
            appt.setDoctorUserId(req.doctorUserId);
            appt.setDoctorName(req.doctorName);
            appt.setDate(req.date);
            appt.setSlotTime(req.slotTime);
            appt.setStatus("CONFIRMED");
            appt.setScheduleId(req.scheduleId);
            appt.setSlotId(req.slotId);
            Appointment saved = appointmentRepository.save(appt);

            return ResponseEntity.ok(Map.of("success", true, "data", saved));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Reserve a slot for short TTL (seconds)
    @PostMapping("/reserve/{scheduleId}/{slotId}")
    @Transactional
    public ResponseEntity<?> reserveSlot(@PathVariable Long scheduleId, @PathVariable String slotId, @RequestBody Map<String,Object> body) {
        try {
            Long patientUserId = body.get("patientUserId") == null ? null : Long.valueOf(body.get("patientUserId").toString());
            Integer ttl = body.get("ttl") == null ? 300 : Integer.valueOf(body.get("ttl").toString());
            DoctorSchedule schedule = em.find(DoctorSchedule.class, scheduleId, LockModeType.PESSIMISTIC_WRITE);
            if (schedule == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Schedule not found"));
            List<Map<String,Object>> slots = mapper.readValue(schedule.getSlotsJson(), new TypeReference<List<Map<String,Object>>>(){});
            boolean found = false;
            for (Map<String,Object> slot : slots) {
                Object id = slot.get("id");
                if (id != null && id.toString().equals(slotId)) {
                    Boolean active = (Boolean) slot.getOrDefault("active", true);
                    String reservedUntil = (String) slot.get("reservedUntil");
                    if (!active) return ResponseEntity.status(409).body(Map.of("success", false, "message", "Slot not available"));
                    if (reservedUntil != null) {
                        try { Instant ru = Instant.parse(reservedUntil); if (ru.isAfter(Instant.now())) return ResponseEntity.status(409).body(Map.of("success", false, "message", "Already reserved")); } catch(Exception ex) {}
                    }
                    Instant until = Instant.now().plusSeconds(ttl.longValue());
                    String untilIso = until.toString();
                    slot.put("reservedUntil", untilIso);
                    slot.put("reservedBy", patientUserId);
                    found = true;
                    break;
                }
            }
            if (!found) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Slot not found"));
            schedule.setSlotsJson(mapper.writeValueAsString(slots));
            scheduleRepository.save(schedule);
            return ResponseEntity.ok(Map.of("success", true, "reservedUntil", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/cancel")
    @Transactional
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id, @RequestBody Map<String,Object> body) {
        try {
            Optional<Appointment> opt = appointmentRepository.findById(id);
            if (opt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Appointment not found"));
            Appointment appt = opt.get();
            appt.setStatus("CANCELLED");
            appointmentRepository.save(appt);
            // re-enable slot if applicable
            if (appt.getScheduleId() != null && appt.getSlotId() != null) {
                DoctorSchedule schedule = em.find(DoctorSchedule.class, appt.getScheduleId(), LockModeType.PESSIMISTIC_WRITE);
                if (schedule != null) {
                    List<Map<String,Object>> slots = mapper.readValue(schedule.getSlotsJson(), new TypeReference<List<Map<String,Object>>>(){});
                    for (Map<String,Object> slot : slots) {
                        Object idv = slot.get("id");
                        if (idv != null && idv.toString().equals(appt.getSlotId())) {
                            slot.put("active", true);
                            slot.remove("reservedUntil");
                            slot.remove("reservedBy");
                            break;
                        }
                    }
                    schedule.setSlotsJson(mapper.writeValueAsString(slots));
                    scheduleRepository.save(schedule);
                }
            }
            return ResponseEntity.ok(Map.of("success", true, "data", appt));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/reschedule")
    @Transactional
    public ResponseEntity<?> rescheduleAppointment(@PathVariable Long id, @RequestBody Map<String,Object> body) {
        try {
            Optional<Appointment> opt = appointmentRepository.findById(id);
            if (opt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Appointment not found"));
            Appointment appt = opt.get();

            Long newScheduleId = body.get("scheduleId") == null ? null : Long.valueOf(body.get("scheduleId").toString());
            String newSlotId = body.get("slotId") == null ? null : body.get("slotId").toString();
            String newDate = body.get("date") == null ? appt.getDate() : body.get("date").toString();
            String newSlotTime = body.get("slotTime") == null ? appt.getSlotTime() : body.get("slotTime").toString();

            // re-enable old slot if present
            if (appt.getScheduleId() != null && appt.getSlotId() != null) {
                DoctorSchedule old = em.find(DoctorSchedule.class, appt.getScheduleId(), LockModeType.PESSIMISTIC_WRITE);
                if (old != null) {
                    List<Map<String,Object>> slots = mapper.readValue(old.getSlotsJson(), new TypeReference<List<Map<String,Object>>>(){});
                    for (Map<String,Object> slot : slots) {
                        Object idv = slot.get("id");
                        if (idv != null && idv.toString().equals(appt.getSlotId())) {
                            slot.put("active", true);
                            slot.remove("reservedUntil");
                            slot.remove("reservedBy");
                            break;
                        }
                    }
                    old.setSlotsJson(mapper.writeValueAsString(slots));
                    scheduleRepository.save(old);
                }
            }

            // reserve new slot (lock new schedule and mark inactive)
            if (newScheduleId != null && newSlotId != null) {
                DoctorSchedule nxt = em.find(DoctorSchedule.class, newScheduleId, LockModeType.PESSIMISTIC_WRITE);
                if (nxt == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "New schedule not found"));
                List<Map<String,Object>> nslots = mapper.readValue(nxt.getSlotsJson(), new TypeReference<List<Map<String,Object>>>(){});
                boolean found = false;
                for (Map<String,Object> slot : nslots) {
                    Object idv = slot.get("id");
                    if (idv != null && idv.toString().equals(newSlotId)) {
                        Boolean active = (Boolean) slot.getOrDefault("active", true);
                        if (!active) return ResponseEntity.status(409).body(Map.of("success", false, "message", "New slot not available"));
                        slot.put("active", false);
                        slot.remove("reservedUntil");
                        slot.remove("reservedBy");
                        found = true; break;
                    }
                }
                if (!found) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "New slot not found"));
                nxt.setSlotsJson(mapper.writeValueAsString(nslots));
                scheduleRepository.save(nxt);

                // update appointment
                appt.setScheduleId(newScheduleId);
                appt.setSlotId(newSlotId);
                appt.setDate(newDate);
                appt.setSlotTime(newSlotTime);
                appt.setStatus("RESCHEDULED");
                appointmentRepository.save(appt);
            }

            return ResponseEntity.ok(Map.of("success", true, "data", appt));
        } catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getAppointmentsByDoctor(@PathVariable Long doctorId) {
        try {
            List<Appointment> appts = appointmentRepository.findByDoctorUserIdOrderByCreatedAtDesc(doctorId);
            return ResponseEntity.ok(Map.of("success", true, "data", appts));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
