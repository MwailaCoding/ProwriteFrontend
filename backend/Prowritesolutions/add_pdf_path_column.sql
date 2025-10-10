-- Add pdf_path column to manual_payments table for auto-download functionality
-- Run this script on your database to enable PDF download functionality

ALTER TABLE manual_payments 
ADD COLUMN pdf_path VARCHAR(500) NULL 
COMMENT 'Path to generated PDF file for download';

-- Update existing records to have NULL pdf_path (they will be populated when PDFs are generated)
UPDATE manual_payments SET pdf_path = NULL WHERE pdf_path IS NULL;

-- Add index for better performance
CREATE INDEX idx_manual_payments_pdf_path ON manual_payments(pdf_path);

-- Verify the column was added
DESCRIBE manual_payments;

