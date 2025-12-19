package com.medvault.medvault.controller;

import com.medvault.medvault.model.DoctorSchedule;
import com.medvault.medvault.repository.DoctorScheduleRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import com.medvault.medvault.service.DoctorService;
import com.medvault.medvault.model.Doctor;

@RestController
@RequestMapping("/api/doctor/schedules")
@CrossOrigin(origins = "http://localhost:3000")
public class DoctorScheduleController {

    @Autowired
    private DoctorScheduleRepository scheduleRepository;

    @Autowired
    private DoctorService doctorService;

    private final ObjectMapper mapper = new ObjectMapper();

    static class SlotDTO {
        public String id;
        public String time;
        public boolean active;
    }

    static class CreateRequest {
        public Long doctorUserId;
        public String doctorName;
        public String specialization;
        public String date; // YYYY-MM-DD
        public List<SlotDTO> slots;
    }

    @PostMapping
    public ResponseEntity<?> createSchedule(@RequestBody CreateRequest req) {
        try {
            DoctorSchedule s = new DoctorSchedule();
            s.setDoctorUserId(req.doctorUserId);
            // prefer authoritative data from doctor profile if available
            String doctorName = req.doctorName;
            String specialization = req.specialization;
            try {
                if (req.doctorUserId != null) {
                    Optional<Doctor> dopt = doctorService.getDoctorByUserId(req.doctorUserId);
                    if (dopt.isPresent()) {
                        Doctor d = dopt.get();
                        if (d.getFullName() != null && !d.getFullName().isBlank()) doctorName = d.getFullName();
                        if (d.getSpecialization() != null && !d.getSpecialization().isBlank()) specialization = d.getSpecialization();
                    }
                }
            } catch (Exception ex) {
                // ignore and use provided values
            }
            s.setDoctorName(doctorName);
            s.setSpecialization(specialization);
            s.setDate(LocalDate.parse(req.date));
            s.setSlotsJson(mapper.writeValueAsString(req.slots));
            DoctorSchedule saved = scheduleRepository.save(s);
            return ResponseEntity.ok(Map.of("success", true, "data", saved));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/{doctorUserId}")
    public ResponseEntity<?> getSchedules(@PathVariable Long doctorUserId) {
        try {
            List<DoctorSchedule> list = scheduleRepository.findByDoctorUserIdOrderByDateAsc(doctorUserId);
            // convert slotsJson into structure for client
            List<Map<String,Object>> out = new ArrayList<>();
            for (DoctorSchedule s : list) {
                List<SlotDTO> slots = mapper.readValue(s.getSlotsJson(), new TypeReference<List<SlotDTO>>(){});
                String doctorName = s.getDoctorName();
                String specialization = s.getSpecialization();
                try {
                    if ((doctorName == null || doctorName.isBlank() || specialization == null || specialization.isBlank()) && s.getDoctorUserId() != null) {
                        Optional<Doctor> dopt = doctorService.getDoctorByUserId(s.getDoctorUserId());
                        if (dopt.isPresent()) {
                            Doctor d = dopt.get();
                            if (doctorName == null || doctorName.isBlank()) doctorName = d.getFullName();
                            if (specialization == null || specialization.isBlank()) specialization = d.getSpecialization();
                        }
                    }
                } catch (Exception ex) { }
                Map<String,Object> m = new HashMap<>();
                m.put("id", s.getId());
                m.put("doctorUserId", s.getDoctorUserId());
                m.put("doctorName", doctorName);
                m.put("specialization", specialization);
                m.put("date", s.getDate().toString());
                m.put("slots", slots);
                out.add(m);
            }
            return ResponseEntity.ok(Map.of("success", true, "data", out));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Return doctors/dates that have at least one active slot
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableSchedules() {
        try {
            List<DoctorSchedule> list = scheduleRepository.findAll();
            List<Map<String,Object>> out = new ArrayList<>();
            for (DoctorSchedule s : list) {
                List<SlotDTO> slots = mapper.readValue(s.getSlotsJson(), new TypeReference<List<SlotDTO>>(){});
                List<SlotDTO> active = new ArrayList<>();
                for (SlotDTO slot : slots) if (slot.active) active.add(slot);
                if (!active.isEmpty()) {
                    String doctorName = s.getDoctorName();
                    String specialization = s.getSpecialization();
                    try {
                        if ((doctorName == null || doctorName.isBlank() || specialization == null || specialization.isBlank()) && s.getDoctorUserId() != null) {
                            Optional<Doctor> dopt = doctorService.getDoctorByUserId(s.getDoctorUserId());
                            if (dopt.isPresent()) {
                                Doctor d = dopt.get();
                                if (doctorName == null || doctorName.isBlank()) doctorName = d.getFullName();
                                if (specialization == null || specialization.isBlank()) specialization = d.getSpecialization();
                            }
                        }
                    } catch (Exception ex) {}
                    Map<String,Object> m = new HashMap<>();
                    m.put("id", s.getId());
                    m.put("doctorUserId", s.getDoctorUserId());
                    m.put("doctorName", doctorName);
                    m.put("specialization", specialization);
                    m.put("date", s.getDate().toString());
                    m.put("slots", active);
                    out.add(m);
                }
            }
            return ResponseEntity.ok(Map.of("success", true, "data", out));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Toggle a slot active/disabled
    @PatchMapping("/{scheduleId}/slots/{slotId}")
    public ResponseEntity<?> toggleSlot(@PathVariable Long scheduleId, @PathVariable String slotId, @RequestBody Map<String,Object> body) {
        try {
            Optional<DoctorSchedule> opt = scheduleRepository.findById(scheduleId);
            if (opt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Schedule not found"));
            DoctorSchedule s = opt.get();
            List<SlotDTO> slots = mapper.readValue(s.getSlotsJson(), new TypeReference<List<SlotDTO>>(){});
            boolean changed = false;
            for (SlotDTO slot : slots) {
                if (slot.id.equals(slotId)) {
                    // if body contains active, set it; otherwise toggle
                    if (body != null && body.containsKey("active")) {
                        slot.active = Boolean.parseBoolean(body.get("active").toString());
                    } else {
                        slot.active = !slot.active;
                    }
                    changed = true;
                    break;
                }
            }
            if (!changed) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Slot not found"));
            s.setSlotsJson(mapper.writeValueAsString(slots));
            scheduleRepository.save(s);
            return ResponseEntity.ok(Map.of("success", true, "data", s));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Edit slot time
    @PutMapping("/{scheduleId}/slots/{slotId}")
    public ResponseEntity<?> editSlot(@PathVariable Long scheduleId, @PathVariable String slotId, @RequestBody Map<String,Object> body) {
        try {
            Optional<DoctorSchedule> opt = scheduleRepository.findById(scheduleId);
            if (opt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Schedule not found"));
            DoctorSchedule s = opt.get();
            List<SlotDTO> slots = mapper.readValue(s.getSlotsJson(), new TypeReference<List<SlotDTO>>(){});
            boolean changed = false;
            for (SlotDTO slot : slots) {
                if (slot.id.equals(slotId)) {
                    if (body != null && body.containsKey("time")) {
                        slot.time = body.get("time").toString();
                        changed = true;
                    }
                    break;
                }
            }
            if (!changed) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Slot not found or no new time provided"));
            s.setSlotsJson(mapper.writeValueAsString(slots));
            scheduleRepository.save(s);
            return ResponseEntity.ok(Map.of("success", true, "data", s));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Delete a slot from a schedule
    @DeleteMapping("/{scheduleId}/slots/{slotId}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long scheduleId, @PathVariable String slotId) {
        try {
            Optional<DoctorSchedule> opt = scheduleRepository.findById(scheduleId);
            if (opt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Schedule not found"));
            DoctorSchedule s = opt.get();
            List<SlotDTO> slots = mapper.readValue(s.getSlotsJson(), new TypeReference<List<SlotDTO>>(){});
            int before = slots.size();
            slots.removeIf(slot -> slot.id.equals(slotId));
            if (slots.size() == before) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Slot not found"));
            s.setSlotsJson(mapper.writeValueAsString(slots));
            scheduleRepository.save(s);
            return ResponseEntity.ok(Map.of("success", true, "data", s));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
