-- Add business_type column to services table
ALTER TABLE services ADD COLUMN business_type VARCHAR(20) NOT NULL DEFAULT 'BOTH';

-- Update mapping based on existing categories
UPDATE services SET business_type = 'SPA' WHERE category IN ('Massage', 'Skin');
UPDATE services SET business_type = 'SALON' WHERE category IN ('Hair', 'Nails', 'Grooming');
-- Any other categories remain 'BOTH'
