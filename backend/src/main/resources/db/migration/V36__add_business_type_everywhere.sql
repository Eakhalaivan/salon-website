-- Add business_type to appointments, staff, and subscription_plans
ALTER TABLE appointments ADD COLUMN business_type VARCHAR(20) DEFAULT 'BOTH';
ALTER TABLE staff ADD COLUMN business_type VARCHAR(20) DEFAULT 'BOTH';
ALTER TABLE subscription_plans ADD COLUMN business_type VARCHAR(20) DEFAULT 'BOTH';
