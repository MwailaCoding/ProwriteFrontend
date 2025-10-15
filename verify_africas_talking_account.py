#!/usr/bin/env python3
"""
Script to verify Africa's Talking account by making an API call
This will lift account restrictions and allow you to create teams and apps
"""

import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def verify_account():
    """Verify Africa's Talking account by making an API call"""
    
    print("🔐 Africa's Talking Account Verification")
    print("=" * 50)
    
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
        print("Please set AFRICAS_TALKING_API_KEY and AFRICAS_TALKING_USERNAME in your .env file")
        return False
    
    # Set base URL
    if environment == 'production':
        base_url = 'https://api.africastalking.com'
    else:
        base_url = 'https://api.sandbox.africastalking.com'
    
    print(f"Base URL: {base_url}")
    print()
    
    # Method 1: Try to get account balance (simplest API call)
    print("🧪 Method 1: Getting Account Balance")
    print("-" * 30)
    
    try:
        url = f"{base_url}/version1/user"
        headers = {
            'apiKey': api_key,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        data = {
            'username': username
        }
        
        print(f"URL: {url}")
        print(f"Data: {json.dumps(data, indent=2)}")
        
        response = requests.get(url, params=data, headers=headers, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('status') == 'Success':
                print("✅ SUCCESS: Account verified via balance check!")
                print(f"Balance: {result.get('balance', 'N/A')}")
                return True
            else:
                print(f"❌ API Error: {result.get('message', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()
    
    # Method 2: Try to send a test SMS (if balance check fails)
    print("🧪 Method 2: Sending Test SMS")
    print("-" * 30)
    
    try:
        url = f"{base_url}/version1/messaging"
        headers = {
            'apiKey': api_key,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        # Send SMS to your own number (replace with your phone number)
        data = {
            'username': username,
            'to': '+254712345678',  # Replace with your actual phone number
            'message': 'Africa\'s Talking account verification test'
        }
        
        print(f"URL: {url}")
        print(f"Data: {json.dumps(data, indent=2)}")
        print("Note: Replace phone number with your actual number")
        
        # Uncomment the next lines to actually send SMS
        # response = requests.post(url, json=data, headers=headers, timeout=30)
        # print(f"Status Code: {response.status_code}")
        # print(f"Response: {response.text}")
        
        print("⚠️  SMS sending commented out to avoid charges")
        print("   Uncomment the lines above to send actual SMS")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()
    
    # Method 3: Try to get SMS balance
    print("🧪 Method 3: Getting SMS Balance")
    print("-" * 30)
    
    try:
        url = f"{base_url}/version1/messaging/balance"
        headers = {
            'apiKey': api_key,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        data = {
            'username': username
        }
        
        print(f"URL: {url}")
        print(f"Data: {json.dumps(data, indent=2)}")
        
        response = requests.get(url, params=data, headers=headers, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('status') == 'Success':
                print("✅ SUCCESS: Account verified via SMS balance check!")
                print(f"SMS Balance: {result.get('balance', 'N/A')}")
                return True
            else:
                print(f"❌ API Error: {result.get('message', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()
    print("❌ Account verification failed with all methods")
    print()
    print("📋 Next Steps:")
    print("1. Check your API credentials are correct")
    print("2. Ensure your account has sufficient balance")
    print("3. Try sending an actual SMS to verify your account")
    print("4. Contact Africa's Talking support if issues persist")
    
    return False

def main():
    """Main function"""
    
    print("🚀 Africa's Talking Account Verification Script")
    print("=" * 60)
    print()
    print("This script will help verify your Africa's Talking account")
    print("by making API calls to lift account restrictions.")
    print()
    
    success = verify_account()
    
    print()
    print("=" * 60)
    if success:
        print("🎉 Account verification successful!")
        print("You can now create up to 5 teams and 5 apps.")
    else:
        print("❌ Account verification failed.")
        print("Please check the errors above and try again.")

if __name__ == "__main__":
    main()
