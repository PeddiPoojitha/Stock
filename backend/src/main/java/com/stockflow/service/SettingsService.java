package com.stockflow.service;

import com.stockflow.dto.SettingsRequest;
import com.stockflow.dto.SettingsResponse;
import com.stockflow.entity.Organization;
import com.stockflow.exception.BadRequestException;
import com.stockflow.exception.ResourceNotFoundException;
import com.stockflow.repository.OrganizationRepository;
import com.stockflow.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    private final OrganizationRepository organizationRepository;
    private final AuthService authService;

    public SettingsService(OrganizationRepository organizationRepository, AuthService authService) {
        this.organizationRepository = organizationRepository;
        this.authService = authService;
    }

    private Long getCurrentOrganizationId() {
        return authService.getAuthenticatedPrincipal().getOrganizationId();
    }

    @Transactional(readOnly = true)
    public SettingsResponse getSettings() {
        Long orgId = getCurrentOrganizationId();
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        return new SettingsResponse(
                organization.getId(),
                organization.getName(),
                organization.getDefaultLowStockThreshold(),
                organization.getCreatedAt()
        );
    }

    @Transactional
    public SettingsResponse updateSettings(SettingsRequest request) {
        if (request.getDefaultLowStockThreshold() == null || request.getDefaultLowStockThreshold() < 0) {
            throw new BadRequestException("Default low stock threshold must be a non-negative integer");
        }

        Long orgId = getCurrentOrganizationId();
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        organization.setDefaultLowStockThreshold(request.getDefaultLowStockThreshold());
        Organization updated = organizationRepository.save(organization);

        return new SettingsResponse(
                updated.getId(),
                updated.getName(),
                updated.getDefaultLowStockThreshold(),
                updated.getCreatedAt()
        );
    }
}
