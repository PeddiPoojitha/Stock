package com.stockflow.service;

import com.stockflow.dto.ProductRequest;
import com.stockflow.dto.ProductResponse;
import com.stockflow.dto.StockAdjustmentRequest;
import com.stockflow.entity.Organization;
import com.stockflow.entity.Product;
import com.stockflow.exception.BadRequestException;
import com.stockflow.exception.DuplicateResourceException;
import com.stockflow.exception.ResourceNotFoundException;
import com.stockflow.repository.OrganizationRepository;
import com.stockflow.repository.ProductRepository;
import com.stockflow.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final OrganizationRepository organizationRepository;
    private final AuthService authService;

    public ProductService(ProductRepository productRepository,
                          OrganizationRepository organizationRepository,
                          AuthService authService) {
        this.productRepository = productRepository;
        this.organizationRepository = organizationRepository;
        this.authService = authService;
    }

    private Long getCurrentOrganizationId() {
        return authService.getAuthenticatedPrincipal().getOrganizationId();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts(String search) {
        Long orgId = getCurrentOrganizationId();
        List<Product> products;
        if (StringUtils.hasText(search)) {
            products = productRepository.searchByKeyword(orgId, search.trim());
        } else {
            products = productRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId);
        }
        return products.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Long orgId = getCurrentOrganizationId();
        Product product = productRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        UserPrincipal principal = authService.getAuthenticatedPrincipal();
        Long orgId = principal.getOrganizationId();

        String trimmedSku = request.getSku().trim();
        if (productRepository.existsByOrganizationIdAndSkuIgnoreCase(orgId, trimmedSku)) {
            throw new DuplicateResourceException("A product with SKU '" + trimmedSku + "' already exists in your organization");
        }

        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        Product product = new Product();
        product.setOrganization(organization);
        product.setName(request.getName().trim());
        product.setSku(trimmedSku);
        product.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        product.setQuantityOnHand(request.getQuantityOnHand());
        product.setCostPrice(request.getCostPrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setLowStockThreshold(request.getLowStockThreshold());

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Long orgId = getCurrentOrganizationId();

        Product product = productRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        String trimmedSku = request.getSku().trim();
        if (productRepository.existsByOrganizationIdAndSkuIgnoreCaseAndIdNot(orgId, trimmedSku, id)) {
            throw new DuplicateResourceException("A product with SKU '" + trimmedSku + "' already exists in your organization");
        }

        product.setName(request.getName().trim());
        product.setSku(trimmedSku);
        product.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        product.setQuantityOnHand(request.getQuantityOnHand());
        product.setCostPrice(request.getCostPrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setLowStockThreshold(request.getLowStockThreshold());

        Product updated = productRepository.save(product);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Long orgId = getCurrentOrganizationId();
        Product product = productRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        productRepository.delete(product);
    }

    @Transactional
    public ProductResponse adjustStock(Long id, StockAdjustmentRequest request) {
        Long orgId = getCurrentOrganizationId();
        Product product = productRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        int newQuantity = product.getQuantityOnHand() + request.getAdjustment();
        if (newQuantity < 0) {
            throw new BadRequestException("Stock cannot be adjusted below zero. Current quantity is "
                    + product.getQuantityOnHand() + ", adjustment: " + request.getAdjustment());
        }

        product.setQuantityOnHand(newQuantity);
        Product updated = productRepository.save(product);
        return mapToResponse(updated);
    }

    public ProductResponse mapToResponse(Product product) {
        ProductResponse res = new ProductResponse();
        res.setId(product.getId());
        res.setOrganizationId(product.getOrganization().getId());
        res.setOrganizationName(product.getOrganization().getName());
        res.setName(product.getName());
        res.setSku(product.getSku());
        res.setDescription(product.getDescription());
        res.setQuantityOnHand(product.getQuantityOnHand());
        res.setCostPrice(product.getCostPrice());
        res.setSellingPrice(product.getSellingPrice());
        res.setLowStockThreshold(product.getLowStockThreshold());

        int effectiveThreshold = product.getEffectiveThreshold();
        res.setEffectiveThreshold(effectiveThreshold);
        res.setLowStock(product.isLowStock());

        res.setCreatedAt(product.getCreatedAt());
        res.setUpdatedAt(product.getUpdatedAt());
        return res;
    }
}
