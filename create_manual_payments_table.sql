-- Create manual_payments table for ProWrite
CREATE TABLE IF NOT EXISTS manual_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(50) UNIQUE NOT NULL,
    form_data JSON,
    document_type VARCHAR(100),
    amount INT,
    status VARCHAR(50) DEFAULT 'pending_payment',
    payment_method VARCHAR(50) DEFAULT 'manual',
    transaction_code VARCHAR(100),
    validation_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reference (reference),
    INDEX idx_status (status)
);
