package com.stockflow.service;

import com.stockflow.dto.DashboardResponse;
import com.stockflow.dto.ProductResponse;
import com.stockflow.entity.Organization;
import com.stockflow.entity.Product;
import com.stockflow.exception.ResourceNotFoundException;
import com.stockflow.repository.OrganizationRepository;
import com.stockflow.repository.ProductRepository;
import com.stockflow.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final OrganizationRepository organizationRepository;
    private final AuthService authService;
    private final ProductService productService;

    public DashboardService(ProductRepository productRepository,
                            OrganizationRepository organizationRepository,
                            AuthService authService,
                            ProductService productService) {
        this.productRepository = productRepository;
        this.organizationRepository = organizationRepository;
        this.authService = authService;
        this.productService = productService;
    }

    private Long getCurrentOrganizationId() {
        return authService.getAuthenticatedPrincipal().getOrganizationId();
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardSummary() {
        UserPrincipal principal = authService.getAuthenticatedPrincipal();
        Long orgId = principal.getOrganizationId();

        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        long totalProducts = productRepository.countByOrganizationId(orgId);
        long totalStockQuantity = productRepository.sumQuantityByOrganizationId(orgId);
        long lowStockCount = productRepository.countLowStockProducts(orgId);
        BigDecimal totalInventoryValue = productRepository.sumInventoryValueByOrganizationId(orgId);

        List<Product> lowStockProducts = productRepository.findLowStockProducts(orgId);
        List<ProductResponse> lowStockItems = lowStockProducts.stream()
                .map(productService::mapToResponse)
                .collect(Collectors.toList());

        DashboardResponse response = new DashboardResponse();
        response.setTotalProducts(totalProducts);
        response.setTotalStockQuantity(totalStockQuantity);
        response.setLowStockProductsCount(lowStockCount);
        response.setTotalInventoryValue(totalInventoryValue);
        response.setOrganizationName(organization.getName());
        response.setDefaultLowStockThreshold(organization.getDefaultLowStockThreshold());
        response.setLowStockItems(lowStockItems);

        return response;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts() {
        Long orgId = getCurrentOrganizationId();
        List<Product> lowStockProducts = productRepository.findLowStockProducts(orgId);
        return lowStockProducts.stream()
                .map(productService::mapToResponse)
                .collect(Collectors.toList());
    }
}
