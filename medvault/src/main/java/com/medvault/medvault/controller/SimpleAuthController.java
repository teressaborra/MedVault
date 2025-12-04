package com.medvault.medvault.controller;

import com.medvault.medvault.model.User;
import com.medvault.medvault.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/persist")
public class SimpleAuthController {
    private final UserService userService;

    public SimpleAuthController(UserService userService) { this.userService = userService; }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        User created = userService.register(req.username, req.email, req.password);
        return ResponseEntity.ok(created.getId());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        return userService.findByUsername(req.username)
            .filter(u -> userService.checkPassword(u, req.password))
            .map(u -> ResponseEntity.ok("OK"))
            .orElse(ResponseEntity.status(401).body("Invalid credentials"));
    }

    public static class RegisterRequest { public String username; public String email; public String password; }
    public static class LoginRequest { public String username; public String password; }
}
