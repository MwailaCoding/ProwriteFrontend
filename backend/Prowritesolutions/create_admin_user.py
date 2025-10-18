#!/usr/bin/env python3
"""
Enhanced Admin User Creation Script for ProWrite
Creates or updates admin users with proper validation and error handling
"""

import bcrypt
import mysql.connector
import os
import sys
from datetime import datetime
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

class AdminUserManager:
    def __init__(self):
        self.connection = None
    
    def get_db_connection(self):
        """Get database connection with error handling"""
        try:
            connection = mysql.connector.connect(**DB_CONFIG)
            return connection
        except mysql.connector.Error as e:
            print(f"❌ Database connection error: {e}")
            return None
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def create_admin_user(self, email: str, password: str, first_name: str = "Admin", last_name: str = "User"):
        """Create a new admin user"""
        connection = self.get_db_connection()
        if not connection:
            return False, "Database connection failed"
        
        try:
            cursor = connection.cursor()
            
            # Check if user already exists
            cursor.execute("SELECT id, is_admin FROM users WHERE email = %s", (email,))
            existing_user = cursor.fetchone()
            
            if existing_user:
                user_id, is_admin = existing_user
                if is_admin:
                    return False, f"Admin user with email {email} already exists"
                else:
                    # Update existing user to admin
                    hashed_password = self.hash_password(password)
                    cursor.execute("""
                        UPDATE users 
                        SET password = %s, first_name = %s, last_name = %s, is_admin = TRUE, updated_at = NOW()
                        WHERE id = %s
                    """, (hashed_password, first_name, last_name, user_id))
                    connection.commit()
                    print(f"✅ Updated existing user {email} to admin")
                    return True, f"User {email} updated to admin successfully"
            else:
                # Create new admin user
                hashed_password = self.hash_password(password)
                cursor.execute("""
                    INSERT INTO users (email, password, first_name, last_name, is_admin, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, TRUE, NOW(), NOW())
                """, (email, hashed_password, first_name, last_name))
                
                user_id = cursor.lastrowid
                connection.commit()
                print(f"✅ Created new admin user: {email}")
                return True, f"Admin user {email} created successfully with ID {user_id}"
                
        except mysql.connector.Error as e:
            print(f"❌ Database error: {e}")
            return False, f"Database error: {e}"
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return False, f"Unexpected error: {e}"
        finally:
            if connection:
                connection.close()
    
    def list_admin_users(self):
        """List all admin users"""
        connection = self.get_db_connection()
        if not connection:
            return False, "Database connection failed"
        
        try:
            cursor = connection.cursor()
            cursor.execute("""
                SELECT id, email, first_name, last_name, is_premium, created_at
                FROM users WHERE is_admin = TRUE
                ORDER BY created_at DESC
            """)
            
            admin_users = cursor.fetchall()
            
            if not admin_users:
                print("📋 No admin users found")
                return True, []
            
            print("📋 Admin Users:")
            print("-" * 80)
            print(f"{'ID':<5} {'Email':<30} {'Name':<20} {'Premium':<8} {'Created'}")
            print("-" * 80)
            
            for user in admin_users:
                user_id, email, first_name, last_name, is_premium, created_at = user
                full_name = f"{first_name} {last_name}"
                premium_status = "Yes" if is_premium else "No"
                created_date = created_at.strftime("%Y-%m-%d %H:%M") if created_at else "N/A"
                print(f"{user_id:<5} {email:<30} {full_name:<20} {premium_status:<8} {created_date}")
            
            return True, admin_users
            
        except mysql.connector.Error as e:
            print(f"❌ Database error: {e}")
            return False, f"Database error: {e}"
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return False, f"Unexpected error: {e}"
        finally:
            if connection:
                connection.close()
    
    def remove_admin_privileges(self, email: str):
        """Remove admin privileges from a user"""
        connection = self.get_db_connection()
        if not connection:
            return False, "Database connection failed"
        
        try:
            cursor = connection.cursor()
            
            # Check if user exists and is admin
            cursor.execute("SELECT id, is_admin FROM users WHERE email = %s", (email,))
            user_data = cursor.fetchone()
            
            if not user_data:
                return False, f"User with email {email} not found"
            
            user_id, is_admin = user_data
            if not is_admin:
                return False, f"User {email} is not an admin"
            
            # Remove admin privileges
            cursor.execute("""
                UPDATE users 
                SET is_admin = FALSE, updated_at = NOW()
                WHERE id = %s
            """, (user_id,))
            
            connection.commit()
            print(f"✅ Removed admin privileges from {email}")
            return True, f"Admin privileges removed from {email}"
            
        except mysql.connector.Error as e:
            print(f"❌ Database error: {e}")
            return False, f"Database error: {e}"
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return False, f"Unexpected error: {e}"
        finally:
            if connection:
                connection.close()
    
    def reset_admin_password(self, email: str, new_password: str):
        """Reset password for an admin user"""
        connection = self.get_db_connection()
        if not connection:
            return False, "Database connection failed"
        
        try:
            cursor = connection.cursor()
            
            # Check if user exists and is admin
            cursor.execute("SELECT id, is_admin FROM users WHERE email = %s", (email,))
            user_data = cursor.fetchone()
            
            if not user_data:
                return False, f"User with email {email} not found"
            
            user_id, is_admin = user_data
            if not is_admin:
                return False, f"User {email} is not an admin"
            
            # Update password
            hashed_password = self.hash_password(new_password)
            cursor.execute("""
                UPDATE users 
                SET password = %s, updated_at = NOW()
                WHERE id = %s
            """, (hashed_password, user_id))
            
            connection.commit()
            print(f"✅ Password reset for admin user {email}")
            return True, f"Password reset successfully for {email}"
            
        except mysql.connector.Error as e:
            print(f"❌ Database error: {e}")
            return False, f"Database error: {e}"
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return False, f"Unexpected error: {e}"
        finally:
            if connection:
                connection.close()

