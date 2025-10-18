#!/usr/bin/env python3
"""
Create admin-related database tables
Run this script to set up the admin functionality
"""

import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'prowrite_db'),
    'port': int(os.getenv('DB_PORT', 3306))
}

def create_admin_tables():
    """Create all admin-related tables"""
    try:
        # Connect to database
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("Connected to database successfully!")
        
        # 1. Add is_admin column to users table if it doesn't exist
        print("Adding is_admin column to users table...")
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE")
            print("✓ Added is_admin column to users table")
        except mysql.connector.Error as e:
            if "Duplicate column name" in str(e):
                print("✓ is_admin column already exists in users table")
            else:
                print(f"Error adding is_admin column: {e}")
        
        # 2. Create user_documents table
        print("Creating user_documents table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_documents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                file_size BIGINT NOT NULL,
                file_type VARCHAR(50) NOT NULL,
                document_type ENUM('resume', 'cover_letter', 'cv', 'other') DEFAULT 'resume',
                status ENUM('active', 'deleted') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                download_count INT DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_document_type (document_type),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at)
            )
        """)
        print("✓ Created user_documents table")
        
        # 3. Create admin_activity_logs table
        print("Creating admin_activity_logs table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admin_activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                admin_id INT NOT NULL,
                action VARCHAR(100) NOT NULL,
                details TEXT,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_admin_id (admin_id),
                INDEX idx_action (action),
                INDEX idx_created_at (created_at)
            )
        """)
        print("✓ Created admin_activity_logs table")
        
        # 4. Create system_logs table
        print("Creating system_logs table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                level ENUM('info', 'warning', 'error', 'success', 'debug') NOT NULL,
                message TEXT NOT NULL,
                source VARCHAR(100) NOT NULL,
                user_id INT NULL,
                ip_address VARCHAR(45),
                user_agent TEXT,
                metadata JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
                INDEX idx_level (level),
                INDEX idx_source (source),
                INDEX idx_user_id (user_id),
                INDEX idx_created_at (created_at)
            )
        """)
        print("✓ Created system_logs table")
        
        # 5. Create notification_queue table
        print("Creating notification_queue table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notification_queue (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type ENUM('info', 'success', 'warning', 'error') NOT NULL,
                user_id INT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                action_url VARCHAR(500),
                expires_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_type (type),
                INDEX idx_is_read (is_read),
                INDEX idx_created_at (created_at)
            )
        """)
        print("✓ Created notification_queue table")
        
        # 6. Create payment_approvals table
        print("Creating payment_approvals table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS payment_approvals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                payment_id INT NOT NULL,
                admin_id INT NOT NULL,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                notes TEXT,
                admin_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
                FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_payment_id (payment_id),
                INDEX idx_admin_id (admin_id),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at)
            )
        """)
        print("✓ Created payment_approvals table")
        
        # 7. Insert some sample system logs
        print("Inserting sample system logs...")
        sample_logs = [
            ('info', 'Admin panel initialized', 'system', None),
            ('info', 'Database connection established', 'system', None),
            ('success', 'Admin user created successfully', 'admin', 1),
            ('info', 'System backup completed', 'system', None),
            ('warning', 'High memory usage detected', 'system', None)
        ]
        
        for level, message, source, user_id in sample_logs:
            cursor.execute("""
                INSERT IGNORE INTO system_logs (level, message, source, user_id)
                VALUES (%s, %s, %s, %s)
            """, (level, message, source, user_id))
        
        print("✓ Inserted sample system logs")
        
        # 8. Create an admin user if none exists
        print("Creating admin user...")
        cursor.execute("SELECT COUNT(*) FROM users WHERE is_admin = TRUE")
        admin_count = cursor.fetchone()[0]
        
        if admin_count == 0:
            import bcrypt
            admin_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
            cursor.execute("""
                INSERT INTO users (first_name, last_name, email, password_hash, is_admin, is_premium)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, ('Admin', 'User', 'admin@prowrite.com', admin_password, True, True))
            print("✓ Created admin user (email: admin@prowrite.com, password: admin123)")
        else:
            print("✓ Admin user already exists")
        
        # Commit all changes
        conn.commit()
        print("\n🎉 All admin tables created successfully!")
        print("\nAdmin credentials:")
        print("Email: admin@prowrite.com")
        print("Password: admin123")
        
    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
    
    return True

if __name__ == "__main__":
    print("Setting up admin functionality...")
    success = create_admin_tables()
    if success:
        print("\n✅ Admin setup completed successfully!")
    else:
        print("\n❌ Admin setup failed!")