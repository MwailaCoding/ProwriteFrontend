#!/usr/bin/env python3
"""
Test script to verify M-Pesa service is working correctly
"""

import os
import sys

# Add the current directory to Python path
sys.path.append('/home/Prowrite/frontend/ProwriteFrontend/backend/Prowritesolutions')

try:
    # Import the app to set environment variables
    from app import app
    
    # Import M-Pesa service
    from mpesa_service import mpesa_service
    
    print("✅ M-Pesa service imported successfully")
    
    # Test access token generation
    print("\n🔍 Testing M-Pesa Access Token Generation:")
    print("=" * 50)
    
    try:
        token = mpesa_service.get_access_token()
        if token:
            print(f"✅ Access Token Generated: {token[:20]}...")
            print("✅ M-Pesa service is working correctly!")
        else:
            print("❌ Failed to generate access token")
    except Exception as e:
        print(f"❌ Error generating access token: {e}")
    
    # Test environment variables
    print("\n🔍 Environment Variables Check:")
    print("=" * 50)
    
    required_vars = [
        'MPESA_CONSUMER_KEY',
        'MPESA_CONSUMER_SECRET',
        'MPESA_BUSINESS_SHORT_CODE',
        'MPESA_PASSKEY',
        'MPESA_ENVIRONMENT'
    ]
    
    all_set = True
    for var in required_vars:
        value = os.getenv(var)
        if value:
            if 'SECRET' in var or 'KEY' in var:
                print(f"✅ {var}: {value[:8]}...")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: Not set")
            all_set = False
    
    if all_set:
        print("\n🎯 All M-Pesa environment variables are set correctly!")
    else:
        print("\n⚠️  Some environment variables are missing!")
    
except ImportError as e:
    print(f"❌ Error importing modules: {e}")
except Exception as e:
    print(f"❌ Error: {e}")
