#!/usr/bin/env python3
"""
Test script to verify the transaction validator is working
"""

import sys
import os

# Add the backend directory to the path
sys.path.append('backend/Prowritesolutions')

try:
    from africas_talking_validator import DevelopmentValidator
    
    print("🧪 TESTING TRANSACTION VALIDATOR")
    print("=" * 50)
    
    # Create validator instance
    validator = DevelopmentValidator()
    
    # Test codes to try
    test_codes = ['TEST123', 'DEV456', 'VALID789', 'DEMO001', 'SAMPLE999']
    
    print("📋 Available test codes:")
    for code in test_codes:
        print(f"  - {code}")
    
    print("\n🔍 Testing each code:")
    
    for code in test_codes:
        print(f"\nTesting: {code}")
        result = validator.validate_transaction_code(code, "TEST-REF-123", 500)
        
        if result.valid:
            print(f"  ✅ SUCCESS: {result.message}")
        else:
            print(f"  ❌ FAILED: {result.error}")
    
    print("\n🔄 Testing TEST123 multiple times:")
    for i in range(3):
        print(f"\nTest {i+1}:")
        result = validator.validate_transaction_code('TEST123', f"TEST-REF-{i+1}", 500)
        if result.valid:
            print(f"  ✅ SUCCESS: {result.message}")
        else:
            print(f"  ❌ FAILED: {result.error}")
    
    print("\n✅ VALIDATOR TEST COMPLETE!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running this from the project root directory")
except Exception as e:
    print(f"❌ Error: {e}")
