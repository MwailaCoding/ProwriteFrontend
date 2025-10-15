#!/usr/bin/env python3
"""
Debug Pesapal API response to see what's happening
"""
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def debug_pesapal_api():
    """Debug the actual Pesapal API call"""
    print("🔍 Debugging Pesapal API Response")
    print("=" * 50)
    
    # Get credentials from environment
    consumer_key = os.getenv('PESAPAL_CONSUMER_KEY')
    consumer_secret = os.getenv('PESAPAL_CONSUMER_SECRET')
    
    if not consumer_key or not consumer_secret:
        print("❌ Credentials not found in environment")
        return
    
    print(f"Consumer Key: {consumer_key}")
    print(f"Consumer Secret: {consumer_secret}")
    print()
    
    # Step 1: Get access token
    print("1. Getting access token...")
    token_url = "https://pay.pesapal.com/v3/api/Auth/RequestToken"
    
    token_headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    token_data = {
        'consumer_key': consumer_key,
        'consumer_secret': consumer_secret
    }
    
    try:
        token_response = requests.post(token_url, json=token_data, headers=token_headers, timeout=30)
        print(f"Token Status: {token_response.status_code}")
        print(f"Token Response: {token_response.text}")
        
        if token_response.status_code != 200:
            print("❌ Failed to get access token")
            return
            
        token_data = token_response.json()
        access_token = token_data.get('token')
        
        if not access_token:
            print("❌ No access token in response")
            return
            
        print(f"✅ Access token: {access_token[:20]}...")
        print()
        
    except Exception as e:
        print(f"❌ Token error: {e}")
        return
    
    # Step 2: Create payment order
    print("2. Creating payment order...")
    order_url = "https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest"
    
    order_headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    order_data = {
        'id': 'PAY-DEBUG123',
        'currency': 'KES',
        'amount': 100.00,
        'description': 'Debug test payment',
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
    
    try:
        order_response = requests.post(order_url, json=order_data, headers=order_headers, timeout=30)
        print(f"Order Status: {order_response.status_code}")
        print(f"Order Response: {order_response.text}")
        
        if order_response.status_code == 200:
            order_result = order_response.json()
            print("\n✅ Order created successfully!")
            print(f"Redirect URL: {order_result.get('redirect_url')}")
            print(f"Order Tracking ID: {order_result.get('order_tracking_id')}")
            print(f"Full Response: {json.dumps(order_result, indent=2)}")
        else:
            print("❌ Order creation failed")
            
    except Exception as e:
        print(f"❌ Order error: {e}")

if __name__ == "__main__":
    debug_pesapal_api()
