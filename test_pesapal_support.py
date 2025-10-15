#!/usr/bin/env python3
"""
Test to gather information for Pesapal support
"""
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_pesapal_support():
    """Test to gather information for Pesapal support"""
    print("🔍 Gathering Information for Pesapal Support")
    print("=" * 60)
    
    # Get credentials
    consumer_key = os.getenv('PESAPAL_CONSUMER_KEY')
    consumer_secret = os.getenv('PESAPAL_CONSUMER_SECRET')
    
    print(f"Consumer Key: {consumer_key}")
    print(f"Consumer Secret: {consumer_secret}")
    print()
    
    # Get access token
    token_url = "https://pay.pesapal.com/v3/api/Auth/RequestToken"
    token_data = {
        'consumer_key': consumer_key,
        'consumer_secret': consumer_secret
    }
    
    try:
        token_response = requests.post(token_url, json=token_data, timeout=30)
        print(f"Token Request Status: {token_response.status_code}")
        print(f"Token Response: {token_response.text}")
        
        if token_response.status_code == 200:
            access_token = token_response.json().get('token')
            print(f"✅ Access token obtained: {access_token[:20]}...")
        else:
            print("❌ Failed to get access token")
            return
            
    except Exception as e:
        print(f"❌ Token error: {e}")
        return
    
    # Test minimal payment request
    order_url = "https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest"
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    # Minimal test data
    order_data = {
        'id': 'PAY-SUPPORT-TEST',
        'currency': 'KES',
        'amount': 100.00,
        'description': 'Support test payment',
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
    
    print(f"\nTesting minimal payment request...")
    print(f"Request URL: {order_url}")
    print(f"Request Data: {json.dumps(order_data, indent=2)}")
    
    try:
        response = requests.post(order_url, json=order_data, headers=headers, timeout=30)
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if 'error' in result:
                print(f"\n❌ Error Details:")
                print(f"  Error Type: {result['error'].get('error_type')}")
                print(f"  Error Code: {result['error'].get('code')}")
                print(f"  Error Message: {result['error'].get('message')}")
            else:
                print(f"✅ SUCCESS!")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Request error: {e}")
    
    print(f"\n" + "=" * 60)
    print("📋 INFORMATION FOR PESAPAL SUPPORT:")
    print("=" * 60)
    print(f"Consumer Key: {consumer_key}")
    print(f"Environment: Production")
    print(f"Callback URL: https://prowrite.pythonanywhere.com/api/payments/pesapal/callback")
    print(f"IPN URL: https://prowrite.pythonanywhere.com/api/payments/pesapal/callback")
    print(f"Dashboard IPN ID: 19744")
    print(f"Error: The specified IPN ID is invalid")
    print(f"API Endpoint: https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest")
    print()
    print("🔧 NEXT STEPS:")
    print("1. Contact Pesapal support with the above information")
    print("2. Ask them to verify your IPN URL registration")
    print("3. Request the correct IPN ID format for your account")
    print("4. Ask if there are any account restrictions or pending approvals")

if __name__ == "__main__":
    test_pesapal_support()
