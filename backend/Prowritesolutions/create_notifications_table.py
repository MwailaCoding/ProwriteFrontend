#!/usr/bin/env python3
"""
Script to create the notifications table in the database
"""

import mysql.connector
import os
from datetime import datetime

# Database configuration for PythonAnywhere
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'Prowrite.mysql.pythonanywhere-services.com'),
    'user': os.getenv('DB_USER', 'Prowrite'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'Prowrite$dbprowrite'),
    'port': int(os.getenv('DB_PORT', 3306))
}

def create_notifications_table():
    """Create the notifications table if it doesn't exist"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("Creating notifications table...")
        
        # Create notifications table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                status VARCHAR(20) DEFAULT 'unread',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                read_at TIMESTAMP NULL,
                archived_at TIMESTAMP NULL,
                data JSON,
                action_url VARCHAR(500),
                expires_at TIMESTAMP NULL,
                category VARCHAR(100),
                icon VARCHAR(100),
                color VARCHAR(20),
                priority VARCHAR(20) DEFAULT 'normal',
                INDEX idx_user_id (user_id),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at),
                INDEX idx_type (type)
            )
        ''')
        
        print("✓ Notifications table created successfully")
        
        # Create notification preferences table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notification_preferences (
                user_id INT PRIMARY KEY,
                email_enabled BOOLEAN DEFAULT TRUE,
                push_enabled BOOLEAN DEFAULT TRUE,
                sms_enabled BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        ''')
        
        print("✓ Notification preferences table created successfully")
        
        # Insert some sample notifications for testing
        cursor.execute('''
            INSERT IGNORE INTO notifications (user_id, title, message, type, status, created_at)
            VALUES 
            (1, 'Welcome to ProWrite', 'Welcome to ProWrite! Start creating your professional resume.', 'welcome', 'unread', NOW()),
            (1, 'System Update', 'ProWrite has been updated with new features and improvements.', 'info', 'unread', NOW()),
            (1, 'Payment Confirmed', 'Your payment has been processed successfully.', 'success', 'unread', NOW())
        ''')
        
        print("✓ Sample notifications inserted")
        
        # Commit changes
        conn.commit()
        cursor.close()
        conn.close()
        
        print("✅ Database setup completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error creating notifications table: {e}")
        return False

def check_table_exists():
    """Check if notifications table exists"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        cursor.execute("SHOW TABLES LIKE 'notifications'")
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return result is not None
        
    except Exception as e:
        print(f"Error checking table: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Setting up notifications system...")
    
    if check_table_exists():
        print("ℹ️  Notifications table already exists")
    else:
        create_notifications_table()
