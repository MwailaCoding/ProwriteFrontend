#!/usr/bin/env python3
"""
Test script for manual payment system
Demonstrates the pattern-based validation system
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from transaction_validator import transaction_validator
from manual_payment_service import manual_payment_service

def test_transaction_validation():
    """Test transaction code validation"""
    print("🧪 Testing Transaction Code Validation")
    print("=" * 50)
    
    # Test cases
    test_cases = [
        # Valid cases
        ("QGH7X8K9", "Valid M-Pesa code"),
        ("ABC12345", "Valid M-Pesa code"),
        ("XYZ98765", "Valid M-Pesa code"),
        ("DEF456GH", "Valid M-Pesa code"),
        
        # Invalid cases
        ("ABC123", "Too short"),
        ("ABC123456789", "Too long"),
        ("abc12345", "Lowercase letters"),
        ("ABC-12345", "Special characters"),
        ("ABC 12345", "Contains space"),
        ("123ABC45", "Starts with numbers"),
        ("ABCDEFGH", "No numbers"),
        ("12345678", "No letters"),
        ("A1", "Too short and too few letters"),
    ]
    
    for code, description in test_cases:
        result = transaction_validator.validate_transaction_code(code, "TEST-REF", 500)
        status = "✅ VALID" if result.valid else "❌ INVALID"
        print(f"{status} | {code:12} | {description}")
        if not result.valid:
            print(f"      └─ Error: {result.error}")

def test_payment_flow():
    """Test complete payment flow"""
    print("\n🔄 Testing Complete Payment Flow")
    print("=" * 50)
    
    # Step 1: Initiate payment
    print("1. Initiating payment...")
    result = manual_payment_service.initiate_payment(
        form_data={"name": "John Doe", "email": "john@example.com"},
        document_type="Francisca Resume",
        user_email="john@example.com",
        phone_number="254712345678"
    )
    
    if result['success']:
        print(f"   ✅ Payment initiated successfully")
        print(f"   📋 Reference: {result['reference']}")
        print(f"   💰 Amount: KES {result['amount']}")
        print(f"   🏪 Till: {result['till_number']} ({result['till_name']})")
        
        reference = result['reference']
        
        # Step 2: Validate transaction code
        print("\n2. Validating transaction code...")
        validation_result = manual_payment_service.validate_transaction_code(
            transaction_code="QGH7X8K9",
            reference=reference
        )
        
        if validation_result['success']:
            print(f"   ✅ Payment validated successfully")
            print(f"   🔄 Status: {validation_result['status']}")
            print(f"   🛠️ Method: {validation_result['validation_method']}")
        else:
            print(f"   ❌ Validation failed: {validation_result['error']}")
            if validation_result.get('fallback') == 'admin_confirmation':
                print(f"   🔄 Fallback: Admin confirmation triggered")
        
        # Step 3: Check payment status
        print("\n3. Checking payment status...")
        status_result = manual_payment_service.get_payment_status(reference)
        
        if status_result['success']:
            print(f"   📊 Status: {status_result['status']}")
            print(f"   🛠️ Method: {status_result['validation_method']}")
        else:
            print(f"   ❌ Status check failed: {status_result['error']}")
    
    else:
        print(f"   ❌ Payment initiation failed: {result['error']}")

def test_admin_confirmation():
    """Test admin confirmation flow"""
    print("\n👨‍💼 Testing Admin Confirmation Flow")
    print("=" * 50)
    
    # Get pending payments
    print("1. Getting pending admin confirmations...")
    pending_payments = manual_payment_service.get_pending_admin_confirmations()
    
    if pending_payments:
        print(f"   📋 Found {len(pending_payments)} pending payments")
        
        # Test admin confirmation
        payment = pending_payments[0]
        print(f"\n2. Confirming payment: {payment['reference']}")
        
        confirm_result = manual_payment_service.admin_confirm_payment(
            reference=payment['reference'],
            admin_user_id=1
        )
        
        if confirm_result['success']:
            print(f"   ✅ Payment confirmed by admin")
            print(f"   🔄 Status: {confirm_result['status']}")
        else:
            print(f"   ❌ Admin confirmation failed: {confirm_result['error']}")
    else:
        print("   ℹ️ No pending payments for admin confirmation")

def main():
    """Run all tests"""
    print("🚀 Manual Payment System Test Suite")
    print("=" * 60)
    
    try:
        # Test transaction validation
        test_transaction_validation()
        
        # Test payment flow
        test_payment_flow()
        
        # Test admin confirmation
        test_admin_confirmation()
        
        print("\n✅ All tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()


