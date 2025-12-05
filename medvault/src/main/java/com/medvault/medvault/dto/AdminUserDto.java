package com.medvault.medvault.dto;

import java.time.OffsetDateTime;

public class AdminUserDto {
    public Long id;
    public String username;
    public String email;
    public String roles;
    public Boolean isApproved;
    public String status;
    public OffsetDateTime createdAt;

    public AdminUserDto() {}
}
