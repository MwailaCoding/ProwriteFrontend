#!/usr/bin/env python3
"""
Test Pesapal with different API approaches
"""
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_pesapal_v2():
    """Test with different API approaches"""
    print("🔍 Testing Pesapal API v2 Approaches")
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
    
    # Test different API approaches
    approaches = [
        {
            'name': 'Standard with callback only',
            'data': {
                'id': 'PAY-STD-TEST',
                'currency': 'KES',
                'amount': 100.00,
                'description': 'Standard test payment',
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
        },
        {
            'name': 'With notification_id field',
            'data': {
                'id': 'PAY-NOTIF-TEST',
                'currency': 'KES',
                'amount': 100.00,
                'description': 'Test with notification_id',
                'callback_url': 'https://prowrite.pythonanywhere.com/api/payments/pesapal/callback',
                'notification_id': '19744',
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
        },
        {
            'name': 'With webhook_url field',
            'data': {
                'id': 'PAY-WEBHOOK-TEST',
                'currency': 'KES',
                'amount': 100.00,
                'description': 'Test with webhook_url',
                'callback_url': 'https://prowrite.pythonanywhere.com/api/payments/pesapal/callback',
                'webhook_url': 'https://prowrite.pythonanywhere.com/api/payments/pesapal/callback',
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
        }
    ]
    
    order_url = "https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest"
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    for i, approach in enumerate(approaches, 1):
        print(f"\nTest {i}: {approach['name']}")
        
        try:
            response = requests.post(order_url, json=approach['data'], headers=headers, timeout=30)
            print(f"  Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                if 'error' in result:
                    print(f"  ❌ Error: {result['error']['message']}")
                else:
                    print(f"  ✅ SUCCESS! Redirect URL: {result.get('redirect_url')}")
                    print(f"  ✅ Order Tracking ID: {result.get('order_tracking_id')}")
                    print(f"  🎯 Working approach: {approach['name']}")
                    return approach['data']
            else:
                print(f"  ❌ Failed: {response.text}")
                
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    print("\n❌ No working approach found")
    return None

if __name__ == "__main__":
    working_approach = test_pesapal_v2()
    if working_approach:
        print(f"\n🎯 Use this approach in your code!")
    else:
        print("\n🔧 Need to check Pesapal account status or contact support")
