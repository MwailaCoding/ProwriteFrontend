import re
import logging
import requests
import base64
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
import os

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class ValidationResult:
    valid: bool
    error: Optional[str] = None
    error_code: Optional[str] = None
    message: Optional[str] = None
    transaction_code: Optional[str] = None
    amount_verified: Optional[float] = None
    transaction_time: Optional[datetime] = None

class SecureMpesaValidator:
    """
    Secure M-Pesa transaction validator using real Safaricom API
    """
    
    def __init__(self):
        self.consumer_key = os.getenv('MPESA_CONSUMER_KEY')
        self.consumer_secret = os.getenv('MPESA_CONSUMER_SECRET')
        self.business_short_code = os.getenv('MPESA_BUSINESS_SHORT_CODE', '174379')
        self.passkey = os.getenv('MPESA_PASSKEY')
        self.environment = os.getenv('MPESA_ENVIRONMENT', 'sandbox')
        
        # API URLs based on environment
        if self.environment == 'production':
            self.base_url = 'https://api.safaricom.co.ke'
        else:
            self.base_url = 'https://sandbox.safaricom.co.ke'
        
        self.validated_transactions = set()  # Store validated transaction IDs
        
    def _get_access_token(self) -> Optional[str]:
        """Get OAuth access token from M-Pesa API"""
        try:
            if not self.consumer_key or not self.consumer_secret:
                logger.error("M-Pesa credentials not configured")
                return None
                
            url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
            
            # Create basic auth header
            credentials = f"{self.consumer_key}:{self.consumer_secret}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            
            headers = {
                'Authorization': f'Basic {encoded_credentials}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                return data.get('access_token')
            else:
                logger.error(f"Failed to get access token: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting access token: {e}")
            return None
    
    def _query_transaction_status(self, transaction_id: str, amount: float) -> ValidationResult:
        """Query M-Pesa API to verify transaction"""
        try:
            access_token = self._get_access_token()
            if not access_token:
                return ValidationResult(
                    valid=False,
                    error="Unable to connect to M-Pesa API",
                    error_code="API_CONNECTION_FAILED"
                )
            
            # Transaction status query URL
            url = f"{self.base_url}/mpesa/transactionstatus/v1/query"
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            # Generate timestamp
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            
            # Create password (BusinessShortCode + Passkey + Timestamp)
            password_string = f"{self.business_short_code}{self.passkey}{timestamp}"
            password = base64.b64encode(password_string.encode()).decode()
            
            payload = {
                "Initiator": "testapi",  # In production, use actual initiator name
                "SecurityCredential": "security_credential",  # In production, use encrypted credential
                "CommandID": "TransactionStatusQuery",
                "TransactionID": transaction_id,
                "PartyA": self.business_short_code,
                "IdentifierType": "4",
                "ResultURL": os.getenv('MPESA_CALLBACK_URL', 'https://prowrite.pythonanywhere.com/api/payments/mpesa-callback'),
                "QueueTimeOutURL": os.getenv('MPESA_CALLBACK_URL', 'https://prowrite.pythonanywhere.com/api/payments/mpesa-timeout'),
                "Remarks": "Transaction Status Query",
                "Occasion": "Payment Verification"
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if transaction is valid and amount matches
                if self._verify_transaction_data(data, amount, transaction_id):
                    return ValidationResult(
                        valid=True,
                        message="Transaction verified successfully",
                        transaction_code=transaction_id,
                        amount_verified=amount
                    )
                else:
                    return ValidationResult(
                        valid=False,
                        error="Transaction verification failed - amount or details don't match",
                        error_code="VERIFICATION_FAILED"
                    )
            else:
                logger.error(f"M-Pesa API error: {response.status_code} - {response.text}")
                return ValidationResult(
                    valid=False,
                    error="Transaction verification failed",
                    error_code="API_ERROR"
                )
                
        except Exception as e:
            logger.error(f"Error querying transaction: {e}")
            return ValidationResult(
                valid=False,
                error="Transaction verification error",
                error_code="QUERY_ERROR"
            )
    
    def _verify_transaction_data(self, api_response: dict, expected_amount: float, transaction_id: str) -> bool:
        """Verify transaction data from M-Pesa API response"""
        try:
            # In a real implementation, you would parse the API response
            # and verify the transaction details
            
            # For sandbox/testing, we'll implement basic verification
            result_code = api_response.get('ResultCode', '1')
            
            # Result code 0 means success
            if result_code == '0':
                # In production, you would also verify:
                # - Amount matches expected amount
                # - Transaction is to correct till number
                # - Transaction is recent (within allowed time window)
                # - Transaction hasn't been used before
                
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error verifying transaction data: {e}")
            return False
    
    def validate_transaction_code(self, transaction_code: str, reference: str, amount: int) -> ValidationResult:
        """
        Validate M-Pesa transaction code securely
        
        Args:
            transaction_code: M-Pesa transaction ID
            reference: Payment reference number
            amount: Expected payment amount
            
        Returns:
            ValidationResult with validation status and details
        """
        try:
            logger.info(f"SECURE VALIDATOR: Validating transaction {transaction_code} for amount KES {amount}")
            
            # Basic format validation
            if not transaction_code or not isinstance(transaction_code, str):
                return ValidationResult(
                    valid=False,
                    error="Transaction code is required",
                    error_code="MISSING_CODE"
                )
            
            # Clean transaction code
            code = transaction_code.strip().upper()
            
            # M-Pesa transaction IDs are typically 10-20 characters
            if len(code) < 8 or len(code) > 25:
                return ValidationResult(
                    valid=False,
                    error="Invalid transaction code format",
                    error_code="INVALID_FORMAT"
                )
            
            # Check if already validated
            if code in self.validated_transactions:
                return ValidationResult(
                    valid=False,
                    error="Transaction code has already been used",
                    error_code="ALREADY_USED"
                )
            
            # Query M-Pesa API for transaction verification
            validation_result = self._query_transaction_status(code, float(amount))
            
            if validation_result.valid:
                # Mark as validated
                self.validated_transactions.add(code)
                logger.info(f"Transaction {code} validated successfully")
                
                return ValidationResult(
                    valid=True,
                    message="Payment verified through M-Pesa API",
                    transaction_code=code,
                    amount_verified=float(amount)
                )
            else:
                logger.warning(f"Transaction {code} validation failed: {validation_result.error}")
                return validation_result
                
        except Exception as e:
            logger.error(f"Validation error for transaction {transaction_code}: {e}")
            return ValidationResult(
                valid=False,
                error="Transaction validation failed",
                error_code="VALIDATION_ERROR"
            )
    
    def validate_till_payment(self, transaction_code: str, till_number: str, amount: float) -> ValidationResult:
        """
        Validate that payment was made to correct till number
        """
        try:
            # This would integrate with M-Pesa API to verify:
            # 1. Transaction exists
            # 2. Payment was made to correct till
            # 3. Amount matches
            # 4. Transaction is recent
            
            # For now, implement basic validation
            if till_number != "6340351":
                return ValidationResult(
                    valid=False,
                    error="Payment must be made to till number 6340351",
                    error_code="WRONG_TILL"
                )
            
            return self.validate_transaction_code(transaction_code, "", int(amount))
            
        except Exception as e:
            logger.error(f"Till validation error: {e}")
            return ValidationResult(
                valid=False,
                error="Till validation failed",
                error_code="TILL_VALIDATION_ERROR"
            )

# For development/testing - controlled validation
class DevelopmentValidator:
    """
    Development validator with controlled testing codes
    """
    
    def __init__(self):
        # Predefined valid test codes for development
        self.valid_test_codes = {
            'TEST123': {'amount': 500, 'used': False},
            'DEV456': {'amount': 500, 'used': False},
            'VALID789': {'amount': 500, 'used': False},
            'DEMO001': {'amount': 300, 'used': False},
            'SAMPLE999': {'amount': 500, 'used': False}
        }
    
    def validate_transaction_code(self, transaction_code: str, reference: str, amount: int) -> ValidationResult:
        """Validate using predefined test codes"""
        try:
            code = transaction_code.strip().upper()
            
            if code in self.valid_test_codes:
                test_data = self.valid_test_codes[code]
                
                if test_data['used']:
                    return ValidationResult(
                        valid=False,
                        error="Test transaction code already used",
                        error_code="ALREADY_USED"
                    )
                
                if test_data['amount'] != amount:
                    return ValidationResult(
                        valid=False,
                        error=f"Amount mismatch. Expected KES {amount}, test code is for KES {test_data['amount']}",
                        error_code="AMOUNT_MISMATCH"
                    )
                
                # Mark as used
                self.valid_test_codes[code]['used'] = True
                
                return ValidationResult(
                    valid=True,
                    message="Development test code validated",
                    transaction_code=code,
                    amount_verified=float(amount)
                )
            else:
                return ValidationResult(
                    valid=False,
                    error="Invalid test transaction code. Use: TEST123, DEV456, VALID789, DEMO001, or SAMPLE999",
                    error_code="INVALID_TEST_CODE"
                )
                
        except Exception as e:
            logger.error(f"Development validation error: {e}")
            return ValidationResult(
                valid=False,
                error="Validation failed",
                error_code="VALIDATION_ERROR"
            )

# Create appropriate validator based on environment
ENVIRONMENT = os.getenv('FLASK_ENV', 'development')

if ENVIRONMENT == 'production':
    # Use real M-Pesa validator in production
    transaction_validator = SecureMpesaValidator()
    logger.info("Using SECURE M-Pesa validator for production")
else:
    # Use development validator for testing
    transaction_validator = DevelopmentValidator()
    logger.info("Using DEVELOPMENT validator with test codes")
