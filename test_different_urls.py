#!/usr/bin/env python3
"""
Test different URL formats for Pesapal
"""
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_different_urls():
    """Test different callback URL formats"""
    print("🔍 Testing Different URL Formats")
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
    
    # Test different URL formats
    url_formats = [
        "https://prowrite.pythonanywhere.com/api/payments/pesapal/callback",
        "https://prowrite.pythonanywhere.com/api/payments/pesapal/webhook",
        "https://prowrite.pythonanywhere.com/callback",
        "https://prowrite.pythonanywhere.com/webhook",
        "https://prowrite.pythonanywhere.com/",
    ]
    
    order_url = "https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest"
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    for i, callback_url in enumerate(url_formats, 1):
        print(f"\nTest {i}: {callback_url}")
        
        order_data = {
            'id': f'PAY-TEST{i}',
            'currency': 'KES',
            'amount': 100.00,
            'description': f'Test payment {i}',
            'callback_url': callback_url,
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
                    print(f"  ✅ Success! Redirect URL: {result.get('redirect_url')}")
                    print(f"  ✅ Order Tracking ID: {result.get('order_tracking_id')}")
                    return callback_url
            else:
                print(f"  ❌ Failed: {response.text}")
                
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    print("\n❌ No working URL format found")
    return None

if __name__ == "__main__":
    working_url = test_different_urls()
    if working_url:
        print(f"\n🎯 Working URL: {working_url}")
    else:
        print("\n🔧 Need to check Pesapal dashboard configuration")
