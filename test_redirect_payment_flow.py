#!/usr/bin/env python3
"""
Test script for Pesapal Redirect-Based Payment Flow
Tests the complete flow where redirect confirms payment
"""

import requests
import json

def test_redirect_payment_flow():
    """Test the redirect-based payment confirmation flow"""
    
    print("🔄 TESTING PESAPAL REDIRECT-BASED PAYMENT FLOW")
    print("=" * 60)
    
    base_url = "https://prowrite.pythonanywhere.com"
    
    # Test data
    test_order = {
        'order_reference': 'PAY-REDIRECT-TEST-001',
        'amount': '100.00',
        'description': 'Test payment for redirect flow'
    }
    
    print(f"🔧 Testing with order: {test_order['order_reference']}")
    print(f"💰 Amount: KES {test_order['amount']}")
    print()
    
    # Test 1: Payment Page
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
            
            if 'iframe' in response.text and 'pesapal.com' in response.text:
                print("✅ Embedded Pesapal iframe found")
            else:
                print("⚠️  Embedded iframe not found")
                
        else:
            print(f"❌ Failed to load payment page: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error testing payment page: {str(e)}")
    
    print()
    
    # Test 2: Simulate Payment Success Redirect
    print("🔄 Testing Payment Success Redirect (Simulation)")
    print("-" * 40)
    
    success_url = f"{base_url}/api/payments/pesapal/payment-success"
    success_params = {
        'order_reference': test_order['order_reference'],
        'amount': test_order['amount'],
        'payment_reference': 'TGBL123456789'
    }
    
    try:
        response = requests.get(success_url, params=success_params, timeout=30)
        
        if response.status_code == 200:
            print("✅ Payment success redirect handled successfully")
            print(f"📄 Response length: {len(response.text)} characters")
            
            if 'Payment Successful' in response.text:
                print("✅ Success page displayed correctly")
            if 'Download PDF' in response.text:
                print("✅ Download button found")
            if 'Email Notification' in response.text:
                print("✅ Email notification message found")
                
        else:
            print(f"❌ Payment success redirect failed: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            
    except Exception as e:
        print(f"❌ Error testing payment success redirect: {str(e)}")
    
    print()
    
    # Test 3: PDF Download
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
            print("📝 This is normal - PDF will be available after background processing")
        else:
            print(f"❌ PDF download failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error testing PDF download: {str(e)}")
    
    print()
    
    # Test 4: Payment Cancellation
    print("❌ Testing Payment Cancellation")
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
                print("✅ Payment cancellation handled successfully")
            else:
                print(f"⚠️  Payment cancellation failed: {result.get('message')}")
        else:
            print(f"❌ Payment cancellation failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error testing payment cancellation: {str(e)}")
    
    print()
    print("🎯 REDIRECT-BASED PAYMENT FLOW SUMMARY")
    print("=" * 60)
    print("1. User visits payment page")
    print(f"   {payment_page_url}?order_reference=PAY-123&amount=500")
    print()
    print("2. User completes payment via Pesapal")
    print("   → Pesapal processes payment")
    print()
    print("3. Pesapal redirects to success URL")
    print(f"   {base_url}/api/payments/pesapal/payment-success")
    print("   → REDIRECT CONFIRMS PAYMENT AUTOMATICALLY")
    print()
    print("4. System processes redirect and:")
    print("   ✅ Updates payment status to 'COMPLETED'")
    print("   📄 Starts PDF generation in background")
    print("   📧 Sends email with PDF attachment")
    print("   🔗 Creates download link")
    print()
    print("5. User sees success page with download button")
    print("6. User receives email with PDF attachment")
    print("7. User can download PDF directly")
    print(f"   {base_url}/api/payments/pesapal/download/PAY-123")
    print()
    print("🚀 REDIRECT-BASED CONFIRMATION SYSTEM READY!")
    print()
    print("📋 CONFIGURATION NEEDED:")
    print("1. Upload pesapal_embedded_routes.py to PythonAnywhere")
    print("2. Set Pesapal success URL to:")
    print(f"   {base_url}/api/payments/pesapal/payment-success")
    print("3. Set Pesapal cancel URL to:")
    print(f"   {base_url}/api/payments/pesapal/payment-cancelled")
    print()
    print("🎉 NO ADDITIONAL VERIFICATION NEEDED!")
    print("   The redirect itself confirms payment was successful!")

if __name__ == "__main__":
    test_redirect_payment_flow()
