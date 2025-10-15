import requests
import json
import base64
import hashlib
import hmac
import uuid
from datetime import datetime
import logging
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

class PesapalService:
    def __init__(self):
        self.consumer_key = os.getenv('PESAPAL_CONSUMER_KEY')
        self.consumer_secret = os.getenv('PESAPAL_CONSUMER_SECRET')
        self.callback_url = os.getenv('PESAPAL_CALLBACK_URL')
        self.ipn_id = os.getenv('PESAPAL_IPN_ID')
        self.environment = os.getenv('PESAPAL_ENVIRONMENT', 'sandbox')
        
        # API URLs
        if self.environment == 'sandbox':
            self.base_url = 'https://cybqa.pesapal.com/pesapalv3'
        else:
            self.base_url = 'https://pay.pesapal.com/v3'
        
        logger.info(f"Pesapal Service initialized for {self.environment} environment")
    
    def get_access_token(self):
        """
        Get access token from Pesapal API
        """
        try:
            url = f"{self.base_url}/api/Auth/RequestToken"
            
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            data = {
                'consumer_key': self.consumer_key,
                'consumer_secret': self.consumer_secret
            }
            
            logger.info("Requesting Pesapal access token")
            response = requests.post(url, json=data, headers=headers, timeout=30)
            
            if response.status_code == 200:
                token_data = response.json()
                access_token = token_data.get('token')
                logger.info("✅ Pesapal access token obtained successfully")
                return access_token
            else:
                logger.error(f"❌ Failed to get access token: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error getting access token: {e}")
            return None
    
    def initiate_payment(self, order_details):
        """
        Initiate payment with Pesapal
        
        Args:
            order_details (dict): Order information including amount, currency, etc.
        
        Returns:
            dict: Payment initiation response
        """
        try:
            access_token = self.get_access_token()
            if not access_token:
                return {
                    'success': False,
                    'error': 'Failed to get access token'
                }
            
            url = f"{self.base_url}/api/Transactions/SubmitOrderRequest"
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            # Generate unique order reference
            order_reference = f"PAY-{uuid.uuid4().hex[:8].upper()}"
            
            payment_data = {
                'id': order_reference,
                'currency': order_details.get('currency', 'KES'),
                'amount': order_details.get('amount'),
                'description': order_details.get('description', 'Payment for services'),
                'callback_url': self.callback_url,
                'notification_id': order_details.get('notification_id', None),
                'ipn_notification_url': self.ipn_id,
                'billing_address': {
                    'phone_number': order_details.get('phone_number', ''),
                    'email_address': order_details.get('email_address', ''),
                    'country_code': order_details.get('country_code', 'KE'),
                    'first_name': order_details.get('first_name', ''),
                    'middle_name': order_details.get('middle_name', ''),
                    'last_name': order_details.get('last_name', ''),
                    'line_1': order_details.get('line_1', ''),
                    'line_2': order_details.get('line_2', ''),
                    'city': order_details.get('city', ''),
                    'state': order_details.get('state', ''),
                    'postal_code': order_details.get('postal_code', ''),
                    'zip_code': order_details.get('zip_code', '')
                }
            }
            
            logger.info(f"Initiating Pesapal payment for order: {order_reference}")
            response = requests.post(url, json=payment_data, headers=headers, timeout=30)
            
            if response.status_code == 200:
                payment_response = response.json()
                logger.info(f"✅ Payment initiated successfully: {order_reference}")
                
                return {
                    'success': True,
                    'order_reference': order_reference,
                    'payment_url': payment_response.get('redirect_url'),
                    'order_tracking_id': payment_response.get('order_tracking_id'),
                    'message': 'Payment initiated successfully'
                }
            else:
                logger.error(f"❌ Payment initiation failed: {response.status_code} - {response.text}")
                return {
                    'success': False,
                    'error': f'Payment initiation failed: {response.text}'
                }
                
        except Exception as e:
            logger.error(f"❌ Error initiating payment: {e}")
            return {
                'success': False,
                'error': f'Payment initiation error: {str(e)}'
            }
    
    def get_payment_status(self, order_tracking_id):
        """
        Get payment status from Pesapal
        
        Args:
            order_tracking_id (str): Order tracking ID from Pesapal
        
        Returns:
            dict: Payment status information
        """
        try:
            access_token = self.get_access_token()
            if not access_token:
                return {
                    'success': False,
                    'error': 'Failed to get access token'
                }
            
            url = f"{self.base_url}/api/Transactions/GetTransactionStatus"
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            params = {
                'orderTrackingId': order_tracking_id
            }
            
            logger.info(f"Getting payment status for: {order_tracking_id}")
            response = requests.get(url, params=params, headers=headers, timeout=30)
            
            if response.status_code == 200:
                status_data = response.json()
                logger.info(f"✅ Payment status retrieved: {status_data}")
                
                return {
                    'success': True,
                    'status': status_data.get('payment_status'),
                    'payment_method': status_data.get('payment_method'),
                    'amount': status_data.get('amount'),
                    'currency': status_data.get('currency'),
                    'payment_reference': status_data.get('payment_reference'),
                    'data': status_data
                }
            else:
                logger.error(f"❌ Failed to get payment status: {response.status_code} - {response.text}")
                return {
                    'success': False,
                    'error': f'Failed to get payment status: {response.text}'
                }
                
        except Exception as e:
            logger.error(f"❌ Error getting payment status: {e}")
            return {
                'success': False,
                'error': f'Payment status error: {str(e)}'
            }
    
    def test_connection(self):
        """
        Test connection to Pesapal API
        """
        try:
            access_token = self.get_access_token()
            if access_token:
                return {
                    'success': True,
                    'message': 'Pesapal connection successful',
                    'environment': self.environment
                }
            else:
                return {
                    'success': False,
                    'message': 'Pesapal connection failed'
                }
        except Exception as e:
            return {
                'success': False,
                'message': f'Pesapal connection error: {str(e)}'
            }
