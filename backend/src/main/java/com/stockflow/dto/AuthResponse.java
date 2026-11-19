package com.stockflow.dto;

public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private Long userId;
    private String fullName;
    private String email;
    private Long organizationId;
    private String organizationName;
    private Integer defaultLowStockThreshold;

    public AuthResponse() {
    }

    public AuthResponse(String token, Long userId, String fullName, String email,
                        Long organizationId, String organizationName, Integer defaultLowStockThreshold) {
        this.token = token;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.organizationId = organizationId;
        this.organizationName = organizationName;
        this.defaultLowStockThreshold = defaultLowStockThreshold;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public Integer getDefaultLowStockThreshold() {
        return defaultLowStockThreshold;
    }

    public void setDefaultLowStockThreshold(Integer defaultLowStockThreshold) {
        this.defaultLowStockThreshold = defaultLowStockThreshold;
    }
}
