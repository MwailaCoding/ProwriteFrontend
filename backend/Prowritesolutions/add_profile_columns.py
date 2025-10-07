import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'prowrite2'),
            auth_plugin='mysql_native_password'
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def add_profile_columns():
    """Add profile-related columns to users table"""
    connection = get_db_connection()
    if not connection:
        print("Failed to connect to database")
        return False
    
    cursor = connection.cursor()
    
    try:
        # Add profile columns to users table
        columns_to_add = [
            "ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL",
            "ADD COLUMN IF NOT EXISTS bio TEXT NULL",
            "ADD COLUMN IF NOT EXISTS location VARCHAR(255) NULL",
            "ADD COLUMN IF NOT EXISTS website VARCHAR(255) NULL",
            "ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255) NULL",
            "ADD COLUMN IF NOT EXISTS github VARCHAR(255) NULL",
            "ADD COLUMN IF NOT EXISTS twitter VARCHAR(255) NULL",
            "ADD COLUMN IF NOT EXISTS date_of_birth DATE NULL",
            "ADD COLUMN IF NOT EXISTS gender ENUM('male', 'female', 'non-binary', 'prefer-not-to-say') NULL",
            "ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC'",
            "ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en'",
            "ADD COLUMN IF NOT EXISTS avatar VARCHAR(500) NULL"
        ]
        
        for column in columns_to_add:
            try:
                cursor.execute(f"ALTER TABLE users {column}")
                print(f"✅ Added column: {column.split()[2]}")
            except Error as e:
                if "Duplicate column name" in str(e):
                    print(f"⚠️  Column already exists: {column.split()[2]}")
                else:
                    print(f"❌ Error adding column {column.split()[2]}: {e}")
        
        # Create user_preferences table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_preferences (
                user_id INT PRIMARY KEY,
                theme ENUM('light', 'dark', 'system') DEFAULT 'system',
                notifications JSON,
                privacy JSON,
                resume JSON,
                ai JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        """)
        print("✅ Created user_preferences table")
        
        # Create user_activity table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_activity (
                activity_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                activity_type VARCHAR(50) NOT NULL,
                description TEXT,
                metadata JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        """)
        print("✅ Created user_activity table")
        
        # Create trusted_devices table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trusted_devices (
                device_id VARCHAR(255) PRIMARY KEY,
                user_id INT NOT NULL,
                device_name VARCHAR(255) NOT NULL,
                device_type VARCHAR(50) NOT NULL,
                last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                location VARCHAR(255) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        """)
        print("✅ Created trusted_devices table")
        
        connection.commit()
        print("✅ All profile-related tables and columns added successfully!")
        return True
        
    except Error as e:
        print(f"❌ Error adding profile columns: {e}")
        return False
    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    print("🚀 Adding profile columns to users table...")
    success = add_profile_columns()
    if success:
        print("✅ Profile setup completed successfully!")
    else:
        print("❌ Profile setup failed!")

