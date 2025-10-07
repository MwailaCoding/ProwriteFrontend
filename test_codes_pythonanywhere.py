#!/usr/bin/env python3
"""
Test script to run in PythonAnywhere Console to verify test codes
"""

import sys
import os

print("🧪 TESTING TRANSACTION VALIDATOR IN PYTHONANYWHERE")
print("=" * 60)

try:
    # Import the validator
    from africas_talking_validator import DevelopmentValidator
    
    print("✅ Successfully imported DevelopmentValidator")
    
    # Create validator instance
    validator = DevelopmentValidator()
    
    print("✅ Created validator instance")
    
    # Show available test codes
    print("\n📋 Available test codes:")
    for code, data in validator.valid_test_codes.items():
        status = "✅ Available" if not data['used'] else "❌ Used"
        print(f"  - {code}: KES {data['amount']} ({status})")
    
    # Test each code
    print("\n🔍 Testing each test code:")
    test_codes = ['TEST123', 'DEV456', 'VALID789', 'DEMO001', 'SAMPLE999']
    
    for code in test_codes:
        print(f"\nTesting: {code}")
        result = validator.validate_transaction_code(code, "TEST-REF-123", 500)
        
        if result.valid:
            print(f"  ✅ SUCCESS: {result.message}")
        else:
            print(f"  ❌ FAILED: {result.error} (Code: {result.error_code})")
    
    # Test TEST123 multiple times (should work)
    print("\n🔄 Testing TEST123 multiple times (should work each time):")
    for i in range(3):
        print(f"\nTest {i+1}:")
        result = validator.validate_transaction_code('TEST123', f"TEST-REF-{i+1}", 500)
        if result.valid:
            print(f"  ✅ SUCCESS: {result.message}")
        else:
            print(f"  ❌ FAILED: {result.error}")
    
    print("\n" + "=" * 60)
    print("✅ VALIDATOR TEST COMPLETE!")
    print("If all tests passed, the test codes should work in your app.")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure africas_talking_validator.py is in the same directory")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
