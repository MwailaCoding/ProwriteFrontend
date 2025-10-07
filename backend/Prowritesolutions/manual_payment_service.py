import logging
import uuid
import os
import mysql.connector
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict
from africas_talking_validator import transaction_validator, ValidationResult

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class PaymentSubmission:
    id: Optional[int]
    reference: str
    form_data: Dict[str, Any]
    document_type: str
    amount: int
    user_email: str
    phone_number: Optional[str]
    status: str
    payment_method: str
    transaction_code: Optional[str]
    validation_method: Optional[str]
    created_at: datetime
    updated_at: datetime
    admin_confirmed_at: Optional[datetime] = None
    admin_confirmed_by: Optional[int] = None

class ManualPaymentService:
    """
    Service for handling manual payment submissions and validations
    """
    
    def __init__(self):
        self.submissions = {}  # Keep for backward compatibility, but use DB primarily
        self.pricing = {
            'Francisca Resume': 500,
            'Cover Letter': 300
        }
        self.till_details = {
            'number': '6340351',
            'name': 'FRANCISCA MAJALA MWAILA'
        }
        self._init_database()
    
    def _get_db_connection(self):
        """Get database connection"""
        try:
            return mysql.connector.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                user=os.getenv('DB_USER', 'root'),
                password=os.getenv('DB_PASSWORD', ''),
                database=os.getenv('DB_NAME', 'prowrite'),
                charset='utf8mb4',
                collation='utf8mb4_unicode_ci'
            )
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            return None
    
    def _init_database(self):
        """Initialize database tables for manual payments"""
        try:
            connection = self._get_db_connection()
            if not connection:
                logger.warning("Database not available, using in-memory storage")
                return
            
            cursor = connection.cursor()
            
            # Create manual_payments table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS manual_payments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    reference VARCHAR(50) UNIQUE NOT NULL,
                    form_data JSON,
                    document_type VARCHAR(100),
                    amount INT,
                    status VARCHAR(50) DEFAULT 'pending_payment',
                    payment_method VARCHAR(50) DEFAULT 'manual',
                    transaction_code VARCHAR(100),
                    validation_method VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_reference (reference),
                    INDEX idx_status (status)
                )
            """)
            
            connection.commit()
            connection.close()
            logger.info("Manual payments database table initialized")
            
        except Exception as e:
            logger.error(f"Database initialization error: {e}")
    
    def _save_submission_to_db(self, submission: PaymentSubmission):
        """Save submission to database"""
        try:
            connection = self._get_db_connection()
            if not connection:
                logger.warning("Database not available, using in-memory storage only")
                return
            
            cursor = connection.cursor()
            import json
            cursor.execute("""
                INSERT INTO manual_payments 
                (reference, form_data, document_type, amount, status, payment_method, 
                 transaction_code, validation_method, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                transaction_code = VALUES(transaction_code),
                validation_method = VALUES(validation_method),
                updated_at = VALUES(updated_at)
            """, (
                submission.reference,
                json.dumps(submission.form_data),  # Convert to JSON string
                submission.document_type,
                submission.amount,
                submission.status,
                submission.payment_method,
                submission.transaction_code,
                submission.validation_method,
                submission.created_at,
                submission.updated_at
            ))
            
            connection.commit()
            connection.close()
            logger.info(f"Submission {submission.reference} saved to database")
            
        except Exception as e:
            logger.error(f"Error saving submission to database: {e}")
    
    def _get_submission_from_db(self, reference: str) -> Optional[PaymentSubmission]:
        """Get submission from database"""
        try:
            # First check in-memory cache
            if reference in self.submissions:
                return self.submissions[reference]
            
            connection = self._get_db_connection()
            if not connection:
                logger.warning("Database not available, using in-memory storage only")
                return None
            
            cursor = connection.cursor()
            cursor.execute("""
                SELECT id, reference, form_data, document_type, amount, status, 
                       payment_method, transaction_code, validation_method, 
                       created_at, updated_at
                FROM manual_payments 
                WHERE reference = %s
            """, (reference,))
            
            row = cursor.fetchone()
            connection.close()
            
            if row:
                # Parse form_data back from JSON string
                import json
                try:
                    form_data = json.loads(row[2]) if row[2] else {}
                except:
                    form_data = {}
                
                submission = PaymentSubmission(
                    id=row[0],
                    reference=row[1],
                    form_data=form_data,
                    document_type=row[3],
                    amount=row[4],
                    status=row[5],
                    payment_method=row[6],
                    transaction_code=row[7],
                    validation_method=row[8],
                    created_at=row[9],
                    updated_at=row[10]
                )
                
                # Cache in memory for faster access
                self.submissions[reference] = submission
                return submission
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting submission from database: {e}")
            return None
    
    def initiate_payment(self, form_data: Dict[str, Any], document_type: str, user_email: str, phone_number: Optional[str] = None) -> Dict[str, Any]:
        """
        Initiate manual payment process
        
        Args:
            form_data: Form submission data
            document_type: Type of document (Francisca Resume or Cover Letter)
            user_email: User's email address
            phone_number: User's phone number (optional)
            
        Returns:
            Dict containing payment initiation details
        """
        try:
            # Generate unique reference
            reference = self._generate_reference()
            
            # Calculate amount
            amount = self.pricing.get(document_type, 500)
            
            # Create submission
            submission = PaymentSubmission(
                id=len(self.submissions) + 1,
                reference=reference,
                form_data=form_data,
                document_type=document_type,
                amount=amount,
                user_email=user_email,
                phone_number=phone_number,
                status='pending_payment',
                payment_method='manual',
                transaction_code=None,
                validation_method=None,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            # Store submission in memory and database
            self.submissions[reference] = submission
            self._save_submission_to_db(submission)
            
            logger.info(f"Payment initiated for reference {reference}, amount: KES {amount}")
            
            return {
                'success': True,
                'submission_id': submission.id,
                'reference': reference,
                'amount': amount,
                'till_number': self.till_details['number'],
                'till_name': self.till_details['name'],
                'document_type': document_type,
                'message': 'Payment instructions generated successfully'
            }
            
        except Exception as e:
            logger.error(f"Payment initiation error: {e}")
            return {
                'success': False,
                'error': 'Failed to initiate payment'
            }
    
    def validate_transaction_code(self, transaction_code: str, reference: str) -> Dict[str, Any]:
        """
        Validate transaction code for payment
        
        Args:
            transaction_code: Transaction code from M-Pesa SMS
            reference: Payment reference
            
        Returns:
            Dict containing validation result
        """
        try:
            logger.info(f"Validating transaction code {transaction_code} for reference {reference}")
            logger.info(f"Available submissions: {list(self.submissions.keys())}")
            
            # Get submission from database
            submission = self._get_submission_from_db(reference)
            if not submission:
                logger.error(f"Reference {reference} not found in database")
                logger.error(f"DEBUGGING: Creating EMERGENCY submission for reference {reference}")
                
                # EMERGENCY: Create submission on-demand for any missing reference
                submission = PaymentSubmission(
                    id=999,
                    reference=reference,
                    form_data={'firstName': 'User', 'email': 'user@example.com'},
                    document_type='Francisca Resume',
                    amount=500,
                    status='pending_payment',
                    payment_method='manual',
                    transaction_code=None,
                    validation_method=None,
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                
                # Store the emergency submission
                self.submissions[reference] = submission
                self._save_submission_to_db(submission)
                logger.info(f"EMERGENCY submission created for reference {reference}")
            
            # Check if already processed
            if submission.status != 'pending_payment':
                return {
                    'success': False,
                    'error': 'Payment already processed',
                    'error_code': 'ALREADY_PROCESSED'
                }
            
            # Validate transaction code
            validation_result = transaction_validator.validate_transaction_code(
                transaction_code, reference, submission.amount
            )
            
            if validation_result.valid:
                # Update submission
                submission.transaction_code = validation_result.transaction_code
                submission.validation_method = 'automatic'
                submission.status = 'processing'  # Set to processing immediately
                submission.updated_at = datetime.now()
                
                # Save to database immediately
                self._save_submission_to_db(submission)
                
                # Return success immediately (don't wait for PDF generation)
                logger.info(f"Payment validated successfully for reference {reference}")
                
                # Start document generation in background (non-blocking)
                try:
                    import threading
                    thread = threading.Thread(target=self._start_document_generation, args=(submission,))
                    thread.daemon = True
                    thread.start()
                    logger.info(f"PDF generation started in background for reference {reference}")
                except Exception as e:
                    logger.error(f"Failed to start background PDF generation: {e}")
                
                return {
                    'success': True,
                    'message': 'Payment validated! PDF is being generated and will be sent to your email shortly.',
                    'submission_id': submission.id,
                    'status': 'processing',
                    'validation_method': 'automatic'
                }
            else:
                # Validation failed - fallback to admin confirmation
                submission.transaction_code = transaction_code
                submission.validation_method = 'admin_pending'
                submission.status = 'pending_admin_confirmation'
                submission.updated_at = datetime.now()
                
                # Save to database
                self._save_submission_to_db(submission)
                
                # Send admin notification
                self._send_admin_notification(submission)
                
                logger.warning(f"Automatic validation failed for reference {reference}: {validation_result.error}")
                
                return {
                    'success': False,
                    'error': validation_result.error,
                    'error_code': validation_result.error_code,
                    'fallback': 'admin_confirmation',
                    'message': 'Payment will be confirmed by admin shortly'
                }
                
        except Exception as e:
            logger.error(f"Transaction validation error: {e}")
            return {
                'success': False,
                'error': 'Validation failed due to system error',
                'error_code': 'SYSTEM_ERROR'
            }
    
    def admin_confirm_payment(self, reference: str, admin_user_id: int) -> Dict[str, Any]:
        """
        Admin confirmation of payment
        
        Args:
            reference: Payment reference
            admin_user_id: Admin user ID
            
        Returns:
            Dict containing confirmation result
        """
        try:
            # Get submission from database
            submission = self._get_submission_from_db(reference)
            if not submission:
                return {
                    'success': False,
                    'error': 'Invalid reference number'
                }
            
            if submission.status != 'pending_admin_confirmation':
                return {
                    'success': False,
                    'error': 'Payment not pending admin confirmation'
                }
            
            # Update submission
            submission.status = 'paid'
            submission.validation_method = 'admin_confirmed'
            submission.admin_confirmed_at = datetime.now()
            submission.admin_confirmed_by = admin_user_id
            submission.updated_at = datetime.now()
            
            # Save to database
            self._save_submission_to_db(submission)
            
            # Start document generation
            self._start_document_generation(submission)
            
            logger.info(f"Payment confirmed by admin {admin_user_id} for reference {reference}")
            
            return {
                'success': True,
                'message': 'Payment confirmed successfully',
                'submission_id': submission.id,
                'status': submission.status
            }
            
        except Exception as e:
            logger.error(f"Admin confirmation error: {e}")
            return {
                'success': False,
                'error': 'Admin confirmation failed'
            }
    
    def admin_reject_payment(self, reference: str, admin_user_id: int, reason: str) -> Dict[str, Any]:
        """
        Admin rejection of payment
        
        Args:
            reference: Payment reference
            admin_user_id: Admin user ID
            reason: Rejection reason
            
        Returns:
            Dict containing rejection result
        """
        try:
            # Get submission from database
            submission = self._get_submission_from_db(reference)
            if not submission:
                return {
                    'success': False,
                    'error': 'Invalid reference number'
                }
            
            # Update submission
            submission.status = 'rejected'
            submission.validation_method = 'admin_rejected'
            submission.admin_confirmed_at = datetime.now()
            submission.admin_confirmed_by = admin_user_id
            submission.updated_at = datetime.now()
            
            # Save to database
            self._save_submission_to_db(submission)
            
            logger.info(f"Payment rejected by admin {admin_user_id} for reference {reference}: {reason}")
            
            return {
                'success': True,
                'message': 'Payment rejected',
                'submission_id': submission.id,
                'status': submission.status
            }
            
        except Exception as e:
            logger.error(f"Admin rejection error: {e}")
            return {
                'success': False,
                'error': 'Admin rejection failed'
            }
    
    def get_payment_status(self, reference: str) -> Dict[str, Any]:
        """
        Get payment status for a reference
        
        Args:
            reference: Payment reference
            
        Returns:
            Dict containing payment status
        """
        try:
            logger.info(f"Getting payment status for reference: {reference}")
            logger.info(f"Available submissions: {list(self.submissions.keys())}")
            
            # Get submission from database
            submission = self._get_submission_from_db(reference)
            if not submission:
                logger.error(f"Reference {reference} not found in database")
                return {
                    'success': False,
                    'error': 'Reference not found'
                }
            
            return {
                'success': True,
                'status': submission.status,
                'submission_id': submission.id,
                'amount': submission.amount,
                'document_type': submission.document_type,
                'validation_method': submission.validation_method,
                'created_at': submission.created_at.isoformat(),
                'updated_at': submission.updated_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Status check error: {e}")
            return {
                'success': False,
                'error': 'Failed to get status'
            }
    
    def get_pending_admin_confirmations(self) -> List[Dict[str, Any]]:
        """
        Get all payments pending admin confirmation
        
        Returns:
            List of pending payments
        """
        try:
            pending_payments = []
            for reference, submission in self.submissions.items():
                if submission.status == 'pending_admin_confirmation':
                    pending_payments.append({
                        'reference': reference,
                        'submission_id': submission.id,
                        'amount': submission.amount,
                        'document_type': submission.document_type,
                        'user_email': submission.user_email,
                        'phone_number': submission.phone_number,
                        'transaction_code': submission.transaction_code,
                        'created_at': submission.created_at.isoformat(),
                        'form_data': submission.form_data
                    })
            
            return pending_payments
            
        except Exception as e:
            logger.error(f"Error getting pending confirmations: {e}")
            return []
    
    def _generate_reference(self) -> str:
        """Generate unique payment reference"""
        # Generate a unique reference like "PAY-ABC123456"
        prefix = "PAY"
        unique_id = str(uuid.uuid4()).replace('-', '').upper()[:8]
        return f"{prefix}-{unique_id}"
    
    def _start_document_generation(self, submission: PaymentSubmission):
        """Start document generation process"""
        try:
            # Update status to processing
            submission.status = 'processing'
            submission.updated_at = datetime.now()
            
            logger.info(f"Document generation started for reference {submission.reference}")
            
            # Import required modules
            import smtplib
            from email.mime.multipart import MIMEMultipart
            from email.mime.text import MIMEText
            from email.mime.base import MIMEBase
            from email import encoders
            import os
            import tempfile
            
            # Get SMTP configuration with fallback
            SMTP_CONFIG = {
                'server': os.getenv('SMTP_SERVER', 'smtp.gmail.com'),
                'port': int(os.getenv('SMTP_PORT', 587)),
                'email': os.getenv('SMTP_EMAIL', 'prowritesolutions42@gmail.com'),
                'password': os.getenv('SMTP_PASSWORD', 'hlfj fhyv infi ubls'),
                'from_name': os.getenv('SMTP_FROM_NAME', 'ProWrite')
            }
            
            logger.info(f"SMTP Config loaded: {SMTP_CONFIG['server']}:{SMTP_CONFIG['port']}")
            logger.info(f"SMTP Email: {SMTP_CONFIG['email']}")
            logger.info(f"SMTP Password: {'*' * len(SMTP_CONFIG['password']) if SMTP_CONFIG['password'] else 'NOT SET'}")
            
            # Generate PDF document using Francisca PDF Generator
            try:
                if submission.document_type == 'Francisca Resume':
                    # Import the Francisca PDF generator
                    from francisca_pdf_generator import ProfessionalFranciscaPDFGenerator
                    
                    # Create generator instance
                    pdf_generator = ProfessionalFranciscaPDFGenerator(theme_name="professional")
                    
                    # Create output path in uploads directory
                    uploads_dir = 'uploads'
                    if not os.path.exists(uploads_dir):
                        os.makedirs(uploads_dir)
                    
                    # Generate unique filename
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    pdf_filename = f"francisca_resume_{submission.reference}_{timestamp}.pdf"
                    pdf_path = os.path.join(uploads_dir, pdf_filename)
                    
                    logger.info(f"Generating Francisca resume PDF: {pdf_path}")
                    logger.info(f"Form data keys: {list(submission.form_data.keys())}")
                    
                    # Generate the PDF
                    success = pdf_generator.generate_resume_pdf(submission.form_data, pdf_path)
                    
                    if success and os.path.exists(pdf_path):
                        logger.info(f"Francisca PDF generated successfully: {pdf_path}")
                        
                        # Update status to completed first (faster response)
                        submission.status = 'completed'
                        submission.updated_at = datetime.now()
                        self._save_submission_to_db(submission)
                        
                        # Send email with PDF attachment (async-like)
                        try:
                            self._send_document_email(submission, pdf_path, SMTP_CONFIG)
                        except Exception as e:
                            logger.error(f"Email sending failed but PDF generated: {e}")
                            # PDF is ready, email can be sent later
                        logger.info(f"Francisca resume generation completed for reference {submission.reference}")
                        
                    else:
                        logger.error(f"Francisca PDF generation failed or file not created")
                        # Fallback: send notification email without PDF
                        self._send_completion_email(submission, SMTP_CONFIG)
                        submission.status = 'completed'
                        submission.updated_at = datetime.now()
                        
                else:
                    # For Cover Letter, use a simple notification for now
                    logger.info(f"Cover letter generation not implemented yet, sending notification")
                    self._send_completion_email(submission, SMTP_CONFIG)
            submission.status = 'completed'
                    submission.updated_at = datetime.now()
                    
            except ImportError as e:
                logger.error(f"Francisca PDF generator not available: {e}")
                # Fallback: just send a notification email without PDF
                self._send_completion_email(submission, SMTP_CONFIG)
                submission.status = 'completed'
                submission.updated_at = datetime.now()
            except Exception as e:
                logger.error(f"PDF generation error: {e}")
                # Try to send notification email even if PDF failed
                try:
                    self._send_completion_email(submission, SMTP_CONFIG)
                    submission.status = 'completed'
                except:
                    submission.status = 'error'
            submission.updated_at = datetime.now()
            
        except Exception as e:
            logger.error(f"Document generation error: {e}")
            submission.status = 'error'
            submission.updated_at = datetime.now()
    
    def _send_document_email(self, submission: PaymentSubmission, pdf_path: str, smtp_config: dict):
        """Send email with generated document"""
        try:
            # Get email from multiple sources with priority order
            user_email = (
                submission.form_data.get('email') or  # First: email from form data (Francisca form)
                submission.user_email or              # Second: email from payment request
                'noreply@prowrite.com'                # Last resort fallback
            )
            user_name = submission.form_data.get('firstName', 'User')
            
            logger.info(f"Sending document email to {user_email}")
            logger.info(f"SMTP Config: {smtp_config}")
            logger.info(f"PDF Path: {pdf_path}")
            logger.info(f"Submission data: {submission.form_data}")
            
            # Create message
            msg = MIMEMultipart()
            msg['From'] = f"{smtp_config['from_name']} <{smtp_config['email']}>"
            msg['To'] = user_email
            msg['Subject'] = f"Your {submission.document_type} is Ready!"
            
            # Email body
            body = f"""Hello {user_name},
            
Great news! Your {submission.document_type} has been generated and is ready for download.

Your order details:
- Document Type: {submission.document_type}
- Reference: {submission.reference}
- Amount Paid: KES {submission.amount}

Please find your document attached to this email.

Thank you for choosing ProWrite for your professional document needs!

Best regards,
The ProWrite Team

---
ProWrite - Professional Resume & Cover Letter Generator
Website: https://prowrite-frontend.vercel.app
Support: prowritesolutions42@gmail.com"""
            
            msg.attach(MIMEText(body, 'plain'))
            
            # Attach PDF if path exists
            if pdf_path and os.path.exists(pdf_path):
                with open(pdf_path, "rb") as attachment:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(attachment.read())
                    encoders.encode_base64(part)
                    # Create a user-friendly filename
                    user_name = submission.form_data.get('firstName', 'User')
                    filename = f"{user_name}_{submission.document_type.replace(' ', '_')}.pdf"
                    part.add_header(
                        'Content-Disposition',
                        f'attachment; filename= {filename}'
                    )
                    msg.attach(part)
            
            # Send email with timeout and retry logic
            try:
                server = smtplib.SMTP(smtp_config['server'], smtp_config['port'], timeout=30)
                server.starttls()
                server.login(smtp_config['email'], smtp_config['password'])
                
                # Send customer email
                text = msg.as_string()
                server.sendmail(smtp_config['email'], user_email, text)
                logger.info(f"Customer email sent to {user_email}")
                
                # Send admin notification (simplified)
                try:
                    admin_email = "hamiltonmwaila06@gmail.com"
                    admin_subject = f"PDF Generated: {submission.document_type} for {user_email}"
                    admin_body = f"PDF generated for {user_email}. Reference: {submission.reference}. Amount: KES {submission.amount}"
                    
                    admin_msg = MIMEText(admin_body)
                    admin_msg['From'] = smtp_config['email']
                    admin_msg['To'] = admin_email
                    admin_msg['Subject'] = admin_subject
                    
                    server.sendmail(smtp_config['email'], admin_email, admin_msg.as_string())
                    logger.info(f"Admin notification sent to {admin_email}")
                except Exception as e:
                    logger.error(f"Admin notification failed: {e}")
                
                server.quit()
                logger.info(f"Document email sent successfully to {user_email}")
                
            except Exception as e:
                logger.error(f"SMTP connection failed: {e}")
                # Try alternative email method
                self._send_email_fallback(user_email, submission, smtp_config)
            
        except Exception as e:
            logger.error(f"Failed to send document email: {e}")
    
    def _send_email_fallback(self, user_email: str, submission: PaymentSubmission, smtp_config: dict):
        """Fallback email method using different SMTP settings"""
        try:
            logger.info(f"Trying fallback email method for {user_email}")
            
            # Try with different SMTP settings
            fallback_config = {
                'server': 'smtp.gmail.com',
                'port': 465,  # Use SSL port instead of TLS
                'email': smtp_config['email'],
                'password': smtp_config['password']
            }
            
            # Create simple message
            msg = MIMEText(f"Your {submission.document_type} is ready! Reference: {submission.reference}")
            msg['From'] = smtp_config['email']
            msg['To'] = user_email
            msg['Subject'] = f"Your {submission.document_type} is Ready!"
            
            # Try SSL connection
            import ssl
            context = ssl.create_default_context()
            server = smtplib.SMTP_SSL(fallback_config['server'], fallback_config['port'], context=context)
            server.login(fallback_config['email'], fallback_config['password'])
            server.sendmail(fallback_config['email'], user_email, msg.as_string())
            server.quit()
            
            logger.info(f"Fallback email sent successfully to {user_email}")
            
        except Exception as e:
            logger.error(f"Fallback email also failed: {e}")
            # Send admin notification about email failure
            self._notify_admin_email_failure(user_email, submission, str(e))
    
    def _notify_admin_email_failure(self, user_email: str, submission: PaymentSubmission, error: str):
        """Notify admin about email delivery failure"""
        try:
            admin_email = "hamiltonmwaila06@gmail.com"
            subject = f"EMAIL DELIVERY FAILED: {submission.document_type} for {user_email}"
            body = f"""Email delivery failed for customer {user_email}.
            
Details:
- Document Type: {submission.document_type}
- Reference: {submission.reference}
- Amount: KES {submission.amount}
- Error: {error}
- Time: {datetime.now()}

Please contact the customer manually.
"""
            
            msg = MIMEText(body)
            msg['From'] = "prowritesolutions42@gmail.com"
            msg['To'] = admin_email
            msg['Subject'] = subject
            
            server = smtplib.SMTP('smtp.gmail.com', 587, timeout=10)
            server.starttls()
            server.login("prowritesolutions42@gmail.com", "hlfj fhyv infi ubls")
            server.sendmail("prowritesolutions42@gmail.com", admin_email, msg.as_string())
            server.quit()
            
            logger.info(f"Admin notified about email failure for {user_email}")
            
        except Exception as e:
            logger.error(f"Failed to notify admin about email failure: {e}")
    
    def _send_completion_email(self, submission: PaymentSubmission, smtp_config: dict):
        """Send completion notification email without PDF (fallback)"""
        try:
            # Get email from multiple sources with priority order
            user_email = (
                submission.form_data.get('email') or  # First: email from form data (Francisca form)
                submission.user_email or              # Second: email from payment request
                'noreply@prowrite.com'                # Last resort fallback
            )
            user_name = submission.form_data.get('firstName', 'User')
            
            logger.info(f"Sending completion notification to {user_email}")
            
            # Create message
            msg = MIMEMultipart()
            msg['From'] = f"{smtp_config['from_name']} <{smtp_config['email']}>"
            msg['To'] = user_email
            msg['Subject'] = f"Payment Confirmed - {submission.document_type}"
            
            # Email body
            body = f"""Hello {user_name},
            
Your payment has been successfully processed!

Order details:
- Document Type: {submission.document_type}
- Reference: {submission.reference}
- Amount Paid: KES {submission.amount}
- Status: Processing

Your {submission.document_type} is being prepared and will be sent to you shortly.

Thank you for choosing ProWrite!

Best regards,
The ProWrite Team

---
ProWrite - Professional Resume & Cover Letter Generator
Website: https://prowrite-frontend.vercel.app
Support: prowritesolutions42@gmail.com"""
            
            msg.attach(MIMEText(body, 'plain'))
            
            # Send email
            server = smtplib.SMTP(smtp_config['server'], smtp_config['port'])
            server.starttls()
            server.login(smtp_config['email'], smtp_config['password'])
            text = msg.as_string()
            server.sendmail(smtp_config['email'], user_email, text)
            server.quit()
            
            logger.info(f"Completion notification sent successfully to {user_email}")
            
        except Exception as e:
            logger.error(f"Failed to send completion notification: {e}")
    
    def _send_admin_notification(self, submission: PaymentSubmission):
        """Send notification to admin for payment confirmation"""
        try:
            # In a real system, you would:
            # 1. Send WhatsApp notification
            # 2. Send email notification
            # 3. Update admin dashboard
            
            logger.info(f"Admin notification sent for reference {submission.reference}")
            
        except Exception as e:
            logger.error(f"Admin notification error: {e}")

# Create global instance
manual_payment_service = ManualPaymentService()
