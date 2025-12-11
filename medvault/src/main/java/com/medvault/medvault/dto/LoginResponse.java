package com.medvault.medvault.dto;

public class LoginResponse {
    private boolean success;
    private String message;
    private String role;
    private String name;
    private Long userId;
    private String identificationId;

    public LoginResponse(boolean success, String message, String role, String name, Long userId) {
        this.success = success;
        this.message = message;
        this.role = role;
        this.name = name;
        this.userId = userId;
    }
    
    public LoginResponse(boolean success, String message, String role, String name, Long userId, String identificationId) {
        this.success = success;
        this.message = message;
        this.role = role;
        this.name = name;
        this.userId = userId;
        this.identificationId = identificationId;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public String getRole() {
        return role;
    }

    public String getName() {
        return name;
    }

    public Long getUserId() {
        return userId;
    }
    
    public String getIdentificationId() {
        return identificationId;
    }
}
