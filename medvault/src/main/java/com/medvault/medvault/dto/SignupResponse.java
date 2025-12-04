package com.medvault.medvault.dto;

public class SignupResponse {

    private boolean success;
    private String message;

    public SignupResponse() {}

    public SignupResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }
}
