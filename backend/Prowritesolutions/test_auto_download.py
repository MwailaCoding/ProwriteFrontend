#!/usr/bin/env python3
"""
Test script for automatic PDF download functionality
"""
import requests
import json
import time
import os
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000"  # Change to your server URL
API_BASE = f"{BASE_URL}/api/payments/manual"

def test_auto_download():
    """Test the complete auto-download flow"""
    
    print("🚀 Testing Automatic PDF Download Functionality")
    print("=" * 50)
    
    # Test data
    test_data = {
        "form_data": {
            "firstName": "John",
            "lastName": "Doe",
            "email": "test@example.com",
            "phone": "0712345678",
            "experience": "5 years in software development",
            "skills": ["Python", "JavaScript", "React"],
            "education": "Bachelor's in Computer Science"
        },
        "document_type": "Francisca Resume",
        "user_email": "test@example.com",
        "phone_number": "0712345678"
    }
    
    try:
        # Step 1: Initiate payment
        print("📝 Step 1: Initiating payment...")
        response = requests.post(f"{API_BASE}/initiate", json=test_data)
        
        if response.status_code != 200:
            print(f"❌ Payment initiation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        payment_data = response.json()
        if not payment_data.get('success'):
            print(f"❌ Payment initiation failed: {payment_data.get('error')}")
            return False
        
        reference = payment_data['reference']
        print(f"✅ Payment initiated successfully")
        print(f"   Reference: {reference}")
        print(f"   Amount: KES {payment_data['amount']}")
        
        # Step 2: Simulate payment validation (using test transaction code)
        print("\n💳 Step 2: Validating payment...")
        validation_data = {
            "transaction_code": "TEST123456",  # Test transaction code
            "reference": reference
        }
        
        response = requests.post(f"{API_BASE}/validate", json=validation_data)
        
        if response.status_code != 200:
            print(f"❌ Payment validation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        validation_result = response.json()
        if not validation_result.get('success'):
            print(f"❌ Payment validation failed: {validation_result.get('error')}")
            return False
        
        print("✅ Payment validated successfully")
        print(f"   Status: {validation_result.get('status')}")
        print(f"   Auto Download: {validation_result.get('auto_download')}")
        print(f"   Download URL: {validation_result.get('download_url')}")
        
        # Step 3: Check if auto-download is available
        if not validation_result.get('auto_download'):
            print("⚠️  Auto-download not available in response")
            return False
        
        download_url = validation_result.get('download_url')
        if not download_url:
            print("⚠️  Download URL not provided")
            return False
        
        # Step 4: Poll for PDF completion
        print("\n⏳ Step 3: Waiting for PDF generation...")
        max_attempts = 20  # 1 minute max wait
        attempt = 0
        
        while attempt < max_attempts:
            attempt += 1
            print(f"   Attempt {attempt}/{max_attempts} - Checking status...")
            
            # Check payment status
            response = requests.get(f"{API_BASE}/status/{reference}")
            
            if response.status_code == 200:
                status_data = response.json()
                if status_data.get('success'):
                    status = status_data.get('status')
                    pdf_ready = status_data.get('pdf_ready', False)
                    
                    print(f"   Status: {status}, PDF Ready: {pdf_ready}")
                    
                    if status == 'completed' and pdf_ready:
                        print("✅ PDF generation completed!")
                        break
                    elif status == 'error':
                        print("❌ PDF generation failed")
                        return False
                else:
                    print(f"   Status check failed: {status_data.get('error')}")
            else:
                print(f"   Status check failed: {response.status_code}")
            
            time.sleep(3)  # Wait 3 seconds before next check
        
        if attempt >= max_attempts:
            print("⏰ Timeout waiting for PDF generation")
            return False
        
        # Step 5: Test PDF download
        print("\n📥 Step 4: Testing PDF download...")
        
        # Get the full download URL
        full_download_url = f"{BASE_URL}{download_url}"
        print(f"   Download URL: {full_download_url}")
        
        response = requests.get(full_download_url)
        
        if response.status_code == 200:
            # Check if it's actually a PDF
            content_type = response.headers.get('content-type', '')
            if 'application/pdf' in content_type:
                print("✅ PDF download successful!")
                
                # Save the PDF for verification
                filename = f"test_download_{reference}.pdf"
                with open(filename, 'wb') as f:
                    f.write(response.content)
                
                file_size = len(response.content)
                print(f"   File saved as: {filename}")
                print(f"   File size: {file_size} bytes")
                
                # Clean up test file
                try:
                    os.remove(filename)
                    print("   Test file cleaned up")
                except:
                    pass
                
                return True
            else:
                print(f"❌ Downloaded file is not a PDF. Content-Type: {content_type}")
                return False
        else:
            print(f"❌ PDF download failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

def test_download_endpoint_directly():
    """Test the download endpoint directly with a mock reference"""
    print("\n🔧 Testing Download Endpoint Directly")
    print("=" * 40)
    
    # Test with a non-existent reference
    test_reference = "PAY-TEST123"
    download_url = f"{BASE_URL}/api/payments/manual/download/{test_reference}"
    
    try:
        response = requests.get(download_url)
        
        if response.status_code == 404:
            print("✅ Download endpoint correctly returns 404 for non-existent reference")
            return True
        else:
            print(f"❌ Expected 404, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Direct download test failed: {e}")
        return False

if __name__ == "__main__":
    print(f"🧪 Auto-Download Test Suite")
    print(f"Time: {datetime.now()}")
    print(f"Server: {BASE_URL}")
    print()
    
    # Test 1: Complete flow
    success1 = test_auto_download()
    
    # Test 2: Direct endpoint test
    success2 = test_download_endpoint_directly()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   Complete Flow Test: {'✅ PASSED' if success1 else '❌ FAILED'}")
    print(f"   Direct Endpoint Test: {'✅ PASSED' if success2 else '❌ FAILED'}")
    
    if success1 and success2:
        print("\n🎉 All tests passed! Auto-download functionality is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Please check the implementation.")
