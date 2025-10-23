#!/usr/bin/env python3
"""
Comprehensive Test Suite for M-Pesa STK Push Flow
Tests the complete payment flow from initiation to completion
"""

import os
import sys
import json
import time
import requests
from datetime import datetime
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

class MpesaSTKTestSuite:
    def __init__(self):
        self.base_url = "https://prowrite.pythonanywhere.com/api"
        self.test_phone = "254708374149"  # Test phone number
        self.test_email = "test@example.com"
        self.test_amount = 500
        self.test_document_type = "Prowrite Template Resume"
        self.test_form_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "254708374149",
            "experience": "5 years",
            "skills": ["Python", "JavaScript", "React"]
        }
        
        # Test results
        self.results = {
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "errors": []
        }
    
    def log_test(self, test_name, success, error=None):
        """Log test result"""
        self.results["total_tests"] += 1
        if success:
            self.results["passed"] += 1
            print(f"✅ {test_name}")
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {error}")
            print(f"❌ {test_name}: {error}")
    
    def test_service_status(self):
        """Test M-Pesa service status endpoint"""
        try:
            response = requests.get(f"{self.base_url}/payments/mpesa/service-status")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") in ["operational", "error"]:
                    self.log_test("Service Status Check", True)
                    return True
                else:
                    self.log_test("Service Status Check", False, "Invalid status response")
                    return False
            else:
                self.log_test("Service Status Check", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Service Status Check", False, str(e))
            return False
    
    def test_stk_push_initiation(self):
        """Test STK push initiation"""
        try:
            payload = {
                "phone_number": self.test_phone,
                "amount": self.test_amount,
                "document_type": self.test_document_type,
                "form_data": self.test_form_data,
                "user_email": self.test_email,
                "user_id": 1
            }
            
            response = requests.post(
                f"{self.base_url}/payments/mpesa/initiate",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("STK Push Initiation", True)
                    return data
                else:
                    self.log_test("STK Push Initiation", False, data.get("error", "Unknown error"))
                    return None
            else:
                self.log_test("STK Push Initiation", False, f"HTTP {response.status_code}: {response.text}")
                return None
        except Exception as e:
            self.log_test("STK Push Initiation", False, str(e))
            return None
    
    def test_payment_status_query(self, checkout_request_id):
        """Test payment status query"""
        try:
            response = requests.get(f"{self.base_url}/payments/mpesa/status/{checkout_request_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Payment Status Query", True)
                    return data
                else:
                    self.log_test("Payment Status Query", False, data.get("error", "Unknown error"))
                    return None
            else:
                self.log_test("Payment Status Query", False, f"HTTP {response.status_code}: {response.text}")
                return None
        except Exception as e:
            self.log_test("Payment Status Query", False, str(e))
            return None
    
    def test_callback_simulation(self, checkout_request_id):
        """Simulate M-Pesa callback for testing"""
        try:
            # Simulate successful payment callback
            callback_data = {
                "Body": {
                    "stkCallback": {
                        "MerchantRequestID": f"test_merchant_{int(time.time())}",
                        "CheckoutRequestID": checkout_request_id,
                        "ResultCode": 0,
                        "ResultDesc": "The service request is processed successfully.",
                        "CallbackMetadata": {
                            "Item": [
                                {"Name": "Amount", "Value": self.test_amount},
                                {"Name": "MpesaReceiptNumber", "Value": f"TEST{int(time.time())}"},
                                {"Name": "TransactionDate", "Value": int(time.time())},
                                {"Name": "PhoneNumber", "Value": self.test_phone}
                            ]
                        }
                    }
                }
            }
            
            response = requests.post(
                f"{self.base_url}/payments/mpesa/callback",
                json=callback_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ResultCode") == 0:
                    self.log_test("Callback Simulation", True)
                    return True
                else:
                    self.log_test("Callback Simulation", False, f"Callback failed: {data}")
                    return False
            else:
                self.log_test("Callback Simulation", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Callback Simulation", False, str(e))
            return False
    
    def test_phone_number_validation(self):
        """Test phone number validation"""
        test_cases = [
            ("254708374149", True, "Valid 254 format"),
            ("0708374149", True, "Valid 0 format"),
            ("708374149", True, "Valid 7 format"),
            ("123456789", False, "Invalid format"),
            ("", False, "Empty string"),
            ("abc123", False, "Non-numeric")
        ]
        
        for phone, expected, description in test_cases:
            try:
                # Test with a mock validation endpoint
                payload = {"phone_number": phone}
                response = requests.post(
                    f"{self.base_url}/payments/mpesa/initiate",
                    json={**payload, "amount": 100, "document_type": "test", "form_data": {}, "user_email": "test@test.com", "user_id": 1},
                    headers={"Content-Type": "application/json"}
                )
                
                # If phone is valid, we should get a different error (not phone validation error)
                # If phone is invalid, we should get a phone validation error
                if expected:
                    # Valid phone should not give phone validation error
                    if response.status_code == 200 or "phone" not in response.text.lower():
                        self.log_test(f"Phone Validation - {description}", True)
                    else:
                        self.log_test(f"Phone Validation - {description}", False, "Valid phone rejected")
                else:
                    # Invalid phone should give phone validation error
                    if "phone" in response.text.lower() or response.status_code == 400:
                        self.log_test(f"Phone Validation - {description}", True)
                    else:
                        self.log_test(f"Phone Validation - {description}", False, "Invalid phone accepted")
            except Exception as e:
                self.log_test(f"Phone Validation - {description}", False, str(e))
    
    def test_polling_mechanism(self, checkout_request_id, max_attempts=5):
        """Test polling mechanism"""
        try:
            for attempt in range(max_attempts):
                status_data = self.test_payment_status_query(checkout_request_id)
                if status_data and status_data.get("status") in ["completed", "failed"]:
                    self.log_test("Polling Mechanism", True)
                    return status_data
                
                if attempt < max_attempts - 1:
                    time.sleep(2)  # Wait 2 seconds before next poll
            
            self.log_test("Polling Mechanism", False, "Max polling attempts reached")
            return None
        except Exception as e:
            self.log_test("Polling Mechanism", False, str(e))
            return None
    
    def test_error_handling(self):
        """Test error handling scenarios"""
        error_tests = [
            {
                "name": "Missing Phone Number",
                "payload": {"amount": 500, "document_type": "test", "form_data": {}, "user_email": "test@test.com", "user_id": 1},
                "expected_error": "phone"
            },
            {
                "name": "Invalid Amount",
                "payload": {"phone_number": "254708374149", "amount": -100, "document_type": "test", "form_data": {}, "user_email": "test@test.com", "user_id": 1},
                "expected_error": "amount"
            },
            {
                "name": "Missing Email",
                "payload": {"phone_number": "254708374149", "amount": 500, "document_type": "test", "form_data": {}, "user_id": 1},
                "expected_error": "email"
            }
        ]
        
        for test in error_tests:
            try:
                response = requests.post(
                    f"{self.base_url}/payments/mpesa/initiate",
                    json=test["payload"],
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 400 or test["expected_error"] in response.text.lower():
                    self.log_test(f"Error Handling - {test['name']}", True)
                else:
                    self.log_test(f"Error Handling - {test['name']}", False, f"Expected error not found: {response.text}")
            except Exception as e:
                self.log_test(f"Error Handling - {test['name']}", False, str(e))
    
    def run_complete_flow_test(self):
        """Run complete end-to-end flow test"""
        print("🚀 Starting Complete M-Pesa STK Push Flow Test")
        print("=" * 50)
        
        # Test 1: Service Status
        print("\n1. Testing Service Status...")
        if not self.test_service_status():
            print("❌ Service status check failed. Stopping tests.")
            return False
        
        # Test 2: Phone Number Validation
        print("\n2. Testing Phone Number Validation...")
        self.test_phone_number_validation()
        
        # Test 3: Error Handling
        print("\n3. Testing Error Handling...")
        self.test_error_handling()
        
        # Test 4: STK Push Initiation
        print("\n4. Testing STK Push Initiation...")
        initiation_result = self.test_stk_push_initiation()
        if not initiation_result:
            print("❌ STK push initiation failed. Stopping tests.")
            return False
        
        checkout_request_id = initiation_result.get("checkout_request_id")
        if not checkout_request_id:
            print("❌ No checkout request ID received. Stopping tests.")
            return False
        
        # Test 5: Payment Status Query
        print("\n5. Testing Payment Status Query...")
        status_result = self.test_payment_status_query(checkout_request_id)
        if not status_result:
            print("❌ Payment status query failed. Stopping tests.")
            return False
        
        # Test 6: Callback Simulation
        print("\n6. Testing Callback Simulation...")
        if not self.test_callback_simulation(checkout_request_id):
            print("❌ Callback simulation failed. Stopping tests.")
            return False
        
        # Test 7: Polling Mechanism
        print("\n7. Testing Polling Mechanism...")
        polling_result = self.test_polling_mechanism(checkout_request_id)
        if not polling_result:
            print("❌ Polling mechanism failed. Stopping tests.")
            return False
        
        print("\n" + "=" * 50)
        print("🎉 Complete Flow Test Finished!")
        return True
    
    def run_individual_tests(self):
        """Run individual component tests"""
        print("🧪 Running Individual Component Tests")
        print("=" * 50)
        
        # Test service status
        print("\n1. Service Status Test...")
        self.test_service_status()
        
        # Test phone validation
        print("\n2. Phone Number Validation Test...")
        self.test_phone_number_validation()
        
        # Test error handling
        print("\n3. Error Handling Test...")
        self.test_error_handling()
        
        print("\n" + "=" * 50)
        print("🧪 Individual Tests Finished!")
    
    def print_results(self):
        """Print test results summary"""
        print("\n" + "=" * 50)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {self.results['total_tests']}")
        print(f"Passed: {self.results['passed']}")
        print(f"Failed: {self.results['failed']}")
        print(f"Success Rate: {(self.results['passed'] / self.results['total_tests'] * 100):.1f}%")
        
        if self.results['errors']:
            print("\n❌ ERRORS:")
            for error in self.results['errors']:
                print(f"  - {error}")
        
        print("\n" + "=" * 50)

def main():
    """Main test function"""
    print("🔧 M-Pesa STK Push Test Suite")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("mpesa_routes.py"):
        print("❌ Error: mpesa_routes.py not found. Please run from the backend directory.")
        return
    
    # Initialize test suite
    test_suite = MpesaSTKTestSuite()
    
    # Ask user what tests to run
    print("\nSelect test mode:")
    print("1. Complete Flow Test (End-to-End)")
    print("2. Individual Component Tests")
    print("3. Both")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == "1":
        test_suite.run_complete_flow_test()
    elif choice == "2":
        test_suite.run_individual_tests()
    elif choice == "3":
        test_suite.run_individual_tests()
        print("\n" + "=" * 50)
        test_suite.run_complete_flow_test()
    else:
        print("❌ Invalid choice. Running individual tests by default.")
        test_suite.run_individual_tests()
    
    # Print results
    test_suite.print_results()

if __name__ == "__main__":
    main()
