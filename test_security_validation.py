#!/usr/bin/env python3
"""
Test script to verify security - only real transactions should be accepted
"""

import requests
import json

def test_transaction_security():
    """Test that only real transactions are accepted"""
    
    print("🔒 Testing Transaction Security")
    print("=" * 50)
    
    # Test cases
    test_cases = [
        {
            "name": "Real Transaction (Should PASS)",
            "transaction_code": "TJBL8759KU",
            "reference": "PAY-B76C88F3",
            "expected": "PASS"
        },
        {
            "name": "Fake Transaction (Should FAIL)",
            "transaction_code": "TJBL8759YZ",
            "reference": "PAY-B76C88F3",
            "expected": "FAIL"
        },
        {
            "name": "Another Fake Transaction (Should FAIL)",
            "transaction_code": "FAKE123456",
            "reference": "PAY-B76C88F3",
            "expected": "FAIL"
        },
        {
            "name": "Real Transaction TGBL8759KU (Should PASS)",
            "transaction_code": "TGBL8759KU",
            "reference": "PAY-B76C88F3",
            "expected": "PASS"
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
            
            result = response.json()
            success = result.get('success', False)
            
            if test_case['expected'] == "PASS":
                if success:
                    print("✅ CORRECT: Real transaction was accepted")
                else:
                    print(f"❌ ERROR: Real transaction was rejected - {result.get('error')}")
            else:
                if not success:
                    print("✅ CORRECT: Fake transaction was rejected")
                else:
                    print("❌ SECURITY ISSUE: Fake transaction was accepted!")
                    
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("Security test completed!")

if __name__ == "__main__":
    test_transaction_security()
