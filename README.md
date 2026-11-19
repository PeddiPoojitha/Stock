# StockFlow - Multi-Tenant SaaS Inventory Management System

StockFlow is a production-style, multi-tenant inventory management SaaS platform designed for small business owners and shop owners to manage products, available stock, pricing, and automated low-stock replenishment alerts.

> **Important**: This is an inventory SaaS platform, **not** an e-commerce shopping site (no customer checkout, shopping cart, or payment gateways).

---

## 1. System Architecture & Multi-Tenant Isolation

StockFlow employs a clean layered architecture with complete organizational data isolation:

```
[ React.js SPA (Vite) ]
       │  HTTP / REST + Bearer JWT
       ▼
[ Spring Security Filter Chain ] ──▶ [ JwtAuthenticationFilter ]
       │                                     │
       ▼                                     ▼
[ REST Controllers ] ──────────────▶ [ SecurityContext (Tenant ID) ]
       │
       ▼
[ Service Layer ] (Multi-tenant scoped queries; never trusts client org ID)
       │
       ▼
[ Spring Data JPA / Hibernate ]
       │
       ▼
[ MySQL 8 Database (stockflow_db) ]
```

### Multi-Tenant Security Rules:
1. Every user belongs to exactly one `Organization` created during signup.
2. The authenticated organization ID is extracted strictly from the validated JWT token on the backend server (`SecurityContextHolder`).
3. Organization ID sent from the frontend is **never** trusted.
4. All product queries, updates, deletes, stock adjustments, and dashboard metrics are automatically filtered by `organization_id`.
5. SKU uniqueness is enforced per organization using composite unique constraint: `UNIQUE KEY uk_organization_sku (organization_id, sku)`.

---

## 2. Technology Stack

### Backend
- **Language**: Java 21 LTS
- **Framework**: Spring Boot 3.3.5
- **Modules**:
  - `spring-boot-starter-web` (REST APIs)
  - `spring-boot-starter-data-jpa` & Hibernate (ORM)
  - `spring-boot-starter-security` (Stateless JWT Authentication)
  - `spring-boot-starter-validation` (Bean Validation)
  - `io.jsonwebtoken (jjwt 0.12.6)` (HMAC-SHA256 JWT signing)
  - `mysql-connector-j` (MySQL 8 driver)
- **Build Tool**: Apache Maven (with `mvnw` wrapper included)

### Frontend
- **Framework**: React.js 19 (Vite)
- **Routing**: `react-router-dom` v7
- **HTTP Client**: `axios` with automatic JWT Bearer token & 401 interceptors
- **State Management**: React Context API (`AuthContext`, `ToastContext`)
- **Icons**: `lucide-react`
- **Design System**: Modern SaaS UI (inspired by Linear, Stripe Dashboard, Vercel)

### Database
- **Database**: MySQL 8.x
- **Database Name**: `stockflow_db`

---

## 3. Database Schema

The database schema comprises three core relational tables:

```sql
organizations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    default_low_stock_threshold INT NOT NULL DEFAULT 5,
    created_at DATETIME(6) NOT NULL
);

users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    organization_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    description TEXT,
    quantity_on_hand INT NOT NULL DEFAULT 0,
    cost_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    low_stock_threshold INT DEFAULT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE KEY uk_organization_sku (organization_id, sku)
);
```

---

## 4. REST API Endpoint Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new organization & store owner | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | No |

### Products (`/api/products`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/products` | List all organization products (optional `?search=`) | Yes (JWT) |
| `GET` | `/api/products/{id}` | Get product details by ID (tenant-isolated) | Yes (JWT) |
| `POST` | `/api/products` | Create a new product with unique SKU | Yes (JWT) |
| `PUT` | `/api/products/{id}` | Update product fields and threshold | Yes (JWT) |
| `DELETE` | `/api/products/{id}` | Permanently delete product from organization | Yes (JWT) |
| `PATCH` | `/api/products/{id}/adjust-stock` | Increment/decrement stock quantity | Yes (JWT) |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Summary cards & inventory metrics | Yes (JWT) |
| `GET` | `/api/dashboard/low-stock` | List products with quantity &le; threshold | Yes (JWT) |

### Settings (`/api/settings`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/settings` | Get organization threshold setting | Yes (JWT) |
| `PUT` | `/api/settings` | Update default low-stock threshold | Yes (JWT) |

---

## 5. Low-Stock Alert Logic

A product is flagged as **Low Stock** when:
$$\text{quantity\_on\_hand} \le \text{effective\_threshold}$$

**Effective Threshold Resolution Hierarchy**:
1. Product-specific `low_stock_threshold` (if defined and non-null).
2. Organization-level `default_low_stock_threshold` (configured in Settings).
3. Fallback default of `5` units.

---

## 6. Installation & How to Run

### Prerequisites
- Java 17 or Java 21 installed (`java -version`)
- Node.js 18+ and npm (`node -v`, `npm -v`)
- MySQL 8 server running locally on port 3306

### Step 1: Database Setup
Ensure MySQL is running, then create the database:
```sql
CREATE DATABASE IF NOT EXISTS stockflow_db;
```

Update credentials in `backend/src/main/resources/application.properties` if your MySQL password differs:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/stockflow_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=12345
```

### Step 2: Run the Backend (Spring Boot)
Open a terminal in `backend/`:
```bash
cd backend
./mvnw spring-boot:run
```
Backend will start on `http://localhost:8080`.

To run backend automated test suite:
```bash
./mvnw test
```

### Step 3: Run the Frontend (React.js)
Open a separate terminal in `frontend/`:
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:5173`.

---

## 7. Demo Accounts & Test Credentials

Safe pre-configured demo test accounts:

| Organization | Email | Password |
|---|---|---|
| **ABC Mobile Store** | `alice.store@abcmobile.com` | `password123` |
| **XYZ Electronics** | `bob.tech@xyzelec.com` | `password123` |

You can also click **Create an organization** on the signup page to register any new store with custom credentials.

---

## 8. Verification & Test Scenarios

The test suite in `StockflowApplicationTests.java` validates all 15 scenarios:
1. Register organization and user with BCrypt password encryption.
2. Authenticate with valid credentials and verify JWT generation.
3. Reject invalid credentials with 401 Unauthorized.
4. Add products with field validations.
5. View and list products with stock badges.
6. Update product specifications and quantities.
7. Delete products with confirmation.
8. Search products dynamically by name.
9. Search products dynamically by SKU.
10. Calculate total organization products.
11. Compute sum of stock quantities across catalog.
12. Verify low-stock calculation and threshold inheritance.
13. Update organization default threshold and verify dynamic recalculation.
14. Enforce strict multi-tenant isolation (Tenant A cannot view or manipulate Tenant B's products; SKU collision allowed between distinct tenants).
15. Reject unauthenticated API requests with 403 Forbidden.
