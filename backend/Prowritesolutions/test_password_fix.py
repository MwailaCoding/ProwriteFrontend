#!/usr/bin/env python3

"""
Test script to verify password hashing fix
"""

from werkzeug.security import check_password_hash, generate_password_hash
import mysql.connector
import os

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'prowrite_db'),
    'port': int(os.getenv('DB_PORT', 3306))
}

def test_password_hashing():
    """Test the password hashing and verification"""
    print("Testing password hashing fix...")
    
    # Test password
    test_password = "admin123"
    
    # Generate hash using Werkzeug
    hashed = generate_password_hash(test_password)
    print(f"Generated hash: {hashed}")
    print(f"Hash length: {len(hashed)}")
    print(f"Hash starts with: {hashed[:10]}")
    
    # Test verification
    is_valid = check_password_hash(hashed, test_password)
    print(f"Password verification result: {is_valid}")
    
    # Test with wrong password
    is_invalid = check_password_hash(hashed, "wrongpassword")
    print(f"Wrong password verification result: {is_invalid}")
    
    return hashed

def test_database_connection():
    """Test database connection and update admin password"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Get admin user
        cursor.execute("""
            SELECT user_id, email, password_hash, is_admin 
            FROM users 
            WHERE email = 'prowritesolutions42@gmail.com' AND is_admin = 1
        """)
        
        user = cursor.fetchone()
        
        if user:
            print(f"\nFound admin user: {user['email']}")
            print(f"Current password hash: {user['password_hash']}")
            
            # Generate new hash
            new_hash = generate_password_hash("admin123")
            print(f"New password hash: {new_hash}")
            
            # Update the password
            cursor.execute("""
                UPDATE users 
                SET password_hash = %s 
                WHERE user_id = %s
            """, (new_hash, user['user_id']))
            conn.commit()
            print("✅ Password updated successfully!")
            
            # Test the new password
            test_result = check_password_hash(new_hash, "admin123")
            print(f"✅ New password verification: {test_result}")
            
        else:
            print("❌ Admin user not found")
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Database error: {e}")

if __name__ == "__main__":
    print("=== Password Hashing Fix Test ===")
    
    # Test 1: Basic hashing
    print("\n1. Testing basic password hashing...")
    test_password_hashing()
    
    # Test 2: Database update
    print("\n2. Testing database password update...")
    test_database_connection()
    
    print("\n✅ All tests completed!")
