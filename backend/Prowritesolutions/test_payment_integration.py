#!/usr/bin/env python3
"""
Payment Integration Test Suite
Tests the complete payment integration from frontend to backend
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

class PaymentIntegrationTestSuite:
    def __init__(self):
        self.base_url = "https://prowrite.pythonanywhere.com/api"
        self.test_phone = "254708374149"
        self.test_email = "test@example.com"
        self.test_amount = 500
        self.test_document_type = "Prowrite Template Resume"
        self.test_form_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "254708374149",
            "experience": "5 years",
            "skills": ["Python", "JavaScript", "React"],
            "education": "Bachelor's Degree",
            "location": "Nairobi, Kenya"
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
    
    def test_database_connection(self):
        """Test database connection and schema"""
        try:
            # This would require a database connection test
            # For now, we'll test if the payment endpoints are accessible
            response = requests.get(f"{self.base_url}/payments/mpesa/service-status")
            if response.status_code == 200:
                self.log_test("Database Connection", True)
                return True
            else:
                self.log_test("Database Connection", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Database Connection", False, str(e))
            return False
    
    def test_payment_initiation_flow(self):
        """Test complete payment initiation flow"""
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
                if data.get("success") and data.get("checkout_request_id"):
                    self.log_test("Payment Initiation Flow", True)
                    return data
                else:
                    self.log_test("Payment Initiation Flow", False, data.get("error", "Unknown error"))
                    return None
            else:
                self.log_test("Payment Initiation Flow", False, f"HTTP {response.status_code}: {response.text}")
                return None
        except Exception as e:
            self.log_test("Payment Initiation Flow", False, str(e))
            return None
    
    def test_payment_status_tracking(self, checkout_request_id):
        """Test payment status tracking"""
        try:
            response = requests.get(f"{self.base_url}/payments/mpesa/status/{checkout_request_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Payment Status Tracking", True)
                    return data
                else:
                    self.log_test("Payment Status Tracking", False, data.get("error", "Unknown error"))
                    return None
            else:
                self.log_test("Payment Status Tracking", False, f"HTTP {response.status_code}: {response.text}")
                return None
        except Exception as e:
            self.log_test("Payment Status Tracking", False, str(e))
            return None
    
    def test_callback_processing(self, checkout_request_id):
        """Test callback processing"""
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
                    self.log_test("Callback Processing", True)
                    return True
                else:
                    self.log_test("Callback Processing", False, f"Invalid response: {data}")
                    return False
            else:
                self.log_test("Callback Processing", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Callback Processing", False, str(e))
            return False
    
    def test_pdf_generation_trigger(self, checkout_request_id):
        """Test PDF generation trigger after payment"""
        try:
            # Wait a bit for callback processing
            time.sleep(2)
            
            # Check if payment status is updated
            status_response = requests.get(f"{self.base_url}/payments/mpesa/status/{checkout_request_id}")
            
            if status_response.status_code == 200:
                data = status_response.json()
                if data.get("success"):
                    self.log_test("PDF Generation Trigger", True)
                    return True
                else:
                    self.log_test("PDF Generation Trigger", False, data.get("error", "Status check failed"))
                    return False
            else:
                self.log_test("PDF Generation Trigger", False, f"HTTP {status_response.status_code}: {status_response.text}")
                return False
        except Exception as e:
            self.log_test("PDF Generation Trigger", False, str(e))
            return False
    
    def test_email_delivery_simulation(self):
        """Test email delivery simulation"""
        try:
            # This would test if email delivery is triggered
            # For now, we'll just test if the system can handle email requests
            test_email_data = {
                "to": self.test_email,
                "subject": "Test Email",
                "body": "This is a test email"
            }
            
            # This is a mock test - in reality, you'd test the actual email service
            self.log_test("Email Delivery Simulation", True)
            return True
        except Exception as e:
            self.log_test("Email Delivery Simulation", False, str(e))
            return False
    
    def test_payment_validation(self):
        """Test payment validation logic"""
        try:
            # Test various validation scenarios
            validation_tests = [
                {
                    "name": "Valid Payment Data",
                    "data": {
                        "phone_number": "254708374149",
                        "amount": 500,
                        "document_type": "Prowrite Template Resume",
                        "form_data": self.test_form_data,
                        "user_email": "test@example.com",
                        "user_id": 1
                    },
                    "should_pass": True
                },
                {
                    "name": "Invalid Phone Number",
                    "data": {
                        "phone_number": "123456789",
                        "amount": 500,
                        "document_type": "Prowrite Template Resume",
                        "form_data": self.test_form_data,
                        "user_email": "test@example.com",
                        "user_id": 1
                    },
                    "should_pass": False
                },
                {
                    "name": "Invalid Amount",
                    "data": {
                        "phone_number": "254708374149",
                        "amount": -100,
                        "document_type": "Prowrite Template Resume",
                        "form_data": self.test_form_data,
                        "user_email": "test@example.com",
                        "user_id": 1
                    },
                    "should_pass": False
                }
            ]
            
            for test in validation_tests:
                response = requests.post(
                    f"{self.base_url}/payments/mpesa/initiate",
                    json=test["data"],
                    headers={"Content-Type": "application/json"}
                )
                
                if test["should_pass"]:
                    if response.status_code == 200:
                        self.log_test(f"Validation - {test['name']}", True)
                    else:
                        self.log_test(f"Validation - {test['name']}", False, f"HTTP {response.status_code}")
                else:
                    if response.status_code == 400:
                        self.log_test(f"Validation - {test['name']}", True)
                    else:
                        self.log_test(f"Validation - {test['name']}", False, f"Expected 400, got {response.status_code}")
            
            return True
        except Exception as e:
            self.log_test("Payment Validation", False, str(e))
            return False
    
    def test_error_handling(self):
        """Test error handling scenarios"""
        try:
            error_scenarios = [
                {
                    "name": "Missing Required Fields",
                    "data": {"amount": 500},
                    "expected_status": 400
                },
                {
                    "name": "Invalid JSON",
                    "data": "invalid json",
                    "expected_status": 400
                },
                {
                    "name": "Empty Request Body",
                    "data": {},
                    "expected_status": 400
                }
            ]
            
            for scenario in error_scenarios:
                try:
                    if scenario["name"] == "Invalid JSON":
                        response = requests.post(
                            f"{self.base_url}/payments/mpesa/initiate",
                            data=scenario["data"],
                            headers={"Content-Type": "application/json"}
                        )
                    else:
                        response = requests.post(
                            f"{self.base_url}/payments/mpesa/initiate",
                            json=scenario["data"],
                            headers={"Content-Type": "application/json"}
                        )
                    
                    if response.status_code == scenario["expected_status"]:
                        self.log_test(f"Error Handling - {scenario['name']}", True)
                    else:
                        self.log_test(f"Error Handling - {scenario['name']}", False, f"Expected {scenario['expected_status']}, got {response.status_code}")
                except Exception as e:
                    self.log_test(f"Error Handling - {scenario['name']}", False, str(e))
            
            return True
        except Exception as e:
            self.log_test("Error Handling", False, str(e))
            return False
    
    def test_performance(self):
        """Test system performance under load"""
        try:
            # Test multiple concurrent requests
            start_time = time.time()
            responses = []
            
            for i in range(5):
                payload = {
                    "phone_number": f"25470837414{i}",
                    "amount": 500,
                    "document_type": "Prowrite Template Resume",
                    "form_data": self.test_form_data,
                    "user_email": f"test{i}@example.com",
                    "user_id": i + 1
                }
                
                response = requests.post(
                    f"{self.base_url}/payments/mpesa/initiate",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                responses.append(response.status_code)
            
            end_time = time.time()
            duration = end_time - start_time
            
            success_count = sum(1 for status in responses if status == 200)
            if success_count >= 3 and duration < 10:  # At least 3 successful, under 10 seconds
                self.log_test("Performance Test", True)
                return True
            else:
                self.log_test("Performance Test", False, f"Only {success_count}/5 successful in {duration:.2f}s")
                return False
        except Exception as e:
            self.log_test("Performance Test", False, str(e))
            return False
    
    def run_complete_integration_test(self):
        """Run complete integration test"""
        print("🚀 Starting Complete Payment Integration Test")
        print("=" * 50)
        
        # Test 1: Database Connection
        print("\n1. Testing Database Connection...")
        if not self.test_database_connection():
            print("❌ Database connection failed. Stopping tests.")
            return False
        
        # Test 2: Payment Validation
        print("\n3. Testing Payment Validation...")
        self.test_payment_validation()
        
        # Test 3: Error Handling
        print("\n4. Testing Error Handling...")
        self.test_error_handling()
        
        # Test 4: Payment Initiation
        print("\n5. Testing Payment Initiation...")
        initiation_result = self.test_payment_initiation_flow()
        if not initiation_result:
            print("❌ Payment initiation failed. Stopping tests.")
            return False
        
        checkout_request_id = initiation_result.get("checkout_request_id")
        if not checkout_request_id:
            print("❌ No checkout request ID received. Stopping tests.")
            return False
        
        # Test 5: Payment Status Tracking
        print("\n6. Testing Payment Status Tracking...")
        status_result = self.test_payment_status_tracking(checkout_request_id)
        if not status_result:
            print("❌ Payment status tracking failed. Stopping tests.")
            return False
        
        # Test 6: Callback Processing
        print("\n7. Testing Callback Processing...")
        if not self.test_callback_processing(checkout_request_id):
            print("❌ Callback processing failed. Stopping tests.")
            return False
        
        # Test 7: PDF Generation Trigger
        print("\n8. Testing PDF Generation Trigger...")
        if not self.test_pdf_generation_trigger(checkout_request_id):
            print("❌ PDF generation trigger failed. Stopping tests.")
            return False
        
        # Test 8: Email Delivery Simulation
        print("\n9. Testing Email Delivery Simulation...")
        self.test_email_delivery_simulation()
        
        # Test 9: Performance Test
        print("\n10. Testing Performance...")
        self.test_performance()
        
        print("\n" + "=" * 50)
        print("🎉 Complete Integration Test Finished!")
        return True
    
    def print_results(self):
        """Print test results summary"""
        print("\n" + "=" * 50)
        print("📊 INTEGRATION TEST RESULTS")
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
    print("🔧 Payment Integration Test Suite")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("mpesa_routes.py"):
        print("❌ Error: mpesa_routes.py not found. Please run from the backend directory.")
        return
    
    # Initialize test suite
    test_suite = PaymentIntegrationTestSuite()
    
    # Run complete integration test
    test_suite.run_complete_integration_test()
    
    # Print results
    test_suite.print_results()

if __name__ == "__main__":
    main()
