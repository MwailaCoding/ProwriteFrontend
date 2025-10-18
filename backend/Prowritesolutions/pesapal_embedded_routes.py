from flask import Blueprint, request, jsonify, render_template_string, current_app, send_file
import logging
import mysql.connector
from datetime import datetime
from dotenv import load_dotenv
import os
import threading
import tempfile

load_dotenv()
logger = logging.getLogger(__name__)

pesapal_embedded_bp = Blueprint('pesapal_embedded', __name__, url_prefix='/api/payments/pesapal')

@pesapal_embedded_bp.route('/payment-page', methods=['GET'])
def show_payment_page():
    """Show the embedded Pesapal payment page"""
    try:
        # Get order details from query parameters
        order_reference = request.args.get('order_reference')
        amount = request.args.get('amount')
        description = request.args.get('description', 'Payment for services')
        
        if not order_reference or not amount:
            return jsonify({
                'success': False,
                'message': 'Order reference and amount are required'
            }), 400
        
        # Create the embedded payment page HTML
        payment_page_html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment - Prowrite Solutions</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f5f5f5;
                }}
                .payment-container {{
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }}
                .order-info {{
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }}
                .pesapal-iframe {{
                    width: 100%;
                    height: 600px;
                    border: none;
                    border-radius: 5px;
                }}
                .amount {{
                    font-size: 24px;
                    font-weight: bold;
                    color: #28a745;
                }}
            </style>
        </head>
        <body>
            <div class="payment-container">
                <h1>Complete Your Payment</h1>
                
                <div class="order-info">
                    <h3>Order Details</h3>
                    <p><strong>Order Reference:</strong> {order_reference}</p>
                    <p><strong>Amount:</strong> <span class="amount">KES {amount}</span></p>
                    <p><strong>Description:</strong> {description}</p>
                </div>
                
                <h3>Payment Options</h3>
                <p>Please complete your payment using the form below:</p>
                
                <iframe 
                    class="pesapal-iframe"
                    src="https://store.pesapal.com/embed-code?pageUrl=https://store.pesapal.com/prowrite2&orderRef={order_reference}&amount={amount}&description={description}"
                    frameborder="0" 
                    allowfullscreen>
                </iframe>
                
                <div style="margin-top: 20px; padding: 15px; background: #e9ecef; border-radius: 5px;">
                    <p><strong>Note:</strong> After completing payment, you will receive a confirmation email. 
                    Your order will be processed within 24 hours.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return payment_page_html
        
    except Exception as e:
        logger.error(f"Error showing payment page: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error showing payment page: {str(e)}'
        }), 500

@pesapal_embedded_bp.route('/payment-success', methods=['GET', 'POST'])
def payment_success():
    """Handle successful payment redirect - redirect itself confirms payment"""
    try:
        # Get payment details from query parameters or form data
        if request.method == 'GET':
            order_reference = request.args.get('order_reference')
            amount = request.args.get('amount')
            payment_reference = request.args.get('payment_reference')
        else:
            order_reference = request.form.get('order_reference')
            amount = request.form.get('amount')
            payment_reference = request.form.get('payment_reference')
        
        if not order_reference:
            return render_payment_error_page("Order reference is required")
        
        logger.info(f"PAYMENT REDIRECT CONFIRMED: {order_reference} - Redirect received from Pesapal")
        
        # Check if payment was already processed
        existing_data = get_submission_data(order_reference)
        if existing_data and existing_data.get('status') == 'COMPLETED':
            logger.info(f"Payment already processed for {order_reference}")
            return render_payment_success_page(order_reference, payment_reference, amount)
        
        # REDIRECT CONFIRMS PAYMENT - Update status immediately
        success = update_payment_status(
            order_reference=order_reference,
            status='COMPLETED',
            payment_reference=payment_reference,
            amount=amount,
            currency='KES',
            method='Pesapal',
            account='Embedded Payment Page'
        )
        
        if success:
            logger.info(f"Payment status updated to COMPLETED for {order_reference}")
            
            # Start PDF generation and email sending in background
            try:
                thread = threading.Thread(target=process_payment_completion, args=(order_reference,))
                thread.daemon = True
                thread.start()
                logger.info(f"Background PDF generation started for {order_reference}")
            except Exception as e:
                logger.error(f"Failed to start background PDF generation: {e}")
            
            # Return success page with download link
            return render_payment_success_page(order_reference, payment_reference, amount)
        else:
            return render_payment_error_page("Failed to update payment status")
            
    except Exception as e:
        logger.error(f"Error handling payment success redirect: {str(e)}")
        return render_payment_error_page(f"Error processing payment: {str(e)}")

