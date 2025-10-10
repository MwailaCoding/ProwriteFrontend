#!/usr/bin/env python3
"""
Database Setup Script for M-Pesa Integration
Creates required tables in the aiprowrite2 database
"""

import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('env_file')

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'aiprowrite2'),
    'charset': 'utf8mb4'
}

def create_tables():
    """Create required tables for M-Pesa integration"""
    
    # SQL statements for table creation
    tables = {
        'form_submissions': """
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """,
        
        'email_deliveries': """
            CREATE TABLE IF NOT EXISTS email_deliveries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                submission_id INT NOT NULL,
                recipient_email VARCHAR(255) NOT NULL,
                sent_at TIMESTAMP,
                status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (submission_id) REFERENCES form_submissions(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """,
        
        'payments': """
            CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                currency VARCHAR(3) DEFAULT 'KES',
                payment_method ENUM('mpesa', 'card', 'bank') DEFAULT 'mpesa',
                status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
                mpesa_checkout_request_id VARCHAR(255),
                mpesa_merchant_request_id VARCHAR(255),
                mpesa_receipt_number VARCHAR(255),
                transaction_reference VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    }
    
    try:
        # Connect to database
        print(f"Connecting to database: {DB_CONFIG['database']}")
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("✅ Database connection successful")
        
        # Create tables
        for table_name, sql in tables.items():
            try:
                print(f"Creating table: {table_name}")
                cursor.execute(sql)
                connection.commit()
                print(f"✅ Table '{table_name}' created successfully")
            except mysql.connector.Error as e:
                if e.errno == 1050:  # Table already exists
                    print(f"⚠️  Table '{table_name}' already exists")
                else:
                    print(f"❌ Error creating table '{table_name}': {e}")
        
        # Verify tables exist
        print("\nVerifying tables...")
        cursor.execute("SHOW TABLES")
        existing_tables = [table[0] for table in cursor.fetchall()]
        
        required_tables = ['form_submissions', 'email_deliveries', 'payments']
        for table in required_tables:
            if table in existing_tables:
                print(f"✅ Table '{table}' exists")
            else:
                print(f"❌ Table '{table}' missing")
        
        # Show table structures
        print("\nTable structures:")
        for table in required_tables:
            if table in existing_tables:
                print(f"\n--- {table} ---")
                cursor.execute(f"DESCRIBE {table}")
                columns = cursor.fetchall()
                for column in columns:
                    print(f"  {column[0]} - {column[1]} - {column[2]}")
        
        print("\n🎉 Database setup completed successfully!")
        
    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("Database connection closed")
    
    return True

if __name__ == "__main__":
    print("🚀 Setting up M-Pesa integration database tables...")
    print(f"Database: {DB_CONFIG['database']}")
    print(f"Host: {DB_CONFIG['host']}")
    print(f"User: {DB_CONFIG['user']}")
    print("-" * 50)
    
    success = create_tables()
    
    if success:
        print("\n✅ Database setup completed successfully!")
        print("You can now run your Flask application with M-Pesa integration.")
    else:
        print("\n❌ Database setup failed!")
        print("Please check your database configuration and try again.")

