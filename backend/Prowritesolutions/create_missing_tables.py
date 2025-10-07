#!/usr/bin/env python3
"""
Create missing tables for M-Pesa integration
"""

import mysql.connector

def create_missing_tables():
    """Create the missing form_submissions and email_deliveries tables"""
    
    try:
        # Connect to database
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='',
            database='aiprowrite2'
        )
        cursor = conn.cursor()
        
        print("✅ Connected to aiprowrite2 database")
        
        # Create form_submissions table
        form_submissions_sql = """
        CREATE TABLE IF NOT EXISTS form_submissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            form_data JSON NOT NULL,
            document_type ENUM('Francisca Resume', 'Cover Letter') NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            payment_id INT,
            pdf_path VARCHAR(500),
            email_sent BOOLEAN DEFAULT FALSE,
            status ENUM('pending_payment', 'paid', 'pdf_generated', 'email_sent', 'completed') DEFAULT 'pending_payment',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        
        cursor.execute(form_submissions_sql)
        print("✅ form_submissions table created")
        
        # Create email_deliveries table
        email_deliveries_sql = """
        CREATE TABLE IF NOT EXISTS email_deliveries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            submission_id INT NOT NULL,
            recipient_email VARCHAR(255) NOT NULL,
            sent_at TIMESTAMP,
            status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
            error_message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (submission_id) REFERENCES form_submissions(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        
        cursor.execute(email_deliveries_sql)
        print("✅ email_deliveries table created")
        
        conn.commit()
        print("✅ All tables created successfully!")
        
        # Verify tables exist
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        table_names = [table[0] for table in tables]
        
        required_tables = ['form_submissions', 'email_deliveries', 'payments']
        print("\nTable verification:")
        for table in required_tables:
            if table in table_names:
                print(f"✅ {table} - EXISTS")
            else:
                print(f"❌ {table} - MISSING")
        
    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()
            print("Database connection closed")

if __name__ == "__main__":
    print("🚀 Creating missing tables for M-Pesa integration...")
    create_missing_tables()