def main():
    """Main function to handle command line arguments"""
    manager = AdminUserManager()
    
    if len(sys.argv) < 2:
        print("🔧 ProWrite Admin User Manager")
        print("=" * 50)
        print("Usage:")
        print("  python create_admin_user.py create <email> <password> [first_name] [last_name]")
        print("  python create_admin_user.py list")
        print("  python create_admin_user.py remove <email>")
        print("  python create_admin_user.py reset <email> <new_password>")
        print("")
        print("Examples:")
        print("  python create_admin_user.py create admin@prowrite.com admin123")
        print("  python create_admin_user.py create admin@prowrite.com admin123 John Doe")
        print("  python create_admin_user.py list")
        print("  python create_admin_user.py remove admin@prowrite.com")
        print("  python create_admin_user.py reset admin@prowrite.com newpassword123")
        return
    
    command = sys.argv[1].lower()
    
    if command == "create":
        if len(sys.argv) < 4:
            print("❌ Error: Email and password are required for create command")
            print("Usage: python create_admin_user.py create <email> <password> [first_name] [last_name]")
            return
        
        email = sys.argv[2]
        password = sys.argv[3]
        first_name = sys.argv[4] if len(sys.argv) > 4 else "Admin"
        last_name = sys.argv[5] if len(sys.argv) > 5 else "User"
        
        success, message = manager.create_admin_user(email, password, first_name, last_name)
        if success:
            print(f"✅ {message}")
        else:
            print(f"❌ {message}")
    
    elif command == "list":
        success, result = manager.list_admin_users()
        if not success:
            print(f"❌ {result}")
    
    elif command == "remove":
        if len(sys.argv) < 3:
            print("❌ Error: Email is required for remove command")
            print("Usage: python create_admin_user.py remove <email>")
            return
        
        email = sys.argv[2]
        success, message = manager.remove_admin_privileges(email)
        if success:
            print(f"✅ {message}")
        else:
            print(f"❌ {message}")
    
    elif command == "reset":
        if len(sys.argv) < 4:
            print("❌ Error: Email and new password are required for reset command")
            print("Usage: python create_admin_user.py reset <email> <new_password>")
            return
        
        email = sys.argv[2]
        new_password = sys.argv[3]
        success, message = manager.reset_admin_password(email, new_password)
        if success:
            print(f"✅ {message}")
        else:
            print(f"❌ {message}")
    
    else:
        print(f"❌ Unknown command: {command}")
        print("Available commands: create, list, remove, reset")

if __name__ == "__main__":
    main()
