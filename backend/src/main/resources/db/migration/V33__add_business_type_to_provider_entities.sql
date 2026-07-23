-- Migration V33: Add business_type to branches and products
-- IMPORTANT: The product owner must verify the SKU patterns used for backfilling before deployment.

ALTER TABLE branches ADD COLUMN business_type VARCHAR(20) DEFAULT 'BOTH';
ALTER TABLE products ADD COLUMN business_type VARCHAR(20) DEFAULT 'BOTH';

-- Example SKU migration logic:
UPDATE products SET business_type = 'SPA' WHERE sku LIKE 'SPA-%';
UPDATE products SET business_type = 'SALON' WHERE sku LIKE 'SLN-%';
