#!/usr/bin/env python3
"""
Test Pesapal credentials directly
"""
import requests
import json

def test_pesapal_credentials():
    """Test Pesapal API with your credentials"""
    print("🔐 Testing Pesapal Credentials")
    print("=" * 50)
    
    # Your credentials
    consumer_key = "aeLxU3Y4x3L08yF39vOlcNkO9KaFckCs"
    consumer_secret = "gg9/FDAyxBhnWKbaBUJ1JRgYig4="
    
    # Pesapal sandbox URL
    url = "https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken"
    
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    data = {
        'consumer_key': consumer_key,
        'consumer_secret': consumer_secret
    }
    
    print(f"Consumer Key: {consumer_key}")
    print(f"Consumer Secret: {consumer_secret}")
    print(f"URL: {url}")
    print()
    
    try:
        print("🔄 Requesting access token...")
        response = requests.post(url, json=data, headers=headers, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('token')
            if access_token:
                print("✅ Credentials are valid!")
                print(f"Access Token: {access_token[:20]}...")
                return True
            else:
                print("❌ No token in response")
                return False
        else:
            print("❌ Credentials failed")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_pesapal_credentials()
