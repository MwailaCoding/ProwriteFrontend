#!/usr/bin/env python3
"""
Test different IPN ID formats
"""
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_ipn_formats():
    """Test different IPN ID formats"""
    print("🔍 Testing Different IPN ID Formats")
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
    
    # Test different IPN ID formats
    ipn_formats = [
        "19744",           # Just the number
        "ipn_19744",       # With ipn_ prefix
        "IPN_19744",       # With IPN_ prefix
        "19744",           # As integer
        19744,             # As actual integer
        "https://prowrite.pythonanywhere.com/api/payments/pesapal/callback",  # Full URL
    ]
    
    order_url = "https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest"
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    for i, ipn_id in enumerate(ipn_formats, 1):
        print(f"\nTest {i}: IPN ID = '{ipn_id}' (type: {type(ipn_id).__name__})")
        
        order_data = {
            'id': f'PAY-IPN-TEST{i}',
            'currency': 'KES',
            'amount': 100.00,
            'description': f'Test payment {i}',
            'callback_url': 'https://prowrite.pythonanywhere.com/api/payments/pesapal/callback',
            'ipn_notification_url': ipn_id,
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
        
        try:
            response = requests.post(order_url, json=order_data, headers=headers, timeout=30)
            print(f"  Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                if 'error' in result:
                    print(f"  ❌ Error: {result['error']['message']}")
                else:
                    print(f"  ✅ SUCCESS! Redirect URL: {result.get('redirect_url')}")
                    print(f"  ✅ Order Tracking ID: {result.get('order_tracking_id')}")
                    print(f"  🎯 Working IPN ID format: {ipn_id}")
                    return ipn_id
            else:
                print(f"  ❌ Failed: {response.text}")
                
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    print("\n❌ No working IPN ID format found")
    return None

if __name__ == "__main__":
    working_ipn = test_ipn_formats()
    if working_ipn:
        print(f"\n🎯 Use this IPN ID format: {working_ipn}")
    else:
        print("\n🔧 Need to check Pesapal dashboard for correct IPN ID format")

