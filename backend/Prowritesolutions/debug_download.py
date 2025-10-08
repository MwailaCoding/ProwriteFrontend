#!/usr/bin/env python3
"""
Debug script to test the download functionality
This script will help identify why auto-download is not working
"""

import mysql.connector
import os
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'aiprowrite2'),
    'charset': 'utf8mb4'
}

def check_database_schema():
    """Check if pdf_path column exists in manual_payments table"""
    print("🔍 Checking database schema...")
    
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        # Check if pdf_path column exists
        cursor.execute("SHOW COLUMNS FROM manual_payments LIKE 'pdf_path'")
        result = cursor.fetchone()
        
        if result:
            print("✅ pdf_path column exists in manual_payments table")
            print(f"   Column details: {result}")
        else:
            print("❌ pdf_path column does NOT exist in manual_payments table")
            print("   This is the problem! You need to run the migration.")
            return False
        
        # Show all columns
        cursor.execute("SHOW COLUMNS FROM manual_payments")
        columns = cursor.fetchall()
        print(f"\n📋 All columns in manual_payments table:")
        for col in columns:
            print(f"   - {col[0]} ({col[1]})")
        
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def check_recent_payments():
    """Check recent payments and their PDF paths"""
    print("\n🔍 Checking recent payments...")
    
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        # Get recent payments
        cursor.execute("""
            SELECT reference, status, pdf_path, created_at, updated_at
            FROM manual_payments 
            ORDER BY created_at DESC 
            LIMIT 5
        """)
        
        payments = cursor.fetchall()
        
        if not payments:
            print("❌ No payments found in database")
            return
        
        print(f"📋 Found {len(payments)} recent payments:")
        for payment in payments:
            reference, status, pdf_path, created_at, updated_at = payment
            print(f"\n   Reference: {reference}")
            print(f"   Status: {status}")
            print(f"   PDF Path: {pdf_path}")
            print(f"   Created: {created_at}")
            print(f"   Updated: {updated_at}")
            
            if pdf_path and os.path.exists(pdf_path):
                print(f"   ✅ PDF file exists: {pdf_path}")
            elif pdf_path:
                print(f"   ❌ PDF file missing: {pdf_path}")
            else:
                print(f"   ⚠️  No PDF path stored")
        
        connection.close()
        
    except Exception as e:
        print(f"❌ Error checking payments: {e}")

def test_download_endpoint():
    """Test the download endpoint directly"""
    print("\n🔍 Testing download endpoint...")
    
    try:
        import requests
        
        # Get a recent payment reference
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        cursor.execute("""
            SELECT reference FROM manual_payments 
            WHERE status = 'completed' AND pdf_path IS NOT NULL
            ORDER BY created_at DESC 
            LIMIT 1
        """)
        
        result = cursor.fetchone()
        connection.close()
        
        if not result:
            print("❌ No completed payments with PDF paths found")
            return
        
        reference = result[0]
        print(f"📋 Testing download for reference: {reference}")
        
        # Test download endpoint
        url = f"https://prowrite.pythonanywhere.com/api/payments/manual/download/{reference}"
        print(f"🌐 Testing URL: {url}")
        
        response = requests.get(url, timeout=10)
        print(f"📡 Response status: {response.status_code}")
        print(f"📡 Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Download endpoint is working!")
            print(f"   Content-Type: {response.headers.get('Content-Type')}")
            print(f"   Content-Length: {response.headers.get('Content-Length')}")
        else:
            print(f"❌ Download endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
        
    except ImportError:
        print("⚠️  requests library not available, skipping endpoint test")
    except Exception as e:
        print(f"❌ Error testing endpoint: {e}")

def main():
    """Main debug function"""
    print("🚀 DOWNLOAD DEBUG SCRIPT")
    print("=" * 50)
    
    # Check database schema
    schema_ok = check_database_schema()
    
    # Check recent payments
    check_recent_payments()
    
    # Test download endpoint
    test_download_endpoint()
    
    print("\n" + "=" * 50)
    print("🎯 DEBUG SUMMARY:")
    
    if not schema_ok:
        print("❌ CRITICAL ISSUE: pdf_path column missing!")
        print("   SOLUTION: Run 'python migrate_pdf_path.py'")
    else:
        print("✅ Database schema is correct")
    
    print("\n📋 NEXT STEPS:")
    print("1. If schema is missing, run: python migrate_pdf_path.py")
    print("2. Upload updated backend files to PythonAnywhere")
    print("3. Restart PythonAnywhere web app")
    print("4. Test with a new payment")
    print("5. Check browser console for download URL")

if __name__ == "__main__":
    main()
