package com.stockflow.dto;

import jakarta.validation.constraints.NotNull;

public class StockAdjustmentRequest {

    @NotNull(message = "Adjustment quantity is required")
    private Integer adjustment;

    private String note;

    public StockAdjustmentRequest() {
    }

    public StockAdjustmentRequest(Integer adjustment, String note) {
        this.adjustment = adjustment;
        this.note = note;
    }

    public Integer getAdjustment() {
        return adjustment;
    }

    public void setAdjustment(Integer adjustment) {
        this.adjustment = adjustment;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
