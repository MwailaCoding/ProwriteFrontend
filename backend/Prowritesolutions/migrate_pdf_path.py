#!/usr/bin/env python3
"""
Database migration script to add pdf_path column for auto-download functionality
"""
import os
import mysql.connector
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'Prowrite.mysql.pythonanywhere-services.com'),
    'user': os.getenv('DB_USER', 'Prowrite'),
    'password': os.getenv('DB_PASSWORD', 'Hamilton2025'),
    'database': os.getenv('DB_NAME', 'Prowrite$dbprowrite'),
    'charset': 'utf8mb4'
}

def run_migration():
    """Add pdf_path column to manual_payments table"""
    try:
        print("🔧 Starting database migration for PDF download functionality...")
        
        # Connect to database
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("✅ Connected to database")
        
        # Check if column already exists
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s 
            AND TABLE_NAME = 'manual_payments' 
            AND COLUMN_NAME = 'pdf_path'
        """, (DB_CONFIG['database'],))
        
        if cursor.fetchone():
            print("✅ pdf_path column already exists")
        else:
            print("📝 Adding pdf_path column...")
            
            # Add the column
            cursor.execute("""
                ALTER TABLE manual_payments 
                ADD COLUMN pdf_path VARCHAR(500) NULL 
                COMMENT 'Path to generated PDF file for download'
            """)
            
            print("✅ pdf_path column added successfully")
        
        # Add index for better performance
        try:
            cursor.execute("""
                CREATE INDEX idx_manual_payments_pdf_path ON manual_payments(pdf_path)
            """)
            print("✅ Index created successfully")
        except mysql.connector.Error as e:
            if "Duplicate key name" in str(e):
                print("✅ Index already exists")
            else:
                print(f"⚠️  Index creation warning: {e}")
        
        # Commit changes
        connection.commit()
        
        # Verify the table structure
        cursor.execute("DESCRIBE manual_payments")
        columns = cursor.fetchall()
        
        print("\n📋 Current table structure:")
        for column in columns:
            print(f"  - {column[0]}: {column[1]}")
        
        print("\n🎉 Migration completed successfully!")
        print("📥 PDF download functionality is now enabled")
        
    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Migration error: {e}")
        return False
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("🔌 Database connection closed")
    
    return True

if __name__ == "__main__":
    success = run_migration()
    if success:
        print("\n✅ Migration completed successfully!")
        print("🚀 You can now use the PDF download functionality")
    else:
        print("\n❌ Migration failed. Please check the error messages above.")

