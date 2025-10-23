#!/usr/bin/env python3
"""
M-Pesa STK Push Routes for ProWrite
Handles M-Pesa Daraja API integration for payments
"""

from flask import Blueprint, request, jsonify
import logging
import mysql.connector
import os
from datetime import datetime
from dotenv import load_dotenv
from mpesa_service import mpesa_service
import threading
import time

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# Create Blueprint
mpesa_bp = Blueprint('mpesa', __name__, url_prefix='/api/payments/mpesa')

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'Prowrite.mysql.pythonanywhere-services.com'),
    'user': os.getenv('DB_USER', 'Prowrite'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'Prowrite$dbprowrite'),
    'port': int(os.getenv('DB_PORT', 3306))
}

def get_db_connection():
    """Get database connection"""
    return mysql.connector.connect(**DB_CONFIG)

def log_payment_action(payment_id, action, details=None):
    """Log payment action to payment_logs table"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO payment_logs (payment_id, action, details)
            VALUES (%s, %s, %s)
        """, (payment_id, action, details))
        
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        logger.error(f"Error logging payment action: {e}")

def create_payment_record(user_id, amount, checkout_request_id, merchant_request_id, phone_number, document_type, form_data):
    """Create payment record in database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Generate reference
        reference = f"MPESA_{int(time.time())}_{user_id}"
        
        cursor.execute("""
            INSERT INTO payments (
                user_id, amount, status, payment_type, item_id, 
                checkout_request_id, merchant_request_id, phone_number,
                payment_method, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id, amount, 'pending', document_type, 0,
            checkout_request_id, merchant_request_id, phone_number,
            'mpesa_stk', datetime.now()
        ))
        
        payment_id = cursor.lastrowid
        
        # Store form data in JSON format
        import json
        form_data_json = json.dumps(form_data) if form_data else None
        cursor.execute("""
            UPDATE payments SET form_data = %s WHERE payment_id = %s
        """, (form_data_json, payment_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        # Log the payment initiation
        log_payment_action(payment_id, 'initiated', {
            'checkout_request_id': checkout_request_id,
            'merchant_request_id': merchant_request_id,
            'amount': amount,
            'phone_number': phone_number
        })
        
        return payment_id, reference
        
    except Exception as e:
        logger.error(f"Error creating payment record: {e}")
        return None, None

def update_payment_status(payment_id, status, mpesa_receipt=None, failure_reason=None):
    """Update payment status in database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if status == 'completed':
            cursor.execute("""
                UPDATE payments 
                SET status = %s, completed_at = %s, mpesa_code = %s
                WHERE payment_id = %s
            """, (status, datetime.now(), mpesa_receipt, payment_id))
        else:
            cursor.execute("""
                UPDATE payments 
                SET status = %s, failure_reason = %s, updated_at = %s
                WHERE payment_id = %s
            """, (status, failure_reason, datetime.now(), payment_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        # Log the status update
        log_payment_action(payment_id, 'status_updated', {
            'new_status': status,
            'mpesa_receipt': mpesa_receipt,
            'failure_reason': failure_reason
        })
        
        return True
        
    except Exception as e:
        logger.error(f"Error updating payment status: {e}")
        return False

def trigger_pdf_generation(payment_id, form_data, document_type, user_email):
    """Trigger PDF generation in background thread"""
    def generate_pdf():
        try:
            # Import here to avoid circular imports
            from app import generate_resume_pdf, send_email_with_pdf
            
            # Generate PDF
            pdf_path = generate_resume_pdf(form_data, document_type, payment_id)
            
            if pdf_path:
                # Send email with PDF
                send_email_with_pdf(user_email, pdf_path, document_type)
                
                # Log successful generation
                log_payment_action(payment_id, 'pdf_generated', {
                    'pdf_path': pdf_path,
                    'email_sent': True
                })
            else:
                logger.error(f"Failed to generate PDF for payment {payment_id}")
                
        except Exception as e:
            logger.error(f"Error in PDF generation thread: {e}")
    
    # Start PDF generation in background thread
    thread = threading.Thread(target=generate_pdf)
    thread.daemon = True
    thread.start()

@mpesa_bp.route('/initiate', methods=['POST'])
def initiate_stk_push():
    """Initiate M-Pesa STK Push payment"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['phone_number', 'amount', 'document_type', 'form_data', 'user_email']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        phone_number = data['phone_number']
        amount = int(data['amount'])
        document_type = data['document_type']
        form_data = data['form_data']
        user_email = data['user_email']
        user_id = data.get('user_id', 1)  # Default to 1 if not provided
        
        # Validate phone number format
        if not mpesa_service.validate_phone_number(phone_number):
            return jsonify({
                'success': False,
                'error': 'Invalid phone number format. Use format: 254XXXXXXXXX'
            }), 400
        
        # Generate reference
        reference = f"PROWRITE_{int(time.time())}_{user_id}"
        
        # Initiate STK push
        result = mpesa_service.initiate_stk_push(
            phone=phone_number,
            amount=amount,
            reference=reference,
            description=f"ProWrite {document_type}"
        )
        
        if result['success']:
            # Create payment record
            payment_id, db_reference = create_payment_record(
                user_id=user_id,
                amount=amount,
                checkout_request_id=result['checkout_request_id'],
                merchant_request_id=result['merchant_request_id'],
                phone_number=phone_number,
                document_type=document_type,
                form_data=form_data
            )
            
            if payment_id:
                return jsonify({
                    'success': True,
                    'payment_id': payment_id,
                    'checkout_request_id': result['checkout_request_id'],
                    'merchant_request_id': result['merchant_request_id'],
                    'reference': db_reference,
                    'message': 'STK push initiated successfully. Check your phone for payment prompt.'
                })
            else:
                logger.error(f"Failed to create payment record for user {user_id}")
                return jsonify({
                    'success': False,
                    'error': 'Failed to create payment record. Please try again.'
                }), 500
        else:
            # Handle specific M-Pesa errors
            error_message = result.get('error', 'Failed to initiate STK push')
            
            # Map M-Pesa error codes to user-friendly messages
            if '1037' in error_message:
                error_message = 'No response from user. Please check your phone and respond to the STK push.'
            elif '1032' in error_message:
                error_message = 'Payment was cancelled. Please try again if you want to proceed.'
            elif '1031' in error_message:
                error_message = 'Unable to lock subscriber. Please try again later.'
            elif '1033' in error_message:
                error_message = 'Transaction failed. Please check your M-Pesa balance and try again.'
            elif '2001' in error_message:
                error_message = 'Wrong PIN entered. Please try again with the correct PIN.'
            elif '2002' in error_message:
                error_message = 'Insufficient funds. Please top up your M-Pesa account and try again.'
            elif '2003' in error_message:
                error_message = 'Less than minimum transaction value. Please check the amount.'
            elif '2004' in error_message:
                error_message = 'More than maximum transaction value. Please check the amount.'
            elif '2005' in error_message:
                error_message = 'Would exceed daily transfer limit. Please try again tomorrow.'
            elif '2006' in error_message:
                error_message = 'Would exceed minimum balance. Please check your account balance.'
            elif 'Network error' in error_message:
                error_message = 'Network connection error. Please check your internet connection and try again.'
            elif 'Rate limited' in error_message:
                error_message = 'Too many requests. Please wait a moment before trying again.'
            
            logger.error(f"STK push failed for user {user_id}: {error_message}")
            return jsonify({
                'success': False,
                'error': error_message
            }), 400
            
    except Exception as e:
        logger.error(f"Error initiating STK push: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@mpesa_bp.route('/callback', methods=['POST'])
def mpesa_callback():
    """Handle M-Pesa callback"""
    try:
        callback_data = request.get_json()
        logger.info(f"M-Pesa callback received: {callback_data}")
        
        # Process callback data
        result = mpesa_service.process_callback(callback_data)
        
        if result['success']:
            checkout_request_id = result['checkout_request_id']
            
            # Find payment record
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute("""
                SELECT payment_id, user_id, amount, form_data, payment_type, status
                FROM payments 
                WHERE checkout_request_id = %s
            """, (checkout_request_id,))
            
            payment = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if payment:
                # Update payment status
                if result['status'] == 'completed':
                    update_payment_status(
                        payment['payment_id'], 
                        'completed', 
                        mpesa_receipt=result.get('mpesa_receipt_number')
                    )
                    
                    # Trigger PDF generation
                    trigger_pdf_generation(
                        payment['payment_id'],
                        payment['form_data'],
                        payment['payment_type'],
                        payment.get('user_email', 'user@example.com')
                    )
                    
                    # Log callback received
                    log_payment_action(payment['payment_id'], 'callback_received', {
                        'mpesa_receipt': result.get('mpesa_receipt_number'),
                        'amount': result.get('amount'),
                        'phone_number': result.get('phone_number')
                    })
                    
                else:
                    update_payment_status(
                        payment['payment_id'], 
                        'failed', 
                        failure_reason=result.get('result_description', 'Payment failed')
                    )
                
                # Return acknowledgment to M-Pesa
                return jsonify({
                    "ResultCode": 0,
                    "ResultDesc": "Success"
                })
            else:
                logger.error(f"Payment not found for checkout_request_id: {checkout_request_id}")
                return jsonify({
                    "ResultCode": 1,
                    "ResultDesc": "Payment not found"
                }), 404
        else:
            logger.error(f"Callback processing failed: {result.get('error')}")
            return jsonify({
                "ResultCode": 1,
                "ResultDesc": "Callback processing failed"
            }), 400
            
    except Exception as e:
        logger.error(f"Error processing M-Pesa callback: {e}")
        return jsonify({
            "ResultCode": 1,
            "ResultDesc": "Internal server error"
        }), 500

@mpesa_bp.route('/status/<checkout_request_id>', methods=['GET'])
def query_payment_status(checkout_request_id):
    """Query payment status for frontend polling"""
    try:
        # Add rate limiting - check if we've queried recently
        import time
        current_time = time.time()
        
        # Simple in-memory rate limiting (in production, use Redis)
        if not hasattr(query_payment_status, 'last_query_time'):
            query_payment_status.last_query_time = {}
        
        last_query = query_payment_status.last_query_time.get(checkout_request_id, 0)
        
        # Rate limit: max 1 query per 2 seconds per checkout_request_id
        if current_time - last_query < 2:
            return jsonify({
                'success': False,
                'error': 'Rate limited. Please wait before checking again.',
                'status': 'pending'
            }), 429
        
        query_payment_status.last_query_time[checkout_request_id] = current_time
        
        # Query M-Pesa API for status
        result = mpesa_service.query_stk_status(checkout_request_id)
        
        if result['success']:
            # Get payment record from database
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute("""
                SELECT payment_id, status, amount, payment_type, form_data, created_at
                FROM payments 
                WHERE checkout_request_id = %s
            """, (checkout_request_id,))
            
            payment = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if payment:
                return jsonify({
                    'success': True,
                    'status': payment['status'],
                    'mpesa_status': result['status'],
                    'payment_id': payment['payment_id'],
                    'amount': payment['amount'],
                    'payment_type': payment['payment_type'],
                    'created_at': payment['created_at'].isoformat() if payment['created_at'] else None,
                    'result_code': result.get('result_code'),
                    'result_description': result.get('result_description')
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Payment not found'
                }), 404
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Failed to query status')
            }), 400
            
    except Exception as e:
        logger.error(f"Error querying payment status: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@mpesa_bp.route('/service-status', methods=['GET'])
def service_status():
    """Get M-Pesa service status"""
    try:
        status = mpesa_service.get_service_status()
        return jsonify(status)
    except Exception as e:
        logger.error(f"Error getting service status: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500
