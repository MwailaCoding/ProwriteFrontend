#!/usr/bin/env python3
"""
Simple test script to verify M-Pesa environment variables
"""

import os

# Set environment variables directly (same as in app.py)
os.environ['MPESA_CONSUMER_KEY'] = 'JhER2QNVQOCW1O4SG9J7y7pRduOtg1EpYvlE4b34YRI34YzN'
os.environ['MPESA_CONSUMER_SECRET'] = 'uG5jOnzxoFelO2FSsZdlsLoMQATZpH4RGKGu3PahGIxOz5OnjA7Cuk8W4aZnUQfi'
os.environ['MPESA_BUSINESS_SHORT_CODE'] = '174379'
os.environ['MPESA_PASSKEY'] = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
os.environ['MPESA_ENVIRONMENT'] = 'sandbox'
os.environ['MPESA_CALLBACK_URL'] = 'https://prowrite.pythonanywhere.com/api/payments/mpesa/callback'

print("🔍 Testing M-Pesa Environment Variables:")
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

# Test M-Pesa API call
print("\n🔍 Testing M-Pesa API Access:")
print("=" * 50)

try:
    import requests
    
    # Test access token generation
    consumer_key = os.getenv('MPESA_CONSUMER_KEY')
    consumer_secret = os.getenv('MPESA_CONSUMER_SECRET')
    
    if consumer_key and consumer_secret:
        # M-Pesa OAuth URL
        oauth_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        
        # Make request
        response = requests.get(oauth_url, auth=(consumer_key, consumer_secret))
        
        if response.status_code == 200:
            data = response.json()
            access_token = data.get('access_token')
            if access_token:
                print(f"✅ Access Token Generated: {access_token[:20]}...")
                print("✅ M-Pesa API connection successful!")
            else:
                print("❌ No access token in response")
        else:
            print(f"❌ API Error: {response.status_code} - {response.text}")
    else:
        print("❌ Missing consumer key or secret")
        
except ImportError:
    print("❌ requests module not available")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n🎯 M-Pesa API Test Complete!")
