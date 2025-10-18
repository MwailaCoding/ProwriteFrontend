#!/usr/bin/env python3
"""
Diagnose Authentication Issues
Check database structure and test authentication
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

def check_database_structure():
    """Check the actual database structure"""
    print("🔍 Checking Database Structure...")
    print("=" * 50)
    
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        print("❌ Database connection failed")
        return False
    
    try:
        cursor = connection.cursor()
        
        # Check if users table exists
        cursor.execute("SHOW TABLES LIKE 'users'")
        if not cursor.fetchone():
            print("❌ Users table does not exist!")
            return False
        
        # Get table structure
        cursor.execute("DESCRIBE users")
        columns = cursor.fetchall()
        
        print("📋 Current users table structure:")
        print("-" * 80)
        print(f"{'Field':<20} {'Type':<20} {'Null':<8} {'Key':<8} {'Default'}")
        print("-" * 80)
        
        column_names = []
        for column in columns:
            field, type_info, null, key, default, extra = column
            column_names.append(field)
            print(f"{field:<20} {type_info:<20} {null:<8} {key:<8} {default or 'NULL'}")
        
        # Check if there are any users
        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()[0]
        print(f"\n📊 Total users in database: {count}")
        
        # Show all users if any exist
        if count > 0:
            print("\n📋 All users in database:")
            print("-" * 100)
            
            # Build query based on available columns
            select_columns = []
            if 'user_id' in column_names:
                select_columns.append('user_id')
            elif 'id' in column_names:
                select_columns.append('id')
            
            if 'email' in column_names:
                select_columns.append('email')
            
            if 'password' in column_names:
                select_columns.append('password')
            elif 'password_hash' in column_names:
                select_columns.append('password_hash')
            
            if 'first_name' in column_names:
                select_columns.append('first_name')
            
            if 'last_name' in column_names:
                select_columns.append('last_name')
            
            if 'is_admin' in column_names:
                select_columns.append('is_admin')
            
            if 'is_premium' in column_names:
                select_columns.append('is_premium')
            
            if 'created_at' in column_names:
                select_columns.append('created_at')
            
            if select_columns:
                query = f"SELECT {', '.join(select_columns)} FROM users"
                cursor.execute(query)
                users = cursor.fetchall()
                
                for user in users:
                    print(f"  {user}")
            else:
                print("  No recognizable columns found")
        
        return column_names
        
    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
        return False
    finally:
        if connection:
            connection.close()

def test_authentication(email, password):
    """Test authentication with the actual database structure"""
    print(f"\n🧪 Testing Authentication for: {email}")
    print("=" * 50)
    
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        print("❌ Database connection failed")
        return False
    
    try:
        cursor = connection.cursor()
        
        # First, let's see what columns we have
        cursor.execute("DESCRIBE users")
        columns = cursor.fetchall()
        column_names = [col[0] for col in columns]
        
        print(f"📋 Available columns: {column_names}")
        
        # Try to find the user
        if 'email' in column_names:
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user_data = cursor.fetchone()
            
            if not user_data:
                print(f"❌ User with email {email} not found")
                return False
            
            print(f"✅ User found: {user_data}")
            
            # Check password column
            password_column = None
            if 'password' in column_names:
                password_column = 'password'
            elif 'password_hash' in column_names:
                password_column = 'password_hash'
            
            if not password_column:
                print("❌ No password column found")
                return False
            
            # Get password hash
            password_index = column_names.index(password_column)
            stored_hash = user_data[password_index]
            
            print(f"🔐 Stored hash: {stored_hash[:50]}...")
            
            # Test password verification
            try:
                is_valid = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
                print(f"🔑 Password verification: {'✅ VALID' if is_valid else '❌ INVALID'}")
                return is_valid
            except Exception as e:
                print(f"❌ Password verification error: {e}")
                return False
        else:
            print("❌ No email column found")
            return False
            
    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
        return False
    finally:
        if connection:
            connection.close()

def create_test_admin():
    """Create a test admin user with known credentials"""
    print(f"\n👤 Creating Test Admin User...")
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
        
        # Check if admin user already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", ('admin@prowrite.com',))
        existing_user = cursor.fetchone()
        
        if existing_user:
            print("ℹ️  Admin user already exists, updating password...")
            
            # Update existing user
            hashed_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
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
                values.append('Admin')
            
            if 'last_name' in column_names:
                update_clauses.append('last_name = %s')
                values.append('User')
            
            if 'is_admin' in column_names:
                update_clauses.append('is_admin = %s')
                values.append(True)
            
            if 'updated_at' in column_names:
                update_clauses.append('updated_at = NOW()')
            
            values.append('admin@prowrite.com')
            
            query = f"UPDATE users SET {', '.join(update_clauses)} WHERE email = %s"
            cursor.execute(query, values)
            connection.commit()
            
            print("✅ Admin user updated successfully")
        else:
            print("ℹ️  Creating new admin user...")
            
            # Create new user
            hashed_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Build insert query based on available columns
            insert_columns = []
            insert_values = []
            placeholders = []
            
            if 'email' in column_names:
                insert_columns.append('email')
                insert_values.append('admin@prowrite.com')
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
                insert_values.append('Admin')
                placeholders.append('%s')
            
            if 'last_name' in column_names:
                insert_columns.append('last_name')
                insert_values.append('User')
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
    """Main diagnostic function"""
    print("🔧 ProWrite Authentication Diagnostic Tool")
    print("=" * 60)
    
    # Check database structure
    column_names = check_database_structure()
    if not column_names:
        return
    
    # Create/update test admin
    if create_test_admin():
        print("\n✅ Test admin user ready")
    else:
        print("\n❌ Failed to create test admin")
        return
    
    # Test authentication
    print("\n🧪 Testing Authentication...")
    test_authentication('admin@prowrite.com', 'admin123')
    
    print("\n🎉 Diagnostic completed!")
    print("\nYou can now try logging in with:")
    print("Email: admin@prowrite.com")
    print("Password: admin123")

if __name__ == "__main__":
    main()
