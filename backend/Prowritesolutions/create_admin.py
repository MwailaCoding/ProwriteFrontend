#!/usr/bin/env python3
"""
Create admin user with known password
"""

import bcrypt
import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

def create_admin():
    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )
    
    cursor = conn.cursor()
    
    # Hash the password
    password = 'admin123'
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Update the admin user password
    cursor.execute("""
        UPDATE users 
        SET password_hash = %s 
        WHERE email = 'admin@prowrite.com'
    """, (hashed_password,))
    
    conn.commit()
    
    print(f"✅ Updated admin password to: {password}")
    print(f"✅ Password hash: {hashed_password[:50]}...")
    
    # Verify the password works
    cursor.execute('SELECT password_hash FROM users WHERE email = %s', ('admin@prowrite.com',))
    row = cursor.fetchone()
    stored_hash = row[0]
    
    result = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
    print(f"✅ Password verification: {'SUCCESS' if result else 'FAILED'}")
    
    conn.close()

if __name__ == "__main__":
    create_admin()

