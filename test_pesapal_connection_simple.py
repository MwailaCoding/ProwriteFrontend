#!/usr/bin/env python3
"""
Simple test to check Pesapal connection
"""
import requests
import json

def test_simple_connection():
    """Test basic connection to your server"""
    print("🔌 Testing Basic Server Connection")
    print("=" * 50)
    
    base_url = "https://prowrite.pythonanywhere.com"
    
    # Test 1: Basic server response
    try:
        response = requests.get(base_url, timeout=10)
        print(f"✅ Server is running: {response.status_code}")
    except Exception as e:
        print(f"❌ Server connection failed: {e}")
        return
    
    # Test 2: Check if Pesapal test endpoint exists
    test_url = f"{base_url}/api/payments/pesapal/test"
    print(f"\n🔍 Testing Pesapal endpoint: {test_url}")
    
    try:
        response = requests.get(test_url, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Pesapal endpoint is accessible!")
        elif response.status_code == 404:
            print("❌ Pesapal endpoint not found - files not uploaded")
        elif response.status_code == 500:
            print("❌ Server error - check logs")
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_simple_connection()
