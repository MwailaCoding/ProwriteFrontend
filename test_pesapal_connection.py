#!/usr/bin/env python3
"""
Test script to verify Pesapal API connection
"""

import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_pesapal_connection():
    """Test Pesapal API connection"""
    
    print("🔧 Testing Pesapal API Connection")
    print("=" * 50)
    
    # Get credentials
    consumer_key = os.getenv('PESAPAL_CONSUMER_KEY')
    consumer_secret = os.getenv('PESAPAL_CONSUMER_SECRET')
    environment = os.getenv('PESAPAL_ENVIRONMENT', 'sandbox')
    
    print(f"Consumer Key: {consumer_key[:8]}...{consumer_key[-4:] if consumer_key else 'NOT SET'}")
    print(f"Consumer Secret: {'SET' if consumer_secret else 'NOT SET'}")
    print(f"Environment: {environment}")
    print()
    
    if not consumer_key or not consumer_secret:
        print("❌ Missing Pesapal credentials!")
        print("Please add to your .env file:")
        print("PESAPAL_CONSUMER_KEY=your_consumer_key_here")
        print("PESAPAL_CONSUMER_SECRET=your_consumer_secret_here")
        return False
    
    # Set base URL based on environment
    if environment == 'production':
        base_url = 'https://www.pesapal.com'
    else:
        base_url = 'https://cybqa.pesapal.com'  # Sandbox URL
    
    print(f"Base URL: {base_url}")
    print()
    
    # Test 1: Get OAuth token
    print("🧪 Test 1: Getting OAuth Token")
    print("-" * 30)
    
    try:
        # Get OAuth token
        token_url = f"{base_url}/api/Auth/RequestToken"
        
        data = {
            'consumer_key': consumer_key,
            'consumer_secret': consumer_secret
        }
        
        print(f"Token URL: {token_url}")
        print(f"Data: {json.dumps(data, indent=2)}")
        
        response = requests.post(token_url, json=data, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if 'token' in result:
                token = result['token']
                print(f"✅ SUCCESS: Got OAuth token")
                print(f"Token: {token[:20]}...")
                
                # Test 2: Test API endpoint
                print("\n🧪 Test 2: Testing API Endpoint")
                print("-" * 30)
                
                # Test a simple API call
                test_url = f"{base_url}/api/URLSetup/GetIpnList"
                headers = {
                    'Authorization': f'Bearer {token}',
                    'Content-Type': 'application/json'
                }
                
                print(f"Test URL: {test_url}")
                
                test_response = requests.get(test_url, headers=headers, timeout=30)
                
                print(f"Status Code: {test_response.status_code}")
                print(f"Response: {test_response.text}")
                
                if test_response.status_code == 200:
                    print("✅ SUCCESS: API connection working!")
                    return True
                else:
                    print("❌ API test failed")
                    return False
            else:
                print("❌ No token in response")
                return False
        else:
            print(f"❌ Token request failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main function"""
    
    print("🚀 Pesapal API Connection Test")
    print("=" * 60)
    print()
    
    success = test_pesapal_connection()
    
    print()
    print("=" * 60)
    if success:
        print("🎉 Pesapal API connection successful!")
        print("You can now proceed with integration.")
    else:
        print("❌ Pesapal API connection failed.")
        print("Please check your credentials and try again.")

if __name__ == "__main__":
    main()
