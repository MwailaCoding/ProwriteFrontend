#!/usr/bin/env python3
"""
Debug Pesapal credentials with different formats
"""
import requests
import json

def test_credential_formats():
    """Test different credential formats"""
    print("🔍 Debugging Pesapal Credentials")
    print("=" * 50)
    
    # Your credentials
    consumer_key = "aeLxU3Y4x3L08yF39vOlcNkO9KaFckCs"
    consumer_secret = "gg9/FDAyxBhnWKbaBUJ1JRgYig4="
    
    # Test different URLs
    urls = [
        "https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken",
        "https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken/",
        "https://cybqa.pesapal.com/pesapalv3/api/auth/RequestToken",
    ]
    
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    data = {
        'consumer_key': consumer_key,
        'consumer_secret': consumer_secret
    }
    
    print(f"Consumer Key: '{consumer_key}'")
    print(f"Consumer Secret: '{consumer_secret}'")
    print(f"Key Length: {len(consumer_key)}")
    print(f"Secret Length: {len(consumer_secret)}")
    print()
    
    for i, url in enumerate(urls, 1):
        print(f"Test {i}: {url}")
        try:
            response = requests.post(url, json=data, headers=headers, timeout=30)
            print(f"  Status: {response.status_code}")
            print(f"  Response: {response.text}")
            
            if response.status_code == 200:
                token_data = response.json()
                if 'token' in token_data:
                    print("  ✅ SUCCESS!")
                    return True
                else:
                    print("  ❌ No token in response")
            else:
                print("  ❌ Failed")
                
        except Exception as e:
            print(f"  ❌ Error: {e}")
        print()
    
    return False

def test_production_url():
    """Test production URL (in case credentials are for production)"""
    print("🏭 Testing Production URL")
    print("=" * 50)
    
    consumer_key = "aeLxU3Y4x3L08yF39vOlcNkO9KaFckCs"
    consumer_secret = "gg9/FDAyxBhnWKbaBUJ1JRgYig4="
    
    url = "https://pay.pesapal.com/v3/api/Auth/RequestToken"
    
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    data = {
        'consumer_key': consumer_key,
        'consumer_secret': consumer_secret
    }
    
    try:
        response = requests.post(url, json=data, headers=headers, timeout=30)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            token_data = response.json()
            if 'token' in token_data:
                print("✅ Production credentials work!")
                return True
                
    except Exception as e:
        print(f"❌ Error: {e}")
    
    return False

if __name__ == "__main__":
    print("🧪 PESAPAL CREDENTIAL DEBUG")
    print("=" * 60)
    
    # Test 1: Different sandbox URLs
    sandbox_works = test_credential_formats()
    
    if not sandbox_works:
        # Test 2: Production URL
        production_works = test_production_url()
        
        if production_works:
            print("\n🎯 SOLUTION: Use production environment!")
            print("Change PESAPAL_ENVIRONMENT=production in your .env file")
        else:
            print("\n❌ Credentials don't work in either environment")
            print("Check your Pesapal dashboard for correct credentials")
    else:
        print("\n✅ Sandbox credentials work!")
