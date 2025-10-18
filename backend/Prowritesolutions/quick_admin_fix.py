#!/usr/bin/env python3
"""
Quick Admin User Fix
Create admin user with your specific credentials
"""

import mysql.connector
import os
import bcrypt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'Prowrite.mysql.pythonanywhere-services.com'),
    'user': os.getenv('DB_USER', 'Prowrite'),
    'password': os.getenv('DB_PASSWORD', 'Hamilton2025'),
    'database': os.getenv('DB_NAME', 'Prowrite$dbprowrite'),
    'charset': 'utf8mb4'
}

def create_admin_with_credentials(email, password, first_name="Admin", last_name="User"):
    """Create admin user with specific credentials"""
    print(f"👤 Creating Admin User: {email}")
    print("=" * 50)
    
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        print("❌ Database connection failed")
        return False
    
    try:
        cursor = connection.cursor()
        
        # Get column structure
        cursor.execute("DESCRIBE users")
        columns = cursor.fetchall()
        column_names = [col[0] for col in columns]
        
        print(f"📋 Available columns: {column_names}")
        
        # Check if user already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            print("ℹ️  User already exists, updating to admin...")
            
            # Update existing user
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Build update query based on available columns
            update_clauses = []
            values = []
            
            if 'password' in column_names:
                update_clauses.append('password = %s')
                values.append(hashed_password)
            elif 'password_hash' in column_names:
                update_clauses.append('password_hash = %s')
                values.append(hashed_password)
            
            if 'first_name' in column_names:
                update_clauses.append('first_name = %s')
                values.append(first_name)
            
            if 'last_name' in column_names:
                update_clauses.append('last_name = %s')
                values.append(last_name)
            
            if 'is_admin' in column_names:
                update_clauses.append('is_admin = %s')
                values.append(True)
            
            if 'is_premium' in column_names:
                update_clauses.append('is_premium = %s')
                values.append(True)
            
            if 'updated_at' in column_names:
                update_clauses.append('updated_at = NOW()')
            
            values.append(email)
            
            query = f"UPDATE users SET {', '.join(update_clauses)} WHERE email = %s"
            cursor.execute(query, values)
            connection.commit()
            
            print("✅ User updated to admin successfully")
        else:
            print("ℹ️  Creating new admin user...")
            
            # Create new user
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Build insert query based on available columns
            insert_columns = []
            insert_values = []
            placeholders = []
            
            if 'email' in column_names:
                insert_columns.append('email')
                insert_values.append(email)
                placeholders.append('%s')
            
            if 'password' in column_names:
                insert_columns.append('password')
                insert_values.append(hashed_password)
                placeholders.append('%s')
            elif 'password_hash' in column_names:
                insert_columns.append('password_hash')
                insert_values.append(hashed_password)
                placeholders.append('%s')
            
            if 'first_name' in column_names:
                insert_columns.append('first_name')
                insert_values.append(first_name)
                placeholders.append('%s')
            
            if 'last_name' in column_names:
                insert_columns.append('last_name')
                insert_values.append(last_name)
                placeholders.append('%s')
            
            if 'is_admin' in column_names:
                insert_columns.append('is_admin')
                insert_values.append(True)
                placeholders.append('%s')
            
            if 'is_premium' in column_names:
                insert_columns.append('is_premium')
                insert_values.append(True)
                placeholders.append('%s')
            
            if 'created_at' in column_names:
                insert_columns.append('created_at')
                insert_values.append('NOW()')
                placeholders.append('NOW()')
            
            query = f"INSERT INTO users ({', '.join(insert_columns)}) VALUES ({', '.join(placeholders)})"
            cursor.execute(query, insert_values)
            connection.commit()
            
            print("✅ Admin user created successfully")
        
        # Verify the user was created/updated
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user_data = cursor.fetchone()
        
        if user_data:
            print(f"✅ Verification: User found in database")
            print(f"   Data: {user_data}")
            
            # Test password
            password_column = None
            if 'password' in column_names:
                password_column = 'password'
            elif 'password_hash' in column_names:
                password_column = 'password_hash'
            
            if password_column:
                password_index = column_names.index(password_column)
                stored_hash = user_data[password_index]
                
                is_valid = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
                print(f"🔑 Password test: {'✅ VALID' if is_valid else '❌ INVALID'}")
        
        return True
        
    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    finally:
        if connection:
            connection.close()

def main():
    """Main function"""
    print("🔧 Quick Admin User Fix")
    print("=" * 40)
    
    # You can change these credentials
    email = "prowritesolutions42@gmail.com"
    password = "admin123"
    first_name = "Prowrite"
    last_name = "Solutions"
    
    print(f"Creating admin user with:")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print(f"Name: {first_name} {last_name}")
    print()
    
    if create_admin_with_credentials(email, password, first_name, last_name):
        print("\n🎉 Admin user created successfully!")
        print(f"\nYou can now login with:")
        print(f"Email: {email}")
        print(f"Password: {password}")
    else:
        print("\n❌ Failed to create admin user")

if __name__ == "__main__":
    main()
