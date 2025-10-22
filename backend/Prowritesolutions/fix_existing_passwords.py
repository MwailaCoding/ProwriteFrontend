#!/usr/bin/env python3

"""
Script to fix existing password hashes in the database
Updates all admin users to use Werkzeug's password hashing
"""

import mysql.connector
import os
from werkzeug.security import generate_password_hash

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'prowrite_db'),
    'port': int(os.getenv('DB_PORT', 3306))
}

def fix_admin_passwords():
    """Fix admin user passwords to use correct hashing"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Get all admin users
        cursor.execute("""
            SELECT user_id, email, password_hash, is_admin 
            FROM users 
            WHERE is_admin = 1
        """)
        
        admin_users = cursor.fetchall()
        
        if not admin_users:
            print("No admin users found")
            return
        
        print(f"Found {len(admin_users)} admin user(s)")
        
        # Default admin password
        admin_password = "admin123"
        
        for user in admin_users:
            print(f"\nUpdating admin user: {user['email']}")
            print(f"Current hash: {user['password_hash'][:20]}...")
            
            # Generate new hash using Werkzeug
            new_hash = generate_password_hash(admin_password)
            print(f"New hash: {new_hash[:20]}...")
            
            # Update the password
            cursor.execute("""
                UPDATE users 
                SET password_hash = %s 
                WHERE user_id = %s
            """, (new_hash, user['user_id']))
            
            print(f"✅ Updated password for {user['email']}")
        
        conn.commit()
        print(f"\n✅ Successfully updated {len(admin_users)} admin user(s)")
        print(f"All admin users now use password: {admin_password}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("=== Fixing Admin Password Hashes ===")
    fix_admin_passwords()
    print("\n✅ Password fix completed!")
