#!/usr/bin/env python3
"""
Test script to find working sandbox numbers and fix common issues
"""

import requests
import json
import os
import time

# Set environment variables
os.environ['MPESA_CONSUMER_KEY'] = 'JhER2QNVQOCW1O4SG9J7y7pRduOtg1EpYvlE4b34YRI34YzN'
os.environ['MPESA_CONSUMER_SECRET'] = 'uG5jOnzxoFelO2FSsZdlsLoMQATZpH4RGKGu3PahGIxOz5OnjA7Cuk8W4aZnUQfi'

def test_sandbox_connection():
    """Test M-Pesa sandbox connection and find working numbers"""
    
    print("🔍 Testing M-Pesa Sandbox Connection")
    print("=" * 50)
    
    # Test access token
    consumer_key = os.getenv('MPESA_CONSUMER_KEY')
    consumer_secret = os.getenv('MPESA_CONSUMER_SECRET')
    
    oauth_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    
    try:
        response = requests.get(oauth_url, auth=(consumer_key, consumer_secret), timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            access_token = data.get('access_token')
            print(f"✅ Access Token: {access_token[:20]}...")
        else:
            print(f"❌ Failed to get access token: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return
    
    # Test different sandbox numbers
    sandbox_numbers = [
        "254708374149",  # Official test number 1
        "254708374150",  # Official test number 2
        "254708374151",  # Official test number 3
        "254700000000",  # Generic test number
        "254712345678",  # Alternative test number
    ]
    
    print("\n📱 Testing Sandbox Phone Numbers:")
    print("=" * 50)
    
    working_numbers = []
    
    for phone in sandbox_numbers:
        print(f"\n🔍 Testing: {phone}")
        
        try:
            # Test STK push
            stk_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            # Generate password
            from datetime import datetime
            import base64
            
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password_string = f"174379bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919{timestamp}"
            password = base64.b64encode(password_string.encode()).decode()
            
            payload = {
                "BusinessShortCode": "174379",
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": 1,
                "PartyA": phone,
                "PartyB": "174379",
                "PhoneNumber": phone,
                "CallBackURL": "https://prowrite.pythonanywhere.com/api/payments/mpesa/callback",
                "AccountReference": "Test123",
                "TransactionDesc": "Test Payment"
            }
            
            response = requests.post(stk_url, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('ResponseCode') == '0':
                    print(f"   ✅ Success: {data.get('CustomerMessage')}")
                    print(f"   ✅ CheckoutRequestID: {data.get('CheckoutRequestID')}")
                    working_numbers.append(phone)
                else:
                    print(f"   ❌ Error: {data.get('ResponseDescription')}")
            else:
                print(f"   ❌ HTTP Error: {response.status_code}")
                print(f"   ❌ Response: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Exception: {e}")
    
    print(f"\n🎯 Working Sandbox Numbers: {working_numbers}")
    
    if working_numbers:
        print("\n✅ Use these numbers for testing:")
        for number in working_numbers:
            print(f"   📱 {number}")
    else:
        print("\n❌ No working sandbox numbers found. Check your credentials.")
    
    print("\n💡 Testing Tips:")
    print("   - Use working numbers for testing")
    print("   - Wait 2-3 minutes between tests")
    print("   - Don't spam the API")
    print("   - Check logs for detailed errors")

if __name__ == "__main__":
    test_sandbox_connection()
