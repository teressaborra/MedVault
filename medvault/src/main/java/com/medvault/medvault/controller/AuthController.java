package com.medvault.medvault.controller;

import com.medvault.medvault.dto.LoginRequest;
import com.medvault.medvault.dto.LoginResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.medvault.medvault.dto.SignupRequest;
import com.medvault.medvault.dto.SignupResponse;
import com.medvault.medvault.service.UserService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        // DB-backed login: find by email and verify password
        String email = req.getEmail();
        String password = req.getPassword();

        var userOpt = userService.findByEmail(email);
        if (userOpt.isPresent()) {
            var user = userOpt.get();
            if (userService.checkPassword(user, password)) {
                String role = user.getRoles();
                String name = user.getUsername();
                return ResponseEntity.ok(new LoginResponse(true, "Login successful", role, name, user.getId()));
            } else {
                return ResponseEntity.ok(new LoginResponse(false, "Invalid credentials", null, null, null));
            }
        }

        return ResponseEntity.ok(new LoginResponse(false, "Invalid credentials", null, null, null));
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

        // Check for existing email
        if (userService.findByEmail(email).isPresent()) {
            return ResponseEntity.ok(new SignupResponse(false, "Email already registered."));
        }

        // Register the user in DB (username = name)
        try {
            userService.register(name, email, password, normalizedRole);
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(new SignupResponse(false, "Unable to save user: " + ex.getMessage()));
        }

        String msg = "Signup submitted successfully. Admin will review and approve your account.";
        return ResponseEntity.ok(new SignupResponse(true, msg));
    }

}
