#!/usr/bin/env python3
"""
Test Pesapal with real payment amount
"""
import requests
import json

def test_real_payment():
    """Test with a realistic payment amount"""
    print("💳 Testing Real Payment Amount")
    print("=" * 50)
    
    base_url = "https://prowrite.pythonanywhere.com"
    initiate_url = f"{base_url}/api/payments/pesapal/initiate"
    
    # Realistic payment data
    payment_data = {
        "amount": 100.00,  # 100 KES - more realistic amount
        "currency": "KES",
        "description": "Test payment for ProWrite services",
        "phone_number": "254712345678",
        "email_address": "test@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "country_code": "KE",
        "city": "Nairobi",
        "state": "Nairobi",
        "line_1": "123 Test Street",
        "postal_code": "00100"
    }
    
    print(f"URL: {initiate_url}")
    print(f"Amount: KES {payment_data['amount']}")
    print()
    
    try:
        response = requests.post(
            initiate_url,
            json=payment_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ Payment initiated successfully!")
                print(f"Order Reference: {result.get('order_reference')}")
                print(f"Payment URL: {result.get('payment_url')}")
                print(f"Order Tracking ID: {result.get('order_tracking_id')}")
                
                if result.get('payment_url'):
                    print(f"\n🌐 Payment URL: {result.get('payment_url')}")
                    print("You can use this URL to complete the payment!")
                else:
                    print("\n⚠️  No payment URL returned - check Pesapal configuration")
                
                return result.get('order_reference')
            else:
                print("❌ Payment initiation failed")
        else:
            print("❌ Payment initiation failed")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
    
    return None

if __name__ == "__main__":
    test_real_payment()
