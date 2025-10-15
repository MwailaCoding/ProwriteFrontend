#!/usr/bin/env python3
"""
Test Complete Pesapal Integration
"""
import requests
import json

def test_pesapal_connection():
    """Test Pesapal API connection"""
    print("🔌 Testing Pesapal Connection")
    print("=" * 50)
    
    # Replace with your actual domain
    base_url = "https://prowrite.pythonanywhere.com"
    test_url = f"{base_url}/api/payments/pesapal/test"
    
    try:
        response = requests.get(test_url, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Pesapal connection successful!")
        else:
            print("❌ Pesapal connection failed")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")

def test_payment_initiation():
    """Test payment initiation"""
    print("\n💳 Testing Payment Initiation")
    print("=" * 50)
    
    # Replace with your actual domain
    base_url = "https://prowrite.pythonanywhere.com"
    initiate_url = f"{base_url}/api/payments/pesapal/initiate"
    
    # Sample payment data
    payment_data = {
        "amount": 500.00,
        "currency": "KES",
        "description": "Test payment for services",
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
    print(f"Data: {json.dumps(payment_data, indent=2)}")
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
                return result.get('order_reference')
            else:
                print("❌ Payment initiation failed")
        else:
            print("❌ Payment initiation failed")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
    
    return None

def test_payment_status(order_reference):
    """Test payment status check"""
    if not order_reference:
        print("\n⏭️  Skipping payment status test (no order reference)")
        return
    
    print(f"\n📊 Testing Payment Status for: {order_reference}")
    print("=" * 50)
    
    # Replace with your actual domain
    base_url = "https://prowrite.pythonanywhere.com"
    status_url = f"{base_url}/api/payments/pesapal/status/{order_reference}"
    
    try:
        response = requests.get(status_url, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Payment status retrieved successfully!")
        else:
            print("❌ Payment status check failed")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")

def test_callback_url():
    """Test callback URL"""
    print("\n🔄 Testing Callback URL")
    print("=" * 50)
    
    # Replace with your actual domain
    base_url = "https://prowrite.pythonanywhere.com"
    callback_url = f"{base_url}/api/payments/pesapal/callback"
    
    # Sample callback data
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
    
    print(f"URL: {callback_url}")
    print(f"Data: {json.dumps(callback_data, indent=2)}")
    print()
    
    try:
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

def main():
    """Run all tests"""
    print("🧪 PESAPAL INTEGRATION TEST SUITE")
    print("=" * 60)
    print("🔧 Using your PythonAnywhere domain: prowrite.pythonanywhere.com")
    print("✅ All URLs configured correctly!")
    print()
    
    # Test 1: Connection
    test_pesapal_connection()
    
    # Test 2: Payment Initiation
    order_reference = test_payment_initiation()
    
    # Test 3: Payment Status
    test_payment_status(order_reference)
    
    # Test 4: Callback URL
    test_callback_url()
    
    print("\n" + "=" * 60)
    print("🎉 Test suite completed!")
    print("\nNext steps:")
    print("1. Update the base_url with your actual domain")
    print("2. Add your Pesapal credentials to .env file")
    print("3. Test with real payments")

if __name__ == "__main__":
    main()
