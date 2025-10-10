#!/usr/bin/env python3
"""
Database Setup Script for ProWrite
Creates the database and tables if they don't exist
"""

import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_db_connection():
    """Get database connection without specifying database"""
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            charset='utf8mb4'
        )
        return connection
    except mysql.connector.Error as e:
        print(f"Database connection error: {e}")
        return None

def setup_database():
    """Setup database and tables"""
    connection = get_db_connection()
    if not connection:
        print("Failed to connect to MySQL server")
        return False
    
    cursor = connection.cursor()
    
    try:
        # Create database
        cursor.execute("CREATE DATABASE IF NOT EXISTS prowrite_db")
        print("✅ Database 'prowrite_db' created or already exists")
        
        # Use the database
        cursor.execute("USE prowrite_db")
        
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
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
        print("✅ Users table created or already exists")
        
        # Create a test admin user if it doesn't exist
        cursor.execute("SELECT id FROM users WHERE email = %s", ('admin@prowrite.com',))
        if not cursor.fetchone():
            import bcrypt
            hashed_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cursor.execute("""
                INSERT INTO users (email, password, first_name, last_name, is_admin)
                VALUES (%s, %s, %s, %s, %s)
            """, ('admin@prowrite.com', hashed_password, 'Admin', 'User', True))
            print("✅ Test admin user created (email: admin@prowrite.com, password: admin123)")
        
        connection.commit()
        print("✅ Database setup completed successfully!")
        return True
        
    except mysql.connector.Error as e:
        print(f"Database error: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False
    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    setup_database()

