#!/usr/bin/env python3
"""
Database Structure Fix Script for ProWrite
Checks and fixes the users table structure
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

def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except mysql.connector.Error as e:
        print(f"❌ Database connection error: {e}")
        return None

def check_table_structure():
    """Check the current structure of the users table"""
    connection = get_db_connection()
    if not connection:
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
        print("-" * 60)
        print(f"{'Field':<20} {'Type':<20} {'Null':<8} {'Key':<8} {'Default'}")
        print("-" * 60)
        
        for column in columns:
            field, type_info, null, key, default, extra = column
            print(f"{field:<20} {type_info:<20} {null:<8} {key:<8} {default or 'NULL'}")
        
        return True
        
    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
        return False
    finally:
        if connection:
            connection.close()

def fix_users_table():
    """Fix the users table structure"""
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Check if users table exists
        cursor.execute("SHOW TABLES LIKE 'users'")
        if not cursor.fetchone():
            print("📝 Creating users table...")
            cursor.execute("""
                CREATE TABLE users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    first_name VARCHAR(100) NOT NULL,
                    last_name VARCHAR(100) NOT NULL,
                    is_premium BOOLEAN DEFAULT FALSE,
                    is_admin BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)
            print("✅ Users table created successfully!")
        else:
            print("📝 Users table exists, checking structure...")
            
            # Get current columns
            cursor.execute("DESCRIBE users")
            columns = cursor.fetchall()
            column_names = [col[0] for col in columns]
            
            # Add missing columns
            if 'id' not in column_names:
                print("➕ Adding id column...")
                cursor.execute("ALTER TABLE users ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST")
            
            if 'email' not in column_names:
                print("➕ Adding email column...")
                cursor.execute("ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE NOT NULL")
            
            if 'password' not in column_names:
                print("➕ Adding password column...")
                cursor.execute("ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL")
            
            if 'first_name' not in column_names:
                print("➕ Adding first_name column...")
                cursor.execute("ALTER TABLE users ADD COLUMN first_name VARCHAR(100) NOT NULL")
            
            if 'last_name' not in column_names:
                print("➕ Adding last_name column...")
                cursor.execute("ALTER TABLE users ADD COLUMN last_name VARCHAR(100) NOT NULL")
            
            if 'is_premium' not in column_names:
                print("➕ Adding is_premium column...")
                cursor.execute("ALTER TABLE users ADD COLUMN is_premium BOOLEAN DEFAULT FALSE")
            
            if 'is_admin' not in column_names:
                print("➕ Adding is_admin column...")
                cursor.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE")
            
            if 'created_at' not in column_names:
                print("➕ Adding created_at column...")
                cursor.execute("ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
            
            if 'updated_at' not in column_names:
                print("➕ Adding updated_at column...")
                cursor.execute("ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
        
        connection.commit()
        print("✅ Database structure fixed successfully!")
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

def create_default_admin():
    """Create a default admin user"""
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Check if admin user already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", ('admin@prowrite.com',))
        if cursor.fetchone():
            print("ℹ️  Admin user already exists")
            return True
        
        # Create default admin user
        import bcrypt
        hashed_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        cursor.execute("""
            INSERT INTO users (email, password, first_name, last_name, is_admin)
            VALUES (%s, %s, %s, %s, %s)
        """, ('admin@prowrite.com', hashed_password, 'Admin', 'User', True))
        
        connection.commit()
        print("✅ Default admin user created (admin@prowrite.com / admin123)")
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
    print("🔧 ProWrite Database Structure Fix")
    print("=" * 50)
    
    # Check current structure
    print("\n1. Checking current database structure...")
    if not check_table_structure():
        print("❌ Failed to check table structure")
        return
    
    # Fix structure
    print("\n2. Fixing database structure...")
    if not fix_users_table():
        print("❌ Failed to fix database structure")
        return
    
    # Check structure again
    print("\n3. Verifying fixed structure...")
    check_table_structure()
    
    # Create default admin
    print("\n4. Creating default admin user...")
    create_default_admin()
    
    print("\n🎉 Database setup completed successfully!")
    print("\nYou can now use the admin user creation script:")
    print("python create_admin_user.py create prowritesolutions42@gmail.com admin123 Prowrite Solutions")

if __name__ == "__main__":
    main()
