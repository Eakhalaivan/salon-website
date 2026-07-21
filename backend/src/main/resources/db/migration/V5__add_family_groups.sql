-- Migration for Client Family Records (Module 1)
-- Adds family_groups to allow customers to link their accounts and optionally pool loyalty points.
-- Updates customers table to reference family_groups.

CREATE TABLE family_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    pool_points BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE customers ADD COLUMN family_group_id BIGINT NULL;
ALTER TABLE customers ADD COLUMN is_primary_member BOOLEAN DEFAULT FALSE;

ALTER TABLE customers
ADD CONSTRAINT fk_customer_family_group FOREIGN KEY (family_group_id) REFERENCES family_groups(id) ON DELETE SET NULL;
