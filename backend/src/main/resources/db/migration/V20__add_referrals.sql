ALTER TABLE customers ADD COLUMN referral_code VARCHAR(50);
ALTER TABLE customers ADD UNIQUE (referral_code);

CREATE TABLE referrals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    referrer_customer_id BIGINT NOT NULL,
    referred_customer_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    reward_issued BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (referrer_customer_id) REFERENCES customers(id),
    FOREIGN KEY (referred_customer_id) REFERENCES customers(id)
);
