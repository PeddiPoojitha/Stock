package com.stockflow.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardResponse {

    private long totalProducts;
    private long totalStockQuantity;
    private long lowStockProductsCount;
    private BigDecimal totalInventoryValue;
    private String organizationName;
    private Integer defaultLowStockThreshold;
    private List<ProductResponse> lowStockItems;

    public DashboardResponse() {
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalStockQuantity() {
        return totalStockQuantity;
    }

    public void setTotalStockQuantity(long totalStockQuantity) {
        this.totalStockQuantity = totalStockQuantity;
    }

    public long getLowStockProductsCount() {
        return lowStockProductsCount;
    }

    public void setLowStockProductsCount(long lowStockProductsCount) {
        this.lowStockProductsCount = lowStockProductsCount;
    }

    public BigDecimal getTotalInventoryValue() {
        return totalInventoryValue;
    }

    public void setTotalInventoryValue(BigDecimal totalInventoryValue) {
        this.totalInventoryValue = totalInventoryValue;
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

    public List<ProductResponse> getLowStockItems() {
        return lowStockItems;
    }

    public void setLowStockItems(List<ProductResponse> lowStockItems) {
        this.lowStockItems = lowStockItems;
    }
}
