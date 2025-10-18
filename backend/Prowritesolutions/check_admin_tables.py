#!/usr/bin/env python3
"""
Check if admin-related database tables exist
"""

import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'prowrite_db'),
    'port': int(os.getenv('DB_PORT', 3306))
}

def check_tables():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("Checking database tables...")
        
        # List all tables
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print(f"Found {len(tables)} tables:")
        for table in tables:
            print(f"  - {table[0]}")
        
        # Check specific admin-related tables
        admin_tables = ['users', 'user_documents', 'payments', 'system_logs', 'admin_activity_logs']
        
        print("\nChecking admin-related tables:")
        for table in admin_tables:
            cursor.execute(f"SHOW TABLES LIKE '{table}'")
            result = cursor.fetchone()
            if result:
                print(f"  ✓ {table} exists")
                
                # Get table structure
                cursor.execute(f"DESCRIBE {table}")
                columns = cursor.fetchall()
                print(f"    Columns: {[col[0] for col in columns]}")
                
                # Get row count
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"    Rows: {count}")
            else:
                print(f"  ✗ {table} does not exist")
        
        # Check if users table has admin columns
        print("\nChecking users table structure:")
        cursor.execute("DESCRIBE users")
        columns = cursor.fetchall()
        for col in columns:
            print(f"  - {col[0]} ({col[1]})")
        
        # Check for admin users
        print("\nChecking for admin users:")
        cursor.execute("SELECT user_id, first_name, last_name, email, is_admin FROM users WHERE is_admin = 1")
        admin_users = cursor.fetchall()
        if admin_users:
            print(f"Found {len(admin_users)} admin users:")
            for user in admin_users:
                print(f"  - {user[1]} {user[2]} ({user[3]}) - Admin: {user[4]}")
        else:
            print("No admin users found")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Database error: {str(e)}")

if __name__ == "__main__":
    check_tables()
