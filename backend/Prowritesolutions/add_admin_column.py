import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def add_admin_column():
    try:
        # Connect to database
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME'),
            auth_plugin='mysql_native_password'
        )
        
        cursor = connection.cursor()
        
        # Check if is_admin column already exists
        cursor.execute("SHOW COLUMNS FROM users LIKE 'is_admin'")
        column_exists = cursor.fetchone()
        
        if not column_exists:
            # Add is_admin column
            cursor.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE")
            print("Added is_admin column to users table")
        else:
            print("is_admin column already exists")
        
        # Update the admin user to have admin privileges
        cursor.execute("UPDATE users SET is_admin = TRUE WHERE email = %s", ('prowritesolutions42@gmail.com',))
        print("Updated admin user with admin privileges")
        
        connection.commit()
        print("Database updated successfully!")
        
    except Exception as e:
        print(f"Error updating database: {e}")
    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    add_admin_column()







































