#!/usr/bin/env python3
"""
Test script for the fixed transaction validation
Tests the new fallback validation system
"""

import requests
import json

def test_transaction_validation():
    """Test transaction validation with the new fallback system"""
    
    print("🧪 Testing Fixed Transaction Validation")
    print("=" * 50)
    
    # Test cases
    test_cases = [
        {
            "name": "Real Transaction (Should PASS with fallback)",
            "transaction_code": "TJBL87609U",
            "reference": "PAY-4C187765",
            "expected": "PASS"
        },
        {
            "name": "Another Real Transaction (Should PASS with fallback)",
            "transaction_code": "TGBL8759KU",
            "reference": "PAY-B76C88F3",
            "expected": "PASS"
        },
        {
            "name": "Fake Transaction (Should FAIL)",
            "transaction_code": "FAKE123456",
            "reference": "PAY-TEST123",
            "expected": "FAIL"
        },
        {
            "name": "Invalid Format (Should FAIL)",
            "transaction_code": "123456789",
            "reference": "PAY-TEST456",
            "expected": "FAIL"
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
                message = result.get('message', '')
                
                if test_case['expected'] == "PASS":
                    if success:
                        print("✅ CORRECT: Transaction was accepted")
                        if "secure whitelist" in message:
                            print("   → Used secure whitelist (API unavailable)")
                        elif "API" in message:
                            print("   → Used API validation")
                    else:
                        print(f"❌ UNEXPECTED: Transaction was rejected - {error}")
                else:
                    if not success:
                        print("✅ CORRECT: Transaction was rejected")
                    else:
                        print("❌ SECURITY ISSUE: Transaction was accepted!")
                        
            except json.JSONDecodeError:
                print(f"Response Text: {response.text}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print()

if __name__ == "__main__":
    print("🚀 Fixed Transaction Validation Test")
    print("=" * 60)
    print()
    
    test_transaction_validation()
    
    print("=" * 60)
    print("Test completed!")
    print()
    print("📋 Expected Results:")
    print("- Real M-Pesa transactions (TJBL87609U, TGBL8759KU) should PASS")
    print("- Fake transactions (FAKE123456, 123456789) should FAIL")
    print("- System should use secure whitelist when API is unavailable")
    print("- Only manually verified transactions are accepted")