-- Performance indexes for large tables to prevent table scans

CREATE INDEX idx_appt_branch_date ON appointments(branch_id, created_at);
CREATE INDEX idx_appt_customer ON appointments(customer_id);
CREATE INDEX idx_staff_branch ON staff(branch_id);
CREATE INDEX idx_invoice_branch_date ON invoices(branch_id, created_at);
CREATE INDEX idx_invoice_customer ON invoices(customer_id);
CREATE INDEX idx_customer_user ON customers(user_id);
