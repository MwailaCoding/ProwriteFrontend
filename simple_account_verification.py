#!/usr/bin/env python3
"""
Simple Africa's Talking account verification
Run this in your PythonAnywhere console
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def verify_account_simple():
    """Simple account verification"""
    
    api_key = os.getenv('AFRICAS_TALKING_API_KEY')
    username = os.getenv('AFRICAS_TALKING_USERNAME')
    
    if not api_key or not username:
        print("❌ Missing credentials!")
        return False
    
    # Try to get account balance
    url = 'https://api.africastalking.com/version1/user'
    headers = {'apiKey': api_key}
    params = {'username': username}
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=30)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Account verified!")
            return True
        else:
            print("❌ Verification failed")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

# Run verification
print("🔐 Verifying Africa's Talking Account...")
verify_account_simple()
