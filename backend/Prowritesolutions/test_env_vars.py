#!/usr/bin/env python3
"""
Test script to verify M-Pesa environment variables are set correctly
"""

import os
import sys

# Add the current directory to Python path
sys.path.append('/home/Prowrite/frontend/ProwriteFrontend/backend/Prowritesolutions')

# Import the app to trigger environment variable setting
try:
    from app import app
    print("✅ Flask app imported successfully")
    
    # Test environment variables
    print("\n🔍 Testing M-Pesa Environment Variables:")
    print("=" * 50)
    
    mpesa_vars = [
        'MPESA_CONSUMER_KEY',
        'MPESA_CONSUMER_SECRET', 
        'MPESA_BUSINESS_SHORT_CODE',
        'MPESA_PASSKEY',
        'MPESA_ENVIRONMENT',
        'MPESA_CALLBACK_URL'
    ]
    
    for var in mpesa_vars:
        value = os.getenv(var)
        if value:
            # Mask sensitive values for security
            if 'SECRET' in var or 'KEY' in var:
                masked_value = value[:8] + '*' * (len(value) - 8)
                print(f"✅ {var}: {masked_value}")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: None")
    
    print("\n🎯 Environment Variables Test Complete!")
    
except ImportError as e:
    print(f"❌ Error importing app: {e}")
    print("Make sure you're in the correct directory")
except Exception as e:
    print(f"❌ Error: {e}")
