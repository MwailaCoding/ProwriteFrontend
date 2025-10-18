#!/usr/bin/env python3
"""
Debug script for transaction verification
Tests the specific transaction TGBL8759KU with detailed logging
"""

import os
import sys
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_africas_talking_api():
    """Test Africa's Talking API directly"""
    
    print("🔧 Testing Africa's Talking API Directly")
    print("=" * 60)
    
    # Get credentials
    api_key = os.getenv('AFRICAS_TALKING_API_KEY')
    username = os.getenv('AFRICAS_TALKING_USERNAME')
    environment = os.getenv('AFRICAS_TALKING_ENV', 'production')
    
    print(f"Username: {username}")
    print(f"API Key: {api_key[:8]}...{api_key[-4:] if api_key else 'NOT SET'}")
    print(f"Environment: {environment}")
    print()
    
    if not api_key or not username:
        print("❌ Missing Africa's Talking credentials!")
        return
    
    # Set base URL
    if environment == 'production':
        base_url = 'https://api.africastalking.com'
    else:
        base_url = 'https://api.sandbox.africastalking.com'
    
    # Test 1: Fetch product transactions
    print("🧪 Test 1: Fetching Product Transactions")
    print("-" * 40)
    
    try:
        url = f"{base_url}/version1/payments/fetchProductTransactions"
        headers = {
            'apiKey': api_key,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        data = {
            'username': username,
            'productName': 'Mpesa',
            'pageNumber': 1,
            'count': 10,
            'providerChannel': '6340351'  # Your till number
        }
        
        print(f"URL: {url}")
        print(f"Data: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, json=data, headers=headers, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            transactions = result.get('transactions', [])
            print(f"Found {len(transactions)} transactions")
            
            # Look for our specific transaction
            for transaction in transactions:
                if transaction.get('transactionId') == 'TGBL8759KU':
                    print(f"✅ Found our transaction: {transaction}")
                    break
            else:
                print("❌ Transaction TGBL8759KU not found in recent transactions")
        else:
            print(f"❌ API Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()
    
    # Test 2: Test our validation endpoint
    print("🧪 Test 2: Testing Our Validation Endpoint")
    print("-" * 40)
    
    try:
        test_data = {
            'transaction_code': 'TGBL8759KU',
            'reference': 'PAY-B76C88F3'
        }
        
        response = requests.post(
            'https://prowrite.pythonanywhere.com/api/payments/manual/validate',
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def test_transaction_format():
    """Test transaction format validation"""
    
    print("🧪 Test 3: Transaction Format Validation")
    print("-" * 40)
    
    transaction_id = "TGBL8759KU"
    
    # Basic checks
    print(f"Transaction ID: {transaction_id}")
    print(f"Length: {len(transaction_id)}")
    print(f"Has letters: {any(c.isalpha() for c in transaction_id)}")
    print(f"Has numbers: {any(c.isdigit() for c in transaction_id)}")
    print(f"Is alphanumeric: {transaction_id.replace('-', '').replace('_', '').isalnum()}")
    
    # Check if it looks like M-Pesa format
    if len(transaction_id) >= 6 and len(transaction_id) <= 30:
        print("✅ Length check passed")
    else:
        print("❌ Length check failed")
    
    if any(c.isalpha() for c in transaction_id) and any(c.isdigit() for c in transaction_id):
        print("✅ Format check passed (has letters and numbers)")
    else:
        print("❌ Format check failed")

if __name__ == "__main__":
    print("🚀 Transaction Verification Debug")
    print("=" * 60)
    print()
    
    # Test environment variables
    print("🔧 Environment Variables:")
    required_vars = ['AFRICAS_TALKING_API_KEY', 'AFRICAS_TALKING_USERNAME', 'AFRICAS_TALKING_ENV', 'FLASK_ENV']
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
    print()
    
    # Test transaction format
    test_transaction_format()
    print()
    
    # Test Africa's Talking API
    test_africas_talking_api()
    
    print()
    print("=" * 60)
    print("Debug completed!")
