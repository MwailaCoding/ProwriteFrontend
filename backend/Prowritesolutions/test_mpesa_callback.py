#!/usr/bin/env python3
"""
M-Pesa Callback Test Suite
Tests the callback handling mechanism for M-Pesa payments
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

class MpesaCallbackTestSuite:
    def __init__(self):
        self.base_url = "https://prowrite.pythonanywhere.com/api"
        self.test_phone = "254708374149"
        self.test_amount = 500
        
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
    
    def create_successful_callback(self, checkout_request_id):
        """Create a successful payment callback"""
        return {
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
    
    def create_failed_callback(self, checkout_request_id):
        """Create a failed payment callback"""
        return {
            "Body": {
                "stkCallback": {
                    "MerchantRequestID": f"test_merchant_{int(time.time())}",
                    "CheckoutRequestID": checkout_request_id,
                    "ResultCode": 1,
                    "ResultDesc": "The balance is insufficient for the transaction."
                }
            }
        }
    
    def create_cancelled_callback(self, checkout_request_id):
        """Create a cancelled payment callback"""
        return {
            "Body": {
                "stkCallback": {
                    "MerchantRequestID": f"test_merchant_{int(time.time())}",
                    "CheckoutRequestID": checkout_request_id,
                    "ResultCode": 2,
                    "ResultDesc": "The transaction was cancelled by the user."
                }
            }
        }
    
    def test_successful_callback(self):
        """Test successful payment callback"""
        try:
            checkout_request_id = f"test_checkout_{int(time.time())}"
            callback_data = self.create_successful_callback(checkout_request_id)
            
            response = requests.post(
                f"{self.base_url}/payments/mpesa/callback",
                json=callback_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ResultCode") == 0 and data.get("ResultDesc") == "Success":
                    self.log_test("Successful Callback", True)
                    return True
                else:
                    self.log_test("Successful Callback", False, f"Invalid response: {data}")
                    return False
            else:
                self.log_test("Successful Callback", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Successful Callback", False, str(e))
            return False
    
    def test_failed_callback(self):
        """Test failed payment callback"""
        try:
            checkout_request_id = f"test_checkout_{int(time.time())}"
            callback_data = self.create_failed_callback(checkout_request_id)
            
            response = requests.post(
                f"{self.base_url}/payments/mpesa/callback",
                json=callback_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ResultCode") == 0:  # Should still return success to M-Pesa
                    self.log_test("Failed Callback", True)
                    return True
                else:
                    self.log_test("Failed Callback", False, f"Invalid response: {data}")
                    return False
            else:
                self.log_test("Failed Callback", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Failed Callback", False, str(e))
            return False
    
    def test_cancelled_callback(self):
        """Test cancelled payment callback"""
        try:
            checkout_request_id = f"test_checkout_{int(time.time())}"
            callback_data = self.create_cancelled_callback(checkout_request_id)
            
            response = requests.post(
                f"{self.base_url}/payments/mpesa/callback",
                json=callback_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ResultCode") == 0:  # Should still return success to M-Pesa
                    self.log_test("Cancelled Callback", True)
                    return True
                else:
                    self.log_test("Cancelled Callback", False, f"Invalid response: {data}")
                    return False
            else:
                self.log_test("Cancelled Callback", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Cancelled Callback", False, str(e))
            return False
    
    def test_invalid_callback_format(self):
        """Test callback with invalid format"""
        try:
            invalid_callback = {
                "InvalidFormat": "This should fail"
            }
            
            response = requests.post(
                f"{self.base_url}/payments/mpesa/callback",
                json=invalid_callback,
                headers={"Content-Type": "application/json"}
            )
            
            # Should handle gracefully and return success to M-Pesa
            if response.status_code == 200:
                data = response.json()
                if data.get("ResultCode") == 0:
                    self.log_test("Invalid Callback Format", True)
                    return True
                else:
                    self.log_test("Invalid Callback Format", False, f"Invalid response: {data}")
                    return False
            else:
                self.log_test("Invalid Callback Format", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Invalid Callback Format", False, str(e))
            return False
    
    def test_missing_callback_data(self):
        """Test callback with missing data"""
        try:
            incomplete_callback = {
                "Body": {
                    "stkCallback": {
                        "MerchantRequestID": "test_merchant",
                        "CheckoutRequestID": "test_checkout",
                        "ResultCode": 0
                        # Missing ResultDesc and CallbackMetadata
                    }
                }
            }
            
            response = requests.post(
                f"{self.base_url}/payments/mpesa/callback",
                json=incomplete_callback,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ResultCode") == 0:
                    self.log_test("Missing Callback Data", True)
                    return True
                else:
                    self.log_test("Missing Callback Data", False, f"Invalid response: {data}")
                    return False
            else:
                self.log_test("Missing Callback Data", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Missing Callback Data", False, str(e))
            return False
    
    def test_callback_with_metadata(self):
        """Test callback with complete metadata"""
        try:
            checkout_request_id = f"test_checkout_{int(time.time())}"
            callback_data = self.create_successful_callback(checkout_request_id)
            
            response = requests.post(
                f"{self.base_url}/payments/mpesa/callback",
                json=callback_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ResultCode") == 0:
                    self.log_test("Callback with Metadata", True)
                    return True
                else:
                    self.log_test("Callback with Metadata", False, f"Invalid response: {data}")
                    return False
            else:
                self.log_test("Callback with Metadata", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Callback with Metadata", False, str(e))
            return False
    
    def test_callback_rate_limiting(self):
        """Test callback rate limiting (if implemented)"""
        try:
            checkout_request_id = f"test_checkout_{int(time.time())}"
            callback_data = self.create_successful_callback(checkout_request_id)
            
            # Send multiple rapid callbacks
            responses = []
            for i in range(5):
                response = requests.post(
                    f"{self.base_url}/payments/mpesa/callback",
                    json=callback_data,
                    headers={"Content-Type": "application/json"}
                )
                responses.append(response.status_code)
                time.sleep(0.1)  # Small delay between requests
            
            # All should return 200 (success) or 429 (rate limited)
            success_count = sum(1 for status in responses if status in [200, 429])
            if success_count == len(responses):
                self.log_test("Callback Rate Limiting", True)
                return True
            else:
                self.log_test("Callback Rate Limiting", False, f"Unexpected responses: {responses}")
                return False
        except Exception as e:
            self.log_test("Callback Rate Limiting", False, str(e))
            return False
    
    def test_callback_security(self):
        """Test callback security measures"""
        try:
            # Test with malicious payload
            malicious_callback = {
                "Body": {
                    "stkCallback": {
                        "MerchantRequestID": "'; DROP TABLE payments; --",
                        "CheckoutRequestID": "test_checkout",
                        "ResultCode": 0,
                        "ResultDesc": "The service request is processed successfully."
                    }
                }
            }
            
            response = requests.post(
                f"{self.base_url}/payments/mpesa/callback",
                json=malicious_callback,
                headers={"Content-Type": "application/json"}
            )
            
            # Should handle gracefully without SQL injection
            if response.status_code == 200:
                data = response.json()
                if data.get("ResultCode") == 0:
                    self.log_test("Callback Security", True)
                    return True
                else:
                    self.log_test("Callback Security", False, f"Invalid response: {data}")
                    return False
            else:
                self.log_test("Callback Security", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Callback Security", False, str(e))
            return False
    
    def run_all_tests(self):
        """Run all callback tests"""
        print("🧪 Running M-Pesa Callback Tests")
        print("=" * 50)
        
        # Test successful callback
        print("\n1. Testing Successful Callback...")
        self.test_successful_callback()
        
        # Test failed callback
        print("\n2. Testing Failed Callback...")
        self.test_failed_callback()
        
        # Test cancelled callback
        print("\n3. Testing Cancelled Callback...")
        self.test_cancelled_callback()
        
        # Test invalid format
        print("\n4. Testing Invalid Callback Format...")
        self.test_invalid_callback_format()
        
        # Test missing data
        print("\n5. Testing Missing Callback Data...")
        self.test_missing_callback_data()
        
        # Test with metadata
        print("\n6. Testing Callback with Metadata...")
        self.test_callback_with_metadata()
        
        # Test rate limiting
        print("\n7. Testing Callback Rate Limiting...")
        self.test_callback_rate_limiting()
        
        # Test security
        print("\n8. Testing Callback Security...")
        self.test_callback_security()
        
        print("\n" + "=" * 50)
        print("🧪 Callback Tests Finished!")
    
    def print_results(self):
        """Print test results summary"""
        print("\n" + "=" * 50)
        print("📊 CALLBACK TEST RESULTS")
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
    print("🔧 M-Pesa Callback Test Suite")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("mpesa_routes.py"):
        print("❌ Error: mpesa_routes.py not found. Please run from the backend directory.")
        return
    
    # Initialize test suite
    test_suite = MpesaCallbackTestSuite()
    
    # Run all tests
    test_suite.run_all_tests()
    
    # Print results
    test_suite.print_results()

if __name__ == "__main__":
    main()
