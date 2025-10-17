#!/usr/bin/env python3
"""
Check existing database structure without modifying it
"""

import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'prowrite_db'),
    'charset': 'utf8mb4'
}

def check_database_structure():
    """Check the existing database structure"""
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        print("❌ Database connection failed")
        return
    
    try:
        cursor = connection.cursor()
        
        # Check if users table exists
        cursor.execute("SHOW TABLES LIKE 'users'")
        if not cursor.fetchone():
            print("❌ Users table does not exist!")
            return
        
        # Get table structure
        cursor.execute("DESCRIBE users")
        columns = cursor.fetchall()
        
        print("📋 Current users table structure:")
        print("-" * 80)
        print(f"{'Field':<20} {'Type':<20} {'Null':<8} {'Key':<8} {'Default'}")
        print("-" * 80)
        
        for column in columns:
            field, type_info, null, key, default, extra = column
            print(f"{field:<20} {type_info:<20} {null:<8} {key:<8} {default or 'NULL'}")
        
        # Check if there are any existing users
        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()[0]
        print(f"\n📊 Total users in database: {count}")
        
        # Show sample data if any exists
        if count > 0:
            cursor.execute("SELECT * FROM users LIMIT 3")
            sample_data = cursor.fetchall()
            print("\n📋 Sample data:")
            for row in sample_data:
                print(f"  {row}")
        
    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    check_database_structure()
