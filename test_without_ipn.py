#!/usr/bin/env python3
"""
Test Pesapal without IPN field
"""
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_without_ipn():
    """Test without IPN field"""
    print("🔍 Testing Without IPN Field")
    print("=" * 50)
    
    # Get credentials
    consumer_key = os.getenv('PESAPAL_CONSUMER_KEY')
    consumer_secret = os.getenv('PESAPAL_CONSUMER_SECRET')
    
    # Get access token
    token_url = "https://pay.pesapal.com/v3/api/Auth/RequestToken"
    token_data = {
        'consumer_key': consumer_key,
        'consumer_secret': consumer_secret
    }
    
    try:
        token_response = requests.post(token_url, json=token_data, timeout=30)
        if token_response.status_code != 200:
            print("❌ Failed to get access token")
            return
            
        access_token = token_response.json().get('token')
        print(f"✅ Access token obtained")
        
    except Exception as e:
        print(f"❌ Token error: {e}")
        return
    
    order_url = "https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest"
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    # Test without IPN field
    order_data = {
        'id': 'PAY-NO-IPN-TEST',
        'currency': 'KES',
        'amount': 100.00,
        'description': 'Test payment without IPN',
        'callback_url': 'https://prowrite.pythonanywhere.com/api/payments/pesapal/callback',
        'billing_address': {
            'phone_number': '254712345678',
            'email_address': 'test@example.com',
            'country_code': 'KE',
            'first_name': 'John',
            'last_name': 'Doe',
            'line_1': '123 Test Street',
            'city': 'Nairobi',
            'state': 'Nairobi',
            'postal_code': '00100'
        }
    }
    
    print("Testing without IPN field...")
    
    try:
        response = requests.post(order_url, json=order_data, headers=headers, timeout=30)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if 'error' in result:
                print(f"❌ Error: {result['error']['message']}")
            else:
                print(f"✅ SUCCESS! Redirect URL: {result.get('redirect_url')}")
                print(f"✅ Order Tracking ID: {result.get('order_tracking_id')}")
        else:
            print(f"❌ Failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_without_ipn()
