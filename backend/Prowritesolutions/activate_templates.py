#!/usr/bin/env python3
"""
Script to activate all existing inactive templates
"""

import os
import sys
import mysql.connector
from mysql.connector import Error

def get_db_connection():
    """Get database connection"""
    try:
        # Check if database environment variables are set
        db_host = os.getenv('DB_HOST', 'localhost')
        db_user = os.getenv('DB_USER', 'root')
        db_password = os.getenv('DB_PASSWORD', '')
        db_name = os.getenv('DB_NAME', 'aiprowrite2')
        
        print(f"Attempting to connect to MySQL at {db_host} with user {db_user} to database {db_name}")
        
        # For MySQL 8+ compatibility, add auth_plugin parameter
        connection_params = {
            'host': db_host,
            'user': db_user,
            'database': db_name,
            'auth_plugin': 'mysql_native_password',
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci'
        }
        
        # Only add password if it's not empty
        if db_password:
            connection_params['password'] = db_password
            
        connection = mysql.connector.connect(**connection_params)
        print("MySQL connection successful!")
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def activate_templates():
    """Activate all inactive templates"""
    connection = get_db_connection()
    if not connection:
        print("❌ Failed to connect to database")
        return False
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # First, check current status
        cursor.execute("SELECT COUNT(*) as total FROM templates")
        total_templates = cursor.fetchone()['total']
        
        cursor.execute("SELECT COUNT(*) as active FROM templates WHERE is_active = TRUE")
        active_templates = cursor.fetchone()['active']
        
        cursor.execute("SELECT COUNT(*) as inactive FROM templates WHERE is_active = FALSE OR is_active IS NULL")
        inactive_templates = cursor.fetchone()['inactive']
        
        print(f"📊 Current template status:")
        print(f"   Total templates: {total_templates}")
        print(f"   Active templates: {active_templates}")
        print(f"   Inactive templates: {inactive_templates}")
        
        if inactive_templates == 0:
            print("✅ All templates are already active!")
            return True
        
        # Activate all inactive templates
        cursor.execute("""
            UPDATE templates 
            SET is_active = TRUE 
            WHERE is_active = FALSE OR is_active IS NULL
        """)
        
        affected_rows = cursor.rowcount
        connection.commit()
        
        print(f"✅ Successfully activated {affected_rows} templates!")
        
        # Verify the update
        cursor.execute("SELECT COUNT(*) as active FROM templates WHERE is_active = TRUE")
        new_active_count = cursor.fetchone()['active']
        
        print(f"📊 New template status:")
        print(f"   Active templates: {new_active_count}")
        
        return True
        
    except Error as e:
        print(f"❌ Database error: {e}")
        return False
    finally:
        if connection:
            connection.close()

def list_templates():
    """List all templates with their status"""
    connection = get_db_connection()
    if not connection:
        print("❌ Failed to connect to database")
        return False
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT template_id, name, category, is_active, created_at 
            FROM templates 
            ORDER BY created_at DESC
        """)
        
        templates = cursor.fetchall()
        
        print(f"📋 Template List ({len(templates)} templates):")
        print("-" * 80)
        print(f"{'ID':<5} {'Name':<30} {'Category':<15} {'Status':<10} {'Created'}")
        print("-" * 80)
        
        for template in templates:
            status = "✅ Active" if template['is_active'] else "❌ Inactive"
            created = template['created_at'].strftime('%Y-%m-%d') if template['created_at'] else 'N/A'
            print(f"{template['template_id']:<5} {template['name'][:29]:<30} {template['category'][:14]:<15} {status:<10} {created}")
        
        return True
        
    except Error as e:
        print(f"❌ Database error: {e}")
        return False
    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    print("🔄 Template Activation Script")
    print("=" * 50)
    
    if len(sys.argv) > 1 and sys.argv[1] == "list":
        success = list_templates()
    else:
        success = activate_templates()
        if success:
            print("\n📋 Updated template list:")
            list_templates()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ Script completed successfully!")
    else:
        print("❌ Script failed!")


























