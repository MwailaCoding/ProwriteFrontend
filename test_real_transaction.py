#!/usr/bin/env python3
"""
Test script for real transaction validation
Tests the transaction code TGBL8759KU with reference PAY-B76C88F3
"""

import os
import sys
import requests
import json

def test_transaction_validation():
    """Test the transaction validation endpoint"""
    
    print("🧪 Testing Real Transaction Validation")
    print("=" * 50)
    
    # Test data from your image
    transaction_code = "TJBL8759KU"
    reference = "PAY-B76C88F3"  
    amount = 500
    
    print(f"Transaction Code: {transaction_code}")
    print(f"Reference: {reference}")
    print(f"Amount: KES {amount}")
    print()
    
    # Test data
    test_data = {
        "transaction_code": transaction_code,
        "reference": reference
    }
    
    # API endpoint (adjust URL for your PythonAnywhere domain)
    api_url = "https://prowrite.pythonanywhere.com/api/payments/manual/validate"
    
    print(f"Testing API endpoint: {api_url}")
    print()
    
    try:
        # Make the request
        response = requests.post(
            api_url,
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print()
        
        # Parse response
        try:
            result = response.json()
            print("Response JSON:")
            print(json.dumps(result, indent=2))
        except:
            print("Response Text:")
            print(response.text)
        
        print()
        
        # Check if validation was successful
        if response.status_code == 200 and result.get('success'):
            print("✅ SUCCESS: Transaction validation passed!")
            print(f"Message: {result.get('message', 'No message')}")
            if 'download_url' in result:
                print(f"Download URL: {result['download_url']}")
        else:
            print("❌ FAILED: Transaction validation failed")
            print(f"Error: {result.get('error', 'Unknown error')}")
            print(f"Error Code: {result.get('error_code', 'No error code')}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ REQUEST ERROR: {e}")
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {e}")

def test_environment_variables():
    """Test if environment variables are properly set"""
    
    print("🔧 Checking Environment Variables")
    print("=" * 50)
    
    required_vars = [
        'AFRICAS_TALKING_API_KEY',
        'AFRICAS_TALKING_USERNAME', 
        'AFRICAS_TALKING_ENV',
        'FLASK_ENV'
    ]
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            # Mask sensitive values
            if 'KEY' in var or 'SECRET' in var:
                masked_value = value[:8] + "..." + value[-4:] if len(value) > 12 else "***"
                print(f"✅ {var}: {masked_value}")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: NOT SET")
    
    print()

if __name__ == "__main__":
    print("🚀 ProWrite Transaction Validation Test")
    print("=" * 60)
    print()
    
    # Check environment variables
    test_environment_variables()
    
    # Test transaction validation
    test_transaction_validation()
    
    print()
    print("=" * 60)
    print("Test completed!")
