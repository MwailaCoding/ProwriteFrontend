#!/usr/bin/env python3
"""
PythonAnywhere Database Setup Script
Run this directly in your PythonAnywhere console
"""

import mysql.connector
import os

def setup_notifications_table():
    """Create notifications table on PythonAnywhere"""
    
    # PythonAnywhere database configuration
    DB_CONFIG = {
        'host': 'Prowrite.mysql.pythonanywhere-services.com',
        'user': 'Prowrite',
        'password': '',  # Add your actual password here
        'database': 'Prowrite$dbprowrite',
        'port': 3306
    }
    
    try:
        print("🔧 Connecting to PythonAnywhere database...")
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("📋 Creating notifications table...")
        
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
        
        print("✅ Notifications table created successfully")
        
        # Create notification preferences table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notification_preferences (
                user_id INT PRIMARY KEY,
                email_enabled BOOLEAN DEFAULT TRUE,
                push_enabled BOOLEAN DEFAULT TRUE,
                sms_enabled BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        ''')
        
        print("✅ Notification preferences table created successfully")
        
        # Insert sample notifications
        cursor.execute('''
            INSERT IGNORE INTO notifications (user_id, title, message, type, status, created_at)
            VALUES 
            (1, 'Welcome to ProWrite', 'Welcome to ProWrite! Start creating your professional resume.', 'welcome', 'unread', NOW()),
            (1, 'System Update', 'ProWrite has been updated with new features and improvements.', 'info', 'unread', NOW()),
            (1, 'Payment Confirmed', 'Your payment has been processed successfully.', 'success', 'unread', NOW())
        ''')
        
        print("✅ Sample notifications inserted")
        
        # Commit changes
        conn.commit()
        cursor.close()
        conn.close()
        
        print("🎉 Database setup completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    setup_notifications_table()
