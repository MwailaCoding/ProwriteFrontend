from flask import Blueprint, request, jsonify, current_app
import logging
import hmac
import hashlib
import json
from datetime import datetime
import mysql.connector
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# Create Blueprint
pesapal_callback_bp = Blueprint('pesapal_callback', __name__, url_prefix='/api/payments/pesapal')

@pesapal_callback_bp.route('/callback', methods=['POST'])
def handle_pesapal_callback():
    """
    Handle Pesapal payment callback notifications
    """
    try:
        logger.info("Received Pesapal callback")
        
        # Get the raw request data
        raw_data = request.get_data()
        logger.info(f"Callback data: {raw_data}")
        
        # Parse JSON data
        try:
            callback_data = request.get_json()
        except:
            callback_data = json.loads(raw_data)
        
        logger.info(f"Parsed callback data: {callback_data}")
        
        # Extract payment information
        order_tracking_id = callback_data.get('OrderTrackingId')
        order_merchant_reference = callback_data.get('OrderMerchantReference')
        payment_status = callback_data.get('PaymentStatus')
        payment_method = callback_data.get('PaymentMethod')
        payment_account = callback_data.get('PaymentAccount')
        amount = callback_data.get('Amount')
        currency = callback_data.get('Currency')
        payment_reference = callback_data.get('PaymentReference')
        
        logger.info(f"Payment Status: {payment_status} for Order: {order_merchant_reference}")
        
        # Update payment status in database
        if order_merchant_reference:
            update_payment_status(
                order_merchant_reference,
                payment_status,
                payment_reference,
                amount,
                currency,
                payment_method,
                payment_account
            )
        
        # Return success response
        return jsonify({
            "status": "success",
            "message": "Callback received successfully"
        }), 200
        
    except Exception as e:
        logger.error(f"Callback processing error: {e}")
        return jsonify({
            "status": "error",
            "message": "Callback processing failed"
        }), 500

def update_payment_status(order_reference, status, payment_reference, amount, currency, method, account):
    """
    Update payment status in database
    """
    try:
        # Database connection
        db_config = {
            'host': os.getenv('DB_HOST'),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'database': os.getenv('DB_NAME')
        }
        
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Update payment status
        update_query = """
        UPDATE manual_payments 
        SET payment_status = %s, 
            payment_reference = %s,
            payment_method = %s,
            payment_account = %s,
            updated_at = %s
        WHERE order_reference = %s
        """
        
        cursor.execute(update_query, (
            status,
            payment_reference,
            method,
            account,
            datetime.now(),
            order_reference
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        logger.info(f"Updated payment status for {order_reference}: {status}")
        
    except Exception as e:
        logger.error(f"Database update error: {e}")

@pesapal_callback_bp.route('/webhook', methods=['POST'])
def handle_pesapal_webhook():
    """
    Handle Pesapal webhook notifications (alternative to callback)
    """
    try:
        logger.info("Received Pesapal webhook")
        
        # Get the raw request data
        raw_data = request.get_data()
        logger.info(f"Webhook data: {raw_data}")
        
        # Parse JSON data
        try:
            webhook_data = request.get_json()
        except:
            webhook_data = json.loads(raw_data)
        
        logger.info(f"Parsed webhook data: {webhook_data}")
        
        # Process webhook data
        # Similar to callback processing
        
        return jsonify({
            "status": "success",
            "message": "Webhook received successfully"
        }), 200
        
    except Exception as e:
        logger.error(f"Webhook processing error: {e}")
        return jsonify({
            "status": "error",
            "message": "Webhook processing failed"
        }), 500
