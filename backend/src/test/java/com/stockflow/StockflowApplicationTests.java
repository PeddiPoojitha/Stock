package com.stockflow;

import com.stockflow.dto.*;
import com.stockflow.entity.Organization;
import com.stockflow.entity.User;
import com.stockflow.repository.OrganizationRepository;
import com.stockflow.repository.ProductRepository;
import com.stockflow.repository.UserRepository;
import com.stockflow.security.UserPrincipal;
import com.stockflow.service.AuthService;
import com.stockflow.service.DashboardService;
import com.stockflow.service.ProductService;
import com.stockflow.service.SettingsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class StockflowApplicationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private ProductService productService;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private SettingsService settingsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private ProductRepository productRepository;

    private void authenticateUser(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        UserPrincipal principal = new UserPrincipal(user);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @BeforeEach
    void setupContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Scenario 1 & 2: Signup and Login with valid credentials")
    void testSignupAndLogin() {
        SignupRequest signupReq = new SignupRequest();
        signupReq.setFullName("Alice Smith");
        signupReq.setEmail("alice@alphastore.com");
        signupReq.setPassword("secret123");
        signupReq.setConfirmPassword("secret123");
        signupReq.setOrganizationName("Alpha Store");

        AuthResponse signupRes = authService.signup(signupReq);
        assertNotNull(signupRes.getToken());
        assertEquals("Alpha Store", signupRes.getOrganizationName());
        assertEquals("alice@alphastore.com", signupRes.getEmail());

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("alice@alphastore.com");
        loginReq.setPassword("secret123");

        AuthResponse loginRes = authService.login(loginReq);
        assertNotNull(loginRes.getToken());
        assertEquals(signupRes.getOrganizationId(), loginRes.getOrganizationId());
    }

    @Test
    @DisplayName("Scenario 3: Login fails with invalid credentials")
    void testLoginWithInvalidCredentials() {
        SignupRequest signupReq = new SignupRequest();
        signupReq.setFullName("Bob Jones");
        signupReq.setEmail("bob@betashop.com");
        signupReq.setPassword("mypassword");
        signupReq.setConfirmPassword("mypassword");
        signupReq.setOrganizationName("Beta Shop");
        authService.signup(signupReq);

        LoginRequest badLogin = new LoginRequest();
        badLogin.setEmail("bob@betashop.com");
        badLogin.setPassword("wrongpassword");

        assertThrows(BadCredentialsException.class, () -> authService.login(badLogin));
    }

    @Test
    @DisplayName("Scenario 4, 5, 6, 7: Product CRUD lifecycle")
    void testProductCrudOperations() {
        // Setup Tenant
        SignupRequest signupReq = new SignupRequest();
        signupReq.setFullName("Charlie");
        signupReq.setEmail("charlie@gammastore.com");
        signupReq.setPassword("charlie123");
        signupReq.setConfirmPassword("charlie123");
        signupReq.setOrganizationName("Gamma Store");
        authService.signup(signupReq);

        authenticateUser("charlie@gammastore.com");

        // Create product
        ProductRequest createReq = new ProductRequest();
        createReq.setName("Wireless Keyboard");
        createReq.setSku("KB-100");
        createReq.setDescription("Ergonomic mechanical keyboard");
        createReq.setQuantityOnHand(25);
        createReq.setCostPrice(new BigDecimal("35.00"));
        createReq.setSellingPrice(new BigDecimal("59.99"));
        createReq.setLowStockThreshold(10);

        ProductResponse created = productService.createProduct(createReq);
        assertNotNull(created.getId());
        assertEquals("KB-100", created.getSku());
        assertFalse(created.isLowStock());

        // Read products
        List<ProductResponse> products = productService.getAllProducts(null);
        assertTrue(products.stream().anyMatch(p -> p.getSku().equals("KB-100")));

        // Update product
        ProductRequest updateReq = new ProductRequest();
        updateReq.setName("Wireless Keyboard V2");
        updateReq.setSku("KB-100-PRO");
        updateReq.setDescription("Updated mechanical keyboard");
        updateReq.setQuantityOnHand(8); // now low stock since threshold is 10
        updateReq.setCostPrice(new BigDecimal("40.00"));
        updateReq.setSellingPrice(new BigDecimal("69.99"));
        updateReq.setLowStockThreshold(10);

        ProductResponse updated = productService.updateProduct(created.getId(), updateReq);
        assertEquals("Wireless Keyboard V2", updated.getName());
        assertEquals(8, updated.getQuantityOnHand());
        assertTrue(updated.isLowStock());

        // Delete product
        productService.deleteProduct(created.getId());
        List<ProductResponse> afterDelete = productService.getAllProducts(null);
        assertFalse(afterDelete.stream().anyMatch(p -> p.getId().equals(created.getId())));
    }

    @Test
    @DisplayName("Scenario 8 & 9: Search by Name and SKU")
    void testSearchByNameAndSku() {
        SignupRequest signupReq = new SignupRequest();
        signupReq.setFullName("David");
        signupReq.setEmail("david@deltamart.com");
        signupReq.setPassword("delta123");
        signupReq.setConfirmPassword("delta123");
        signupReq.setOrganizationName("Delta Mart");
        authService.signup(signupReq);

        authenticateUser("david@deltamart.com");

        ProductRequest p1 = new ProductRequest();
        p1.setName("Dell XPS Laptop 15");
        p1.setSku("LAP-DELL-15");
        p1.setQuantityOnHand(10);
        p1.setCostPrice(new BigDecimal("900.00"));
        p1.setSellingPrice(new BigDecimal("1200.00"));
        p1.setLowStockThreshold(3);
        productService.createProduct(p1);

        ProductRequest p2 = new ProductRequest();
        p2.setName("Logitech Mouse M330");
        p2.setSku("MOU-LOGI-330");
        p2.setQuantityOnHand(50);
        p2.setCostPrice(new BigDecimal("12.00"));
        p2.setSellingPrice(new BigDecimal("22.50"));
        p2.setLowStockThreshold(5);
        productService.createProduct(p2);

        // Search by name
        List<ProductResponse> searchName = productService.getAllProducts("Laptop");
        assertEquals(1, searchName.size());
        assertEquals("LAP-DELL-15", searchName.get(0).getSku());

        // Search by SKU
        List<ProductResponse> searchSku = productService.getAllProducts("MOU-LOGI");
        assertEquals(1, searchSku.size());
        assertEquals("Logitech Mouse M330", searchSku.get(0).getName());
    }

    @Test
    @DisplayName("Scenario 10, 11, 12, 13: Dashboard metrics, low-stock threshold logic and Settings")
    void testDashboardAndSettings() {
        SignupRequest signupReq = new SignupRequest();
        signupReq.setFullName("Emma");
        signupReq.setEmail("emma@echogear.com");
        signupReq.setPassword("echo123");
        signupReq.setConfirmPassword("echo123");
        signupReq.setOrganizationName("Echo Gear");
        authService.signup(signupReq);

        authenticateUser("emma@echogear.com");

        // Product 1: In stock (Qty 20, threshold 5)
        ProductRequest p1 = new ProductRequest();
        p1.setName("Samsung Galaxy");
        p1.setSku("SAM-01");
        p1.setQuantityOnHand(20);
        p1.setCostPrice(new BigDecimal("300.00"));
        p1.setSellingPrice(new BigDecimal("450.00"));
        p1.setLowStockThreshold(5);
        productService.createProduct(p1);

        // Product 2: Low stock (Qty 3, threshold 5)
        ProductRequest p2 = new ProductRequest();
        p2.setName("iPhone 15");
        p2.setSku("IPH-01");
        p2.setQuantityOnHand(3);
        p2.setCostPrice(new BigDecimal("700.00"));
        p2.setSellingPrice(new BigDecimal("999.00"));
        p2.setLowStockThreshold(5);
        productService.createProduct(p2);

        // Product 3: Low stock at boundary (Qty 5, null threshold -> fallback to org default 5)
        ProductRequest p3 = new ProductRequest();
        p3.setName("OnePlus 12");
        p3.setSku("ONE-01");
        p3.setQuantityOnHand(5);
        p3.setCostPrice(new BigDecimal("400.00"));
        p3.setSellingPrice(new BigDecimal("599.00"));
        p3.setLowStockThreshold(null); // uses org default
        productService.createProduct(p3);

        DashboardResponse summary = dashboardService.getDashboardSummary();
        assertEquals(3, summary.getTotalProducts());
        assertEquals(28, summary.getTotalStockQuantity()); // 20 + 3 + 5
        assertEquals(2, summary.getLowStockProductsCount()); // iPhone (3<=5) and OnePlus (5<=5)

        // Test Inventory Value: (20*300) + (3*700) + (5*400) = 6000 + 2100 + 2000 = 10100.00
        BigDecimal expectedValue = new BigDecimal("10100.00");
        assertEquals(0, expectedValue.compareTo(summary.getTotalInventoryValue()));

        // Update default settings threshold to 2
        SettingsRequest settingsReq = new SettingsRequest(2);
        SettingsResponse updatedSettings = settingsService.updateSettings(settingsReq);
        assertEquals(2, updatedSettings.getDefaultLowStockThreshold());

        // Now OnePlus (Qty 5, threshold null -> effective 2) is NO LONGER low stock!
        DashboardResponse summaryAfterSetting = dashboardService.getDashboardSummary();
        assertEquals(1, summaryAfterSetting.getLowStockProductsCount()); // only iPhone (3)
    }

    @Test
    @DisplayName("Scenario 14: Multi-Tenant Data Isolation")
    void testMultiTenantIsolation() {
        // Tenant A
        SignupRequest orgAReq = new SignupRequest();
        orgAReq.setFullName("User A");
        orgAReq.setEmail("userA@abcmobile.com");
        orgAReq.setPassword("pass123");
        orgAReq.setConfirmPassword("pass123");
        orgAReq.setOrganizationName("ABC Mobile Store");
        authService.signup(orgAReq);

        // Tenant B
        SignupRequest orgBReq = new SignupRequest();
        orgBReq.setFullName("User B");
        orgBReq.setEmail("userB@xyzelec.com");
        orgBReq.setPassword("pass123");
        orgBReq.setConfirmPassword("pass123");
        orgBReq.setOrganizationName("XYZ Electronics");
        authService.signup(orgBReq);

        // Tenant A creates product with SKU "GADGET-01"
        authenticateUser("userA@abcmobile.com");
        ProductRequest pA = new ProductRequest();
        pA.setName("ABC Phone");
        pA.setSku("GADGET-01");
        pA.setQuantityOnHand(15);
        pA.setCostPrice(new BigDecimal("100.00"));
        pA.setSellingPrice(new BigDecimal("150.00"));
        ProductResponse createdA = productService.createProduct(pA);

        // Tenant B creates product with SAME SKU "GADGET-01" (must be allowed in separate org!)
        authenticateUser("userB@xyzelec.com");
        ProductRequest pB = new ProductRequest();
        pB.setName("XYZ Tablet");
        pB.setSku("GADGET-01");
        pB.setQuantityOnHand(40);
        pB.setCostPrice(new BigDecimal("200.00"));
        pB.setSellingPrice(new BigDecimal("280.00"));
        ProductResponse createdB = productService.createProduct(pB);

        // Verify Tenant B only sees Tenant B's product
        List<ProductResponse> bProducts = productService.getAllProducts(null);
        assertEquals(1, bProducts.size());
        assertEquals("XYZ Tablet", bProducts.get(0).getName());

        // Tenant B cannot access Tenant A's product by ID
        assertThrows(RuntimeException.class, () -> productService.getProductById(createdA.getId()));

        // Tenant B cannot delete Tenant A's product
        assertThrows(RuntimeException.class, () -> productService.deleteProduct(createdA.getId()));

        // Tenant A only sees Tenant A's product
        authenticateUser("userA@abcmobile.com");
        List<ProductResponse> aProducts = productService.getAllProducts(null);
        assertEquals(1, aProducts.size());
        assertEquals("ABC Phone", aProducts.get(0).getName());
    }

    @Test
    @DisplayName("Stock Adjustment: Increment and Decrement")
    void testStockAdjustment() {
        SignupRequest signupReq = new SignupRequest();
        signupReq.setFullName("Fiona");
        signupReq.setEmail("fiona@gadgets.com");
        signupReq.setPassword("fiona123");
        signupReq.setConfirmPassword("fiona123");
        signupReq.setOrganizationName("Gadget World");
        authService.signup(signupReq);

        authenticateUser("fiona@gadgets.com");

        ProductRequest p = new ProductRequest();
        p.setName("Smart Watch");
        p.setSku("SW-10");
        p.setQuantityOnHand(20);
        p.setCostPrice(new BigDecimal("50.00"));
        p.setSellingPrice(new BigDecimal("80.00"));
        p.setLowStockThreshold(5);
        ProductResponse created = productService.createProduct(p);

        // Stock received: +10 -> 30
        ProductResponse adj1 = productService.adjustStock(created.getId(), new StockAdjustmentRequest(10, "Stock shipment"));
        assertEquals(30, adj1.getQuantityOnHand());

        // Stock sold: -5 -> 25
        ProductResponse adj2 = productService.adjustStock(created.getId(), new StockAdjustmentRequest(-5, "Counter sale"));
        assertEquals(25, adj2.getQuantityOnHand());

        // Disallow negative resulting quantity
        assertThrows(RuntimeException.class, () ->
                productService.adjustStock(created.getId(), new StockAdjustmentRequest(-30, "Excess reduction")));
    }
}
