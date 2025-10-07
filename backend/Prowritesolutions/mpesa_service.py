import os
import requests
import base64
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MpesaService:
    """
    Real M-Pesa Daraja API Service for production use
    """
    
    def __init__(self):
        # M-Pesa Configuration
        self.consumer_key = None
        self.consumer_secret = None
        self.business_short_code = None
        self.passkey = None
        self.environment = 'sandbox'
        self.base_url = 'https://sandbox.safaricom.co.ke'
        
        # Endpoints
        self.oauth_url = None
        self.stk_push_url = None
        self.stk_query_url = None
        
        # Access token
        self.access_token = None
        self.token_expiry = None
        
        # Initialize configuration (will be called when first used)
        self._initialized = False
    
    def _initialize_config(self):
        """Initialize M-Pesa configuration from environment variables"""
        if self._initialized:
            return
            
        # Load configuration from environment
        self.consumer_key = os.getenv('MPESA_CONSUMER_KEY')
        self.consumer_secret = os.getenv('MPESA_CONSUMER_SECRET')
        
        # Handle both MPESA_BUSINESS_SHORT_CODE and MPESA_PAYBILL
        self.business_short_code = os.getenv('MPESA_BUSINESS_SHORT_CODE') or os.getenv('MPESA_PAYBILL')
        self.passkey = os.getenv('MPESA_PASSKEY')
        self.environment = os.getenv('MPESA_ENVIRONMENT', 'sandbox')
        
        # Set API URLs based on environment
        if self.environment == 'production':
            self.base_url = 'https://api.safaricom.co.ke'
        else:
            self.base_url = 'https://sandbox.safaricom.co.ke'
        
        # Set endpoints
        self.oauth_url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        self.stk_push_url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        self.stk_query_url = f"{self.base_url}/mpesa/stkpushquery/v1/query"
        
        # Validate configuration
        self._validate_config()
        
        self._initialized = True
        logger.info(f"M-Pesa service initialized for {self.environment} environment")
    
    def _validate_config(self):
        """Validate M-Pesa configuration"""
        required_vars = [
            'MPESA_CONSUMER_KEY',
            'MPESA_CONSUMER_SECRET', 
            'MPESA_PASSKEY'
        ]
        
        # Check for either MPESA_BUSINESS_SHORT_CODE or MPESA_PAYBILL
        business_short_code = os.getenv('MPESA_BUSINESS_SHORT_CODE') or os.getenv('MPESA_PAYBILL')
        if not business_short_code:
            required_vars.append('MPESA_BUSINESS_SHORT_CODE or MPESA_PAYBILL')
        
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        if missing_vars:
            raise ValueError(f"Missing required M-Pesa environment variables: {missing_vars}")
    
    def _get_access_token(self) -> str:
        """Get M-Pesa access token"""
        try:
            # Initialize configuration if not already done
            self._initialize_config()
            
            # Check if token is still valid
            if self.access_token and self.token_expiry and time.time() < self.token_expiry:
                return self.access_token
            
            # Generate credentials
            credentials = f"{self.consumer_key}:{self.consumer_secret}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            
            headers = {
                'Authorization': f'Basic {encoded_credentials}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(self.oauth_url, headers=headers)
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data['access_token']
            # Token expires in 1 hour, set expiry to 50 minutes for safety
            self.token_expiry = time.time() + (50 * 60)
            
            logger.info("M-Pesa access token generated successfully")
            return self.access_token
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get M-Pesa access token: {e}")
            raise Exception("Failed to authenticate with M-Pesa API")
    
    def _generate_timestamp(self) -> str:
        """Generate M-Pesa timestamp format"""
        return datetime.now().strftime('%Y%m%d%H%M%S')
    
    def _generate_password(self, timestamp: str) -> str:
        """Generate M-Pesa password"""
        password_string = f"{self.business_short_code}{self.passkey}{timestamp}"
        return base64.b64encode(password_string.encode()).decode()
    
    def _format_phone_number(self, phone: str) -> str:
        """Format phone number for M-Pesa API"""
        # Remove any non-digit characters
        cleaned = ''.join(filter(str.isdigit, phone))
        
        # Handle different formats
        if cleaned.startswith('254') and len(cleaned) == 12:
            return cleaned
        elif cleaned.startswith('0') and len(cleaned) == 10:
            return '254' + cleaned[1:]
        elif cleaned.startswith('7') and len(cleaned) == 9:
            return '254' + cleaned
        elif cleaned.startswith('+254') and len(cleaned) == 12:
            return cleaned
        else:
            raise ValueError(f"Invalid phone number format: {phone}")
    
    def initiate_stk_push(self, phone: str, amount: int, reference: str, description: str) -> Dict[str, Any]:
        """
        Initiate STK Push to user's phone
        
        Args:
            phone: User's phone number
            amount: Amount in KES
            reference: Unique reference for the transaction
            description: Description of the payment
            
        Returns:
            Dict containing checkout_request_id and other response data
        """
        try:
            # Initialize configuration if not already done
            self._initialize_config()
            
            # Get access token
            access_token = self._get_access_token()
            
            # Format phone number
            formatted_phone = self._format_phone_number(phone)
            
            # Generate timestamp and password
            timestamp = self._generate_timestamp()
            password = self._generate_password(timestamp)
            
            # Prepare request payload
            payload = {
                "BusinessShortCode": self.business_short_code,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": amount,
                "PartyA": formatted_phone,
                "PartyB": self.business_short_code,
                "PhoneNumber": formatted_phone,
                "CallBackURL": os.getenv('MPESA_CALLBACK_URL', 'https://your-domain.com/api/payments/mpesa-callback'),
                "AccountReference": reference,
                "TransactionDesc": description
            }
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            logger.info(f"Initiating STK Push for {formatted_phone}, amount: KES {amount}")
            
            response = requests.post(self.stk_push_url, json=payload, headers=headers)
            response.raise_for_status()
            
            response_data = response.json()
            
            if response_data.get('ResponseCode') == '0':
                logger.info(f"STK Push initiated successfully. CheckoutRequestID: {response_data.get('CheckoutRequestID')}")
                return {
                    'success': True,
                    'checkout_request_id': response_data.get('CheckoutRequestID'),
                    'merchant_request_id': response_data.get('MerchantRequestID'),
                    'customer_message': response_data.get('CustomerMessage'),
                    'response_code': response_data.get('ResponseCode'),
                    'response_description': response_data.get('ResponseDescription')
                }
            else:
                error_msg = f"STK Push failed: {response_data.get('ResponseDescription', 'Unknown error')}"
                logger.error(error_msg)
                return {
                    'success': False,
                    'error': error_msg,
                    'response_code': response_data.get('ResponseCode'),
                    'response_description': response_data.get('ResponseDescription')
                }
                
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error during STK Push: {str(e)}"
            logger.error(error_msg)
            return {
                'success': False,
                'error': error_msg
            }
        except ValueError as e:
            error_msg = f"Validation error: {str(e)}"
            logger.error(error_msg)
            return {
                'success': False,
                'error': error_msg
            }
        except Exception as e:
            error_msg = f"Unexpected error during STK Push: {str(e)}"
            logger.error(error_msg)
            return {
                'success': False,
                'error': error_msg
            }
    
    def query_stk_status(self, checkout_request_id: str) -> Dict[str, Any]:
        """
        Query STK Push status
        
        Args:
            checkout_request_id: The checkout request ID from STK Push
            
        Returns:
            Dict containing payment status and details
        """
        try:
            # Initialize configuration if not already done
            self._initialize_config()
            
            # Get access token
            access_token = self._get_access_token()
            
            # Generate timestamp and password
            timestamp = self._generate_timestamp()
            password = self._generate_password(timestamp)
            
            # Prepare request payload
            payload = {
                "BusinessShortCode": self.business_short_code,
                "Password": password,
                "Timestamp": timestamp,
                "CheckoutRequestID": checkout_request_id
            }
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            logger.info(f"Querying STK status for CheckoutRequestID: {checkout_request_id}")
            
            response = requests.post(self.stk_query_url, json=payload, headers=headers)
            response.raise_for_status()
            
            response_data = response.json()
            
            if response_data.get('ResponseCode') == '0':
                result_code = response_data.get('ResultCode')
                result_desc = response_data.get('ResultDesc')
                
                logger.info(f"STK Query successful. ResultCode: {result_code}, ResultDesc: {result_desc}")
                
                # Map M-Pesa result codes to our status
                if result_code == '0':
                    status = 'completed'
                elif result_code == '1':
                    status = 'pending'
                elif result_code == '2':
                    status = 'failed'
                else:
                    status = 'unknown'
                
                return {
                    'success': True,
                    'status': status,
                    'result_code': result_code,
                    'result_description': result_desc,
                    'merchant_request_id': response_data.get('MerchantRequestID'),
                    'checkout_request_id': response_data.get('CheckoutRequestID'),
                    'amount': response_data.get('Amount'),
                    'mpesa_receipt_number': response_data.get('MpesaReceiptNumber'),
                    'transaction_date': response_data.get('TransactionDate')
                }
            else:
                error_msg = f"STK Query failed: {response_data.get('ResponseDescription', 'Unknown error')}"
                logger.error(error_msg)
                return {
                    'success': False,
                    'error': error_msg,
                    'response_code': response_data.get('ResponseCode'),
                    'response_description': response_data.get('ResponseDescription')
                }
                
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error during STK Query: {str(e)}"
            logger.error(error_msg)
            return {
                'success': False,
                'error': error_msg
            }
        except Exception as e:
            error_msg = f"Unexpected error during STK Query: {str(e)}"
            logger.error(error_msg)
            return {
                'success': False,
                'error': error_msg
            }
    
    def process_callback(self, callback_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process M-Pesa callback data
        
        Args:
            callback_data: Raw callback data from M-Pesa
            
        Returns:
            Dict containing processed payment information
        """
        try:
            logger.info("Processing M-Pesa callback data")
            
            # Extract relevant information from callback
            body = callback_data.get('Body', {})
            stk_callback = body.get('stkCallback', {})
            
            result_code = stk_callback.get('ResultCode')
            result_desc = stk_callback.get('ResultDesc')
            checkout_request_id = stk_callback.get('CheckoutRequestID')
            merchant_request_id = stk_callback.get('MerchantRequestID')
            
            # Extract payment details
            payment_details = {}
            if 'CallbackMetadata' in stk_callback:
                metadata = stk_callback['CallbackMetadata'].get('Item', [])
                for item in metadata:
                    name = item.get('Name')
                    value = item.get('Value')
                    if name and value is not None:
                        payment_details[name] = value
            
            # Determine payment status
            if result_code == 0:
                status = 'completed'
                mpesa_receipt = payment_details.get('MpesaReceiptNumber', '')
                amount = payment_details.get('Amount', 0)
                phone_number = payment_details.get('PhoneNumber', '')
                
                logger.info(f"Payment completed successfully. Receipt: {mpesa_receipt}, Amount: {amount}")
                
                return {
                    'success': True,
                    'status': status,
                    'checkout_request_id': checkout_request_id,
                    'merchant_request_id': merchant_request_id,
                    'mpesa_receipt_number': mpesa_receipt,
                    'amount': amount,
                    'phone_number': phone_number,
                    'result_code': result_code,
                    'result_description': result_desc
                }
            else:
                status = 'failed'
                logger.warning(f"Payment failed. ResultCode: {result_code}, Description: {result_desc}")
                
                return {
                    'success': False,
                    'status': status,
                    'checkout_request_id': checkout_request_id,
                    'merchant_request_id': merchant_request_id,
                    'result_code': result_code,
                    'result_description': result_desc,
                    'error': result_desc
                }
                
        except Exception as e:
            error_msg = f"Error processing M-Pesa callback: {str(e)}"
            logger.error(error_msg)
            return {
                'success': False,
                'error': error_msg
            }
    
    def validate_phone_number(self, phone: str) -> bool:
        """
        Validate phone number format for M-Pesa
        
        Args:
            phone: Phone number to validate
            
        Returns:
            True if valid, False otherwise
        """
        try:
            # Initialize configuration if not already done
            self._initialize_config()
            
            formatted = self._format_phone_number(phone)
            return len(formatted) == 12 and formatted.startswith('254')
        except ValueError:
            return False
    
    def get_service_status(self) -> Dict[str, Any]:
        """
        Get M-Pesa service status and configuration
        
        Returns:
            Dict containing service status information
        """
        try:
            # Initialize configuration if not already done
            self._initialize_config()
            
            # Test access token generation
            access_token = self._get_access_token()
            
            return {
                'status': 'operational',
                'environment': self.environment,
                'base_url': self.base_url,
                'business_short_code': self.business_short_code,
                'access_token_available': bool(access_token),
                'configuration_valid': True
            }
        except Exception as e:
            return {
                'status': 'error',
                'environment': self.environment,
                'base_url': self.base_url,
                'business_short_code': self.business_short_code,
                'access_token_available': False,
                'configuration_valid': False,
                'error': str(e)
            }

# Create global instance
mpesa_service = MpesaService()
