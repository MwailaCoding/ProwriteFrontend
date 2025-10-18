#!/usr/bin/env python3
"""
Test script to check admin endpoints and database tables
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Test the admin endpoints
BASE_URL = "https://prowrite.pythonanywhere.com"

def test_endpoints():
    print("Testing admin endpoints...")
    
    # Test if admin routes are accessible
    endpoints_to_test = [
        "/api/admin/dashboard/stats",
        "/api/admin/users",
        "/api/admin/analytics",
        "/api/admin/documents",
        "/api/admin/payments",
        "/api/admin/logs"
    ]
    
    for endpoint in endpoints_to_test:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            print(f"{endpoint}: {response.status_code}")
            if response.status_code != 200:
                print(f"  Error: {response.text[:200]}")
        except Exception as e:
            print(f"{endpoint}: ERROR - {str(e)}")
    
    print("\nTesting with admin token...")
    
    # You'll need to get a valid admin token first
    # This is just to test the endpoint structure
    admin_token = "your-admin-token-here"  # Replace with actual token
    
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/api/admin/dashboard/stats", headers=headers, timeout=10)
        print(f"Dashboard stats with token: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error with token: {str(e)}")

if __name__ == "__main__":
    test_endpoints()
