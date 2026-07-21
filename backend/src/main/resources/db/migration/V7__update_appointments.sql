-- Migration for Appointments (Module 3)
-- Adds is_walk_in flag to appointments

ALTER TABLE appointments
ADD COLUMN is_walk_in BOOLEAN DEFAULT FALSE;
