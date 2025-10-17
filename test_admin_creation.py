#!/usr/bin/env python3
"""
Test script for admin user creation
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend', 'Prowritesolutions'))

from create_admin_user import AdminUserManager

def test_admin_creation():
    """Test the admin user creation functionality"""
    print("🧪 Testing Admin User Creation")
    print("=" * 50)
    
    manager = AdminUserManager()
    
    # Test creating an admin user
    print("\n1. Creating test admin user...")
    success, message = manager.create_admin_user(
        email="testadmin@prowrite.com",
        password="testadmin123",
        first_name="Test",
        last_name="Admin"
    )
    
    if success:
        print(f"✅ {message}")
    else:
        print(f"❌ {message}")
    
    # Test listing admin users
    print("\n2. Listing all admin users...")
    success, result = manager.list_admin_users()
    if not success:
        print(f"❌ {result}")
    
    # Test creating duplicate admin user
    print("\n3. Testing duplicate admin user creation...")
    success, message = manager.create_admin_user(
        email="testadmin@prowrite.com",
        password="testadmin123",
        first_name="Test",
        last_name="Admin"
    )
    
    if success:
        print(f"✅ {message}")
    else:
        print(f"❌ {message}")
    
    print("\n🎉 Test completed!")

if __name__ == "__main__":
    test_admin_creation()
