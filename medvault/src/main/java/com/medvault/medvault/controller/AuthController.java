package com.medvault.medvault.controller;

import com.medvault.medvault.dto.LoginRequest;
import com.medvault.medvault.dto.LoginResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.medvault.medvault.dto.SignupRequest;
import com.medvault.medvault.dto.SignupResponse;


@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000") 
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {

        String email = req.getEmail();
        String password = req.getPassword();
        String role = req.getRole(); // PATIENT / DOCTOR / ADMIN

        if (role.equalsIgnoreCase("PATIENT")
                && email.equals("patient@med.com")
                && password.equals("patient123")) {
            return ResponseEntity.ok(
                    new LoginResponse(true, "Patient Login Successful", "PATIENT", "Test Patient")
            );
        }

        if (role.equalsIgnoreCase("DOCTOR")
                && email.equals("doctor@med.com")
                && password.equals("doctor123")) {
            return ResponseEntity.ok(
                    new LoginResponse(true, "Doctor Login Successful", "DOCTOR", "Test Doctor")
            );
        }

        if (role.equalsIgnoreCase("ADMIN")
                && email.equals("admin@med.com")
                && password.equals("admin123")) {
            return ResponseEntity.ok(
                    new LoginResponse(true, "Admin Login Successful", "ADMIN", "System Admin")
            );
        }

        return ResponseEntity.ok(
                new LoginResponse(false, "Invalid Credentials", null, null)
        );
    }
    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@RequestBody SignupRequest req) {

        String name = req.getName();
        String email = req.getEmail();
        String role = req.getRole(); // "patient" or "doctor"
        String password = req.getPassword();

        // Basic validation (similar to frontend)
        if (name == null || name.trim().isEmpty()
                || email == null || email.trim().isEmpty()
                || role == null || role.trim().isEmpty()
                || password == null || password.trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body(new SignupResponse(false, "Please fill all required fields."));
        }

        // simple password length check (frontend already checks)
        if (password.length() < 6) {
            return ResponseEntity.ok(new SignupResponse(false, "Password must be at least 6 characters."));
        }

        // Basic email validation
        int at = email.indexOf("@");
        if (at < 1 || at == email.length() - 1) {
            return ResponseEntity.ok(new SignupResponse(false, "Please enter a valid email."));
        }

        // Role check
        String normalizedRole = role.trim().toLowerCase();
        if (!normalizedRole.equals("patient") && !normalizedRole.equals("doctor")) {
            return ResponseEntity.ok(new SignupResponse(false, "Invalid role. Only patient/doctor allowed."));
        }

        // In a real app: check if email already exists, hash password, save to DB, mark PENDING, etc.
        // For now: log the signup request (do NOT log password in production)
        System.out.println("SIGNUP REQUEST -> name: " + name + ", email: " + email + ", role: " + normalizedRole);

        // Pretend we saved it successfully
        String msg = "Signup request submitted successfully. Admin will review and approve your account.";
        return ResponseEntity.ok(new SignupResponse(true, msg));
    }


}
