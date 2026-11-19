package com.stockflow.dto;

import java.time.LocalDateTime;

public class SettingsResponse {

    private Long organizationId;
    private String organizationName;
    private Integer defaultLowStockThreshold;
    private LocalDateTime createdAt;

    public SettingsResponse() {
    }

    public SettingsResponse(Long organizationId, String organizationName, Integer defaultLowStockThreshold, LocalDateTime createdAt) {
        this.organizationId = organizationId;
        this.organizationName = organizationName;
        this.defaultLowStockThreshold = defaultLowStockThreshold;
        this.createdAt = createdAt;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
