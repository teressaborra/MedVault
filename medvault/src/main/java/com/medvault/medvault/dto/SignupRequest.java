package com.medvault.medvault.dto;

public class SignupRequest {

    private String name;
    private String email;
    private String role;    // "patient" or "doctor"
    private String password; // plain-text from frontend for now (will hash later)

    public SignupRequest() { }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