@pesapal_embedded_bp.route('/payment-cancelled', methods=['GET'])
def payment_cancelled():
    """Handle cancelled payment"""
    try:
        order_reference = request.args.get('order_reference')
        
        if order_reference:
            # Update payment status to cancelled
            update_payment_status(
                order_reference=order_reference,
                status='CANCELLED',
                payment_reference=None,
                amount=None,
                currency='KES',
                method='Pesapal',
                account='Embedded Payment Page'
            )
        
        return jsonify({
            'success': True,
            'message': 'Payment was cancelled',
            'order_reference': order_reference
        })
        
    except Exception as e:
        logger.error(f"Error handling payment cancellation: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error handling payment cancellation: {str(e)}'
        }), 500

def update_payment_status(order_reference, status, payment_reference, amount, currency, method, account):
    """Update payment status in the database"""
    try:
        # Database connection
        db_config = {
            'host': os.getenv('DB_HOST'),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'database': os.getenv('DB_NAME'),
            'port': int(os.getenv('DB_PORT', 3306))
        }
        
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Update payment status
        update_query = """
        UPDATE manual_payments 
        SET status = %s, 
            payment_reference = %s, 
            amount = %s, 
            currency = %s, 
            payment_method = %s, 
            payment_account = %s,
            updated_at = %s
        WHERE order_reference = %s
        """
        
        cursor.execute(update_query, (
            status,
            payment_reference,
            amount,
            currency,
            method,
            account,
            datetime.now(),
            order_reference
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        logger.info(f"Payment status updated for {order_reference}: {status}")
        return True
        
    except Exception as e:
        logger.error(f"Error updating payment status: {str(e)}")
        return False

def process_payment_completion(order_reference):
    """Process payment completion: generate PDF and send email"""
    try:
        logger.info(f"Processing payment completion for {order_reference}")
        
        # Get submission data from database
        submission_data = get_submission_data(order_reference)
        if not submission_data:
            logger.error(f"No submission data found for {order_reference}")
            return
        
        # Generate PDF
        pdf_path = generate_pdf_for_submission(submission_data, order_reference)
        if not pdf_path:
            logger.error(f"Failed to generate PDF for {order_reference}")
            return
        
        # Update database with PDF path
        update_pdf_path(order_reference, pdf_path)
        
        # Send email with PDF attachment
        send_payment_completion_email(submission_data, pdf_path, order_reference)
        
        logger.info(f"Payment completion processed successfully for {order_reference}")
        
    except Exception as e:
        logger.error(f"Error processing payment completion for {order_reference}: {str(e)}")

def get_submission_data(order_reference):
    """Get submission data from database"""
    try:
        db_config = {
            'host': os.getenv('DB_HOST'),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'database': os.getenv('DB_NAME'),
            'port': int(os.getenv('DB_PORT', 3306))
        }
        
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT * FROM manual_payments 
        WHERE order_reference = %s
        """
        
        cursor.execute(query, (order_reference,))
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting submission data: {str(e)}")
        return None

def generate_pdf_for_submission(submission_data, order_reference):
    """Generate PDF for the submission"""
    try:
        # Import PDF generator
        from francisca_pdf_generator import ProfessionalFranciscaPDFGenerator
        
        # Create uploads directory
        uploads_dir = 'uploads'
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir)
        
        # Generate PDF filename
        pdf_filename = f"resume_{order_reference}.pdf"
        pdf_path = os.path.join(uploads_dir, pdf_filename)
        
        # Parse form data
        form_data = eval(submission_data['form_data']) if isinstance(submission_data['form_data'], str) else submission_data['form_data']
        
        # Generate PDF
        pdf_generator = ProfessionalFranciscaPDFGenerator(theme_name="professional")
        success = pdf_generator.generate_resume_pdf(form_data, pdf_path)
        
        if success and os.path.exists(pdf_path):
            logger.info(f"PDF generated successfully: {pdf_path}")
            return pdf_path
        else:
            logger.error(f"PDF generation failed for {order_reference}")
            return None
            
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        return None

def update_pdf_path(order_reference, pdf_path):
    """Update database with PDF path"""
    try:
        db_config = {
            'host': os.getenv('DB_HOST'),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'database': os.getenv('DB_NAME'),
            'port': int(os.getenv('DB_PORT', 3306))
        }
        
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        update_query = """
        UPDATE manual_payments 
        SET pdf_path = %s, 
            updated_at = %s
        WHERE order_reference = %s
        """
        
        cursor.execute(update_query, (pdf_path, datetime.now(), order_reference))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        logger.info(f"PDF path updated for {order_reference}")
        
    except Exception as e:
        logger.error(f"Error updating PDF path: {str(e)}")

def send_payment_completion_email(submission_data, pdf_path, order_reference):
    """Send email with PDF attachment"""
    try:
        # Import EmailService from app
        from app import EmailService
        
        email_service = EmailService()
        
        # Get user email and name
        user_email = submission_data.get('email', '')
        user_name = submission_data.get('name', 'User')
        document_type = submission_data.get('document_type', 'Resume')
        
        if user_email:
            success = email_service.send_pdf_email(
                recipient_email=user_email,
                pdf_path=pdf_path,
                document_type=document_type,
                user_name=user_name
            )
            
            if success:
                logger.info(f"Email sent successfully to {user_email}")
                # Update email_sent status
                update_email_sent_status(order_reference, True)
            else:
                logger.error(f"Failed to send email to {user_email}")
        else:
            logger.error(f"No email address found for {order_reference}")
            
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")

def update_email_sent_status(order_reference, email_sent):
    """Update email sent status in database"""
    try:
        db_config = {
            'host': os.getenv('DB_HOST'),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'database': os.getenv('DB_NAME'),
            'port': int(os.getenv('DB_PORT', 3306))
        }
        
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        update_query = """
        UPDATE manual_payments 
        SET email_sent = %s, 
            updated_at = %s
        WHERE order_reference = %s
        """
        
        cursor.execute(update_query, (email_sent, datetime.now(), order_reference))
        conn.commit()
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        logger.error(f"Error updating email sent status: {str(e)}")

def render_payment_success_page(order_reference, payment_reference, amount):
    """Render payment success page with download link"""
    success_page_html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Successful - Prowrite Solutions</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }}
            .success-container {{
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                text-align: center;
            }}
            .success-icon {{
                font-size: 64px;
                color: #28a745;
                margin-bottom: 20px;
            }}
            .order-info {{
                background: #f8f9fa;
                padding: 20px;
                border-radius: 5px;
                margin: 20px 0;
                text-align: left;
            }}
            .download-section {{
                margin: 30px 0;
                padding: 20px;
                background: #e8f5e8;
                border-radius: 5px;
                border: 2px solid #28a745;
            }}
            .download-btn {{
                background: #28a745;
                color: white;
                padding: 15px 30px;
                border: none;
                border-radius: 5px;
                font-size: 18px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                margin: 10px;
            }}
            .download-btn:hover {{
                background: #218838;
            }}
            .processing-notice {{
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <div class="success-container">
            <div class="success-icon">✅</div>
            <h1>Payment Successful!</h1>
            <p>Thank you for your payment. Your document is being processed.</p>
            
            <div class="order-info">
                <h3>Order Details</h3>
                <p><strong>Order Reference:</strong> {order_reference}</p>
                <p><strong>Payment Reference:</strong> {payment_reference or 'N/A'}</p>
                <p><strong>Amount:</strong> KES {amount or 'N/A'}</p>
                <p><strong>Status:</strong> <span style="color: #28a745;">Completed</span></p>
            </div>
            
            <div class="processing-notice">
                <h4>📧 Email Notification</h4>
                <p>Your document is being generated and will be sent to your email address shortly. 
                Please check your inbox (and spam folder) in the next few minutes.</p>
            </div>
            
            <div class="download-section">
                <h3>📄 Download Your Document</h3>
                <p>You can also download your document directly:</p>
                <a href="/api/payments/pesapal/download/{order_reference}" class="download-btn">
                    Download PDF
                </a>
                <p style="font-size: 14px; color: #666; margin-top: 10px;">
                    Note: Download will be available once processing is complete (usually within 2-3 minutes)
                </p>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #e9ecef; border-radius: 5px;">
                <h4>What's Next?</h4>
                <ul style="text-align: left; max-width: 500px; margin: 0 auto;">
                    <li>✅ Payment confirmed</li>
                    <li>🔄 Document being generated</li>
                    <li>📧 Email will be sent shortly</li>
                    <li>📄 Download link available above</li>
                </ul>
            </div>
            
            <div style="margin-top: 20px; font-size: 14px; color: #666;">
                <p>If you have any questions, please contact our support team.</p>
                <p><strong>ProWrite Solutions</strong> - Professional Resume & Cover Letter Generator</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return success_page_html

def render_payment_error_page(error_message):
    """Render payment error page"""
    error_page_html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Error - Prowrite Solutions</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }}
            .error-container {{
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                text-align: center;
            }}
            .error-icon {{
                font-size: 64px;
                color: #dc3545;
                margin-bottom: 20px;
            }}
            .error-message {{
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
                padding: 20px;
                border-radius: 5px;
                margin: 20px 0;
            }}
            .contact-info {{
                background: #e9ecef;
                padding: 20px;
                border-radius: 5px;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <div class="error-container">
            <div class="error-icon">❌</div>
            <h1>Payment Processing Error</h1>
            
            <div class="error-message">
                <h3>Error Details:</h3>
                <p>{error_message}</p>
            </div>
            
            <div class="contact-info">
                <h4>What to do next:</h4>
                <ul style="text-align: left; max-width: 500px; margin: 0 auto;">
                    <li>✅ Check if payment was actually completed</li>
                    <li>📧 Contact our support team with your order details</li>
                    <li>🔄 Try the payment process again if needed</li>
                    <li>📞 Call us if you need immediate assistance</li>
                </ul>
            </div>
            
            <div style="margin-top: 20px; font-size: 14px; color: #666;">
                <p>If you have any questions, please contact our support team.</p>
                <p><strong>ProWrite Solutions</strong> - Professional Resume & Cover Letter Generator</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return error_page_html

@pesapal_embedded_bp.route('/download/<order_reference>', methods=['GET'])
def download_pdf(order_reference):
    """Download PDF for completed payment"""
    try:
        # Get submission data from database
        submission_data = get_submission_data(order_reference)
        if not submission_data:
            return jsonify({
                'success': False,
                'message': 'Order not found'
            }), 404
        
        # Check if payment is completed
        if submission_data.get('status') != 'COMPLETED':
            return jsonify({
                'success': False,
                'message': 'Payment not completed yet'
            }), 400
        
        # Get PDF path
        pdf_path = submission_data.get('pdf_path')
        if not pdf_path or not os.path.exists(pdf_path):
            return jsonify({
                'success': False,
                'message': 'PDF not ready yet. Please wait a few minutes and try again.'
            }), 404
        
        # Send file for download
        return send_file(
            pdf_path,
            as_attachment=True,
            download_name=f"resume_{order_reference}.pdf",
            mimetype='application/pdf'
        )
        
    except Exception as e:
        logger.error(f"Error downloading PDF for {order_reference}: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error downloading PDF: {str(e)}'
        }), 500
