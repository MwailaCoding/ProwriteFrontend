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
    id: int
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
    pdf_path: Optional[str] = None
    created_at: datetime = None
    updated_at: datetime = None

class FastManualPaymentService:
    """
    Ultra-fast manual payment service with background processing
    """
    
    def __init__(self):
        self.submissions = {}  # Keep for backward compatibility
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
                return
            
            cursor = connection.cursor()
            import json
            cursor.execute("""
                INSERT INTO manual_payments 
                (reference, form_data, document_type, amount, status, payment_method, 
                 transaction_code, validation_method, pdf_path, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                transaction_code = VALUES(transaction_code),
                validation_method = VALUES(validation_method),
                pdf_path = VALUES(pdf_path),
                updated_at = VALUES(updated_at)
            """, (
                submission.reference,
                json.dumps(submission.form_data),
                submission.document_type,
                submission.amount,
                submission.status,
                submission.payment_method,
                submission.transaction_code,
                submission.validation_method,
                submission.pdf_path,
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
            if reference in self.submissions:
                return self.submissions[reference]
            
            connection = self._get_db_connection()
            if not connection:
                return None
            
            cursor = connection.cursor()
            cursor.execute("""
                SELECT id, reference, form_data, document_type, amount, status, 
                       payment_method, transaction_code, validation_method, 
                       pdf_path, created_at, updated_at
                FROM manual_payments 
                WHERE reference = %s
            """, (reference,))
            
            row = cursor.fetchone()
            connection.close()
            
            if row:
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
                    user_email='',  # Will be filled from form_data
                    phone_number='',
                    status=row[5],
                    payment_method=row[6],
                    transaction_code=row[7],
                    validation_method=row[8],
                    pdf_path=row[9],
                    created_at=row[10],
                    updated_at=row[11]
                )
                
                self.submissions[reference] = submission
                return submission
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting submission from database: {e}")
            return None
    
    def initiate_payment(self, form_data: Dict[str, Any], document_type: str, user_email: str, phone_number: Optional[str] = None) -> Dict[str, Any]:
        """Initiate manual payment process"""
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
                'reference': reference,
                'amount': amount,
                'till_number': self.till_details['number'],
                'till_name': self.till_details['name'],
                'document_type': document_type,
                'message': f'Payment initiated. Pay KES {amount} to Till {self.till_details["number"]}'
            }
            
        except Exception as e:
            logger.error(f"Payment initiation error: {e}")
            return {
                'success': False,
                'error': 'Payment initiation failed'
            }
    
    def validate_transaction_code(self, transaction_code: str, reference: str) -> Dict[str, Any]:
        """Validate transaction code for payment (ULTRA-FAST)"""
        try:
            logger.info(f"FAST VALIDATION: Processing {transaction_code} for {reference}")
            
            # Get submission from database
            submission = self._get_submission_from_db(reference)
            if not submission:
                logger.error(f"Reference {reference} not found in database")
                # EMERGENCY: Create submission on-demand
                submission = PaymentSubmission(
                    id=999,
                    reference=reference,
                    form_data={'firstName': 'User', 'email': 'user@example.com'},
                    document_type='Francisca Resume',
                    amount=500,
                    user_email='user@example.com',
                    phone_number='',
                    status='pending_payment',
                    payment_method='manual',
                    transaction_code=None,
                    validation_method=None,
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                self.submissions[reference] = submission
                self._save_submission_to_db(submission)
                logger.info(f"Emergency submission created for reference {reference}")
            
            # Check if already processed
            if submission.status != 'pending_payment':
                return {
                    'success': False,
                    'error': 'Payment already processed',
                    'error_code': 'ALREADY_PROCESSED'
                }
            
            # Validate transaction code (FAST)
            validation_result = transaction_validator.validate_transaction_code(
                transaction_code, reference, submission.amount
            )
            
            if validation_result.valid:
                # Update submission IMMEDIATELY
                submission.transaction_code = validation_result.transaction_code
                submission.validation_method = 'automatic'
                submission.status = 'processing'
                submission.updated_at = datetime.now()
                
                # Save to database IMMEDIATELY
                self._save_submission_to_db(submission)
                
                # Return success IMMEDIATELY (don't wait for PDF)
                logger.info(f"FAST VALIDATION: Payment validated for {reference}")
                
                # Start PDF generation in background (non-blocking)
                try:
                    import threading
                    thread = threading.Thread(target=self._fast_generate_pdf, args=(submission,))
                    thread.daemon = True
                    thread.start()
                    logger.info(f"Background PDF generation started for {reference}")
                except Exception as e:
                    logger.error(f"Failed to start background PDF: {e}")
                
                return {
                    'success': True,
                    'message': 'Payment validated! PDF is being generated and will be sent to your email shortly.',
                    'submission_id': submission.id,
                    'status': 'processing',
                    'validation_method': 'automatic',
                    'auto_download': True,
                    'download_url': f'/api/payments/manual/download/{reference}'
                }
            else:
                return {
                    'success': False,
                    'error': validation_result.error,
                    'error_code': validation_result.error_code
                }
            
        except Exception as e:
            logger.error(f"Validation error: {e}")
            return {
                'success': False,
                'error': 'Validation failed due to system error',
                'error_code': 'SYSTEM_ERROR'
            }
    
    def _fast_generate_pdf(self, submission: PaymentSubmission):
        """Ultra-fast PDF generation in background"""
        try:
            logger.info(f"FAST PDF: Starting generation for {submission.reference}")
            
            # Pre-configured SMTP for speed
            SMTP_CONFIG = {
                'server': 'smtp.gmail.com',
                'port': 587,
                'email': 'prowritesolutions42@gmail.com',
                'password': 'hlfj fhyv infi ubls',
                'from_name': 'ProWrite'
            }
            
            # Fast PDF generation
            if submission.document_type == 'Francisca Resume':
                try:
                    from francisca_pdf_generator import ProfessionalFranciscaPDFGenerator
                    import os
                    
                    # Create uploads directory
                    uploads_dir = 'uploads'
                    if not os.path.exists(uploads_dir):
                        os.makedirs(uploads_dir)
                    
                    # Simple filename for speed
                    pdf_filename = f"resume_{submission.reference}.pdf"
                    pdf_path = os.path.join(uploads_dir, pdf_filename)
                    
                    # Generate PDF
                    pdf_generator = ProfessionalFranciscaPDFGenerator(theme_name="professional")
                    success = pdf_generator.generate_resume_pdf(submission.form_data, pdf_path)
                    
                    if success and os.path.exists(pdf_path):
                        logger.info(f"FAST PDF: Generated {pdf_filename}")
                        
                        # Update status and store PDF path
                        submission.status = 'completed'
                        submission.pdf_path = pdf_path
                        submission.updated_at = datetime.now()
                        self._save_submission_to_db(submission)
                        
                        # Send email quickly
                        self._send_fast_email(submission, pdf_path, SMTP_CONFIG)
                        
                    else:
                        logger.error(f"FAST PDF: Generation failed for {submission.reference}")
                        self._send_fast_completion_email(submission, SMTP_CONFIG)
                        
                except Exception as e:
                    logger.error(f"FAST PDF: Error {e}")
                    self._send_fast_completion_email(submission, SMTP_CONFIG)
            
        except Exception as e:
            logger.error(f"FAST PDF: Background error {e}")
            submission.status = 'error'
            submission.updated_at = datetime.now()
            self._save_submission_to_db(submission)
    
    def _send_fast_email(self, submission: PaymentSubmission, pdf_path: str, smtp_config: dict):
        """Ultra-fast email sending"""
        try:
            # Get email
            user_email = (
                submission.form_data.get('email') or
                submission.user_email or
                'noreply@prowrite.com'
            )
            user_name = submission.form_data.get('firstName', 'User')
            
            logger.info(f"FAST EMAIL: Sending to {user_email}")
            
            # Create simple message
            import smtplib
            from email.mime.multipart import MIMEMultipart
            from email.mime.text import MIMEText
            from email.mime.base import MIMEBase
            from email import encoders
            
            msg = MIMEMultipart()
            msg['From'] = f"{smtp_config['from_name']} <{smtp_config['email']}>"
            msg['To'] = user_email
            msg['Subject'] = f"Your {submission.document_type} is Ready!"
            
            # Simple body
            body = f"""Hello {user_name},

Your {submission.document_type} is ready for download!

Reference: {submission.reference}
Amount: KES {submission.amount}

Please find your document attached.

Best regards,
ProWrite Team
"""
            
            msg.attach(MIMEText(body, 'plain'))
            
            # Attach PDF
            with open(pdf_path, "rb") as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename= {user_name}_Francisca_Resume.pdf'
                )
                msg.attach(part)
            
            # Send email with timeout
            server = smtplib.SMTP(smtp_config['server'], smtp_config['port'], timeout=10)
            server.starttls()
            server.login(smtp_config['email'], smtp_config['password'])
            text = msg.as_string()
            server.sendmail(smtp_config['email'], user_email, text)
            server.quit()
            
            logger.info(f"FAST EMAIL: Sent successfully to {user_email}")
            
            # Send admin notification
            try:
                admin_msg = MIMEText(f"PDF sent to {user_email}. Reference: {submission.reference}")
                admin_msg['From'] = smtp_config['email']
                admin_msg['To'] = "hamiltonmwaila06@gmail.com"
                admin_msg['Subject'] = f"PDF Sent: {submission.document_type} for {user_email}"
                
                server = smtplib.SMTP(smtp_config['server'], smtp_config['port'], timeout=5)
                server.starttls()
                server.login(smtp_config['email'], smtp_config['password'])
                server.sendmail(smtp_config['email'], "hamiltonmwaila06@gmail.com", admin_msg.as_string())
                server.quit()
                logger.info("FAST EMAIL: Admin notification sent")
            except Exception as e:
                logger.error(f"FAST EMAIL: Admin notification failed: {e}")
            
        except Exception as e:
            logger.error(f"FAST EMAIL: Failed to send: {e}")
    
    def _send_fast_completion_email(self, submission: PaymentSubmission, smtp_config: dict):
        """Send fast completion email without PDF"""
        try:
            user_email = (
                submission.form_data.get('email') or
                submission.user_email or
                'noreply@prowrite.com'
            )
            
            import smtplib
            from email.mime.text import MIMEText
            
            msg = MIMEText(f"Your {submission.document_type} is ready! Reference: {submission.reference}")
            msg['From'] = smtp_config['email']
            msg['To'] = user_email
            msg['Subject'] = f"Your {submission.document_type} is Ready!"
            
            server = smtplib.SMTP(smtp_config['server'], smtp_config['port'], timeout=5)
            server.starttls()
            server.login(smtp_config['email'], smtp_config['password'])
            server.sendmail(smtp_config['email'], user_email, msg.as_string())
            server.quit()
            
            logger.info(f"FAST EMAIL: Completion email sent to {user_email}")
            
        except Exception as e:
            logger.error(f"FAST EMAIL: Completion email failed: {e}")
    
    def get_payment_status(self, reference: str) -> Dict[str, Any]:
        """Get payment status for a reference"""
        try:
            submission = self._get_submission_from_db(reference)
            if not submission:
                return {
                    'success': False,
                    'error': 'Reference not found'
                }
            
            result = {
                'success': True,
                'status': submission.status,
                'submission_id': submission.id,
                'amount': submission.amount,
                'document_type': submission.document_type,
                'validation_method': submission.validation_method,
                'created_at': submission.created_at.isoformat(),
                'updated_at': submission.updated_at.isoformat()
            }
            
            # Add download URL if PDF is ready
            if submission.status == 'completed' and submission.pdf_path:
                result['download_url'] = f'/api/payments/manual/download/{reference}'
                result['pdf_ready'] = True
            
            return result
            
        except Exception as e:
            logger.error(f"Status check error: {e}")
            return {
                'success': False,
                'error': 'Status check failed'
            }
    
    def get_pdf_download_path(self, reference: str) -> Optional[str]:
        """Get PDF file path for download"""
        try:
            logger.info(f"🔍 Looking for PDF path for reference: {reference}")
            
            submission = self._get_submission_from_db(reference)
            if not submission:
                logger.error(f"❌ No submission found for reference: {reference}")
                return None
            
            logger.info(f"📋 Submission found - Status: {submission.status}, PDF Path: {submission.pdf_path}")
            
            if submission.status == 'completed' and submission.pdf_path:
                if os.path.exists(submission.pdf_path):
                    logger.info(f"✅ PDF file exists: {submission.pdf_path}")
                    return submission.pdf_path
                else:
                    logger.error(f"❌ PDF file does not exist: {submission.pdf_path}")
                    return None
            else:
                logger.warning(f"⚠️  PDF not ready - Status: {submission.status}, Path: {submission.pdf_path}")
                return None
            
        except Exception as e:
            logger.error(f"❌ PDF path retrieval error: {e}")
            import traceback
            logger.error(f"❌ Traceback: {traceback.format_exc()}")
            return None
    
    def _generate_reference(self) -> str:
        """Generate unique payment reference"""
        prefix = "PAY"
        unique_id = str(uuid.uuid4()).replace('-', '').upper()[:8]
        return f"{prefix}-{unique_id}"

# Create global instance
manual_payment_service = FastManualPaymentService()
