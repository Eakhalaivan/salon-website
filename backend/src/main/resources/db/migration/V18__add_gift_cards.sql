CREATE TABLE gift_cards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    initial_balance DECIMAL(10, 2) NOT NULL,
    current_balance DECIMAL(10, 2) NOT NULL,
    purchased_by_customer_id BIGINT,
    recipient_email VARCHAR(255),
    recipient_name VARCHAR(255),
    status VARCHAR(20) NOT NULL,
    issued_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (purchased_by_customer_id) REFERENCES customers(id)
);

CREATE TABLE gift_card_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    gift_card_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(20) NOT NULL,
    related_invoice_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gift_card_id) REFERENCES gift_cards(id),
    FOREIGN KEY (related_invoice_id) REFERENCES invoices(id)
);
