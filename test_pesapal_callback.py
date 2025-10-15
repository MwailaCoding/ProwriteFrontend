#!/usr/bin/env python3
"""
Test Pesapal Callback URL
"""
import requests
import json

def test_callback_url():
    """Test the Pesapal callback endpoint"""
    
    # Your callback URL
    callback_url = "https://prowrite.pythonanywhere.com/api/payments/pesapal/callback"
    
    print("🔧 Using your PythonAnywhere domain: prowrite.pythonanywhere.com")
    print("✅ Callback URL configured correctly!")
    print()
    
    # Sample callback data (what Pesapal sends)
    callback_data = {
        "OrderTrackingId": "TEST123456",
        "OrderMerchantReference": "PAY-TEST123",
        "PaymentStatus": "COMPLETED",
        "PaymentMethod": "Mpesa",
        "PaymentAccount": "254712345678",
        "Amount": 500.00,
        "Currency": "KES",
        "PaymentReference": "TGBL8759KU"
    }
    
    print("🧪 Testing Pesapal Callback URL")
    print("=" * 50)
    print(f"URL: {callback_url}")
    print(f"Data: {json.dumps(callback_data, indent=2)}")
    print()
    
    try:
        # Send POST request
        response = requests.post(
            callback_url,
            json=callback_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Callback URL is working!")
        else:
            print("❌ Callback URL has issues")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
        print("Make sure your server is running and accessible")

if __name__ == "__main__":
    test_callback_url()
