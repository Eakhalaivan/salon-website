CREATE TABLE coupons (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type ENUM('PERCENTAGE','FIXED') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  valid_from DATETIME,
  valid_until DATETIME,
  usage_limit INT,
  times_used INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE invoices ADD COLUMN coupon_code VARCHAR(50);
ALTER TABLE invoices ADD COLUMN coupon_discount DECIMAL(10,2) DEFAULT 0;
