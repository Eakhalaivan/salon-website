ALTER TABLE gift_cards ADD COLUMN sent_by_admin_id BIGINT NULL REFERENCES users(id);
ALTER TABLE gift_cards ADD COLUMN recipient_customer_id BIGINT NULL REFERENCES customers(id);
ALTER TABLE gift_cards ADD COLUMN message TEXT NULL;
ALTER TABLE gift_cards ADD COLUMN redeemed_at TIMESTAMP NULL;
ALTER TABLE gift_cards ADD COLUMN source VARCHAR(20) NOT NULL DEFAULT 'PURCHASED';
