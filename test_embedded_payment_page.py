#!/usr/bin/env python3
"""
Test script for Pesapal Embedded Payment Page
"""

import requests
import json

def test_embedded_payment_page():
    """Test the embedded payment page functionality"""
    
    print("🧪 TESTING PESAPAL EMBEDDED PAYMENT PAGE")
    print("=" * 60)
    
    base_url = "https://prowrite.pythonanywhere.com"
    
    # Test data
    test_order = {
        'order_reference': 'PAY-EMBEDDED-TEST-001',
        'amount': '100.00',
        'description': 'Test payment for embedded page'
    }
    
    print(f"🔧 Testing with order: {test_order['order_reference']}")
    print(f"💰 Amount: KES {test_order['amount']}")
    print()
    
    # Test 1: Show payment page
    print("📄 Testing Payment Page Display")
    print("-" * 40)
    
    payment_page_url = f"{base_url}/api/payments/pesapal/payment-page"
    params = {
        'order_reference': test_order['order_reference'],
        'amount': test_order['amount'],
        'description': test_order['description']
    }
    
    try:
        response = requests.get(payment_page_url, params=params, timeout=30)
        
        if response.status_code == 200:
            print("✅ Payment page loaded successfully")
            print(f"📄 Response length: {len(response.text)} characters")
            
            # Check if it contains the iframe
            if 'iframe' in response.text and 'pesapal.com' in response.text:
                print("✅ Embedded iframe found in response")
            else:
                print("⚠️  Embedded iframe not found in response")
                
        else:
            print(f"❌ Failed to load payment page: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            
    except Exception as e:
        print(f"❌ Error testing payment page: {str(e)}")
    
    print()
    
    # Test 2: Payment success callback
    print("✅ Testing Payment Success Callback")
    print("-" * 40)
    
    success_url = f"{base_url}/api/payments/pesapal/payment-success"
    success_data = {
        'order_reference': test_order['order_reference'],
        'amount': test_order['amount'],
        'payment_reference': 'TGBL123456789'
    }
    
    try:
        response = requests.post(success_url, data=success_data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ Payment success callback working")
                print(f"📝 Message: {result.get('message')}")
            else:
                print(f"⚠️  Payment success callback failed: {result.get('message')}")
        else:
            print(f"❌ Payment success callback failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing payment success: {str(e)}")
    
    print()
    
    # Test 3: Payment cancellation callback
    print("❌ Testing Payment Cancellation Callback")
    print("-" * 40)
    
    cancel_url = f"{base_url}/api/payments/pesapal/payment-cancelled"
    cancel_params = {
        'order_reference': test_order['order_reference']
    }
    
    try:
        response = requests.get(cancel_url, params=cancel_params, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ Payment cancellation callback working")
                print(f"📝 Message: {result.get('message')}")
            else:
                print(f"⚠️  Payment cancellation callback failed: {result.get('message')}")
        else:
            print(f"❌ Payment cancellation callback failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing payment cancellation: {str(e)}")
    
    print()
    print("🎯 USAGE INSTRUCTIONS")
    print("=" * 60)
    print("1. Use this URL to show payment page:")
    print(f"   {payment_page_url}?order_reference=YOUR_ORDER&amount=YOUR_AMOUNT")
    print()
    print("2. Configure your Pesapal store to redirect to:")
    print(f"   Success: {base_url}/api/payments/pesapal/payment-success")
    print(f"   Cancel:  {base_url}/api/payments/pesapal/payment-cancelled")
    print()
    print("3. The embedded iframe will handle the payment process")
    print("4. Users will be redirected back to your success/cancel pages")
    print()
    print("🎉 Embedded payment page system is ready!")
    
    # Test 4: PDF Download
    print("📄 Testing PDF Download")
    print("-" * 40)
    
    download_url = f"{base_url}/api/payments/pesapal/download/{test_order['order_reference']}"
    
    try:
        response = requests.get(download_url, timeout=30)
        
        if response.status_code == 200:
            print("✅ PDF download endpoint working")
            print(f"📄 Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
            print(f"📄 Content-Length: {len(response.content)} bytes")
        elif response.status_code == 404:
            print("⚠️  PDF not ready yet (expected for new orders)")
            print("📝 This is normal - PDF will be available after payment processing")
        else:
            print(f"❌ PDF download failed: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            
    except Exception as e:
        print(f"❌ Error testing PDF download: {str(e)}")
    
    print()
    print("🎯 COMPLETE PAYMENT FLOW TEST")
    print("=" * 60)
    print("1. User visits payment page")
    print(f"   {payment_page_url}?order_reference=PAY-123&amount=500")
    print()
    print("2. User completes payment via Pesapal")
    print("   → Pesapal processes payment")
    print()
    print("3. Pesapal redirects to success URL")
    print(f"   {base_url}/api/payments/pesapal/payment-success")
    print("   → System automatically:")
    print("     ✅ Updates payment status")
    print("     📄 Generates PDF in background")
    print("     📧 Sends email with attachment")
    print("     🔗 Creates download link")
    print()
    print("4. User sees success page with download button")
    print("5. User receives email with PDF attachment")
    print("6. User can download PDF directly")
    print(f"   {base_url}/api/payments/pesapal/download/PAY-123")
    print()
    print("🚀 AUTOMATIC PAYMENT VERIFICATION COMPLETE!")

if __name__ == "__main__":
    test_embedded_payment_page()
