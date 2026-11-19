package com.stockflow.repository;

import com.stockflow.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);

    @Query("SELECT p FROM Product p WHERE p.organization.id = :orgId AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY p.createdAt DESC")
    List<Product> searchByKeyword(@Param("orgId") Long orgId, @Param("keyword") String keyword);

    Optional<Product> findByIdAndOrganizationId(Long id, Long organizationId);

    boolean existsByOrganizationIdAndSkuIgnoreCase(Long organizationId, String sku);

    boolean existsByOrganizationIdAndSkuIgnoreCaseAndIdNot(Long organizationId, String sku, Long id);

    long countByOrganizationId(Long organizationId);

    @Query("SELECT COALESCE(SUM(p.quantityOnHand), 0) FROM Product p WHERE p.organization.id = :orgId")
    long sumQuantityByOrganizationId(@Param("orgId") Long orgId);

    @Query("SELECT COALESCE(SUM(p.quantityOnHand * p.costPrice), 0.0) FROM Product p WHERE p.organization.id = :orgId")
    BigDecimal sumInventoryValueByOrganizationId(@Param("orgId") Long orgId);

    @Query("SELECT p FROM Product p WHERE p.organization.id = :orgId AND " +
           "p.quantityOnHand <= COALESCE(p.lowStockThreshold, p.organization.defaultLowStockThreshold, 5) " +
           "ORDER BY p.quantityOnHand ASC")
    List<Product> findLowStockProducts(@Param("orgId") Long orgId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.organization.id = :orgId AND " +
           "p.quantityOnHand <= COALESCE(p.lowStockThreshold, p.organization.defaultLowStockThreshold, 5)")
    long countLowStockProducts(@Param("orgId") Long orgId);
}
