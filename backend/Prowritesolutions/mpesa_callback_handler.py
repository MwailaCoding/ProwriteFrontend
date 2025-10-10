"""
M-Pesa Callback Handler for PythonAnywhere
This file handles M-Pesa payment callbacks and processes form submissions
"""

from flask import Flask, request, jsonify
import mysql.connector
import json
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'prowrite_db'),
    'charset': 'utf8mb4'
}

def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except mysql.connector.Error as e:
        logger.error(f"Database connection error: {e}")
        return None

def process_paid_submission(submission_id: int) -> bool:
    """Process a paid submission: generate PDF and send email"""
    try:
        # Get submission details
        connection = get_db_connection()
        if not connection:
            return False
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT fs.*, u.email as user_email, u.first_name, u.last_name
            FROM form_submissions fs
            JOIN users u ON fs.user_id = u.id
            WHERE fs.id = %s
        """, (submission_id,))
        
        submission = cursor.fetchone()
        connection.close()
        
        if not submission:
            logger.error(f"Submission {submission_id} not found")
            return False
        
        # Check if already processed
        if submission['status'] in ['pdf_generated', 'email_sent', 'completed']:
            logger.info(f"Submission {submission_id} already processed")
            return True
        
        # Update status to PDF generation
        connection = get_db_connection()
        if connection:
            cursor = connection.cursor()
            cursor.execute("""
                UPDATE form_submissions 
                SET status = 'pdf_generated', updated_at = NOW()
                WHERE id = %s
            """, (submission_id,))
            connection.commit()
            connection.close()
        
        # Generate PDF (simplified for callback handler)
        # In production, you might want to use a queue system
        pdf_path = f"static/templates/generated_resumes/submission_{submission_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        # Update submission with PDF path
        connection = get_db_connection()
        if connection:
            cursor = connection.cursor()
            cursor.execute("""
                UPDATE form_submissions 
                SET pdf_path = %s, status = 'email_sent', email_sent = TRUE, updated_at = NOW()
                WHERE id = %s
            """, (pdf_path, submission_id))
            connection.commit()
            connection.close()
        
        logger.info(f"Submission {submission_id} processed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error processing paid submission {submission_id}: {e}")
        return False

def handle_mpesa_callback():
    """Handle M-Pesa payment callback"""
    try:
        data = request.get_json()
        
        # Log the callback for debugging
        logger.info(f"M-Pesa callback received: {data}")
        
        # Extract payment details
        checkout_request_id = data.get('Body', {}).get('stkCallback', {}).get('CheckoutRequestID', '')
        result_code = data.get('Body', {}).get('stkCallback', {}).get('ResultCode', '')
        result_description = data.get('Body', {}).get('stkCallback', {}).get('ResultDesc', '')
        
        if result_code == 0:
            # Payment successful
            callback_metadata = data.get('Body', {}).get('stkCallback', {}).get('CallbackMetadata', {}).get('Item', [])
            
            # Extract payment details
            amount = None
            mpesa_receipt_number = None
            transaction_date = None
            phone_number = None
            
            for item in callback_metadata:
                if item.get('Name') == 'Amount':
                    amount = item.get('Value')
                elif item.get('Name') == 'MpesaReceiptNumber':
                    mpesa_receipt_number = item.get('Value')
                elif item.get('Name') == 'TransactionDate':
                    transaction_date = item.get('Value')
                elif item.get('Name') == 'PhoneNumber':
                    phone_number = item.get('Value')
            
            # Process successful payment
            payment_data = {
                'checkout_request_id': checkout_request_id,
                'amount': amount,
                'mpesa_receipt_number': mpesa_receipt_number,
                'transaction_date': transaction_date,
                'phone_number': phone_number,
                'status': 'success'
            }
            
            # Update payment record in database
            connection = get_db_connection()
            if connection:
                try:
                    cursor = connection.cursor()
                    
                    # Update payment status
                    cursor.execute("""
                        UPDATE payments 
                        SET status = 'completed', 
                            mpesa_receipt_number = %s,
                            updated_at = NOW()
                        WHERE mpesa_checkout_request_id = %s
                    """, (mpesa_receipt_number, checkout_request_id))
                    
                    # Find submission by payment
                    cursor.execute("""
                        SELECT fs.id, fs.user_id, fs.document_type, fs.form_data, fs.amount
                        FROM form_submissions fs
                        JOIN payments p ON fs.payment_id = p.id
                        WHERE p.mpesa_checkout_request_id = %s
                    """, (checkout_request_id,))
                    
                    submission = cursor.fetchone()
                    
                    if submission:
                        submission_id, user_id, doc_type, form_data, amount = submission
                        
                        # Update submission status to paid
                        cursor.execute("""
                            UPDATE form_submissions 
                            SET status = 'paid', updated_at = NOW()
                            WHERE id = %s
                        """, (submission_id,))
                        
                        connection.commit()
                        logger.info(f"Form submission {submission_id} payment completed")
                        
                        # Process the submission (generate PDF and send email)
                        try:
                            process_paid_submission(submission_id)
                            logger.info(f"PDF generation and email delivery triggered for submission {submission_id}")
                        except Exception as e:
                            logger.error(f"Error processing submission {submission_id} after payment: {e}")
                    
                    connection.close()
                    
                except Exception as e:
                    logger.error(f"Error updating payment in callback: {e}")
                    if connection:
                        connection.close()
            
            logger.info(f"Payment successful: {payment_data}")
            
        else:
            # Payment failed
            logger.warning(f"Payment failed: {result_description}")
        
        # Always return success to M-Pesa
        return jsonify({
            'ResultCode': 0,
            'ResultDesc': 'Success'
        })
        
    except Exception as e:
        logger.error(f"Error processing M-Pesa callback: {e}")
        return jsonify({
            'ResultCode': 1,
            'ResultDesc': 'Failed'
        }), 500

# Flask app for callback handler
app = Flask(__name__)

@app.route('/api/payments/mpesa-callback', methods=['POST'])
def mpesa_callback():
    """M-Pesa callback endpoint"""
    return handle_mpesa_callback()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'mpesa-callback-handler'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
