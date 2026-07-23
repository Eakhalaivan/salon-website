CREATE TABLE branch_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    business_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    currency VARCHAR(10),
    time_zone VARCHAR(50),
    maintenance_mode BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_branch_settings_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);
