-- Migration for Sitting Packages (Module 5)
-- Adds sitting_packages, sitting_package_items, customer_packages, customer_package_items

CREATE TABLE sitting_packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    validity_days INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sitting_package_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    package_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    allow_substitutions BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_sp_items_pkg FOREIGN KEY (package_id) REFERENCES sitting_packages(id) ON DELETE CASCADE,
    CONSTRAINT fk_sp_items_svc FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE customer_packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    purchase_date TIMESTAMP NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cp_cust FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_cp_pkg FOREIGN KEY (package_id) REFERENCES sitting_packages(id) ON DELETE RESTRICT
);

CREATE TABLE customer_package_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_package_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    remaining_quantity INT NOT NULL,
    CONSTRAINT fk_cpi_cp FOREIGN KEY (customer_package_id) REFERENCES customer_packages(id) ON DELETE CASCADE,
    CONSTRAINT fk_cpi_svc FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
);
