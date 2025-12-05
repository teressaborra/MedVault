package com.medvault.medvault.controller;

import com.medvault.medvault.dto.AdminUserDto;
import com.medvault.medvault.model.User;
import com.medvault.medvault.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) { this.userService = userService; }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> listUsers(@RequestParam(name = "role", required = false) String role) {
        List<User> users;
        if (role == null || role.isBlank()) {
            users = userService.findByRole("PATIENT"); // default show patients
        } else {
            users = userService.findByRole(role.toUpperCase());
        }

        List<AdminUserDto> dto = users.stream().map(u -> {
            AdminUserDto a = new AdminUserDto();
            a.id = u.getId();
            a.username = u.getUsername();
            a.email = u.getEmail();
            a.roles = u.getRoles();
            a.isApproved = u.getIsApproved();
            a.status = u.getStatus();
            a.createdAt = u.getCreatedAt();
            return a;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/users/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        try {
            userService.setApproval(id, true, "ACTIVE");
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            return ResponseEntity.status(404).body(ex.getMessage());
        }
    }

    @PostMapping("/users/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        try {
            userService.setApproval(id, false, "REJECTED");
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            return ResponseEntity.status(404).body(ex.getMessage());
        }
    }

}

