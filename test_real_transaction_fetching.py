#!/usr/bin/env python3
"""
Test script for real transaction fetching implementation
Tests the new Africa's Talking API integration
"""

import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_environment_setup():
    """Test if environment variables are properly configured"""
    
    print("🔧 Testing Environment Setup")
    print("=" * 50)
    
    required_vars = [
        'AFRICAS_TALKING_API_KEY',
        'AFRICAS_TALKING_USERNAME',
        'AFRICAS_TALKING_ENV',
        'AFRICAS_TALKING_PAYMENT_PRODUCT',
        'FLASK_ENV'
    ]
    
    all_set = True
    for var in required_vars:
        value = os.getenv(var)
        if value:
            if 'KEY' in var:
                masked = value[:8] + "..." + value[-4:] if len(value) > 12 else "***"
                print(f"✅ {var}: {masked}")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: NOT SET")
            all_set = False
    
    print()
    return all_set

def test_transaction_validation():
    """Test transaction validation with real API fetching"""
    
    print("🧪 Testing Real Transaction Validation")
    print("=" * 50)
    
    # Test cases
    test_cases = [
        {
            "name": "Real Transaction (Should PASS if in API)",
            "transaction_code": "TJBL8759KU",
            "reference": "PAY-B76C88F3",
            "expected": "PASS"
        },
        {
            "name": "Fake Transaction (Should FAIL)",
            "transaction_code": "FAKE123456",
            "reference": "PAY-B76C88F3",
            "expected": "FAIL"
        },
        {
            "name": "Another Real Transaction (Should PASS if in API)",
            "transaction_code": "TGBL8759KU",
            "reference": "PAY-B76C88F3",
            "expected": "PASS"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}: {test_case['name']}")
        print(f"Transaction Code: {test_case['transaction_code']}")
        print(f"Expected Result: {test_case['expected']}")
        
        try:
            response = requests.post(
                'https://prowrite.pythonanywhere.com/api/payments/manual/validate',
                json={
                    "transaction_code": test_case['transaction_code'],
                    "reference": test_case['reference']
                },
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            print(f"Status Code: {response.status_code}")
            
            try:
                result = response.json()
                print(f"Response: {json.dumps(result, indent=2)}")
                
                success = result.get('success', False)
                error = result.get('error', '')
                error_code = result.get('error_code', '')
                
                if test_case['expected'] == "PASS":
                    if success:
                        print("✅ CORRECT: Transaction was accepted")
                    else:
                        print(f"❌ UNEXPECTED: Transaction was rejected - {error}")
                        if "API_ERROR" in error_code:
                            print("   → This indicates API setup issue")
                        elif "TRANSACTION_NOT_FOUND" in error_code:
                            print("   → Transaction not found in API results")
                else:
                    if not success:
                        print("✅ CORRECT: Fake transaction was rejected")
                    else:
                        print("❌ SECURITY ISSUE: Fake transaction was accepted!")
                        
            except json.JSONDecodeError:
                print(f"Response Text: {response.text}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print()

def test_api_endpoints():
    """Test Africa's Talking API endpoints directly"""
    
    print("🌐 Testing Africa's Talking API Endpoints")
    print("=" * 50)
    
    api_key = os.getenv('AFRICAS_TALKING_API_KEY')
    username = os.getenv('AFRICAS_TALKING_USERNAME')
    environment = os.getenv('AFRICAS_TALKING_ENV', 'production')
    product_name = os.getenv('AFRICAS_TALKING_PAYMENT_PRODUCT', 'Mpesa')
    
    if not api_key or not username:
        print("❌ Missing API credentials - skipping API tests")
        return
    
    # Set base URL
    if environment == 'production':
        base_url = 'https://api.africastalking.com'
    else:
        base_url = 'https://api.sandbox.africastalking.com'
    
    print(f"Base URL: {base_url}")
    print(f"Product Name: {product_name}")
    print()
    
    # Test 1: Query Transaction Fetch
    print("🧪 Test 1: Query Transaction Fetch")
    print("-" * 30)
    
    try:
        url = f"{base_url}/query/transaction/fetch"
        headers = {
            'apiKey': api_key,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        data = {
            'username': username,
            'productName': product_name,
            'pageNumber': 1,
            'count': 10,
            'startDate': '2024-01-01',
            'endDate': '2024-12-31'
        }
        
        print(f"URL: {url}")
        print(f"Data: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, json=data, headers=headers, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}...")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('status') == 'Success':
                transactions = result.get('transactions', [])
                print(f"✅ API Success: Found {len(transactions)} transactions")
            else:
                print(f"❌ API Error: {result.get('message', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()

def main():
    """Main test function"""
    
    print("🚀 Real Transaction Fetching Test Suite")
    print("=" * 60)
    print()
    
    # Test 1: Environment setup
    env_ok = test_environment_setup()
    
    if not env_ok:
        print("❌ Environment setup incomplete. Please configure all required variables.")
        return
    
    # Test 2: API endpoints
    test_api_endpoints()
    
    # Test 3: Transaction validation
    test_transaction_validation()
    
    print("=" * 60)
    print("Test suite completed!")
    print()
    print("📋 Next Steps:")
    print("1. If API tests fail, check your Africa's Talking setup")
    print("2. If transactions are rejected, verify they exist in your till")
    print("3. Check application logs for detailed error messages")

if __name__ == "__main__":
    main()
