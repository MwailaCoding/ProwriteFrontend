-- Fix missing form_data column in payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS form_data JSON NULL;
