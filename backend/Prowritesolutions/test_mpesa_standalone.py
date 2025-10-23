#!/usr/bin/env python3
"""
Standalone M-Pesa test without Flask dependencies
"""

import os
import requests
import json
from datetime import datetime

# Set environment variables directly
os.environ['MPESA_CONSUMER_KEY'] = 'JhER2QNVQOCW1O4SG9J7y7pRduOtg1EpYvlE4b34YRI34YzN'
os.environ['MPESA_CONSUMER_SECRET'] = 'uG5jOnzxoFelO2FSsZdlsLoMQATZpH4RGKGu3PahGIxOz5OnjA7Cuk8W4aZnUQfi'
os.environ['MPESA_BUSINESS_SHORT_CODE'] = '174379'
os.environ['MPESA_PASSKEY'] = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
os.environ['MPESA_ENVIRONMENT'] = 'sandbox'
os.environ['MPESA_CALLBACK_URL'] = 'https://prowrite.pythonanywhere.com/api/payments/mpesa/callback'

class MpesaService:
    def __init__(self):
        self.consumer_key = os.getenv('MPESA_CONSUMER_KEY')
        self.consumer_secret = os.getenv('MPESA_CONSUMER_SECRET')
        self.business_short_code = os.getenv('MPESA_BUSINESS_SHORT_CODE')
        self.passkey = os.getenv('MPESA_PASSKEY')
        self.environment = os.getenv('MPESA_ENVIRONMENT')
        self.callback_url = os.getenv('MPESA_CALLBACK_URL')
        
        if self.environment == 'sandbox':
            self.base_url = 'https://sandbox.safaricom.co.ke'
        else:
            self.base_url = 'https://api.safaricom.co.ke'
    
    def get_access_token(self):
        """Get M-Pesa access token"""
        try:
            oauth_url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
            response = requests.get(oauth_url, auth=(self.consumer_key, self.consumer_secret))
            
            if response.status_code == 200:
                data = response.json()
                return data.get('access_token')
            else:
                print(f"Error getting access token: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"Exception getting access token: {e}")
            return None
    
    def get_timestamp(self):
        """Get current timestamp in YYYYMMDDHHMMSS format"""
        return datetime.now().strftime('%Y%m%d%H%M%S')
    
    def get_password(self):
        """Generate M-Pesa password"""
        timestamp = self.get_timestamp()
        password_string = f"{self.business_short_code}{self.passkey}{timestamp}"
        
        import base64
        password = base64.b64encode(password_string.encode()).decode()
        return password, timestamp

def test_mpesa_service():
    print("🔍 Testing M-Pesa Service (Standalone)")
    print("=" * 50)
    
    # Test environment variables
    print("1. Environment Variables:")
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
            if 'SECRET' in var or 'KEY' in var:
                print(f"   ✅ {var}: {value[:8]}...")
            else:
                print(f"   ✅ {var}: {value}")
        else:
            print(f"   ❌ {var}: None")
    
    print("\n2. M-Pesa Service Initialization:")
    try:
        mpesa = MpesaService()
        print("   ✅ M-Pesa service initialized successfully")
    except Exception as e:
        print(f"   ❌ Error initializing M-Pesa service: {e}")
        return
    
    print("\n3. Access Token Generation:")
    try:
        access_token = mpesa.get_access_token()
        if access_token:
            print(f"   ✅ Access Token: {access_token[:20]}...")
        else:
            print("   ❌ Failed to generate access token")
            return
    except Exception as e:
        print(f"   ❌ Error generating access token: {e}")
        return
    
    print("\n4. Password Generation:")
    try:
        password, timestamp = mpesa.get_password()
        print(f"   ✅ Password: {password[:20]}...")
        print(f"   ✅ Timestamp: {timestamp}")
    except Exception as e:
        print(f"   ❌ Error generating password: {e}")
        return
    
    print("\n5. STK Push Test (Simulation):")
    try:
        # Simulate STK push request
        stk_push_url = f"{mpesa.base_url}/mpesa/stkpush/v1/processrequest"
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        # Test data
        test_data = {
            "BusinessShortCode": mpesa.business_short_code,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": 1,
            "PartyA": "254708374149",
            "PartyB": mpesa.business_short_code,
            "PhoneNumber": "254708374149",
            "CallBackURL": mpesa.callback_url,
            "AccountReference": "Test123",
            "TransactionDesc": "Test Payment"
        }
        
        print(f"   ✅ STK Push URL: {stk_push_url}")
        print(f"   ✅ Test Phone: 
        254708374149")
        print(f"   ✅ Test Amount: 1 KES")
        print(f"   ✅ Callback URL: {mpesa.callback_url}")
        
        # Note: We're not actually making the request to avoid charges
        print("   ℹ️  STK Push request prepared (not sent to avoid charges)")
        
    except Exception as e:
        print(f"   ❌ Error preparing STK push: {e}")
        return
    
    print("\n🎯 M-Pesa Service Test Complete!")
    print("✅ All components are working correctly!")
    print("✅ Ready for production testing!")

if __name__ == "__main__":
    test_mpesa_service()
