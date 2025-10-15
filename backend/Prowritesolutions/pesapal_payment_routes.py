from flask import Blueprint, request, jsonify
import logging
import uuid
from datetime import datetime
import mysql.connector
from dotenv import load_dotenv
import os
from pesapal_service import PesapalService

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# Create Blueprint
pesapal_payment_bp = Blueprint('pesapal_payment', __name__, url_prefix='/api/payments/pesapal')

@pesapal_payment_bp.route('/initiate', methods=['POST'])
def initiate_payment():
    """
    Initiate Pesapal payment
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['amount', 'phone_number', 'email_address']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Initialize Pesapal service
        pesapal_service = PesapalService()
        
        # Prepare order details
        order_details = {
            'amount': float(data['amount']),
            'currency': data.get('currency', 'KES'),
            'description': data.get('description', 'Payment for services'),
            'phone_number': data['phone_number'],
            'email_address': data['email_address'],
            'first_name': data.get('first_name', ''),
            'last_name': data.get('last_name', ''),
            'country_code': data.get('country_code', 'KE'),
            'city': data.get('city', 'Nairobi'),
            'state': data.get('state', 'Nairobi'),
            'line_1': data.get('line_1', ''),
            'postal_code': data.get('postal_code', '00100')
        }
        
        # Initiate payment
        payment_result = pesapal_service.initiate_payment(order_details)
        
        if payment_result['success']:
            # Save payment record to database
            save_payment_record(
                order_reference=payment_result['order_reference'],
                amount=order_details['amount'],
                currency=order_details['currency'],
                phone_number=order_details['phone_number'],
                email_address=order_details['email_address'],
                payment_url=payment_result['payment_url'],
                order_tracking_id=payment_result['order_tracking_id']
            )
            
            return jsonify({
                'success': True,
                'order_reference': payment_result['order_reference'],
                'payment_url': payment_result['payment_url'],
                'order_tracking_id': payment_result['order_tracking_id'],
                'message': 'Payment initiated successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': payment_result['error']
            }), 400
            
    except Exception as e:
        logger.error(f"Payment initiation error: {e}")
        return jsonify({
            'success': False,
            'error': 'Payment initiation failed'
        }), 500

@pesapal_payment_bp.route('/status/<order_reference>', methods=['GET'])
def get_payment_status(order_reference):
    """
    Get payment status by order reference
    """
    try:
        # Get payment record from database
        payment_record = get_payment_record(order_reference)
        
        if not payment_record:
            return jsonify({
                'success': False,
                'error': 'Payment record not found'
            }), 404
        
        # Initialize Pesapal service
        pesapal_service = PesapalService()
        
        # Get status from Pesapal
        status_result = pesapal_service.get_payment_status(payment_record['order_tracking_id'])
        
        if status_result['success']:
            # Update database with latest status
            update_payment_status(
                order_reference,
                status_result['status'],
                status_result.get('payment_reference', ''),
                status_result.get('payment_method', '')
            )
            
            return jsonify({
                'success': True,
                'order_reference': order_reference,
                'status': status_result['status'],
                'amount': payment_record['amount'],
                'currency': payment_record['currency'],
                'payment_reference': status_result.get('payment_reference', ''),
                'payment_method': status_result.get('payment_method', ''),
                'created_at': payment_record['created_at'].isoformat() if payment_record['created_at'] else None
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': status_result['error']
            }), 400
            
    except Exception as e:
        logger.error(f"Payment status error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to get payment status'
        }), 500

@pesapal_payment_bp.route('/test', methods=['GET'])
def test_pesapal_connection():
    """
    Test Pesapal API connection
    """
    try:
        pesapal_service = PesapalService()
        test_result = pesapal_service.test_connection()
        
        return jsonify(test_result), 200 if test_result['success'] else 400
        
    except Exception as e:
        logger.error(f"Pesapal test error: {e}")
        return jsonify({
            'success': False,
            'error': 'Pesapal test failed'
        }), 500

def save_payment_record(order_reference, amount, currency, phone_number, email_address, payment_url, order_tracking_id):
    """
    Save payment record to database
    """
    try:
        db_config = {
            'host': os.getenv('DB_HOST'),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'database': os.getenv('DB_NAME')
        }
        
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        insert_query = """
        INSERT INTO manual_payments 
        (order_reference, amount, currency, phone_number, email_address, 
         payment_url, order_tracking_id, payment_status, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        cursor.execute(insert_query, (
            order_reference,
            amount,
            currency,
            phone_number,
            email_address,
            payment_url,
            order_tracking_id,
            'PENDING',
            datetime.now(),
            datetime.now()
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        logger.info(f"Payment record saved: {order_reference}")
        
    except Exception as e:
        logger.error(f"Database save error: {e}")

def get_payment_record(order_reference):
    """
    Get payment record from database
    """
    try:
        db_config = {
            'host': os.getenv('DB_HOST'),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'database': os.getenv('DB_NAME')
        }
        
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        select_query = """
        SELECT * FROM manual_payments 
        WHERE order_reference = %s
        """
        
        cursor.execute(select_query, (order_reference,))
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return result
        
    except Exception as e:
        logger.error(f"Database get error: {e}")
        return None

def update_payment_status(order_reference, status, payment_reference, payment_method):
    """
    Update payment status in database
    """
    try:
        db_config = {
            'host': os.getenv('DB_HOST'),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'database': os.getenv('DB_NAME')
        }
        
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        update_query = """
        UPDATE manual_payments 
        SET payment_status = %s, 
            payment_reference = %s,
            payment_method = %s,
            updated_at = %s
        WHERE order_reference = %s
        """
        
        cursor.execute(update_query, (
            status,
            payment_reference,
            payment_method,
            datetime.now(),
            order_reference
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        logger.info(f"Payment status updated: {order_reference} -> {status}")
        
    except Exception as e:
        logger.error(f"Database update error: {e}")
