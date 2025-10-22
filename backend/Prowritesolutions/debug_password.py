#!/usr/bin/env python3

import mysql.connector
import os
from werkzeug.security import check_password_hash, generate_password_hash

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', ''),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'prowrite_db'),
    'port': int(os.getenv('DB_PORT', 3306))
}

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

def debug_password_hash():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get admin user password hash
        cursor.execute("""
            SELECT user_id, email, password_hash, is_admin 
            FROM users 
            WHERE email = 'prowritesolutions42@gmail.com' AND is_admin = 1
        """)
        
        user = cursor.fetchone()
        
        if user:
            print(f"User found: {user['email']}")
            print(f"Password hash: {user['password_hash']}")
            print(f"Hash length: {len(user['password_hash'])}")
            print(f"Hash starts with: {user['password_hash'][:10]}")
            
            # Test with a known password
            test_password = "admin123"  # Common test password
            
            try:
                result = check_password_hash(user['password_hash'], test_password)
                print(f"Password check result: {result}")
            except Exception as e:
                print(f"Password check error: {e}")
                
                # Try to generate a new hash
                new_hash = generate_password_hash(test_password)
                print(f"New hash generated: {new_hash}")
                
                # Update the password
                cursor.execute("""
                    UPDATE users 
                    SET password_hash = %s 
                    WHERE user_id = %s
                """, (new_hash, user['user_id']))
                conn.commit()
                print("Password updated successfully!")
        else:
            print("Admin user not found")
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_password_hash()
