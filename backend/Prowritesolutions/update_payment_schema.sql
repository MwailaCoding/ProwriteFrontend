-- Update Payment System Schema for M-Pesa Daraja Integration
-- This file updates the existing payments table and creates new tables for payment tracking

-- 1. Update existing payments table with new fields
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS checkout_request_id VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS merchant_request_id VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(15) NULL,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS failure_reason TEXT NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS payment_method ENUM('mpesa_stk', 'manual_admin', 'pesapal') DEFAULT 'mpesa_stk',
ADD COLUMN IF NOT EXISTS form_data JSON NULL;

-- 2. Create purchased_resumes table for tracking resume purchases
CREATE TABLE IF NOT EXISTS purchased_resumes (
    purchase_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    resume_id INT NOT NULL,
    payment_id INT NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(resume_id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_resume (user_id, resume_id)
);

-- 3. Create purchased_cover_letters table for tracking cover letter purchases
CREATE TABLE IF NOT EXISTS purchased_cover_letters (
    purchase_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cover_letter_id INT NOT NULL,
    payment_id INT NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (cover_letter_id) REFERENCES cover_letters(cover_letter_id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_cover_letter (user_id, cover_letter_id)
);

-- 4. Create payment_logs table for detailed payment tracking
CREATE TABLE IF NOT EXISTS payment_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'initiated', 'callback_received', 'status_updated', 'access_granted'
    details JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE CASCADE
);

-- 5. Create payment_settings table for M-Pesa configuration
CREATE TABLE IF NOT EXISTS payment_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NULL,
    description TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. Insert default payment settings
INSERT INTO payment_settings (setting_key, setting_value, description) VALUES
('mpesa_consumer_key', 'your_consumer_key', 'M-Pesa Consumer Key'),
('mpesa_consumer_secret', 'your_consumer_secret', 'M-Pesa Consumer Secret'),
('mpesa_business_short_code', '174379', 'M-Pesa Business Short Code (Test: 174379)'),
('mpesa_passkey', 'your_passkey', 'M-Pesa Passkey'),
('mpesa_environment', 'sandbox', 'M-Pesa Environment (sandbox/live)'),
('payment_currency', 'KES', 'Default payment currency'),
('resume_price', '500', 'Default resume price in KES'),
('cover_letter_price', '300', 'Default cover letter price in KES'),
('premium_monthly_price', '1500', 'Premium monthly subscription price in KES'),
('premium_yearly_price', '15000', 'Premium yearly subscription price in KES')
ON DUPLICATE KEY UPDATE
    setting_value = VALUES(setting_value),
    description = VALUES(description);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_checkout_request_id ON payments(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_payments_mpesa_code ON payments(mpesa_code);

CREATE INDEX IF NOT EXISTS idx_purchased_resumes_user_id ON purchased_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_purchased_resumes_resume_id ON purchased_resumes(resume_id);

CREATE INDEX IF NOT EXISTS idx_purchased_cover_letters_user_id ON purchased_cover_letters(user_id);
CREATE INDEX IF NOT EXISTS idx_purchased_cover_letters_cover_letter_id ON purchased_cover_letters(cover_letter_id);

-- 8. Add payment verification triggers
DELIMITER //

CREATE TRIGGER IF NOT EXISTS after_payment_completed
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Log the payment completion
        INSERT INTO payment_logs (payment_id, action, details) 
        VALUES (NEW.payment_id, 'status_updated', JSON_OBJECT('old_status', OLD.status, 'new_status', NEW.status));
        
        -- Log access granted
        INSERT INTO payment_logs (payment_id, action, details) 
        VALUES (NEW.payment_id, 'access_granted', JSON_OBJECT('payment_type', NEW.payment_type, 'item_id', NEW.item_id));
    END IF;
END//

DELIMITER ;

-- 9. Create view for payment summary
CREATE OR REPLACE VIEW payment_summary AS
SELECT 
    DATE(created_at) as payment_date,
    payment_type,
    status,
    COUNT(*) as payment_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount
FROM payments
GROUP BY DATE(created_at), payment_type, status
ORDER BY payment_date DESC, payment_type, status;

-- 10. Create view for user payment summary
CREATE OR REPLACE VIEW user_payment_summary AS
SELECT 
    u.user_id,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(p.payment_id) as total_payments,
    SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_spent,
    MAX(p.created_at) as last_payment_date,
    u.is_premium
FROM users u
LEFT JOIN payments p ON u.user_id = p.user_id
GROUP BY u.user_id, u.email, u.first_name, u.last_name, u.is_premium;

-- 11. Update existing payments to have default values for new fields
UPDATE payments 
SET 
    checkout_request_id = CONCAT('LEGACY_', payment_id) 
WHERE checkout_request_id IS NULL;

UPDATE payments 
SET 
    merchant_request_id = CONCAT('LEGACY_', payment_id) 
WHERE merchant_request_id IS NULL;

-- 12. Create sample data for testing (optional - remove in production)
INSERT INTO payment_logs (payment_id, action, details) 
SELECT 
    payment_id, 
    'legacy_migration', 
    JSON_OBJECT('note', 'Legacy payment migrated to new schema')
FROM payments 
WHERE created_at < NOW() - INTERVAL 1 DAY;

-- 13. Add comments for documentation
ALTER TABLE payments COMMENT = 'Enhanced payments table with M-Pesa Daraja integration support';
ALTER TABLE purchased_resumes COMMENT = 'Tracks resume purchases for download access control';
ALTER TABLE purchased_cover_letters COMMENT = 'Tracks cover letter purchases for download access control';
ALTER TABLE payment_logs COMMENT = 'Audit trail for payment actions and status changes';
ALTER TABLE payment_settings COMMENT = 'Configuration settings for payment system';

-- 14. Grant necessary permissions (adjust as needed for your database user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON payments TO 'your_app_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON purchased_resumes TO 'your_app_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON purchased_cover_letters TO 'your_app_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON payment_logs TO 'your_app_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON payment_settings TO 'your_app_user'@'localhost';

-- 15. Verify the schema update
SELECT 'Schema update completed successfully' as status;
SELECT COUNT(*) as payments_count FROM payments;
SELECT COUNT(*) as purchased_resumes_count FROM purchased_resumes;
SELECT COUNT(*) as purchased_cover_letters_count FROM purchased_cover_letters;
SELECT COUNT(*) as payment_logs_count FROM payment_logs;
SELECT COUNT(*) as payment_settings_count FROM payment_settings;
















