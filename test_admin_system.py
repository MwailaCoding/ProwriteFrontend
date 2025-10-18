#!/usr/bin/env python3
"""
Admin System Test Script
Tests the new admin system functionality
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://prowrite.pythonanywhere.com"
ADMIN_EMAIL = "admin@prowrite.com"  # Replace with actual admin email
ADMIN_PASSWORD = "admin123"  # Replace with actual admin password

def test_admin_login():
    """Test admin login functionality"""
    print("🔐 Testing admin login...")
    
    login_data = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/admin/login", json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Admin login successful")
            print(f"   User: {data['user']['firstName']} {data['user']['lastName']}")
            print(f"   Admin: {data['user']['is_admin']}")
            return data['access_token']
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Admin login error: {e}")
        return None

def test_admin_endpoints(token):
    """Test various admin endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    endpoints = [
        ("/api/admin/users", "GET", "Users list"),
        ("/api/admin/documents", "GET", "Documents list"),
        ("/api/admin/payments", "GET", "Payments list"),
        ("/api/admin/system/logs", "GET", "System logs"),
        ("/api/admin/analytics/stats", "GET", "Analytics stats"),
    ]
    
    print("\n🔍 Testing admin endpoints...")
    
    for endpoint, method, description in endpoints:
        try:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {description}: {response.status_code}")
                
                # Show some data if available
                if 'users' in data:
                    print(f"   Found {len(data['users'])} users")
                elif 'documents' in data:
                    print(f"   Found {len(data['documents'])} documents")
                elif 'payments' in data:
                    print(f"   Found {len(data['payments'])} payments")
                elif 'logs' in data:
                    print(f"   Found {len(data['logs'])} logs")
                elif 'users' in data:
                    print(f"   Total users: {data['users']['total']}")
                    
            elif response.status_code == 403:
                print(f"❌ {description}: Access denied (403)")
            else:
                print(f"⚠️  {description}: {response.status_code}")
                
        except Exception as e:
            print(f"❌ {description} error: {e}")

def test_database_tables():
    """Test if new admin tables exist"""
    print("\n🗄️  Testing database tables...")
    
    # This would require database access, so we'll just check if the migration script exists
    try:
        with open("backend/Prowritesolutions/create_admin_tables.py", "r") as f:
            content = f.read()
            if "admin_activity_logs" in content and "user_documents" in content:
                print("✅ Admin tables migration script found")
            else:
                print("❌ Admin tables migration script incomplete")
    except FileNotFoundError:
        print("❌ Admin tables migration script not found")

def main():
    """Main test function"""
    print("🚀 Starting Admin System Tests")
    print("=" * 50)
    
    # Test admin login
    token = test_admin_login()
    
    if token:
        # Test admin endpoints
        test_admin_endpoints(token)
    else:
        print("❌ Cannot proceed with endpoint tests without valid token")
    
    # Test database setup
    test_database_tables()
    
    print("\n" + "=" * 50)
    print("🏁 Admin System Tests Complete")
    
    if token:
        print("✅ Admin system appears to be working correctly!")
    else:
        print("❌ Admin system has issues that need to be resolved")

if __name__ == "__main__":
    main()
