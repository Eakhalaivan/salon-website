CREATE TABLE staff_note (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT,
    content TEXT,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    CONSTRAINT fk_staff_note_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
);

CREATE TABLE cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT DEFAULT 1,
    added_at DATETIME(6),
    CONSTRAINT fk_cart_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE wishlist_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    added_at DATETIME(6),
    CONSTRAINT fk_wishlist_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE leave_request (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT,
    type VARCHAR(50),
    from_date DATE,
    to_date DATE,
    reason TEXT,
    status VARCHAR(50),
    created_at DATETIME(6),
    updated_at DATETIME(6),
    CONSTRAINT fk_leave_request_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
);
