-- Add payment_status and deleted_at to appointments
-- Note: business_type is already added in V36__add_business_type_everywhere.sql
-- payment_status is non-nullable in the entity, so we provide a default value for existing records.

ALTER TABLE appointments ADD COLUMN payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
ALTER TABLE appointments ADD COLUMN deleted_at DATETIME(6) DEFAULT NULL;
