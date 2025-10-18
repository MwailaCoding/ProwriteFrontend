"""
Database Migration Script for Admin System
Creates new tables required for the comprehensive admin interface
"""

import mysql.connector
import os
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

def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except mysql.connector.Error as e:
        print(f"Database connection error: {e}")
        return None

def create_admin_tables():
    """Create all admin-related tables"""
    connection = get_db_connection()
    if not connection:
        print("❌ Failed to connect to database")
        return False
    
    try:
        cursor = connection.cursor()
        
        print("🚀 Starting admin tables creation...")
        
        # 1. Create user_documents table
        print("📄 Creating user_documents table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_documents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                document_type VARCHAR(50) NOT NULL,
                reference VARCHAR(100) UNIQUE NOT NULL,
                file_path VARCHAR(255),
                pdf_url VARCHAR(255),
                status VARCHAR(20) DEFAULT 'generated',
                download_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_reference (reference),
                INDEX idx_document_type (document_type),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ user_documents table created successfully")
        
        # 2. Create admin_activity_logs table
        print("📊 Creating admin_activity_logs table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admin_activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                admin_id INT NOT NULL,
                action VARCHAR(100) NOT NULL,
                target_type VARCHAR(50),
                target_id INT,
                details JSON,
                ip_address VARCHAR(45),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_admin_id (admin_id),
                INDEX idx_action (action),
                INDEX idx_target_type (target_type),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ admin_activity_logs table created successfully")
        
        # 3. Create notification_queue table
        print("📧 Creating notification_queue table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notification_queue (
                id INT AUTO_INCREMENT PRIMARY KEY,
                recipient_id INT,
                recipient_email VARCHAR(255) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                body TEXT NOT NULL,
                body_html TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                scheduled_at TIMESTAMP NULL,
                sent_at TIMESTAMP NULL,
                error_message TEXT,
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (recipient_id) REFERENCES users(user_id) ON DELETE SET NULL,
                FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
                INDEX idx_recipient_id (recipient_id),
                INDEX idx_recipient_email (recipient_email),
                INDEX idx_status (status),
                INDEX idx_scheduled_at (scheduled_at),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ notification_queue table created successfully")
        
        # 4. Create system_logs table
        print("📝 Creating system_logs table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                level VARCHAR(20) NOT NULL,
                message TEXT NOT NULL,
                module VARCHAR(50),
                user_id INT,
                ip_address VARCHAR(45),
                metadata JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
                INDEX idx_level (level),
                INDEX idx_module (module),
                INDEX idx_user_id (user_id),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ system_logs table created successfully")
        
        # 5. Create payment_approvals table (if not exists)
        print("💰 Creating payment_approvals table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS payment_approvals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                payment_id INT NOT NULL,
                payment_type VARCHAR(20) NOT NULL,
                reference VARCHAR(100) NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                user_email VARCHAR(255) NOT NULL,
                status VARCHAR(20) NOT NULL,
                approved_by INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_payment_id (payment_id),
                INDEX idx_reference (reference),
                INDEX idx_status (status),
                INDEX idx_approved_by (approved_by),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ payment_approvals table created successfully")
        
        # 6. Add missing columns to users table if they don't exist
        print("👥 Checking and adding missing columns to users table...")
        
        # Check if columns exist and add them if they don't
        cursor.execute("SHOW COLUMNS FROM users LIKE 'is_active'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE")
            print("✅ Added is_active column to users table")
        
        cursor.execute("SHOW COLUMNS FROM users LIKE 'last_login'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL")
            print("✅ Added last_login column to users table")
        
        cursor.execute("SHOW COLUMNS FROM users LIKE 'phone_number'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) NULL")
            print("✅ Added phone_number column to users table")
        
        cursor.execute("SHOW COLUMNS FROM users LIKE 'country'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE users ADD COLUMN country VARCHAR(100) NULL")
            print("✅ Added country column to users table")
        
        cursor.execute("SHOW COLUMNS FROM users LIKE 'bio'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE users ADD COLUMN bio TEXT NULL")
            print("✅ Added bio column to users table")
        
        cursor.execute("SHOW COLUMNS FROM users LIKE 'location'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE users ADD COLUMN location VARCHAR(255) NULL")
            print("✅ Added location column to users table")
        
        cursor.execute("SHOW COLUMNS FROM users LIKE 'website'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE users ADD COLUMN website VARCHAR(255) NULL")
            print("✅ Added website column to users table")
        
        cursor.execute("SHOW COLUMNS FROM users LIKE 'linkedin'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE users ADD COLUMN linkedin VARCHAR(255) NULL")
            print("✅ Added linkedin column to users table")
        
        cursor.execute("SHOW COLUMNS FROM users LIKE 'github'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE users ADD COLUMN github VARCHAR(255) NULL")
            print("✅ Added github column to users table")
        
        cursor.execute("SHOW COLUMNS FROM users LIKE 'twitter'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE users ADD COLUMN twitter VARCHAR(255) NULL")
            print("✅ Added twitter column to users table")
        
        # Commit all changes
        connection.commit()
        print("\n🎉 All admin tables created successfully!")
        
        # Display table information
        print("\n📋 Created Tables:")
        print("   • user_documents - Track all user-generated documents")
        print("   • admin_activity_logs - Log all admin actions for audit trail")
        print("   • notification_queue - Queue for sending emails/notifications")
        print("   • system_logs - Log system events and errors")
        print("   • payment_approvals - Track payment approval history")
        print("   • Enhanced users table with additional profile fields")
        
        return True
        
    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
        connection.rollback()
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        connection.rollback()
        return False
    finally:
        if connection:
            connection.close()

def verify_tables():
    """Verify that all tables were created successfully"""
    connection = get_db_connection()
    if not connection:
        print("❌ Failed to connect to database for verification")
        return False
    
    try:
        cursor = connection.cursor()
        
        print("\n🔍 Verifying table creation...")
        
        # Check if all tables exist
        tables_to_check = [
            'user_documents',
            'admin_activity_logs', 
            'notification_queue',
            'system_logs',
            'payment_approvals'
        ]
        
        for table in tables_to_check:
            cursor.execute(f"SHOW TABLES LIKE '{table}'")
            if cursor.fetchone():
                print(f"✅ {table} table exists")
            else:
                print(f"❌ {table} table missing")
                return False
        
        # Check users table columns
        print("\n🔍 Checking users table columns...")
        cursor.execute("SHOW COLUMNS FROM users")
        columns = [row[0] for row in cursor.fetchall()]
        
        required_columns = [
            'is_active', 'last_login', 'phone_number', 'country',
            'bio', 'location', 'website', 'linkedin', 'github', 'twitter'
        ]
        
        for column in required_columns:
            if column in columns:
                print(f"✅ users.{column} column exists")
            else:
                print(f"❌ users.{column} column missing")
                return False
        
        print("\n🎉 All tables and columns verified successfully!")
        return True
        
    except mysql.connector.Error as e:
        print(f"❌ Verification error: {e}")
        return False
    finally:
        if connection:
            connection.close()

def main():
    """Main function to run the migration"""
    print("🚀 ProWrite Admin System Database Migration")
    print("=" * 50)
    
    # Create tables
    if create_admin_tables():
        # Verify creation
        if verify_tables():
            print("\n✅ Migration completed successfully!")
            print("\n📝 Next steps:")
            print("   1. Update app.py to register admin routes")
            print("   2. Add admin authentication middleware")
            print("   3. Modify PDF generation to track documents")
            print("   4. Deploy frontend admin interface")
        else:
            print("\n❌ Migration verification failed!")
    else:
        print("\n❌ Migration failed!")

if __name__ == "__main__":
    main()