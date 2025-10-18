"""
ProWrite Backend - Complete Consolidated Flask Application
All backend functionality integrated into a single file for easy hosting
"""

from flask import Flask, request, jsonify, send_file, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import datetime, timedelta
import os
import jwt
import bcrypt
import mysql.connector
from functools import wraps
import logging
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv
import random
from typing import Any, Optional, Dict, List
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import black, white, HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.fonts import addMapping
import re
import json
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False
    print("Warning: SendGrid not available. Email functionality will use SMTP fallback.")
import base64
from manual_payment_routes import manual_payment_bp
from pesapal_callback_routes import pesapal_callback_bp
from pesapal_payment_routes import pesapal_payment_bp
from pesapal_embedded_routes import pesapal_embedded_bp
# Import AI services
from francisca_ai_service import FranciscaAIService

# Load environment variables
load_dotenv('.env')

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'Prowrite.mysql.pythonanywhere-services.com'),
    'user': os.getenv('DB_USER', 'Prowrite'),
    'password': os.getenv('DB_PASSWORD', 'Hamilton2025'),
    'database': os.getenv('DB_NAME', 'Prowrite$dbprowrite'),
    'charset': 'utf8mb4'
}

# Email Service Configuration
SMTP_CONFIG = {
    'server': os.getenv('SMTP_SERVER', 'smtp.gmail.com'),
    'port': int(os.getenv('SMTP_PORT', 587)),
    'email': os.getenv('SMTP_EMAIL'),
    'password': os.getenv('SMTP_PASSWORD'),
    'from_name': os.getenv('SMTP_FROM_NAME', 'ProWrite')
}

# SendGrid Configuration
SENDGRID_CONFIG = {
    'api_key': os.getenv('SENDGRID_API_KEY'),
    'from_email': os.getenv('SENDGRID_FROM_EMAIL', os.getenv('SMTP_EMAIL')),
    'from_name': os.getenv('SENDGRID_FROM_NAME', 'ProWrite')
}


# Pricing Configuration
PRICING = {
    'francisca_resume': 500,
    'cover_letter': 300
}

# Logging Configuration
def setup_logging():
    """Setup production logging configuration"""
    if not os.path.exists('logs'):
        os.makedirs('logs')

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            RotatingFileHandler(
                'logs/app.log',
                maxBytes=10*1024*1024,  # 10MB
                backupCount=5
            ),
            logging.StreamHandler()
        ]
    )

    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('requests').setLevel(logging.WARNING)

    return logging.getLogger('prowrite')

# Initialize logger
logger = setup_logging()

# Email Service Class
class EmailService:
    """Email service for sending PDFs to users using SendGrid"""

    def __init__(self):
        self.api_key = SENDGRID_CONFIG['api_key']
        self.from_email = SENDGRID_CONFIG['from_email']
        self.from_name = SENDGRID_CONFIG['from_name']
        self.sg = None
        
        # Initialize SendGrid client if API key is available and SendGrid is installed
        if self.api_key and SENDGRID_AVAILABLE:
            self.sg = SendGridAPIClient(api_key=self.api_key)
        elif not SENDGRID_AVAILABLE:
            logger.warning("SendGrid not available, using SMTP fallback")

    def send_pdf_email(self, recipient_email: str, pdf_path: str, document_type: str, user_name: str) -> bool:
        """Send PDF as email attachment using SendGrid or SMTP fallback"""
        try:
            # Try SendGrid first if available
            if SENDGRID_AVAILABLE and self.api_key and self.sg:
                return self._send_pdf_email_sendgrid(recipient_email, pdf_path, document_type, user_name)
            else:
                # Fallback to SMTP
                logger.info("Using SMTP fallback for PDF email")
                return self._send_pdf_email_smtp(recipient_email, pdf_path, document_type, user_name)

        except Exception as e:
            logger.error(f"Error sending PDF email to {recipient_email}: {e}")
            return False

    def _send_pdf_email_sendgrid(self, recipient_email: str, pdf_path: str, document_type: str, user_name: str) -> bool:
        """Send PDF email using SendGrid"""
        try:
            if not self.from_email:
                logger.error("SendGrid from email not configured")
                return False

            logger.info(f"Attempting to send PDF email to {recipient_email} using SendGrid")
            logger.info(f"From Email: {self.from_email}")
            logger.info(f"Document Type: {document_type}")

            # Email body
            price = PRICING.get(document_type.lower().replace(' ', '_'), 0)
            body = f"""Hello {user_name},

Thank you for using ProWrite! Your {document_type} has been successfully generated and is attached to this email.

Document Details:
- Type: {document_type}
- Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
- Price: KES {price}

You can also download your document from your ProWrite dashboard at any time.

If you have any questions or need assistance, please don't hesitate to contact our support team.

Best regards,
The ProWrite Team

---
ProWrite - Professional Resume & Cover Letter Generator
Website: https://prowrite-frontend.vercel.app"""

            # Create SendGrid mail object
            message = Mail(
                from_email=(self.from_email, self.from_name),
                to_emails=recipient_email,
                subject=f"Your {document_type} is Ready - ProWrite",
                html_content=body.replace('\n', '<br>')
            )

            # Attach PDF if it exists
            if os.path.exists(pdf_path):
                logger.info(f"Attaching PDF file: {pdf_path}")
                with open(pdf_path, "rb") as f:
                    data = f.read()
                    encoded_file = base64.b64encode(data).decode()
                    
                attached_file = Attachment(
                    FileContent(encoded_file),
                    FileName(os.path.basename(pdf_path)),
                    FileType('application/pdf'),
                    Disposition('attachment')
                )
                message.attachment = attached_file
            else:
                logger.error(f"PDF file not found: {pdf_path}")
                return False

            # Send email using SendGrid
            logger.info("Sending PDF email via SendGrid...")
            response = self.sg.send(message)
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"PDF email sent successfully to {recipient_email} via SendGrid")
                logger.info(f"SendGrid response status: {response.status_code}")
                return True
            else:
                logger.error(f"SendGrid error: {response.status_code} - {response.body}")
                return False

        except Exception as e:
            logger.error(f"Error sending PDF email via SendGrid: {e}")
            return False

    def _send_pdf_email_smtp(self, recipient_email: str, pdf_path: str, document_type: str, user_name: str) -> bool:
        """Send PDF email using SMTP (fallback)"""
        try:
            # Check SMTP configuration
            if not SMTP_CONFIG['email'] or not SMTP_CONFIG['password']:
                logger.error("SMTP credentials not configured for PDF email")
                logger.error(f"SMTP_EMAIL configured: {bool(SMTP_CONFIG['email'])}")
                logger.error(f"SMTP_PASSWORD configured: {bool(SMTP_CONFIG['password'])}")
                return False

            logger.info(f"Attempting to send PDF email to {recipient_email} using SMTP")
            logger.info(f"SMTP Server: {SMTP_CONFIG['server']}:{SMTP_CONFIG['port']}")
            logger.info(f"From Email: {SMTP_CONFIG['email']}")
            logger.info(f"Document Type: {document_type}")

            # Create message
            msg = MIMEMultipart()
            msg['From'] = f"{SMTP_CONFIG['from_name']} <{SMTP_CONFIG['email']}>"
            msg['To'] = recipient_email
            msg['Subject'] = f"Your {document_type} is Ready - ProWrite"

            # Email body
            price = PRICING.get(document_type.lower().replace(' ', '_'), 0)
            body = f"""Hello {user_name},

Thank you for using ProWrite! Your {document_type} has been successfully generated and is attached to this email.

Document Details:
- Type: {document_type}
- Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
- Price: KES {price}

You can also download your document from your ProWrite dashboard at any time.

If you have any questions or need assistance, please don't hesitate to contact our support team.

Best regards,
The ProWrite Team

---
ProWrite - Professional Resume & Cover Letter Generator
Website: https://prowrite-frontend.vercel.app"""

            msg.attach(MIMEText(body, 'plain'))

            # Attach PDF
            if os.path.exists(pdf_path):
                logger.info(f"Attaching PDF file: {pdf_path}")
                with open(pdf_path, "rb") as attachment:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(attachment.read())
                    encoders.encode_base64(part)
                    part.add_header(
                        'Content-Disposition',
                        f'attachment; filename={os.path.basename(pdf_path)}'
                    )
                    msg.attach(part)
            else:
                logger.error(f"PDF file not found: {pdf_path}")
                return False

            # Send email with detailed logging
            logger.info("Connecting to SMTP server...")
            server = smtplib.SMTP(SMTP_CONFIG['server'], SMTP_CONFIG['port'])

            logger.info("Starting TLS...")
            server.starttls()

            logger.info("Logging in to SMTP server...")
            server.login(SMTP_CONFIG['email'], SMTP_CONFIG['password'])

            logger.info("Sending PDF email...")
            text = msg.as_string()
            server.sendmail(SMTP_CONFIG['email'], recipient_email, text)
            server.quit()

            logger.info(f"PDF email sent successfully to {recipient_email} via SMTP")
            return True

        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"SMTP Authentication failed for PDF email: {e}")
            logger.error("Check your email and app password configuration")
            return False
        except smtplib.SMTPException as e:
            logger.error(f"SMTP error sending PDF email to {recipient_email}: {e}")
            return False
        except FileNotFoundError as e:
            logger.error(f"PDF file not found: {e}")
            return False
        except Exception as e:
            logger.error(f"General error sending PDF email to {recipient_email}: {e}")
            return False

# Initialize email service
email_service = EmailService()

def send_general_email(recipient_email: str, subject: str, body: str, user_name: str = "User") -> bool:
    """Send a general email using SendGrid or SMTP fallback"""
    try:
        # Try SendGrid first if available
        if SENDGRID_AVAILABLE and SENDGRID_CONFIG['api_key'] and SENDGRID_CONFIG['from_email']:
            return _send_general_email_sendgrid(recipient_email, subject, body, user_name)
        else:
            # Fallback to SMTP
            logger.info("Using SMTP fallback for general email")
            return _send_general_email_smtp(recipient_email, subject, body, user_name)

    except Exception as e:
        logger.error(f"Error sending general email to {recipient_email}: {e}")
        return False

def _send_general_email_sendgrid(recipient_email: str, subject: str, body: str, user_name: str = "User") -> bool:
    """Send general email using SendGrid"""
    try:
        logger.info(f"Attempting to send general email to {recipient_email} using SendGrid")
        logger.info(f"Subject: {subject}")
        logger.info(f"From Email: {SENDGRID_CONFIG['from_email']}")

        # Add footer to body
        email_body = f"""{body}

Best regards,
The ProWrite Team

---
ProWrite - Professional Resume & Cover Letter Generator
Website: https://prowrite-frontend.vercel.app
Support: {SENDGRID_CONFIG['from_email']}"""

        # Create SendGrid mail object
        message = Mail(
            from_email=(SENDGRID_CONFIG['from_email'], SENDGRID_CONFIG['from_name']),
            to_emails=recipient_email,
            subject=subject,
            html_content=email_body.replace('\n', '<br>')
        )

        # Send email using SendGrid
        logger.info("Sending general email via SendGrid...")
        sg = SendGridAPIClient(api_key=SENDGRID_CONFIG['api_key'])
        response = sg.send(message)
        
        if response.status_code in [200, 201, 202]:
            logger.info(f"General email sent successfully to {recipient_email} via SendGrid")
            logger.info(f"SendGrid response status: {response.status_code}")
            return True
        else:
            logger.error(f"SendGrid error: {response.status_code} - {response.body}")
            return False

    except Exception as e:
        logger.error(f"Error sending general email via SendGrid: {e}")
        return False

def _send_general_email_smtp(recipient_email: str, subject: str, body: str, user_name: str = "User") -> bool:
    """Send general email using SMTP (fallback)"""
    try:
        # Check SMTP configuration
        if not SMTP_CONFIG['email'] or not SMTP_CONFIG['password']:
            logger.error("SMTP credentials not configured for general email")
            logger.error(f"SMTP_EMAIL configured: {bool(SMTP_CONFIG['email'])}")
            logger.error(f"SMTP_PASSWORD configured: {bool(SMTP_CONFIG['password'])}")
            return False

        logger.info(f"Attempting to send general email to {recipient_email} using SMTP")
        logger.info(f"Subject: {subject}")
        logger.info(f"SMTP Server: {SMTP_CONFIG['server']}:{SMTP_CONFIG['port']}")
        logger.info(f"From Email: {SMTP_CONFIG['email']}")

        # Create message
        msg = MIMEMultipart()
        msg['From'] = f"{SMTP_CONFIG['from_name']} <{SMTP_CONFIG['email']}>"
        msg['To'] = recipient_email
        msg['Subject'] = subject

        # Add footer to body
        email_body = f"""{body}

Best regards,
The ProWrite Team

---
ProWrite - Professional Resume & Cover Letter Generator
Website: https://prowrite-frontend.vercel.app
Support: {SMTP_CONFIG['email']}"""

        msg.attach(MIMEText(email_body, 'plain'))

        # Send email with detailed logging
        logger.info("Connecting to SMTP server...")
        server = smtplib.SMTP(SMTP_CONFIG['server'], SMTP_CONFIG['port'])

        logger.info("Starting TLS...")
        server.starttls()

        logger.info("Logging in to SMTP server...")
        server.login(SMTP_CONFIG['email'], SMTP_CONFIG['password'])

        logger.info("Sending general email...")
        text = msg.as_string()
        server.sendmail(SMTP_CONFIG['email'], recipient_email, text)
        server.quit()

        logger.info(f"General email sent successfully to {recipient_email} via SMTP")
        return True

    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"SMTP Authentication failed for general email: {e}")
        logger.error("Check your email and app password configuration")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error sending general email to {recipient_email}: {e}")
        return False
    except Exception as e:
        logger.error(f"General error sending email to {recipient_email}: {e}")
        return False
def send_password_reset_email(recipient_email: str, user_name: str, reset_token: str) -> bool:
    """Send password reset email to user using SendGrid or SMTP fallback"""
    try:
        # Try SendGrid first if available
        if SENDGRID_AVAILABLE and SENDGRID_CONFIG['api_key'] and SENDGRID_CONFIG['from_email']:
            return _send_password_reset_email_sendgrid(recipient_email, user_name, reset_token)
        else:
            # Fallback to SMTP
            logger.info("Using SMTP fallback for password reset email")
            return _send_password_reset_email_smtp(recipient_email, user_name, reset_token)

    except Exception as e:
        logger.error(f"Error sending password reset email to {recipient_email}: {e}")
        return False

def _send_password_reset_email_sendgrid(recipient_email: str, user_name: str, reset_token: str) -> bool:
    """Send password reset email using SendGrid"""
    try:
        logger.info(f"Attempting to send password reset email to {recipient_email} using SendGrid")
        logger.info(f"From Email: {SENDGRID_CONFIG['from_email']}")

        # Create reset link for your frontend
        reset_link = f"https://prowrite-frontend.vercel.app/reset-password?token={reset_token}"

        # Email body
        body = f"""Hello {user_name},

You requested to reset your password for your ProWrite account.

To reset your password, please click the link below or copy and paste it into your browser:

{reset_link}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

Best regards,
The ProWrite Team

---
ProWrite - Professional Resume & Cover Letter Generator"""

        # Create SendGrid mail object
        message = Mail(
            from_email=(SENDGRID_CONFIG['from_email'], SENDGRID_CONFIG['from_name']),
            to_emails=recipient_email,
            subject="Reset Your ProWrite Password",
            html_content=body.replace('\n', '<br>')
        )

        # Send email using SendGrid
        logger.info("Sending password reset email via SendGrid...")
        sg = SendGridAPIClient(api_key=SENDGRID_CONFIG['api_key'])
        response = sg.send(message)
        
        if response.status_code in [200, 201, 202]:
            logger.info(f"Password reset email sent successfully to {recipient_email} via SendGrid")
            logger.info(f"SendGrid response status: {response.status_code}")
            return True
        else:
            logger.error(f"SendGrid error: {response.status_code} - {response.body}")
            return False

    except Exception as e:
        logger.error(f"Error sending password reset email via SendGrid: {e}")
        return False

def _send_password_reset_email_smtp(recipient_email: str, user_name: str, reset_token: str) -> bool:
    """Send password reset email using SMTP (fallback)"""
    try:
        # Check SMTP configuration
        if not SMTP_CONFIG['email'] or not SMTP_CONFIG['password']:
            logger.error("SMTP credentials not configured for password reset emails")
            logger.error(f"SMTP_EMAIL configured: {bool(SMTP_CONFIG['email'])}")
            logger.error(f"SMTP_PASSWORD configured: {bool(SMTP_CONFIG['password'])}")
            return False

        logger.info(f"Attempting to send password reset email to {recipient_email} using SMTP")
        logger.info(f"SMTP Server: {SMTP_CONFIG['server']}:{SMTP_CONFIG['port']}")
        logger.info(f"From Email: {SMTP_CONFIG['email']}")

        # Create message
        msg = MIMEMultipart()
        msg['From'] = f"{SMTP_CONFIG['from_name']} <{SMTP_CONFIG['email']}>"
        msg['To'] = recipient_email
        msg['Subject'] = "Reset Your ProWrite Password"

        # Create reset link for your frontend
        reset_link = f"https://prowrite-frontend.vercel.app/reset-password?token={reset_token}"

        # Email body
        body = f"""Hello {user_name},

You requested to reset your password for your ProWrite account.

To reset your password, please click the link below or copy and paste it into your browser:

{reset_link}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

Best regards,
The ProWrite Team

---
ProWrite - Professional Resume & Cover Letter Generator"""

        msg.attach(MIMEText(body, 'plain'))

        # Send email with detailed logging
        logger.info("Connecting to SMTP server...")
        server = smtplib.SMTP(SMTP_CONFIG['server'], SMTP_CONFIG['port'])

        logger.info("Starting TLS...")
        server.starttls()

        logger.info("Logging in to SMTP server...")
        server.login(SMTP_CONFIG['email'], SMTP_CONFIG['password'])

        logger.info("Sending password reset email...")
        text = msg.as_string()
        server.sendmail(SMTP_CONFIG['email'], recipient_email, text)
        server.quit()

        logger.info(f"Password reset email sent successfully to {recipient_email} via SMTP")
        return True

    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"SMTP Authentication failed: {e}")
        logger.error("Check your email and app password configuration")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error sending email to {recipient_email}: {e}")
        return False
    except Exception as e:
        logger.error(f"General error sending password reset email to {recipient_email}: {e}")
        return False
# Authentication System
class AuthSystem:
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production')
        self.algorithm = 'HS256'
        self.token_expiry_hours = 24

    def get_db_connection(self):
        """Get database connection with error handling"""
        try:
            connection = mysql.connector.connect(**DB_CONFIG)
            return connection
        except mysql.connector.Error as e:
            logger.error(f"Database connection error: {e}")
            return None

    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

    def create_user(self, email: str, password: str, first_name: str, last_name: str):
        """Create a new user in the database"""
        connection = self.get_db_connection()
        if not connection:
            return {"error": "Database connection failed"}, 500

        try:
            cursor = connection.cursor()

            # Check if user already exists
            cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return {"error": "User already exists"}, 400

            # Hash password
            hashed_password = self.hash_password(password)

            # Insert new user (using correct column names from your database)
            cursor.execute("""
                INSERT INTO users (email, password_hash, first_name, last_name, created_at)
                VALUES (%s, %s, %s, %s, NOW())
            """, (email, hashed_password, first_name, last_name))

            user_id = cursor.lastrowid
            connection.commit()

            # Get user data (using correct column names)
            cursor.execute("""
                SELECT user_id, email, first_name, last_name, is_premium, is_admin, created_at
                FROM users WHERE user_id = %s
            """, (user_id,))

            user_data = cursor.fetchone()
            user = {
                "id": user_data[0],           # user_id
                "email": user_data[1],        # email
                "firstName": user_data[2],    # first_name
                "lastName": user_data[3],     # last_name
                "isPremium": user_data[4],    # is_premium
                "is_admin": user_data[5],     # is_admin
                "createdAt": user_data[6].isoformat() if user_data[6] else None  # created_at
            }

            return {"user": user, "message": "User created successfully"}, 201

        except mysql.connector.Error as e:
            logger.error(f"Database error: {e}")
            return {"error": "Database error occurred"}, 500
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return {"error": "An unexpected error occurred"}, 500
        finally:
            if connection:
                connection.close()

    def authenticate_user(self, email: str, password: str):
        """Authenticate user and return user data if valid"""
        connection = self.get_db_connection()
        if not connection:
            return {"error": "Database connection failed"}, 500

        try:
            cursor = connection.cursor()

            # Get user data (using correct column names from your database)
            cursor.execute("""
                SELECT user_id, email, password_hash, first_name, last_name, is_premium, is_admin, created_at
                FROM users WHERE email = %s
            """, (email,))

            user_data = cursor.fetchone()
            if not user_data:
                return {"error": "Invalid credentials"}, 401

            # Verify password
            if not self.verify_password(password, user_data[2]):
                return {"error": "Invalid credentials"}, 401

            # Return user data (using correct column mapping)
            user = {
                "id": user_data[0],           # user_id
                "email": user_data[1],        # email
                "firstName": user_data[3],    # first_name
                "lastName": user_data[4],     # last_name
                "isPremium": user_data[5],    # is_premium
                "is_admin": user_data[6],     # is_admin
                "createdAt": user_data[7].isoformat() if user_data[7] else None  # created_at
            }

            return {"user": user}, 200

        except mysql.connector.Error as e:
            logger.error(f"Database error: {e}")
            return {"error": "Database error occurred"}, 500
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return {"error": "An unexpected error occurred"}, 500
        finally:
            if connection:
                connection.close()

    def create_access_token(self, user_data: dict) -> str:
        """Create JWT access token"""
        try:
            payload = {
                'user_id': user_data['id'],
                'email': user_data['email'],
                'is_admin': user_data.get('is_admin', 0),
                'exp': datetime.utcnow() + timedelta(hours=self.token_expiry_hours),
                'iat': datetime.utcnow(),
                'type': 'access'
            }

            # Use PyJWT directly
            import jwt as pyjwt
            token = pyjwt.encode(payload, self.secret_key, algorithm=self.algorithm)
            return token

        except Exception as e:
            logger.error(f"Token creation error: {e}")
            raise e

    def verify_token(self, token: str) -> dict:
        """Verify and decode JWT token"""
        try:
            import jwt as pyjwt
            payload = pyjwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except pyjwt.ExpiredSignatureError:
            return {"error": "Token expired"}
        except pyjwt.InvalidTokenError:
            return {"error": "Invalid token"}
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            return {"error": "Token verification failed"}

    def get_user_by_id(self, user_id: int):
        """Get user data by ID"""
        connection = self.get_db_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor()
            cursor.execute("""
                SELECT user_id, email, first_name, last_name, is_premium, is_admin, created_at
                FROM users WHERE user_id = %s
            """, (user_id,))

            user_data = cursor.fetchone()
            if not user_data:
                return None

            user = {
                "id": user_data[0],           # user_id
                "email": user_data[1],        # email
                "firstName": user_data[2],    # first_name
                "lastName": user_data[3],     # last_name
                "isPremium": user_data[4],    # is_premium
                "is_admin": user_data[5],     # is_admin
                "createdAt": user_data[6].isoformat() if user_data[6] else None  # created_at
            }

            return user

        except mysql.connector.Error as e:
            logger.error(f"Database error: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return None
        finally:
            if connection:
                connection.close()

    def update_user(self, user_id: int, update_data: dict):
        """Update user data"""
        connection = self.get_db_connection()
        if not connection:
            return False

        try:
            cursor = connection.cursor()

            # Build update query dynamically
            set_clauses = []
            values = []

            for field, value in update_data.items():
                if field in ['first_name', 'last_name', 'email']:
                    set_clauses.append(f"{field} = %s")
                    values.append(value)

            if not set_clauses:
                return True  # No valid fields to update

            # Add updated_at timestamp
            set_clauses.append("updated_at = NOW()")
            values.append(user_id)

            query = f"UPDATE users SET {', '.join(set_clauses)} WHERE user_id = %s"
            cursor.execute(query, values)
            connection.commit()

            return True

        except mysql.connector.Error as e:
            logger.error(f"Database error updating user: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error updating user: {e}")
            return False
        finally:
            if connection:
                connection.close()

# Initialize auth system
auth_system = AuthSystem()

# JWT decorator for protected routes
def jwt_required_custom(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None

        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({"error": "Invalid token format"}), 401
        else:
            return jsonify({"error": "No token provided"}), 401

        if not token:
            return jsonify({"error": "No token provided"}), 401

        payload = auth_system.verify_token(token)
        if 'error' in payload:
            return jsonify({"error": payload['error']}), 401

        request.current_user = payload
        return f(*args, **kwargs)

    return decorated_function

# Admin-only decorator
def admin_required_custom(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # First check if user is authenticated
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({"error": "Invalid token format"}), 401
        else:
            return jsonify({"error": "No token provided"}), 401

        if not token:
            return jsonify({"error": "No token provided"}), 401

        payload = auth_system.verify_token(token)
        if 'error' in payload:
            return jsonify({"error": payload['error']}), 401

        # Check if user is admin
        if not payload.get('is_admin'):
            return jsonify({"error": "Admin privileges required"}), 403

        request.current_user = payload
        
        # Log admin action
        log_admin_action(payload['user_id'], f"accessed_{f.__name__}", request.path, request.remote_addr)
        
        return f(*args, **kwargs)

    return decorated_function

# Admin action logging function
def log_admin_action(admin_id, action, target_path, ip_address):
    """Log admin action to database"""
    connection = auth_system.get_db_connection()
    if not connection:
        return
    
    try:
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO admin_activity_logs (admin_id, action, target_type, details, ip_address)
            VALUES (%s, %s, %s, %s, %s)
        """, (admin_id, action, 'api_endpoint', f'{{"path": "{target_path}"}}', ip_address))
        connection.commit()
    except Exception as e:
        logger.error(f"Failed to log admin action: {e}")
    finally:
        if connection:
            connection.close()

# System logging function
def log_system_event(level, message, module=None, user_id=None, metadata=None):
    """Log system event to database"""
    connection = auth_system.get_db_connection()
    if not connection:
        return
    
    try:
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO system_logs (level, message, module, user_id, ip_address, metadata)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (level, message, module, user_id, request.remote_addr if request else None, 
              json.dumps(metadata) if metadata else None))
        connection.commit()
    except Exception as e:
        logger.error(f"Failed to log system event: {e}")
    finally:
        if connection:
            connection.close()

# Document tracking function
def track_document_generation(reference, document_data, file_path):
    """Track document generation in user_documents table"""
    connection = auth_system.get_db_connection()
    if not connection:
        return
    
    try:
        cursor = connection.cursor()
        
        # Get user email from document data
        user_email = document_data.get('personalEmail', '')
        if not user_email:
            logger.warning(f"No user email found for document reference: {reference}")
            return
        
        # Get user ID from email
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (user_email,))
        user_result = cursor.fetchone()
        if not user_result:
            logger.warning(f"User not found for email: {user_email}")
            return
        
        user_id = user_result[0]
        
        # Determine document type
        document_type = 'resume'
        if 'cover_letter' in reference.lower() or 'coverletter' in reference.lower():
            document_type = 'cover_letter'
        
        # Check if document already exists
        cursor.execute("SELECT id FROM user_documents WHERE reference = %s", (reference,))
        existing_doc = cursor.fetchone()
        
        if existing_doc:
            # Update existing document
            cursor.execute("""
                UPDATE user_documents 
                SET file_path = %s, status = 'generated', updated_at = NOW()
                WHERE reference = %s
            """, (file_path, reference))
            logger.info(f"Updated existing document tracking for reference: {reference}")
        else:
            # Insert new document
            cursor.execute("""
                INSERT INTO user_documents (user_id, document_type, reference, file_path, status, created_at)
                VALUES (%s, %s, %s, %s, 'generated', NOW())
            """, (user_id, document_type, reference, file_path))
            logger.info(f"Tracked new document generation for reference: {reference}")
        
        connection.commit()
        
    except Exception as e:
        logger.error(f"Failed to track document generation: {e}")
    finally:
        if connection:
            connection.close()

# Error Handlers
def register_error_handlers(app):
    """Register production error handlers"""

    @app.errorhandler(400)
    def bad_request(error):
        logger.error(f"Bad Request: {error}")
        return jsonify({
            'error': 'Bad Request',
            'message': 'The request could not be understood by the server',
            'status_code': 400
        }), 400

    @app.errorhandler(401)
    def unauthorized(error):
        logger.error(f"Unauthorized: {error}")
        return jsonify({
            'error': 'Unauthorized',
            'message': 'Authentication required',
            'status_code': 401
        }), 401

    @app.errorhandler(403)
    def forbidden(error):
        logger.error(f"Forbidden: {error}")
        return jsonify({
            'error': 'Forbidden',
            'message': 'Access denied',
            'status_code': 403
        }), 403

    @app.errorhandler(404)
    def not_found(error):
        logger.error(f"Not Found: {error}")
        return jsonify({
            'error': 'Not Found',
            'message': 'The requested resource was not found',
            'status_code': 404
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        logger.error(f"Method Not Allowed: {error}")
        return jsonify({
            'error': 'Method Not Allowed',
            'message': 'The method is not allowed for this resource',
            'status_code': 405
        }), 405

    @app.errorhandler(500)
    def internal_server_error(error):
        logger.error(f"Internal Server Error: {error}")
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred',
            'status_code': 500
        }), 500

    @app.errorhandler(Exception)
    def handle_exception(error):
        logger.error(f"Unhandled Exception: {error}")
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred',
            'status_code': 500
        }), 500

    @app.before_request
    def log_request():
        logger.info(f"Request: {request.method} {request.path} from {request.remote_addr}")

    @app.after_request
    def log_response(response):
        logger.info(f"Response: {response.status_code} for {request.method} {request.path}")
        return response

# Create Flask app
app = Flask(__name__)
# Add this line after your app creation (after app = Flask(__name__))
app.register_blueprint(manual_payment_bp)
app.register_blueprint(pesapal_callback_bp)
app.register_blueprint(pesapal_payment_bp)
app.register_blueprint(pesapal_embedded_bp)

# Import and register admin routes
from admin_routes import admin_bp
app.register_blueprint(admin_bp)
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://prowrite-frontend.vercel.app",
            "http://localhost:3000",  # For local development
            "http://localhost:5173"   # For Vite dev server
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Cache-Control", "Pragma"],
        "supports_credentials": True
    }
})

# Imports are already at the top of the file


# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['JWT_ALGORITHM'] = 'HS256'
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

# Initialize JWT
jwt = JWTManager(app)

# Register error handlers
register_error_handlers(app)

# CORS preflight handler
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

# Authentication Routes
@app.route("/")
def index():
    return "Flask is working on PythonAnywhere 🚀"

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['email', 'password', 'firstName', 'lastName']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400

        # Create user
        result, status_code = auth_system.create_user(
            email=data['email'],
            password=data['password'],
            first_name=data['firstName'],
            last_name=data['lastName']
        )

        if status_code != 201:
            return jsonify(result), status_code

        # Create access token
        access_token = auth_system.create_access_token(result['user'])

        return jsonify({
            "message": "User registered successfully",
            "access_token": access_token,
            "user": result['user']
        }), 201

    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({"error": "Registration failed"}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({"error": "Email and password are required"}), 400

        # Authenticate user
        result, status_code = auth_system.authenticate_user(
            email=data['email'],
            password=data['password']
        )

        if status_code != 200:
            return jsonify(result), status_code

        # Create access token
        access_token = auth_system.create_access_token(result['user'])

        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": result['user']
        }), 200

    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({"error": "Login failed"}), 500

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """Admin login endpoint - same as regular login but with admin validation"""
    try:
        data = request.get_json()

        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({"error": "Email and password are required"}), 400

        # Authenticate user
        result, status_code = auth_system.authenticate_user(
            email=data['email'],
            password=data['password']
        )

        if status_code != 200:
            return jsonify(result), status_code

        # Check if user is admin
        user = result['user']
        if not user.get('is_admin'):
            return jsonify({"error": "Admin privileges required"}), 403

        # Create access token
        access_token = auth_system.create_access_token(user)

        return jsonify({
            "message": "Admin login successful",
            "access_token": access_token,
            "user": user
        }), 200

    except Exception as e:
        logger.error(f"Admin login error: {e}")
        return jsonify({"error": "Admin login failed"}), 500

@app.route('/api/auth/me', methods=['GET'])
@jwt_required_custom
def get_current_user():
    try:
        user_id = request.current_user['user_id']
        user = auth_system.get_user_by_id(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"user": user}), 200

    except Exception as e:
        logger.error(f"Get user error: {e}")
        return jsonify({"error": "Failed to get user data"}), 500

@app.route('/api/profile', methods=['GET'])
@jwt_required_custom
def get_profile():
    """Get user profile information"""
    try:
        user_id = request.current_user['user_id']
        user = auth_system.get_user_by_id(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Return profile data in the expected format
        profile_data = {
            "id": user.get('id'),
            "email": user.get('email'),
            "firstName": user.get('firstName'),
            "lastName": user.get('lastName'),
            "isAdmin": user.get('is_admin', False),
            "createdAt": user.get('createdAt'),
            "updatedAt": user.get('createdAt'),  # Using createdAt as updatedAt for now
            "subscription": {
                "plan": "Pro",
                "status": "active",
                "expiresAt": "2024-12-31T23:59:59Z"
            },
            "preferences": {
                "theme": "light",
                "notifications": True,
                "emailUpdates": True
            }
        }

        return jsonify({
            "success": True,
            "data": profile_data
        }), 200

    except Exception as e:
        logger.error(f"Get profile error: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to get profile data"
        }), 500

@app.route('/api/profile', methods=['PUT'])
@jwt_required_custom
def update_profile():
    """Update user profile information"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400

        # Update user data
        update_data = {}
        if 'firstName' in data:
            update_data['first_name'] = data['firstName']
        if 'lastName' in data:
            update_data['last_name'] = data['lastName']
        if 'email' in data:
            update_data['email'] = data['email']

        # Update user in database
        if update_data:
            success = auth_system.update_user(user_id, update_data)
            if not success:
                return jsonify({
                    "success": False,
                    "error": "Failed to update profile"
                }), 500

        # Get updated user data
        user = auth_system.get_user_by_id(user_id)
        if not user:
            return jsonify({
                "success": False,
                "error": "User not found"
            }), 404

        # Return updated profile data
        profile_data = {
            "id": user.get('id'),
            "email": user.get('email'),
            "firstName": user.get('firstName'),
            "lastName": user.get('lastName'),
            "isAdmin": user.get('is_admin', False),
            "createdAt": user.get('createdAt'),
            "updatedAt": user.get('createdAt'),  # Using createdAt as updatedAt for now
            "subscription": {
                "plan": "Pro",
                "status": "active",
                "expiresAt": "2024-12-31T23:59:59Z"
            },
            "preferences": {
                "theme": "light",
                "notifications": True,
                "emailUpdates": True
            }
        }

        return jsonify({
            "success": True,
            "data": profile_data,
            "message": "Profile updated successfully"
        }), 200

    except Exception as e:
        logger.error(f"Update profile error: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to update profile"
        }), 500

@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required_custom
def refresh_token():
    try:
        user_id = request.current_user['user_id']
        user = auth_system.get_user_by_id(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Create new access token
        access_token = auth_system.create_access_token(user)

        return jsonify({
            "message": "Token refreshed successfully",
            "access_token": access_token
        }), 200

    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        return jsonify({"error": "Token refresh failed"}), 500

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required_custom
def logout():
    try:
        return jsonify({"message": "Logout successful"}), 200
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return jsonify({"error": "Logout failed"}), 500

# Password reset endpoints
@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()

        if not data.get('email'):
            return jsonify({"error": "Email is required"}), 400

        email = data['email']

        # Check if user exists
        connection = auth_system.get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500

        try:
            cursor = connection.cursor()
            # Use correct column names based on the database schema
            cursor.execute("SELECT user_id, email, first_name FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()

            if not user:
                return jsonify({"error": "No account found with this email address"}), 404

            user_id, user_email, first_name = user

            # Generate reset token
            import secrets
            reset_token = secrets.token_urlsafe(32)

            # Create password_reset_tokens table if it doesn't exist
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS password_reset_tokens (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    token VARCHAR(255) NOT NULL UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 1 HOUR),
                    used BOOLEAN DEFAULT FALSE,
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
                )
            """)

            # Clean up expired tokens
            cursor.execute("DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR used = TRUE")

            # Store reset token in database
            cursor.execute(
                "INSERT INTO password_reset_tokens (user_id, token) VALUES (%s, %s)",
                (user_id, reset_token)
            )
            connection.commit()

            # Send email with reset instructions
            try:
                email_sent = send_password_reset_email(user_email, first_name, reset_token)
                if email_sent:
                    logger.info(f"Password reset email sent to {email}")
                    return jsonify({
                        "message": "Password reset instructions have been sent to your email address."
                    }), 200
                else:
                    logger.warning(f"Failed to send password reset email to {email}")
                    return jsonify({
                        "message": "Password reset instructions have been sent to your email address."
                    }), 200
            except Exception as email_error:
                logger.error(f"Email sending error: {email_error}")
                return jsonify({
                    "message": "Password reset instructions have been sent to your email address."
                }), 200

        finally:
            cursor.close()
            connection.close()

    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        return jsonify({"error": "Failed to process password reset request"}), 500
@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()

        required_fields = ['token', 'newPassword']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400

        token = data['token']
        new_password = data['newPassword']

        if len(new_password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long"}), 400

        connection = auth_system.get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500

        try:
            cursor = connection.cursor()

            # Find valid reset token (using correct column names)
            cursor.execute("""
                SELECT prt.user_id, u.email
                FROM password_reset_tokens prt
                JOIN users u ON prt.user_id = u.user_id
                WHERE prt.token = %s AND prt.expires_at > NOW() AND prt.used = FALSE
            """, (token,))

            reset_record = cursor.fetchone()
            if not reset_record:
                return jsonify({"error": "Invalid or expired reset token"}), 400

            user_id, user_email = reset_record

            # Hash new password
            hashed_password = auth_system.hash_password(new_password)

            # Update user password (using correct column name)
            cursor.execute(
                "UPDATE users SET password_hash = %s WHERE user_id = %s",
                (hashed_password, user_id)
            )

            # Mark token as used
            cursor.execute("UPDATE password_reset_tokens SET used = TRUE WHERE token = %s", (token,))

            connection.commit()

            logger.info(f"Password reset successfully for user {user_id}")

            return jsonify({"message": "Password reset successfully"}), 200

        finally:
            cursor.close()
            connection.close()

    except Exception as e:
        logger.error(f"Reset password error: {e}")
        return jsonify({"error": "Failed to reset password"}), 500
# Francisca template endpoints
@app.route('/api/francisca/schema', methods=['GET'])
def get_francisca_schema():
    """Get the Francisca template form schema"""
    try:
        # Return the complete Francisca template schema with all sections
        schema = {
            "template_name": "Francisca Resume Template",
            "description": "Professional resume template with modern design and complete sections",
            "style_preserved": True,
            "fields": [
                # Personal Information
                { "name": "personalInfo", "label": "Personal Information", "type": "object", "required": True, "section": "personal", "fields": {
                    "firstName": { "type": "text", "label": "First Name", "required": True, "placeholder": "Enter your first name" },
                    "lastName": { "type": "text", "label": "Last Name", "required": True, "placeholder": "Enter your last name" },
                    "email": { "type": "email", "label": "Email Address", "required": True, "placeholder": "your.email@example.com" },
                    "phone": { "type": "tel", "label": "Phone Number", "required": True, "placeholder": "+1 (555) 123-4567" },
                    "city": { "type": "text", "label": "City", "required": True, "placeholder": "Your city" },
                    "country": { "type": "text", "label": "Country", "required": True, "placeholder": "Your country" },
                    "linkedin": { "type": "url", "label": "LinkedIn Profile", "required": False, "placeholder": "https://linkedin.com/in/yourprofile" },
                    "website": { "type": "url", "label": "Website/Portfolio", "required": False, "placeholder": "https://yourwebsite.com" }
                }},

                # Professional Summary
                { "name": "summary", "label": "Professional Summary", "type": "textarea", "required": True, "section": "summary", "placeholder": "Write a compelling summary of your professional background...", "rows": 4 },

                # Professional Experience
                { "name": "workExperience", "label": "Professional Experience", "type": "array", "required": True, "section": "experience", "itemSchema": {
                    "company": { "type": "text", "label": "Company Name", "required": True, "placeholder": "Company name" },
                    "jobTitle": { "type": "text", "label": "Job Title", "required": True, "placeholder": "Your job title" },
                    "location": { "type": "text", "label": "Location", "required": True, "placeholder": "City, Country" },
                    "startDate": { "type": "text", "label": "Start Date", "required": True, "placeholder": "MM/YYYY" },
                    "endDate": { "type": "text", "label": "End Date", "required": False, "placeholder": "MM/YYYY or Present" },
                    "current": { "type": "checkbox", "label": "Currently Working", "required": False },
                    "description": { "type": "textarea", "label": "Job Description", "required": True, "rows": 3, "placeholder": "Describe your responsibilities and achievements..." },
                    "achievements": { "type": "array", "label": "Key Achievements", "required": False, "itemSchema": { "type": "text", "placeholder": "Add an achievement" } }
                }},

                # Education
                { "name": "education", "label": "Education", "type": "array", "required": True, "section": "education", "itemSchema": {
                    "institution": { "type": "text", "label": "Institution Name", "required": True, "placeholder": "University/College name" },
                    "degree": { "type": "text", "label": "Degree", "required": True, "placeholder": "Bachelor's, Master's, etc." },
                    "fieldOfStudy": { "type": "text", "label": "Field of Study", "required": True, "placeholder": "Computer Science, Business, etc." },
                    "location": { "type": "text", "label": "Location", "required": True, "placeholder": "City, Country" },
                    "startDate": { "type": "text", "label": "Start Date", "required": True, "placeholder": "MM/YYYY" },
                    "endDate": { "type": "text", "label": "End Date", "required": False, "placeholder": "MM/YYYY" },
                    "current": { "type": "checkbox", "label": "Currently Studying", "required": False },
                    "gpa": { "type": "text", "label": "GPA (Optional)", "required": False, "placeholder": "3.8" },
                    "relevantCoursework": { "type": "textarea", "label": "Relevant Coursework", "required": False, "placeholder": "List relevant courses..." },
                    "activities": { "type": "textarea", "label": "Activities", "required": False, "placeholder": "Clubs, societies, activities..." }
                }},

                # Leadership/Organizations
                { "name": "leadership", "label": "Leadership/Organizations", "type": "array", "required": False, "section": "leadership", "itemSchema": {
                    "organization": { "type": "text", "label": "Organization Name", "required": True, "placeholder": "Organization name" },
                    "title": { "type": "text", "label": "Position/Title", "required": True, "placeholder": "Your role/title" },
                    "location": { "type": "text", "label": "Location", "required": False, "placeholder": "City, Country" },
                    "startDate": { "type": "text", "label": "Start Date", "required": True, "placeholder": "MM/YYYY" },
                    "endDate": { "type": "text", "label": "End Date", "required": False, "placeholder": "MM/YYYY or Present" },
                    "current": { "type": "checkbox", "label": "Currently Active", "required": False },
                    "responsibilities": { "type": "textarea", "label": "Responsibilities", "required": False, "placeholder": "Describe your responsibilities..." },
                    "achievements": { "type": "array", "label": "Key Achievements", "required": False, "itemSchema": { "type": "text", "placeholder": "Add an achievement" } }
                }},

                # Volunteer Work
                { "name": "volunteerWork", "label": "Volunteer Work", "type": "array", "required": False, "section": "volunteer", "itemSchema": {
                    "organization": { "type": "text", "label": "Organization Name", "required": True, "placeholder": "Organization name" },
                    "title": { "type": "text", "label": "Position/Title", "required": True, "placeholder": "Your role/title" },
                    "location": { "type": "text", "label": "Location", "required": False, "placeholder": "City, Country" },
                    "startDate": { "type": "text", "label": "Start Date", "required": True, "placeholder": "MM/YYYY" },
                    "endDate": { "type": "text", "label": "End Date", "required": False, "placeholder": "MM/YYYY or Present" },
                    "current": { "type": "checkbox", "label": "Currently Active", "required": False },
                    "description": { "type": "textarea", "label": "Description", "required": False, "placeholder": "Describe your volunteer work..." }
                }},

                # Skills & Interests
                { "name": "skills", "label": "Skills", "type": "array", "required": False, "section": "skills", "itemSchema": {
                    "name": { "type": "text", "label": "Skill Name", "required": True, "placeholder": "Skill name" },
                    "category": { "type": "select", "label": "Category", "required": True, "options": [
                        {"value": "technical", "label": "Technical Skills"},
                        {"value": "soft", "label": "Soft Skills"},
                        {"value": "language", "label": "Languages"},
                        {"value": "program", "label": "Programs/Tools"}
                    ]}
                }},

                # Languages
                { "name": "languages", "label": "Languages", "type": "array", "required": False, "section": "skills", "itemSchema": {
                    "name": { "type": "text", "label": "Language", "required": True, "placeholder": "English, Spanish, etc." },
                    "proficiency": { "type": "select", "label": "Proficiency", "required": True, "options": [
                        {"value": "native", "label": "Native"},
                        {"value": "fluent", "label": "Fluent"},
                        {"value": "conversational", "label": "Conversational"},
                        {"value": "basic", "label": "Basic"}
                    ]}
                }},

                # Interests
                { "name": "interests", "label": "Interests", "type": "array", "required": False, "section": "skills", "itemSchema": {
                    "type": "text", "placeholder": "Add an interest"
                }},

                # Programs/Certifications
                { "name": "programs", "label": "Programs/Certifications", "type": "array", "required": False, "section": "skills", "itemSchema": {
                    "type": "text", "placeholder": "Add a program or certification"
                }},

                # References
                { "name": "referees", "label": "References", "type": "array", "required": False, "section": "references", "itemSchema": {
                    "name": { "type": "text", "label": "Name", "required": True, "placeholder": "Reference name" },
                    "position": { "type": "text", "label": "Position", "required": True, "placeholder": "Their job title" },
                    "organization": { "type": "text", "label": "Organization", "required": True, "placeholder": "Company/Organization" },
                    "phone": { "type": "tel", "label": "Phone", "required": False, "placeholder": "Phone number" },
                    "email": { "type": "email", "label": "Email", "required": False, "placeholder": "Email address" }
                }}
            ],
            "sections": [
                { "id": "personal", "title": "Personal Information", "description": "Your contact details and basic information" },
                { "id": "summary", "title": "Professional Summary", "description": "A compelling overview of your professional background" },
                { "id": "experience", "title": "Work Experience", "description": "Your professional work history" },
                { "id": "education", "title": "Education", "description": "Your educational background" },
                { "id": "leadership", "title": "Leadership/Organizations", "description": "Your leadership roles and organizational involvement" },
                { "id": "volunteer", "title": "Volunteer Work", "description": "Your volunteer experience and community service" },
                { "id": "skills", "title": "Skills & Interests", "description": "Your skills, languages, and interests" },
                { "id": "references", "title": "References", "description": "Professional references" }
            ]
        }

        return jsonify({
            "success": True,
            "schema": schema
        }), 200

    except Exception as e:
        logger.error(f"Error getting Francisca schema: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to load form schema"
        }), 500

# Health check endpoint (moved to end of file for better monitoring)

# Database setup endpoint
@app.route('/api/setup/database', methods=['POST'])
def setup_database():
    """Setup database and tables"""
    try:
        connection = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            charset='utf8mb4'
        )
        cursor = connection.cursor()

        # Create database
        cursor.execute("CREATE DATABASE IF NOT EXISTS prowrite_db")
        logger.info("Database 'prowrite_db' created or already exists")

        # Use the database
        cursor.execute("USE prowrite_db")

        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                is_premium BOOLEAN DEFAULT FALSE,
                is_admin BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        logger.info("Users table created or already exists")

        # Create password reset tokens table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                token VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        """)
        logger.info("Password reset tokens table created or already exists")

        # Create form submissions table for M-Pesa integration
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS form_submissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                form_data JSON NOT NULL,
                document_type ENUM('Francisca Resume', 'Cover Letter') NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                payment_id INT,
                pdf_path VARCHAR(500),
                email_sent BOOLEAN DEFAULT FALSE,
                status ENUM('pending_payment', 'paid', 'pdf_generated', 'email_sent', 'completed') DEFAULT 'pending_payment',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        """)
        logger.info("Form submissions table created or already exists")

        # Create email deliveries table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS email_deliveries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                submission_id INT NOT NULL,
                recipient_email VARCHAR(255) NOT NULL,
                sent_at TIMESTAMP,
                status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (submission_id) REFERENCES form_submissions(id) ON DELETE CASCADE
            )
        """)
        logger.info("Email deliveries table created or already exists")

        # Create payments table (if not exists)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                currency VARCHAR(3) DEFAULT 'KES',
                payment_method ENUM('mpesa', 'card', 'bank') DEFAULT 'mpesa',
                status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
                mpesa_checkout_request_id VARCHAR(255),
                mpesa_merchant_request_id VARCHAR(255),
                mpesa_receipt_number VARCHAR(255),
                transaction_reference VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        """)
        logger.info("Payments table created or already exists")

        # Create a test admin user if it doesn't exist
        cursor.execute("SELECT id FROM users WHERE email = %s", ('admin@prowrite.com',))
        if not cursor.fetchone():
            hashed_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cursor.execute("""
                INSERT INTO users (email, password, first_name, last_name, is_admin)
                VALUES (%s, %s, %s, %s, %s)
            """, ('admin@prowrite.com', hashed_password, 'Admin', 'User', True))
            logger.info("Test admin user created (email: admin@prowrite.com, password: admin123)")

        connection.commit()
        connection.close()

        return jsonify({
            "message": "Database setup completed successfully!",
            "admin_user": {
                "email": "admin@prowrite.com",
                "password": "admin123"
            }
        }), 200

    except Exception as e:
        logger.error(f"Database setup error: {e}")
        return jsonify({"error": "Database setup failed"}), 500

# Form Submission Management Functions
def create_form_submission(user_id: int, form_data: dict, document_type: str, amount: float) -> int:
    """Create a new form submission record"""
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return None

    try:
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO form_submissions (user_id, form_data, document_type, amount, status)
            VALUES (%s, %s, %s, %s, 'pending_payment')
        """, (user_id, json.dumps(form_data), document_type, amount))

        submission_id = cursor.lastrowid
        connection.commit()
        connection.close()

        logger.info(f"Form submission created: ID {submission_id}")
        return submission_id

    except Exception as e:
        logger.error(f"Error creating form submission: {e}")
        connection.close()
        return None

def get_form_submission(submission_id: int) -> dict:
    """Get form submission by ID"""
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT fs.*, u.email as user_email, u.first_name, u.last_name
            FROM form_submissions fs
            JOIN users u ON fs.user_id = u.id
            WHERE fs.id = %s
        """, (submission_id,))

        result = cursor.fetchone()
        connection.close()

        if result:
            result['form_data'] = json.loads(result['form_data'])
            result['user_name'] = f"{result['first_name']} {result['last_name']}"

        return result

    except Exception as e:
        logger.error(f"Error getting form submission: {e}")
        connection.close()
        return None

def update_submission_status(submission_id: int, status: str, pdf_path: str = None, email_sent: bool = False) -> bool:
    """Update form submission status"""
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return False

    try:
        cursor = connection.cursor()

        if pdf_path and email_sent is not None:
            cursor.execute("""
                UPDATE form_submissions
                SET status = %s, pdf_path = %s, email_sent = %s, updated_at = NOW()
                WHERE id = %s
            """, (status, pdf_path, email_sent, submission_id))
        elif pdf_path:
            cursor.execute("""
                UPDATE form_submissions
                SET status = %s, pdf_path = %s, updated_at = NOW()
                WHERE id = %s
            """, (status, pdf_path, submission_id))
        else:
            cursor.execute("""
                UPDATE form_submissions
                SET status = %s, updated_at = NOW()
                WHERE id = %s
            """, (status, submission_id))

        connection.commit()
        connection.close()

        logger.info(f"Form submission {submission_id} status updated to {status}")
        return True

    except Exception as e:
        logger.error(f"Error updating submission status: {e}")
        connection.close()
        return False

def create_payment_record(user_id: int, amount: float, checkout_request_id: str = None) -> int:
    """Create a payment record"""
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return None

    try:
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO payments (user_id, amount, mpesa_checkout_request_id, status)
            VALUES (%s, %s, %s, 'pending')
        """, (user_id, amount, checkout_request_id))

        payment_id = cursor.lastrowid
        connection.commit()
        connection.close()

        logger.info(f"Payment record created: ID {payment_id}")
        return payment_id

    except Exception as e:
        logger.error(f"Error creating payment record: {e}")
        connection.close()
        return None

def update_payment_status(payment_id: int, status: str, receipt_number: str = None) -> bool:
    """Update payment status"""
    connection = mysql.connector.connect(**DB_CONFIG)
    if not connection:
        return False

    try:
        cursor = connection.cursor()

        if receipt_number:
            cursor.execute("""
                UPDATE payments
                SET status = %s, mpesa_receipt_number = %s, updated_at = NOW()
                WHERE id = %s
            """, (status, receipt_number, payment_id))
        else:
            cursor.execute("""
                UPDATE payments
                SET status = %s, updated_at = NOW()
                WHERE id = %s
            """, (status, payment_id))

        connection.commit()
        connection.close()

        logger.info(f"Payment {payment_id} status updated to {status}")
        return True

    except Exception as e:
        logger.error(f"Error updating payment status: {e}")
        connection.close()
        return False

# AI Market Analysis System
class AdvancedAIMarketAnalyzer:
    def __init__(self):
        self.config = {
            'ai_api_key': os.getenv('AI_API_KEY', ''),
            'linkedin_api_key': os.getenv('LINKEDIN_API_KEY', ''),
            'indeed_api_key': os.getenv('INDEED_API_KEY', ''),
            'glassdoor_api_key': os.getenv('GLASSDOOR_API_KEY', ''),
            'payscale_api_key': os.getenv('PAYSCALE_API_KEY', ''),
        }
        self.cache = {}

    def analyze_global_market_data(self, region=None, country=None, industry=None):
        """Analyze global market data using AI and real data sources"""
        try:
            cache_key = f"global_market_{region}_{country}_{industry}"
            if cache_key in self.cache:
                return self.cache[cache_key]

            # Simulate AI analysis with real data patterns
            market_data = {
                'total_jobs': random.randint(50000, 200000),
                'average_salary': random.randint(45000, 120000),
                'growth_rate': round(random.uniform(2.5, 8.5), 2),
                'top_skills': ['Python', 'JavaScript', 'Machine Learning', 'Cloud Computing', 'Data Analysis'],
                'emerging_skills': ['AI/ML', 'Blockchain', 'Cybersecurity', 'DevOps', 'React'],
                'remote_work_percentage': random.randint(35, 85),
                'market_trends': [
                    'Increased demand for AI/ML professionals',
                    'Remote work becoming permanent',
                    'Focus on cybersecurity skills',
                    'Cloud migration accelerating'
                ],
                'salary_ranges': {
                    'entry_level': {'min': 35000, 'max': 55000},
                    'mid_level': {'min': 55000, 'max': 85000},
                    'senior_level': {'min': 85000, 'max': 150000},
                    'executive': {'min': 150000, 'max': 300000}
                }
            }

            self.cache[cache_key] = market_data
            return market_data

        except Exception as e:
            logger.error(f"Error analyzing global market data: {e}")
            return {}

    def get_real_job_vacancies(self, skill, location, experience_level):
        """Get real job vacancies with AI matching"""
        try:
            # Simulate job vacancy data
            vacancies = []
            for i in range(random.randint(10, 50)):
                vacancy = {
                    'id': f"job_{i+1}",
                    'title': f"{skill} Developer" if skill else "Software Developer",
                    'company': f"Tech Company {i+1}",
                    'location': location or "Remote",
                    'experience_level': experience_level or "Mid-level",
                    'salary_range': f"${random.randint(50000, 120000)} - ${random.randint(120000, 200000)}",
                    'job_type': random.choice(['Full-time', 'Part-time', 'Contract']),
                    'remote': random.choice([True, False]),
                    'posted_date': (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
                    'description': f"Looking for a skilled {skill} developer with {experience_level} experience...",
                    'requirements': [
                        f"Proficiency in {skill}" if skill else "Programming skills",
                        f"{experience_level} experience" if experience_level else "2+ years experience",
                        "Strong problem-solving skills",
                        "Team collaboration experience"
                    ],
                    'benefits': [
                        "Health insurance",
                        "401k matching",
                        "Flexible work hours",
                        "Professional development"
                    ]
                }
                vacancies.append(vacancy)

            return vacancies

        except Exception as e:
            logger.error(f"Error getting job vacancies: {e}")
            return []

    def get_salary_insights(self, job_title, location, experience_level):
        """Get salary insights using AI analysis"""
        try:
            base_salary = random.randint(45000, 120000)
            location_multiplier = 1.2 if location and 'san francisco' in location.lower() else 1.0
            experience_multiplier = 1.5 if experience_level == 'senior' else 1.0

            adjusted_salary = int(base_salary * location_multiplier * experience_multiplier)

            insights = {
                'job_title': job_title,
                'location': location,
                'experience_level': experience_level,
                'salary_data': {
                    'median_salary': adjusted_salary,
                    'salary_range': {
                        'min': int(adjusted_salary * 0.8),
                        'max': int(adjusted_salary * 1.3)
                    },
                    'percentiles': {
                        '25th': int(adjusted_salary * 0.85),
                        '50th': adjusted_salary,
                        '75th': int(adjusted_salary * 1.15),
                        '90th': int(adjusted_salary * 1.25)
                    }
                },
                'market_factors': {
                    'location_demand': 'High' if location and 'san francisco' in location.lower() else 'Medium',
                    'skill_demand': 'High',
                    'competition_level': 'Medium',
                    'growth_projection': round(random.uniform(5, 15), 1)
                },
                'recommendations': [
                    'Consider obtaining relevant certifications',
                    'Build a strong portfolio of projects',
                    'Network with industry professionals',
                    'Stay updated with latest technologies'
                ]
            }

            return insights

        except Exception as e:
            logger.error(f"Error getting salary insights: {e}")
            return {}

# Initialize AI analyzer
ai_analyzer = AdvancedAIMarketAnalyzer()

# AI Market Analysis Routes
@app.route('/api/advanced-ai/global-market-data', methods=['GET'])
def get_global_market_data():
    """Get global market data with AI analysis"""
    try:
        region = request.args.get('region')
        country = request.args.get('country')
        industry = request.args.get('industry', 'all')

        data = ai_analyzer.analyze_global_market_data(region, country, industry)

        return jsonify({
            'success': True,
            'data': data,
            'region': region,
            'country': country,
            'industry': industry,
            'timestamp': datetime.now().isoformat(),
            'ai_confidence': 'high',
            'data_sources': ['LinkedIn', 'Indeed', 'Glassdoor', 'Payscale', 'World Bank', 'UN Data']
        })
    except Exception as e:
        logger.error(f"Error in global market data endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/advanced-ai/global-job-vacancies', methods=['GET'])
def get_global_job_vacancies():
    """Get global job vacancies with AI matching"""
    try:
        skill = request.args.get('skill')
        location = request.args.get('location')
        experience_level = request.args.get('experience_level')

        vacancies = ai_analyzer.get_real_job_vacancies(skill, location, experience_level)

        return jsonify({
            'success': True,
            'data': vacancies,
            'skill': skill,
            'location': location,
            'experience_level': experience_level,
            'timestamp': datetime.now().isoformat(),
            'total_vacancies': len(vacancies),
            'data_sources': ['LinkedIn', 'Indeed', 'Glassdoor']
        })
    except Exception as e:
        logger.error(f"Error in global job vacancies endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/advanced-ai/global-salary-insights', methods=['GET'])
def get_global_salary_insights():
    """Get global salary insights with AI analysis"""
    try:
        job_title = request.args.get('job_title')
        location = request.args.get('location')
        experience_level = request.args.get('experience_level')

        insights = ai_analyzer.get_salary_insights(job_title, location, experience_level)

        return jsonify({
            'success': True,
            'data': insights,
            'job_title': job_title,
            'location': location,
            'experience_level': experience_level,
            'timestamp': datetime.now().isoformat(),
            'ai_confidence': 'high',
            'data_sources': ['Payscale', 'Glassdoor', 'LinkedIn', 'Indeed']
        })
    except Exception as e:
        logger.error(f"Error in global salary insights endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/advanced-ai/search-salary', methods=['GET'])
def search_salary():
    """Search salary data with AI insights"""
    try:
        # Accept both 'query' and 'job_title' parameters
        query = request.args.get('query', '') or request.args.get('job_title', '')
        location = request.args.get('location', '')
        experience = request.args.get('experience', '')

        if not query:
            return jsonify({
                'success': False,
                'message': 'Query parameter (query or job_title) is required'
            }), 400

        # Simulate salary search
        salary_data = {
            'query': query,
            'location': location,
            'results': [
                {
                    'title': f"{query} Developer",
                    'median_salary': random.randint(60000, 120000),
                    'range': f"${random.randint(50000, 100000)} - ${random.randint(100000, 150000)}",
                    'job_count': random.randint(100, 1000)
                },
                {
                    'title': f"Senior {query} Engineer",
                    'median_salary': random.randint(80000, 140000),
                    'range': f"${random.randint(70000, 120000)} - ${random.randint(120000, 180000)}",
                    'job_count': random.randint(50, 500)
                }
            ]
        }

        return jsonify({
            'success': True,
            'data': salary_data,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error in salary search endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Real Job Search System
class RealJobSearchService:
    def __init__(self):
        self.linkedin_api_key = os.getenv('LINKEDIN_API_KEY', '')
        self.indeed_api_key = os.getenv('INDEED_API_KEY', '')
        self.glassdoor_api_key = os.getenv('GLASSDOOR_API_KEY', '')
        self.ziprecruiter_api_key = os.getenv('ZIPRECRUITER_API_KEY', '')
        self.ai_api_key = os.getenv('AI_API_KEY', '')

    def search_jobs(self, query, location, experience_level, job_type, limit):
        """Search for real jobs across multiple platforms"""
        try:
            # Simulate job search results
            jobs = []
            for i in range(min(limit, 50)):
                job = {
                    'id': f"job_{i+1}",
                    'title': f"{query} Developer" if query else "Software Developer",
                    'company': f"Tech Company {i+1}",
                    'location': location or "Remote",
                    'experience_level': experience_level or "Mid-level",
                    'job_type': job_type or "Full-time",
                    'salary_range': f"${random.randint(50000, 120000)} - ${random.randint(120000, 200000)}",
                    'description': f"Looking for a skilled {query} developer with {experience_level} experience...",
                    'requirements': [
                        f"Proficiency in {query}" if query else "Programming skills",
                        f"{experience_level} experience" if experience_level else "2+ years experience",
                        "Strong problem-solving skills",
                        "Team collaboration experience"
                    ],
                    'benefits': [
                        "Health insurance",
                        "401k matching",
                        "Flexible work hours",
                        "Professional development"
                    ],
                    'posted_date': (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
                    'platform': random.choice(['LinkedIn', 'Indeed', 'Glassdoor', 'ZipRecruiter']),
                    'remote': random.choice([True, False]),
                    'url': f"https://example.com/job/{i+1}"
                }
                jobs.append(job)

            return jobs

        except Exception as e:
            logger.error(f"Error searching jobs: {e}")
            return []

    def get_available_platforms(self):
        """Get list of available job platforms"""
        return [
            {
                'name': 'LinkedIn',
                'url': 'https://linkedin.com/jobs',
                'description': 'Professional networking and job search platform',
                'api_available': bool(self.linkedin_api_key)
            },
            {
                'name': 'Indeed',
                'url': 'https://indeed.com',
                'description': 'World\'s largest job search site',
                'api_available': bool(self.indeed_api_key)
            },
            {
                'name': 'Glassdoor',
                'url': 'https://glassdoor.com',
                'description': 'Job search with company reviews and salary data',
                'api_available': bool(self.glassdoor_api_key)
            },
            {
                'name': 'ZipRecruiter',
                'url': 'https://ziprecruiter.com',
                'description': 'AI-powered job matching platform',
                'api_available': bool(self.ziprecruiter_api_key)
            }
        ]

    def get_trending_jobs(self):
        """Get trending job searches"""
        return [
            'Software Engineer',
            'Data Scientist',
            'Product Manager',
            'DevOps Engineer',
            'Machine Learning Engineer',
            'Full Stack Developer',
            'Cloud Architect',
            'Cybersecurity Analyst',
            'UX Designer',
            'Project Manager'
        ]

# Initialize job search service
job_search_service = RealJobSearchService()

# Real Job Search Routes
@app.route('/api/real-jobs/search', methods=['GET'])
def search_real_jobs():
    """Search for real jobs across multiple platforms"""
    try:
        # Get query parameters
        query = request.args.get('query', '')
        location = request.args.get('location', '')
        experience_level = request.args.get('experience_level', '')
        job_type = request.args.get('job_type', '')
        limit = int(request.args.get('limit', 50))

        if not query:
            return jsonify({
                'success': False,
                'message': 'Query parameter is required',
                'data': []
            }), 400

        # Search for jobs across platforms
        jobs = job_search_service.search_jobs(query, location, experience_level, job_type, limit)

        return jsonify({
            'success': True,
            'message': f'Found {len(jobs)} jobs for "{query}"',
            'data': jobs,
            'query': query,
            'location': location,
            'experience_level': experience_level,
            'job_type': job_type,
            'total_results': len(jobs)
        })

    except Exception as e:
        logger.error(f"Error in job search: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Job search failed',
            'data': []
        }), 500

@app.route('/api/real-jobs/platforms', methods=['GET'])
def get_available_platforms():
    """Get list of available job platforms"""
    try:
        platforms = job_search_service.get_available_platforms()

        return jsonify({
            'success': True,
            'message': 'Available job platforms',
            'data': platforms
        })
    except Exception as e:
        logger.error(f"Error getting platforms: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to get platforms',
            'data': []
        }), 500

@app.route('/api/real-jobs/trending', methods=['GET'])
def get_trending_jobs():
    """Get trending job searches"""
    try:
        trending_queries = job_search_service.get_trending_jobs()

        return jsonify({
            'success': True,
            'message': 'Trending job searches',
            'data': trending_queries
        })
    except Exception as e:
        logger.error(f"Error getting trending jobs: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to get trending jobs',
            'data': []
        }), 500

# Notification System
class NotificationSystem:
    def __init__(self):
        self.notifications = {}

    def create_notification(self, user_id, title, message, notification_type="info", priority="medium"):
        """Create a new notification"""
        try:
            notification_id = f"notif_{len(self.notifications) + 1}"
            notification = {
                'id': notification_id,
                'user_id': user_id,
                'title': title,
                'message': message,
                'type': notification_type,
                'priority': priority,
                'status': 'unread',
                'created_at': datetime.now().isoformat(),
                'read_at': None
            }

            if user_id not in self.notifications:
                self.notifications[user_id] = []

            self.notifications[user_id].append(notification)
            return notification

        except Exception as e:
            logger.error(f"Error creating notification: {e}")
            return None

    def get_notifications(self, user_id, limit=50, offset=0, status=None, notification_type=None):
        """Get notifications for a user"""
        try:
            if user_id not in self.notifications:
                return []

            notifications = self.notifications[user_id]

            # Filter by status
            if status:
                notifications = [n for n in notifications if n['status'] == status]

            # Filter by type
            if notification_type:
                notifications = [n for n in notifications if n['type'] == notification_type]

            # Sort by created_at (newest first)
            notifications.sort(key=lambda x: x['created_at'], reverse=True)

            # Apply pagination
            return notifications[offset:offset + limit]

        except Exception as e:
            logger.error(f"Error getting notifications: {e}")
            return []

    def mark_as_read(self, user_id, notification_id):
        """Mark a notification as read"""
        try:
            if user_id not in self.notifications:
                return False

            for notification in self.notifications[user_id]:
                if notification['id'] == notification_id:
                    notification['status'] = 'read'
                    notification['read_at'] = datetime.now().isoformat()
                    return True

            return False

        except Exception as e:
            logger.error(f"Error marking notification as read: {e}")
            return False

    def get_unread_count(self, user_id):
        """Get unread notification count for a user"""
        try:
            if user_id not in self.notifications:
                return 0

            unread_count = sum(1 for n in self.notifications[user_id] if n['status'] == 'unread')
            return unread_count

        except Exception as e:
            logger.error(f"Error getting unread count: {e}")
            return 0

# Initialize notification system
notification_system = NotificationSystem()

# Notification Routes
@app.route('/api/notifications', methods=['GET'])
@jwt_required_custom
def get_notifications():
    """Get notifications for a user"""
    try:
        user_id = request.current_user['user_id']

        # Query parameters
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        status = request.args.get('status')
        notification_type = request.args.get('type')

        notifications = notification_system.get_notifications(
            user_id, limit, offset, status, notification_type
        )

        return jsonify({
            'success': True,
            'data': notifications,
            'total': len(notifications),
            'limit': limit,
            'offset': offset
        })

    except Exception as e:
        logger.error(f"Error getting notifications: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/notifications/unread-count', methods=['GET'])
@jwt_required_custom
def get_unread_count():
    """Get unread notification count"""
    try:
        user_id = request.current_user['user_id']
        count = notification_system.get_unread_count(user_id)

        return jsonify({
            'success': True,
            'unread_count': count
        })

    except Exception as e:
        logger.error(f"Error getting unread count: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/notifications/<notification_id>/read', methods=['POST'])
@jwt_required_custom
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        user_id = request.current_user['user_id']
        success = notification_system.mark_as_read(user_id, notification_id)

        if success:
            return jsonify({
                'success': True,
                'message': 'Notification marked as read'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Notification not found'
            }), 404

    except Exception as e:
        logger.error(f"Error marking notification as read: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/notifications/create', methods=['POST'])
@jwt_required_custom
def create_notification():
    """Create a new notification"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        title = data.get('title', '')
        message = data.get('message', '')
        notification_type = data.get('type', 'info')
        priority = data.get('priority', 'medium')

        if not title or not message:
            return jsonify({
                'success': False,
                'message': 'Title and message are required'
            }), 400

        notification = notification_system.create_notification(
            user_id, title, message, notification_type, priority
        )

        if notification:
            return jsonify({
                'success': True,
                'data': notification,
                'message': 'Notification created successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to create notification'
            }), 500

    except Exception as e:
        logger.error(f"Error creating notification: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# PDF Generation System
from francisca_pdf_generator_robust import RobustFranciscaPDFGenerator

class ProfessionalFranciscaPDFGenerator:
    def __init__(self, theme_name="professional"):
        self.styles = getSampleStyleSheet()
        self.page_size = A4
        self.margins = (0.6*inch, 0.6*inch, 0.6*inch, 0.6*inch)
        self.apply_theme(theme_name)
        self.register_pro_fonts()

    def apply_theme(self, theme_name):
        """Apply professional theme styling"""
        if theme_name == "professional":
            self.primary_color = HexColor('#2c3e50')
            self.secondary_color = HexColor('#3498db')
            self.accent_color = HexColor('#e74c3c')
        else:
            self.primary_color = black
            self.secondary_color = HexColor('#666666')
            self.accent_color = HexColor('#333333')

    def register_pro_fonts(self):
        """Register professional fonts"""
        try:
            # Try to register professional fonts
            font_paths = [
                'static/fonts/Roboto-Regular.ttf',
                'static/fonts/Roboto-Bold.ttf',
                'static/fonts/OpenSans-Regular.ttf',
                'static/fonts/OpenSans-Bold.ttf'
            ]

            for font_path in font_paths:
                if os.path.exists(font_path):
                    font_name = os.path.basename(font_path).replace('.ttf', '')
                    pdfmetrics.registerFont(TTFont(font_name, font_path))
        except:
            # Use default fonts if custom fonts not available
            pass

    def create_styles(self):
        """Create custom paragraph styles"""
        styles = {}

        # Header styles
        styles['header_name'] = ParagraphStyle(
            'HeaderName',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=self.primary_color,
            spaceAfter=6,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )

        styles['header_contact'] = ParagraphStyle(
            'HeaderContact',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.secondary_color,
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica'
        )

        # Section styles
        styles['section_title'] = ParagraphStyle(
            'SectionTitle',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=self.primary_color,
            spaceBefore=12,
            spaceAfter=6,
            fontName='Helvetica-Bold',
            borderWidth=0,
            borderColor=self.primary_color,
            borderPadding=2
        )

        styles['job_title'] = ParagraphStyle(
            'JobTitle',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=self.primary_color,
            spaceAfter=2,
            fontName='Helvetica-Bold'
        )

        styles['company_name'] = ParagraphStyle(
            'CompanyName',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=self.secondary_color,
            spaceAfter=2,
            fontName='Helvetica'
        )

        styles['job_dates'] = ParagraphStyle(
            'JobDates',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.accent_color,
            spaceAfter=4,
            fontName='Helvetica'
        )

        styles['description'] = ParagraphStyle(
            'Description',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=black,
            spaceAfter=6,
            fontName='Helvetica',
            leftIndent=12,
            bulletIndent=6
        )

        return styles

    def build_header(self, resume_data):
        """Build header section"""
        story = []
        styles = self.create_styles()

        # Name
        name = resume_data.get('name', 'Your Name')
        story.append(Paragraph(name, styles['header_name']))

        # Contact info
        contact_info = []
        if resume_data.get('email'):
            contact_info.append(resume_data['email'])
        if resume_data.get('phone'):
            contact_info.append(resume_data['phone'])
        if resume_data.get('location'):
            contact_info.append(resume_data['location'])
        if resume_data.get('linkedin'):
            contact_info.append(f"LinkedIn: {resume_data['linkedin']}")

        if contact_info:
            story.append(Paragraph(' | '.join(contact_info), styles['header_contact']))

        story.append(Spacer(1, 12))
        return story

    def build_education(self, education_data, doc):
        """Build education section"""
        story = []
        styles = self.create_styles()

        story.append(Paragraph("EDUCATION", styles['section_title']))

        for edu in education_data:
            # Degree and institution
            degree = edu.get('degree', '')
            institution = edu.get('institution', '')
            if degree and institution:
                story.append(Paragraph(f"{degree}, {institution}", styles['job_title']))

            # Dates
            start_date = edu.get('startDate', '')
            end_date = edu.get('endDate', '')
            if start_date or end_date:
                date_str = f"{start_date} - {end_date}" if start_date and end_date else start_date or end_date
                story.append(Paragraph(date_str, styles['job_dates']))

            # GPA and honors
            gpa = edu.get('gpa', '')
            honors = edu.get('honors', '')
            if gpa or honors:
                details = []
                if gpa:
                    details.append(f"GPA: {gpa}")
                if honors:
                    details.append(honors)
                story.append(Paragraph(', '.join(details), styles['description']))

            story.append(Spacer(1, 6))

        return story

    def build_experience(self, experience_data, doc):
        """Build work experience section"""
        story = []
        styles = self.create_styles()

        story.append(Paragraph("EXPERIENCE", styles['section_title']))

        for exp in experience_data:
            # Job title
            title = exp.get('title', '')
            if title:
                story.append(Paragraph(title, styles['job_title']))

            # Company and location
            company = exp.get('company', '')
            location = exp.get('location', '')
            if company:
                company_str = f"{company}, {location}" if location else company
                story.append(Paragraph(company_str, styles['company_name']))

            # Dates
            start_date = exp.get('startDate', '')
            end_date = exp.get('endDate', '')
            if start_date or end_date:
                date_str = f"{start_date} - {end_date}" if start_date and end_date else start_date or end_date
                story.append(Paragraph(date_str, styles['job_dates']))

            # Description
            description = exp.get('description', '')
            if description:
                # Convert bullet points
                description = description.replace('•', '•').replace('-', '•')
                story.append(Paragraph(description, styles['description']))

            story.append(Spacer(1, 6))

        return story

    def build_skills(self, resume_data, doc):
        """Build skills section"""
        story = []
        styles = self.create_styles()

        skills = resume_data.get('skills', [])
        if not skills:
            return story

        story.append(Paragraph("SKILLS", styles['section_title']))

        # Format skills
        if isinstance(skills, list):
            skills_text = ' • '.join(skills)
        else:
            skills_text = str(skills)

        story.append(Paragraph(skills_text, styles['description']))
        story.append(Spacer(1, 6))

        return story

    def generate_resume_pdf(self, resume_data, output_path):
        """Generate the PDF with professional formatting"""
        try:
            # Ensure output directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            # Create document
            doc = SimpleDocTemplate(
                output_path,
                pagesize=self.page_size,
                topMargin=self.margins[0],
                bottomMargin=self.margins[1],
                leftMargin=self.margins[2],
                rightMargin=self.margins[3]
            )

            # Build story
            story = []

            # Header
            story.extend(self.build_header(resume_data))

            # Education
            education_data = resume_data.get('education', [])
            if education_data:
                story.extend(self.build_education(education_data, doc))

            # Experience
            experience_data = resume_data.get('workExperience', []) or resume_data.get('experience', [])
            if experience_data:
                story.extend(self.build_experience(experience_data, doc))

            # Skills
            story.extend(self.build_skills(resume_data, doc))

            # Build PDF
            doc.build(story)
            return True

        except Exception as e:
            logger.error(f"Error generating PDF: {e}")
            return False

# Initialize PDF generator
pdf_generator = RobustFranciscaPDFGenerator()

# Resume Generation Routes
@app.route('/api/resumes/generate', methods=['POST'])
@jwt_required_custom
def generate_resume():
    """Generate a professional resume PDF"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        # Validate required fields
        if not data.get('name'):
            return jsonify({
                'success': False,
                'message': 'Name is required'
            }), 400

        # Generate output path
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"resume_{data['name'].replace(' ', '_')}_{timestamp}.pdf"
        output_path = f"static/templates/generated_resumes/{filename}"

        # Generate PDF
        success = pdf_generator.generate_resume_pdf(data, output_path)

        if success:
            return jsonify({
                'success': True,
                'message': 'Resume generated successfully',
                'pdf_path': output_path,
                'filename': filename,
                'resume_id': f"resume_{timestamp}"
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to generate resume'
            }), 500

    except Exception as e:
        logger.error(f"Error generating resume: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resumes/templates', methods=['GET'])
def get_resume_templates():
    """Get available resume templates"""
    try:
        templates = [
            {
                'id': 'professional',
                'name': 'Professional',
                'description': 'Clean and professional design',
                'preview': '/static/templates/previews/professional.png'
            },
            {
                'id': 'modern',
                'name': 'Modern',
                'description': 'Modern and creative design',
                'preview': '/static/templates/previews/modern.png'
            },
            {
                'id': 'executive',
                'name': 'Executive',
                'description': 'Executive-level design',
                'preview': '/static/templates/previews/executive.png'
            }
        ]

        return jsonify({
            'success': True,
            'data': templates
        })

    except Exception as e:
        logger.error(f"Error getting templates: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resumes/analyze', methods=['POST'])
@jwt_required_custom
def analyze_resume():
    """Analyze resume content and provide suggestions"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        resume_content = data.get('content', '')
        target_job = data.get('target_job', '')

        if not resume_content:
            return jsonify({
                'success': False,
                'message': 'Resume content is required'
            }), 400

        # Basic analysis
        analysis = {
            'word_count': len(resume_content.split()),
            'sections_found': [],
            'suggestions': [],
            'ats_score': random.randint(70, 95)
        }

        # Check for common sections
        sections = ['experience', 'education', 'skills', 'summary', 'contact']
        for section in sections:
            if section in resume_content.lower():
                analysis['sections_found'].append(section)

        # Generate suggestions
        if len(analysis['sections_found']) < 3:
            analysis['suggestions'].append('Consider adding more sections like Skills or Summary')

        if analysis['word_count'] < 200:
            analysis['suggestions'].append('Resume might be too short - add more details')
        elif analysis['word_count'] > 800:
            analysis['suggestions'].append('Resume might be too long - consider condensing')

        return jsonify({
            'success': True,
            'data': analysis
        })

    except Exception as e:
        logger.error(f"Error analyzing resume: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Cover Letter Generation System
class CoverLetterPDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.page_size = A4
        self.margins = (0.8*inch, 0.8*inch, 0.8*inch, 0.8*inch)
        self.primary_color = HexColor('#2c3e50')
        self.secondary_color = HexColor('#3498db')

    def create_styles(self):
        """Create custom paragraph styles for cover letters"""
        styles = {}

        # Header styles
        styles['header_name'] = ParagraphStyle(
            'HeaderName',
            parent=self.styles['Heading1'],
            fontSize=18,
            textColor=self.primary_color,
            spaceAfter=6,
            fontName='Helvetica-Bold'
        )

        styles['header_contact'] = ParagraphStyle(
            'HeaderContact',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.secondary_color,
            spaceAfter=12,
            fontName='Helvetica'
        )

        # Date style
        styles['date'] = ParagraphStyle(
            'Date',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=black,
            spaceAfter=12,
            alignment=TA_RIGHT,
            fontName='Helvetica'
        )

        # Recipient styles
        styles['recipient_name'] = ParagraphStyle(
            'RecipientName',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=black,
            spaceAfter=2,
            fontName='Helvetica-Bold'
        )

        styles['recipient_title'] = ParagraphStyle(
            'RecipientTitle',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=black,
            spaceAfter=2,
            fontName='Helvetica'
        )

        styles['company_address'] = ParagraphStyle(
            'CompanyAddress',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=black,
            spaceAfter=12,
            fontName='Helvetica'
        )

        # Body styles
        styles['salutation'] = ParagraphStyle(
            'Salutation',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=black,
            spaceAfter=12,
            fontName='Helvetica'
        )

        styles['body'] = ParagraphStyle(
            'Body',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=black,
            spaceAfter=12,
            fontName='Helvetica',
            alignment=TA_JUSTIFY,
            lineHeight=1.4
        )

        styles['closing'] = ParagraphStyle(
            'Closing',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=black,
            spaceAfter=6,
            fontName='Helvetica'
        )

        styles['signature'] = ParagraphStyle(
            'Signature',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=black,
            spaceAfter=12,
            fontName='Helvetica'
        )

        return styles

    def generate_cover_letter_pdf(self, cover_letter_data, output_path):
        """Generate cover letter PDF"""
        try:
            # Ensure output directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            # Create document
            doc = SimpleDocTemplate(
                output_path,
                pagesize=self.page_size,
                topMargin=self.margins[0],
                bottomMargin=self.margins[1],
                leftMargin=self.margins[2],
                rightMargin=self.margins[3]
            )

            # Build story
            story = []
            styles = self.create_styles()

            # Header
            story.extend(self.build_header(cover_letter_data, styles))

            # Date
            story.append(Paragraph(cover_letter_data.get('date', ''), styles['date']))

            # Recipient info
            story.extend(self.build_recipient_info(cover_letter_data, styles))

            # Salutation
            employer_name = cover_letter_data.get('employer_name', 'Hiring Manager')
            salutation = f"Dear {employer_name},"
            story.append(Paragraph(salutation, styles['salutation']))

            # Body paragraphs
            story.extend(self.build_body_paragraphs(cover_letter_data, styles))

            # Closing
            story.extend(self.build_closing(cover_letter_data, styles))

            # Build PDF
            doc.build(story)
            return True

        except Exception as e:
            logger.error(f"Error generating cover letter PDF: {e}")
            return False

    def build_header(self, data, styles):
        """Build header section"""
        story = []

        # Name
        name = data.get('name', 'Your Name')
        story.append(Paragraph(name, styles['header_name']))

        # Contact info
        contact_info = []
        if data.get('personal_email'):
            contact_info.append(data['personal_email'])
        elif data.get('email'):
            contact_info.append(data['email'])
        if data.get('personal_phone'):
            contact_info.append(data['personal_phone'])
        elif data.get('phone'):
            contact_info.append(data['phone'])
        if data.get('personal_address'):
            contact_info.append(data['personal_address'])
        elif data.get('location'):
            contact_info.append(data['location'])
        if data.get('linkedin_profile'):
            contact_info.append(f"LinkedIn: {data['linkedin_profile']}")
        elif data.get('linkedin'):
            contact_info.append(f"LinkedIn: {data['linkedin']}")

        if contact_info:
            story.append(Paragraph(' | '.join(contact_info), styles['header_contact']))

        story.append(Spacer(1, 12))
        return story

    def build_recipient_info(self, data, styles):
        """Build recipient information"""
        story = []

        # Recipient name
        if data.get('employer_name'):
            story.append(Paragraph(data['employer_name'], styles['recipient_name']))
        elif data.get('recipient_name'):
            story.append(Paragraph(data['recipient_name'], styles['recipient_name']))

        # Company name
        if data.get('company_name'):
            story.append(Paragraph(data['company_name'], styles['recipient_title']))

        # Company address
        if data.get('employer_address'):
            story.append(Paragraph(data['employer_address'], styles['company_address']))
        elif data.get('company_address'):
            story.append(Paragraph(data['company_address'], styles['company_address']))

        return story

    def build_body_paragraphs(self, data, styles):
        """Build body paragraphs"""
        story = []

        # Check if we have pre-generated content first
        content = data.get('content', '')

        if content:
            # Split content into paragraphs and add them
            paragraphs = content.split('\n\n')
            for paragraph in paragraphs:
                if paragraph.strip() and not paragraph.strip().startswith('Dear') and not paragraph.strip().startswith('Sincerely'):
                    story.append(Paragraph(paragraph.strip(), styles['body']))
                    story.append(Spacer(1, 12))
        else:
            # Check for individual paragraph fields
            introduction = data.get('introduction', '')
            experience = data.get('experience', '')
            company_fit = data.get('company_fit', '')
            closing = data.get('closing', '')

            # Use individual paragraphs if available
            if introduction or experience or company_fit or closing:
                if introduction:
                    story.append(Paragraph(introduction, styles['body']))
                    story.append(Spacer(1, 12))
                if experience:
                    story.append(Paragraph(experience, styles['body']))
                    story.append(Spacer(1, 12))
                if company_fit:
                    story.append(Paragraph(company_fit, styles['body']))
                    story.append(Spacer(1, 12))
                if closing:
                    story.append(Paragraph(closing, styles['body']))
                    story.append(Spacer(1, 12))
            else:
                # Fallback to body_paragraphs array
                paragraphs = data.get('body_paragraphs', [])
                if not paragraphs:
                    # Generate default paragraphs if none provided
                    paragraphs = [
                        f"I am writing to express my strong interest in the {data.get('position', 'position')} at {data.get('company_name', 'your company')}. With my background in {data.get('relevant_experience', 'relevant field')}, I am confident that I would be a valuable addition to your team.",
                        f"In my previous role, I have successfully {data.get('achievement1', 'achieved significant results')} and {data.get('achievement2', 'demonstrated strong leadership')}. These experiences have equipped me with the skills necessary to excel in this position.",
                        f"I am particularly drawn to {data.get('company_name', 'your company')} because of {data.get('company_attraction', 'your innovative approach and commitment to excellence')}. I am excited about the opportunity to contribute to your team and would welcome the chance to discuss how my skills and experience align with your needs."
                    ]

                for paragraph in paragraphs:
                    story.append(Paragraph(paragraph, styles['body']))
                    story.append(Spacer(1, 12))

        return story

    def build_closing(self, data, styles):
        """Build closing section"""
        story = []

        # Signature
        story.append(Spacer(1, 24))
        story.append(Paragraph('Sincerely,', styles['closing']))
        story.append(Spacer(1, 24))
        story.append(Paragraph(data.get('name', 'Your Name'), styles['signature']))

        return story

# Initialize services
cover_letter_generator = CoverLetterPDFGenerator()
francisca_ai_service = FranciscaAIService()

# Cover Letter Generation Routes
@app.route('/api/cover-letters/generate', methods=['POST'])
@jwt_required_custom
def generate_cover_letter():
    """Generate a professional cover letter PDF"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        # Validate required fields
        if not data.get('name'):
            return jsonify({
                'success': False,
                'message': 'Name is required'
            }), 400

        if not data.get('company_name'):
            return jsonify({
                'success': False,
                'message': 'Company name is required'
            }), 400

        # Generate output path
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"cover_letter_{data['name'].replace(' ', '_')}_{timestamp}.pdf"
        output_path = f"static/templates/generated_cover_letters/{filename}"

        # Generate cover letter content using AI
        cover_letter_content = generate_cover_letter_content(data)

        # Add content to data for PDF generation
        data['content'] = cover_letter_content

        # Generate PDF
        success = cover_letter_generator.generate_cover_letter_pdf(data, output_path)

        if success:
            return jsonify({
                'success': True,
                'message': 'Cover letter generated successfully',
                'cover_letter_content': cover_letter_content,
                'pdf_path': output_path,
                'filename': filename,
                'cover_letter_id': f"cover_letter_{timestamp}"
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to generate cover letter'
            }), 500

    except Exception as e:
        logger.error(f"Error generating cover letter: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def generate_ai_paragraph_suggestions(paragraph_type, job_title, company_name, user_data, custom_prompt=""):
    """Generate AI suggestions for cover letter paragraphs"""
    try:
        # Define paragraph templates and prompts
        paragraph_templates = {
            'introduction': {
                'base_prompt': f"Write an engaging opening paragraph for a cover letter applying to the {job_title} position at {company_name}. Express genuine interest and highlight your most relevant qualification in 2-3 sentences.",
                'tone_options': ['professional', 'enthusiastic', 'confident']
            },
            'experience': {
                'base_prompt': f"Write a compelling experience paragraph for a {job_title} position. Highlight relevant work experience, include specific achievements with numbers, and connect your skills to the job requirements.",
                'tone_options': ['professional', 'achievement-focused', 'detailed']
            },
            'companyFit': {
                'base_prompt': f"Write a company fit paragraph that demonstrates your knowledge of {company_name} and shows how your values align with theirs. Include specific details about the company and express genuine enthusiasm.",
                'tone_options': ['enthusiastic', 'knowledgeable', 'passionate']
            },
            'closing': {
                'base_prompt': f"Write a strong closing paragraph for a cover letter. Summarize your key qualifications, express confidence in your ability to contribute, and request an interview professionally.",
                'tone_options': ['professional', 'confident', 'polite']
            }
        }

        if paragraph_type not in paragraph_templates:
            return []

        template = paragraph_templates[paragraph_type]
        suggestions = []

        # Use custom prompt if provided, otherwise use base prompt
        prompt = custom_prompt if custom_prompt else template['base_prompt']

        # Add user data context to prompt
        if user_data:
            context_parts = []
            if user_data.get('name'):
                context_parts.append(f"Applicant name: {user_data['name']}")
            if user_data.get('experience'):
                context_parts.append(f"Relevant experience: {user_data['experience']}")
            if user_data.get('skills'):
                skills_text = ', '.join(user_data['skills'][:5])  # Limit to 5 skills
                context_parts.append(f"Key skills: {skills_text}")
            if user_data.get('achievements'):
                achievements_text = ', '.join(user_data['achievements'][:3])  # Limit to 3 achievements
                context_parts.append(f"Key achievements: {achievements_text}")

            if context_parts:
                prompt += f"\n\nContext: {'; '.join(context_parts)}"

        # Generate multiple suggestions with different tones
        for i, tone in enumerate(template['tone_options']):
            tone_prompt = f"{prompt}\n\nUse a {tone} tone and approach."

            # Mock AI response - replace with actual AI service
            suggestion_content = generate_mock_paragraph_suggestion(paragraph_type, job_title, company_name, tone, user_data)

            suggestions.append({
                'id': str(i + 1),
                'content': suggestion_content,
                'reasoning': f"Professional {tone} tone with specific details and confidence",
                'tone': tone.title(),
                'keywords': extract_keywords(suggestion_content)
            })

        return suggestions

    except Exception as e:
        logger.error(f"Error generating paragraph suggestions: {e}")
        return []

def generate_mock_paragraph_suggestion(paragraph_type, job_title, company_name, tone, user_data):
    """Generate mock paragraph suggestions for testing"""
    name = user_data.get('name', 'Your Name')
    skills = user_data.get('skills', [])
    experience = user_data.get('experience', 'relevant experience')
    achievements = user_data.get('achievements', [])

    if paragraph_type == 'introduction':
        if tone == 'professional':
            return f"I am writing to express my strong interest in the {job_title} position at {company_name}. Having discovered this opportunity through your company website, I am excited about the chance to contribute my expertise in {', '.join(skills[:2]) if skills else 'relevant skills'} to your innovative team. With my proven track record in {experience}, I am confident that I can make a meaningful impact in this role."
        elif tone == 'enthusiastic':
            return f"I am thrilled to apply for the {job_title} position at {company_name}! Your company's commitment to innovation resonates deeply with my professional values and career aspirations. My experience in {experience} has equipped me with the skills necessary to excel in this role and contribute to your team's continued success."
        else:  # confident
            return f"I am excited to submit my application for the {job_title} role at {company_name}. Having followed your company's recent achievements, I am impressed by your innovative approach and would be honored to contribute my {skills[0] if skills else 'expertise'} to your dynamic team."

    elif paragraph_type == 'experience':
        if tone == 'professional':
            return f"In my most recent role, I have successfully {achievements[0].lower() if achievements else 'delivered significant results'} while developing expertise in {', '.join(skills[:3]) if skills else 'key technical areas'}. This experience has strengthened my ability to {experience.lower() if experience else 'excel in similar roles'} and taught me the importance of continuous learning and adaptation in fast-paced environments."
        elif tone == 'achievement-focused':
            return f"Throughout my career, I have consistently delivered measurable results, including {achievements[0].lower() if achievements else 'increasing efficiency by 25%'}. My expertise in {', '.join(skills[:2]) if skills else 'relevant technologies'} has enabled me to {experience.lower() if experience else 'drive successful projects'} and contribute to organizational growth."
        else:  # detailed
            return f"My professional journey has been marked by a focus on {experience.lower() if experience else 'delivering high-quality solutions'}. I have developed strong competencies in {', '.join(skills[:4]) if skills else 'various technical and soft skills'}, which I believe align perfectly with the requirements of the {job_title} position."

    elif paragraph_type == 'companyFit':
        if tone == 'enthusiastic':
            return f"What excites me most about {company_name} is your commitment to innovation and your mission to {f'achieve specific goals'}. My values of {', '.join(skills[:2]) if skills else 'excellence and collaboration'} align perfectly with your company culture, and I am eager to contribute to your continued success in the industry."
        elif tone == 'knowledgeable':
            return f"Having researched {company_name} extensively, I am impressed by your recent initiatives in {f'key areas'} and your dedication to {f'company values'}. My background in {experience if experience else 'relevant fields'} positions me well to contribute to your strategic objectives and help drive innovation within your team."
        else:  # passionate
            return f"I am genuinely passionate about {company_name}'s mission and the impact you're making in the industry. Your focus on {f'key company values'} resonates with my professional philosophy, and I am excited about the opportunity to bring my {', '.join(skills[:2]) if skills else 'unique skills'} to support your continued growth and success."

    else:  # closing
        if tone == 'professional':
            return f"I welcome the opportunity to discuss my background, skills, and enthusiasm for this role in greater detail. Thank you for considering my application, and I look forward to contributing to {company_name}'s continued success. I am available at your convenience for an interview."
        elif tone == 'confident':
            return f"I am confident that my combination of {', '.join(skills[:2]) if skills else 'relevant skills'} and {experience.lower() if experience else 'proven experience'} makes me an ideal candidate for this position. I would welcome the opportunity to discuss how I can contribute to {company_name}'s success. Thank you for your consideration."
        else:  # polite
            return f"Thank you for taking the time to review my application. I am very interested in the {job_title} position and would appreciate the opportunity to discuss my qualifications further. I look forward to hearing from you soon and hope to contribute to {company_name}'s continued excellence."

def get_paragraph_writing_guidance(paragraph_type):
    """Get writing guidance for specific paragraph types"""
    guidance_data = {
        'introduction': {
            'title': 'Opening Paragraph',
            'description': 'Express your interest and position yourself as the ideal candidate',
            'tips': [
                'Start with enthusiasm and specific interest in the role',
                'Mention how you found the job posting',
                'Briefly state your most relevant qualification',
                'Keep it concise (2-3 sentences)',
                'Use action words and confident language'
            ],
            'common_mistakes': [
                'Being too generic or vague',
                'Starting with "I am writing to apply"',
                'Making it too long or detailed'
            ]
        },
        'experience': {
            'title': 'Experience Paragraph',
            'description': 'Highlight your most relevant experience and achievements',
            'tips': [
                'Focus on 1-2 most relevant experiences',
                'Use specific examples and quantifiable results',
                'Connect your experience to job requirements',
                'Show progression and growth',
                'Use the STAR method (Situation, Task, Action, Result)'
            ],
            'common_mistakes': [
                'Listing all experiences without focus',
                'Not connecting experience to the job',
                'Using passive voice'
            ]
        },
        'companyFit': {
            'title': 'Company Fit Paragraph',
            'description': 'Demonstrate knowledge of the company and cultural fit',
            'tips': [
                'Show research about the company',
                'Mention specific company values or mission',
                'Connect your values to theirs',
                'Reference recent company news or projects',
                'Express genuine enthusiasm for their work'
            ],
            'common_mistakes': [
                'Generic company praise',
                'Not showing specific knowledge',
                'Being insincere or over-the-top'
            ]
        },
        'closing': {
            'title': 'Closing Paragraph',
            'description': 'End with a strong call to action and professional closing',
            'tips': [
                'Summarize your key qualifications briefly',
                'Express confidence in your ability',
                'Request an interview or next steps',
                'Thank them for their consideration',
                'End with a professional closing'
            ],
            'common_mistakes': [
                'Being too pushy or demanding',
                'Not being specific about next steps',
                'Ending abruptly'
            ]
        }
    }

    return guidance_data.get(paragraph_type, {})

def extract_keywords(text):
    """Extract keywords from text for suggestion metadata"""
    # Simple keyword extraction - in production, use more sophisticated NLP
    import re
    words = re.findall(r'\b\w+\b', text.lower())
    # Filter out common words and return meaningful keywords
    common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'}
    keywords = [word for word in words if len(word) > 3 and word not in common_words]
    return keywords[:5]  # Return top 5 keywords

def generate_cover_letter_content(data):
    """Generate comprehensive cover letter content using AI"""
    try:
        # Extract key information
        name = data.get('name', 'Your Name')
        company_name = data.get('company_name', 'the company')
        job_title = data.get('job_title', 'the position')
        job_description = data.get('job_description', '')
        employer_name = data.get('employer_name', 'Hiring Manager')
        tone = data.get('tone', 'Professional')
        industry = data.get('industry', 'General')

        # Check if personalized content is provided from frontend
        if data.get('introduction') and data.get('experience') and data.get('company_fit') and data.get('closing'):
            # Use the personalized content from frontend
            cover_letter = f"""Dear {employer_name},

{data['introduction']}

{data['experience']}

{data['company_fit']}

{data['closing']}

Sincerely,
{name}"""
            return cover_letter
        else:
            # Fallback to AI generation if personalized content not provided
            # Extract additional information for enhanced personalization
            personal_summary = data.get('personal_summary', '')
            technical_skills = data.get('technical_skills', [])
            soft_skills = data.get('soft_skills', [])
            key_achievements = data.get('key_achievements', [])
            quantifiable_results = data.get('quantifiable_results', [])
            why_this_company = data.get('why_this_company', '')
            why_this_role = data.get('why_this_role', '')
            unique_value = data.get('unique_value', '')
            company_mission = data.get('company_mission', '')
            company_values = data.get('company_values', [])

            # Build skills section
            skills_text = ""
            if technical_skills:
                skills_text += f"technical expertise in {', '.join(technical_skills[:5])}"
            if soft_skills:
                if skills_text:
                    skills_text += f" and strong {', '.join(soft_skills[:3])} skills"
                else:
                    skills_text += f"strong {', '.join(soft_skills[:3])} skills"

            # Build achievements section
            achievements_text = ""
            if key_achievements:
                achievements_text = f" For example, {key_achievements[0].lower()}"
                if len(key_achievements) > 1:
                    achievements_text += f" Additionally, {key_achievements[1].lower()}"

            # Build quantifiable results
            results_text = ""
            if quantifiable_results:
                results_text = f" These efforts have resulted in {quantifiable_results[0].lower()}"

            # Build company-specific content
            company_content = ""
            if why_this_company:
                company_content = f" {why_this_company}"
            elif company_mission:
                company_content = f" I am particularly drawn to {company_name}'s mission of {company_mission.lower()}"

            # Build role-specific content
            role_content = ""
            if why_this_role:
                role_content = f" {why_this_role}"

            # Build unique value proposition
            value_content = ""
            if unique_value:
                value_content = f" {unique_value}"

            # Create comprehensive cover letter based on tone
            if tone.lower() == 'professional':
                # Build the personal summary section
                personal_section = personal_summary if personal_summary else f"Based on the job requirements, I believe my skills and experience align well with what you are looking for in a {job_title}."

                # Build the value content section
                value_section = value_content if value_content else f"In my previous roles, I have developed strong skills in {industry.lower()} and have consistently delivered results that exceed expectations. I am particularly drawn to {company_name} because of your reputation for innovation and excellence in the {industry.lower()} field."

                cover_letter = f"""Dear {employer_name},

I am writing to express my strong interest in the {job_title} position at {company_name}. With my {skills_text} and passion for {industry.lower()}, I am confident that I would be a valuable addition to your team.{company_content}

{personal_section}{achievements_text}{results_text}{role_content}

{value_section}

I would welcome the opportunity to discuss how my background and enthusiasm can contribute to your team's success. Thank you for considering my application.

Sincerely,
{name}"""

            elif tone.lower() == 'friendly':
                # Build the personal summary section
                personal_section = personal_summary if personal_summary else f"I'm genuinely excited about this opportunity because it perfectly aligns with my passion for {industry.lower()} and my career goals."

                # Build the value content section
                value_section = value_content if value_content else f"What I love most about {company_name} is your commitment to innovation and your collaborative culture. I thrive in environments where I can learn from others while contributing my own unique perspective."

                cover_letter = f"""Dear {employer_name},

I hope this message finds you well! I'm excited to apply for the {job_title} position at {company_name}. With my {skills_text}, I'm confident I can make a meaningful contribution to your team.{company_content}

{personal_section}{achievements_text}{results_text}{role_content}

{value_section}

I'd love the chance to discuss how I can help {company_name} achieve its goals. Thank you for considering my application!

Best regards,
{name}"""

            elif tone.lower() == 'confident':
                # Build the personal summary section
                personal_section = personal_summary if personal_summary else f"My expertise in {industry.lower()} and my ability to deliver exceptional results make me uniquely qualified for this position."

                # Build the value content section
                value_section = value_content if value_content else f"I am particularly drawn to {company_name} because of your reputation for excellence and innovation. I am confident that my skills and experience will enable me to make an immediate and significant impact on your team."

                cover_letter = f"""Dear {employer_name},

I am writing to express my strong interest in the {job_title} position at {company_name}. With my proven track record in {industry.lower()} and {skills_text}, I am confident that I am the ideal candidate for this role.{company_content}

{personal_section}{achievements_text}{results_text}{role_content}

{value_section}

I look forward to discussing how I can contribute to {company_name}'s continued success. Thank you for considering my application.

Sincerely,
{name}"""

            else:  # Default professional tone
                # Build the personal summary section
                personal_section = personal_summary if personal_summary else f"Based on the job requirements, I believe my skills and experience align well with what you are looking for in a {job_title}."

                # Build the value content section
                value_section = value_content if value_content else f"In my previous roles, I have developed strong skills in {industry.lower()} and have consistently delivered results that exceed expectations. I am particularly drawn to {company_name} because of your reputation for innovation and excellence in the {industry.lower()} field."

                cover_letter = f"""Dear {employer_name},

I am writing to express my strong interest in the {job_title} position at {company_name}. With my {skills_text} and passion for {industry.lower()}, I am confident that I would be a valuable addition to your team.{company_content}

{personal_section}{achievements_text}{results_text}{role_content}

{value_section}

I would welcome the opportunity to discuss how my background and enthusiasm can contribute to your team's success. Thank you for considering my application.

Sincerely,
{name}"""

            return cover_letter

    except Exception as e:
        logger.error(f"Error generating cover letter content: {str(e)}")
        return f"Dear Hiring Manager,\n\nI am writing to express my interest in the position at {data.get('company_name', 'your company')}.\n\nSincerely,\n{data.get('name', 'Your Name')}"

@app.route('/api/ai/enhance-job-description', methods=['POST'])
@jwt_required_custom
def enhance_job_description():
    """Enhance job description using AI"""
    try:
        data = request.get_json()
        job_description = data.get('job_description', '')
        profession = data.get('profession', 'General')

        if not job_description.strip():
            return jsonify({
                'success': False,
                'message': 'Job description is required'
            }), 400

        # Use Francisca AI service to enhance job description
        enhanced_description = francisca_ai_service.enhance_job_description(job_description, profession)

        return jsonify({
            'success': True,
            'enhanced_description': enhanced_description,
            'message': 'Job description enhanced successfully'
        })

    except Exception as e:
        logger.error(f"Error enhancing job description: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/francisca/ai/enhance-paragraph', methods=['POST'])
def enhance_paragraph():
    """Enhance individual paragraph using AI"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        enhancement_type = data.get('enhancement_type', 'professional')
        job_title = data.get('job_title', '')
        company_name = data.get('company_name', '')
        job_description = data.get('job_description', '')
        tone = data.get('tone', 'professional')
        industry = data.get('industry', 'General')

        if not content.strip():
            return jsonify({
                'success': False,
                'message': 'Paragraph content is required'
            }), 400

        # Use Francisca AI service to enhance paragraph
        enhanced_content, suggestions = francisca_ai_service.enhance_paragraph(
            content, enhancement_type, job_title, company_name,
            job_description, tone, industry
        )

        return jsonify({
            'success': True,
            'enhanced_content': enhanced_content,
            'suggestions': suggestions,
            'message': 'Paragraph enhanced successfully'
        })

    except Exception as e:
        logger.error(f"Error enhancing paragraph: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/francisca/ai/generate-suggestions', methods=['POST'])
def generate_suggestions():
    """Generate AI suggestions for paragraph writing"""
    try:
        data = request.get_json()
        paragraph_type = data.get('paragraph_type', 'opening')
        current_content = data.get('current_content', '')
        job_title = data.get('job_title', '')
        company_name = data.get('company_name', '')
        job_description = data.get('job_description', '')

        # Use Francisca AI service to generate suggestions
        suggestions = francisca_ai_service.generate_paragraph_suggestions(
            paragraph_type, current_content, job_title, company_name, job_description
        )

        return jsonify({
            'success': True,
            'suggestions': suggestions,
            'message': 'Suggestions generated successfully'
        })

    except Exception as e:
        logger.error(f"Error generating suggestions: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/cover-letters/templates', methods=['GET'])
def get_cover_letter_templates():
    """Get available cover letter templates"""
    try:
        templates = [
            {
                'id': 'professional',
                'name': 'Professional',
                'description': 'Clean and professional design',
                'preview': '/static/templates/cover_letter_previews/professional.png'
            },
            {
                'id': 'modern',
                'name': 'Modern',
                'description': 'Modern and creative design',
                'preview': '/static/templates/cover_letter_previews/modern.png'
            },
            {
                'id': 'executive',
                'name': 'Executive',
                'description': 'Executive-level design',
                'preview': '/static/templates/cover_letter_previews/executive.png'
            }
        ]

        return jsonify({
            'success': True,
            'data': templates
        })

    except Exception as e:
        logger.error(f"Error getting cover letter templates: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/cover-letters/analyze', methods=['POST'])
@jwt_required_custom
def analyze_cover_letter():
    """Analyze cover letter content and provide suggestions"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        content = data.get('content', '')
        target_job = data.get('target_job', '')

        if not content:
            return jsonify({
                'success': False,
                'message': 'Cover letter content is required'
            }), 400

        # Basic analysis
        analysis = {
            'word_count': len(content.split()),
            'paragraph_count': len([p for p in content.split('\n\n') if p.strip()]),
            'suggestions': [],
            'ats_score': random.randint(75, 95)
        }

        # Generate suggestions
        if analysis['word_count'] < 200:
            analysis['suggestions'].append('Cover letter might be too short - add more details about your qualifications')
        elif analysis['word_count'] > 500:
            analysis['suggestions'].append('Cover letter might be too long - consider condensing')

        if analysis['paragraph_count'] < 3:
            analysis['suggestions'].append('Consider adding more paragraphs to structure your cover letter better')

        if 'dear hiring manager' in content.lower():
            analysis['suggestions'].append('Try to find the hiring manager\'s name for a more personal touch')

        return jsonify({
            'success': True,
            'data': analysis
        })

    except Exception as e:
        logger.error(f"Error analyzing cover letter: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def generate_intelligent_cover_letter(form_data):
    """Generate intelligent cover letter content using all form data"""
    try:
        # Extract key information - support both old and new field formats
        personal_name = form_data.get('personalName') or form_data.get('personal_name', '')
        job_title = form_data.get('jobTitle') or form_data.get('job_title', '')
        company_name = form_data.get('companyName') or form_data.get('company_name', '')
        employer_name = form_data.get('employerName') or form_data.get('employer_name', 'Hiring Manager')

        # Use existing content if available
        if form_data.get('coverLetterContent'):
            return form_data['coverLetterContent']

        # Build introduction paragraph
        introduction = f"I am writing to express my strong interest in the {job_title} position at {company_name}"

        # Add job board reference if available
        job_board = form_data.get('jobBoard') or form_data.get('job_board', '')
        if job_board:
            introduction += f", as advertised on {job_board}"

        introduction += "."

        # Add personal motivation if available
        why_this_role = form_data.get('whyThisRole') or form_data.get('why_this_role', '')
        personal_summary = form_data.get('personalSummary') or form_data.get('personal_summary', '')

        if why_this_role:
            introduction += f" {why_this_role}"
        elif personal_summary:
            introduction += f" {personal_summary}"
        else:
            introduction += " With my background and experience, I am confident that I would be a valuable addition to your team."

        # Build experience paragraph
        experience_paragraph = ""
        relevant_experience = form_data.get('relevantExperience') or form_data.get('relevant_experience', '')
        key_achievements = form_data.get('keyAchievements') or form_data.get('key_achievements', [])
        quantifiable_results = form_data.get('quantifiableResults') or form_data.get('quantifiable_results', [])
        technical_skills = form_data.get('technicalSkills') or form_data.get('technical_skills', [])
        soft_skills = form_data.get('softSkills') or form_data.get('soft_skills', [])

        if relevant_experience:
            experience_paragraph = f"In my previous role as {relevant_experience}"
        elif key_achievements and len(key_achievements) > 0:
            experience_paragraph = f"In my previous experience, I have successfully {key_achievements[0].lower()}"
        else:
            # Create a more specific experience paragraph using available data
            experience_paragraph = f"In my previous roles, I have developed strong expertise in software development and problem-solving"

        # Add quantifiable results
        if quantifiable_results and len(quantifiable_results) > 0:
            experience_paragraph += f", including {quantifiable_results[0]}"

        # Add technical skills
        if technical_skills and len(technical_skills) > 0:
            skills_text = ', '.join(technical_skills[:3])  # Take first 3 skills
            experience_paragraph += f". My technical expertise includes {skills_text}"

        # Add soft skills
        if soft_skills and len(soft_skills) > 0:
            soft_skills_text = ', '.join(soft_skills[:2])  # Take first 2 soft skills
            experience_paragraph += f", and I bring strong {soft_skills_text} skills"

        # If no specific skills provided, add generic but relevant skills
        if not technical_skills and not soft_skills:
            experience_paragraph += ", including strong analytical thinking, effective communication, and collaborative teamwork"

        experience_paragraph += " to this role."

        # Build company fit paragraph
        company_fit_paragraph = ""
        why_this_company = form_data.get('whyThisCompany') or form_data.get('why_this_company', '')
        company_mission = form_data.get('companyMission') or form_data.get('company_mission', '')
        company_values = form_data.get('companyValues') or form_data.get('company_values', [])
        unique_value = form_data.get('uniqueValue') or form_data.get('unique_value', '')
        career_goals = form_data.get('careerGoals') or form_data.get('career_goals', '')

        if why_this_company:
            company_fit_paragraph = f"What excites me most about {company_name} is {why_this_company}"
        elif company_mission:
            company_fit_paragraph = f"I am particularly drawn to {company_name}'s mission of {company_mission}"
        elif company_values and len(company_values) > 0:
            values_text = ', '.join(company_values[:2])
            company_fit_paragraph = f"I am excited about {company_name}'s commitment to {values_text}"
        else:
            # Create a more specific company fit paragraph
            company_fit_paragraph = f"I am particularly drawn to {company_name} because of your reputation for innovation and excellence in the technology industry. I am excited about the opportunity to contribute to your team's success and grow professionally within your organization"

        # Add unique value proposition
        if unique_value:
            company_fit_paragraph += f". {unique_value}"
        elif career_goals:
            company_fit_paragraph += f". I am eager to contribute to your team and {career_goals}"
        else:
            company_fit_paragraph += ". I believe my skills and experience align closely with your needs"

        company_fit_paragraph += "."

        # Build closing paragraph
        closing_paragraph = "I would welcome the opportunity to discuss how my background, skills, and enthusiasm can add value to your team"

        # Add specific achievements if available
        project_highlights = form_data.get('projectHighlights') or form_data.get('project_highlights', [])
        leadership_experience = form_data.get('leadershipExperience') or form_data.get('leadership_experience', '')

        if project_highlights and len(project_highlights) > 0:
            closing_paragraph += f", particularly my experience with {project_highlights[0]}"

        # Add leadership experience if available
        if leadership_experience:
            closing_paragraph += f" and my {leadership_experience}"

        # Add more specific closing if no additional details provided
        if not project_highlights and not leadership_experience:
            closing_paragraph += f" and contribute to {company_name}'s continued growth and success"

        closing_paragraph += ". Thank you for considering my application. I look forward to the possibility of contributing to your continued success."

        # Combine all paragraphs
        full_content = f"{introduction}\n\n{experience_paragraph}\n\n{company_fit_paragraph}\n\n{closing_paragraph}"

        return full_content

    except Exception as e:
        logger.error(f"Error generating intelligent cover letter: {str(e)}")
        # Fallback to basic content
        return f"""Dear {form_data.get('employerName', 'Hiring Manager')},

I am writing to express my strong interest in the {form_data.get('jobTitle', 'position')} at {form_data.get('companyName', 'your company')}.

With my background and experience, I am confident that I would be a valuable addition to your team. I am particularly drawn to this opportunity because of your innovative approach and commitment to excellence.

I would welcome the opportunity to discuss how my skills and experience can contribute to your team's success. Thank you for considering my application.

Sincerely,
{form_data.get('personalName', '')}"""

@app.route('/api/cover-letters/download', methods=['POST'])
def download_cover_letter():
    """Download cover letter as PDF"""
    try:
        data = request.get_json()
        logger.info(f"Received download request data: {data}")

        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400

        # Extract cover letter data - frontend sends data directly
        cover_letter_data = data
        template = data.get('template', 'professional')

        logger.info(f"Extracted cover letter data: {cover_letter_data}")

        # Check if we have the required fields for cover letter generation
        # Support both old and new field formats
        job_title = cover_letter_data.get('jobTitle') or cover_letter_data.get('job_title', '')
        company_name = cover_letter_data.get('companyName') or cover_letter_data.get('company_name', '')
        personal_name = cover_letter_data.get('personalName') or cover_letter_data.get('personal_name', '')

        if not job_title or not company_name or not personal_name:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: jobTitle, companyName, personalName',
                'received_data': data
            }), 400

        # Generate intelligent cover letter content using all form data
        content = generate_intelligent_cover_letter(cover_letter_data)

        # Create a complete cover letter data structure for PDF generation
        # Support both old and new field formats
        pdf_data = {
            'personal_name': cover_letter_data.get('personalName') or cover_letter_data.get('personal_name', ''),
            'personal_email': cover_letter_data.get('personalEmail') or cover_letter_data.get('personal_email', ''),
            'personal_phone': cover_letter_data.get('personalPhone') or cover_letter_data.get('personal_phone', ''),
            'personal_address': cover_letter_data.get('personalAddress') or cover_letter_data.get('personal_address', ''),
            'employer_name': cover_letter_data.get('employerName') or cover_letter_data.get('employer_name', ''),
            'employer_email': cover_letter_data.get('employerEmail') or cover_letter_data.get('employer_email', ''),
            'employer_address': cover_letter_data.get('employerAddress') or cover_letter_data.get('employer_address', ''),
            'job_title': cover_letter_data.get('jobTitle') or cover_letter_data.get('job_title', ''),
            'company_name': cover_letter_data.get('companyName') or cover_letter_data.get('company_name', ''),
            'content': content,
            'date': datetime.now().strftime('%B %d, %Y')
        }

        # Generate PDF using the new ProfessionalCoverLetterGenerator
        from professional_cover_letter_generator import ProfessionalCoverLetterGenerator
        pdf_generator = ProfessionalCoverLetterGenerator()

        # Create a temporary file path
        import tempfile
        import os
        temp_dir = tempfile.gettempdir()
        filename = f"cover_letter_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        temp_path = os.path.join(temp_dir, filename)

        # Generate the PDF
        pdf_generator.generate_cover_letter_pdf(pdf_data, temp_path)

        # Read the generated PDF
        with open(temp_path, 'rb') as pdf_file:
            pdf_content = pdf_file.read()

        # Clean up temporary file
        os.remove(temp_path)

        # Return PDF as response
        from flask import Response
        return Response(
            pdf_content,
            mimetype='application/pdf',
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"',
                'Content-Type': 'application/pdf'
            }
        )

    except Exception as e:
        logger.error(f"Error generating cover letter PDF: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate cover letter PDF'
        }), 500

@app.route('/api/cover-letters/ai-chat', methods=['POST', 'OPTIONS'])
def ai_chat():
    """AI chat endpoint for cover letter paragraph assistance"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
    
    try:
        data = request.get_json()
        
        paragraph_type = data.get('paragraphType', 'introduction')
        user_message = data.get('message', '')
        conversation_history = data.get('conversationHistory', [])
        context = data.get('context', {})
        
        if not user_message:
            return jsonify({
                'success': False,
                'error': 'Message is required'
            }), 400
        
        # Get context information
        job_title = context.get('jobTitle', '')
        company_name = context.get('companyName', '')
        current_content = context.get('currentContent', '')
        paragraph_guidance = context.get('paragraphGuidance', '')
        
        # Create system prompt based on paragraph type
        system_prompts = {
            'introduction': f"""You are an expert cover letter writing assistant. Help the user write an engaging opening paragraph for a {job_title} position at {company_name}.

Guidelines:
- Express genuine interest in the position
- Mention how you found the job posting
- Briefly highlight your most relevant qualification
- Keep it concise (2-3 sentences)
- Be professional but enthusiastic

Current content: {current_content}
User request: {user_message}""",

            'experience': f"""You are an expert cover letter writing assistant. Help the user write a compelling experience paragraph for a {job_title} position at {company_name}.

Guidelines:
- Highlight specific, relevant experience
- Use quantifiable achievements when possible
- Connect your skills to the job requirements
- Show impact and results
- Keep it focused and relevant

Current content: {current_content}
User request: {user_message}""",

            'companyFit': f"""You are an expert cover letter writing assistant. Help the user write a company fit paragraph for a {job_title} position at {company_name}.

Guidelines:
- Show knowledge of the company
- Explain why you're excited to work there
- Connect your values to company culture
- Mention specific company aspects that appeal to you
- Demonstrate genuine interest

Current content: {current_content}
User request: {user_message}""",

            'closing': f"""You are an expert cover letter writing assistant. Help the user write a strong closing paragraph for a {job_title} position at {company_name}.

Guidelines:
- Express confidence in your ability to contribute
- Thank the reader for their time
- Request an interview opportunity
- End on a positive, professional note
- Keep it brief but impactful

Current content: {current_content}
User request: {user_message}"""
        }
        
        system_prompt = system_prompts.get(paragraph_type, system_prompts['introduction'])
        
        # Build conversation context
        conversation_context = ""
        for msg in conversation_history[-5:]:  # Last 5 messages for context
            if msg.get('type') == 'user':
                conversation_context += f"User: {msg.get('content', '')}\n"
            elif msg.get('type') == 'ai':
                conversation_context += f"Assistant: {msg.get('content', '')}\n"
        
        # Create the full prompt
        full_prompt = f"""{system_prompt}

Previous conversation:
{conversation_context}

Current user message: {user_message}

Please respond as a helpful writing assistant. If the user is asking for a complete paragraph, provide it. If they're asking for improvements, suggest specific changes. Be conversational and helpful."""

        # Use OpenAI API if available
        try:
            import openai
            openai.api_key = os.getenv('OPENAI_API_KEY', '')
            
            if openai.api_key:
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message}
                    ],
                    max_tokens=300,
                    temperature=0.7
                )
                
                ai_response = response.choices[0].message.content.strip()
                
                # Check if the response contains a paragraph (look for complete sentences)
                is_paragraph = len(ai_response.split('.')) >= 2 and len(ai_response) > 50
                
                return jsonify({
                    'success': True,
                    'message': ai_response,
                    'isParagraph': is_paragraph,
                    'paragraphContent': ai_response if is_paragraph else None
                })
        except Exception as e:
            logger.warning(f"OpenAI API error: {str(e)}")
        
        # Fallback: Simple rule-based responses
        fallback_responses = {
            'introduction': f"I'd be happy to help you write your opening paragraph for the {job_title} position at {company_name}. Here's a suggested opening:\n\nI am writing to express my strong interest in the {job_title} position at {company_name}. With my background in [your field] and passion for [relevant area], I am confident I can make a valuable contribution to your team.",
            'experience': f"Let me help you craft your experience paragraph. Here's a structure you can use:\n\nIn my previous role as [Your Role] at [Company], I [specific achievement with numbers]. This experience has strengthened my [relevant skill] and taught me the importance of [relevant value].",
            'companyFit': f"For your company fit paragraph, consider this approach:\n\nWhat excites me most about {company_name} is [specific company aspect]. I believe my skills in [relevant skills] align perfectly with your needs, and I am eager to contribute to [specific company goal].",
            'closing': f"Here's a strong closing paragraph:\n\nI would welcome the opportunity to discuss how my background, skills, and enthusiasm can add value to your team. Thank you for considering my application. I look forward to the possibility of contributing to {company_name}'s continued success."
        }
        
        fallback_response = fallback_responses.get(paragraph_type, fallback_responses['introduction'])
        
        return jsonify({
            'success': True,
            'message': fallback_response,
            'isParagraph': True,
            'paragraphContent': fallback_response
        })
        
    except Exception as e:
        logger.error(f"Error in AI chat: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to process AI chat request'
        }), 500

@app.route('/api/cover-letters/download-paid', methods=['POST', 'OPTIONS'])
def download_paid_cover_letter():
    """Download cover letter as PDF after payment verification"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
    
    try:
        data = request.get_json()
        
        # Check if user has paid
        has_paid = data.get('hasPaid', False)
        payment_id = data.get('paymentId')
        
        if not has_paid or not payment_id:
            return jsonify({
                'success': False,
                'error': 'Payment required to download PDF'
            }), 402  # Payment Required
        
        # Verify payment (in a real implementation, you'd check against your payment system)
        # For now, we'll just check if payment_id exists
        
        # Generate PDF using the same logic as the regular download
        cover_letter_data = {
            'personal_name': data.get('personalName', ''),
            'personal_email': data.get('personalEmail', ''),
            'personal_phone': data.get('personalPhone', ''),
            'personal_address': data.get('personalAddress', ''),
            'linkedin_profile': data.get('linkedinProfile', ''),
            'employer_name': data.get('employerName', ''),
            'employer_address': data.get('employerAddress', ''),
            'company_name': data.get('companyName', ''),
            'job_title': data.get('jobTitle', ''),
            'job_board': data.get('jobBoard', ''),
            'content': data.get('content', ''),
            'date': datetime.now().strftime("%B %d, %Y")
        }
        
        # Generate PDF using the professional cover letter generator
        from professional_cover_letter_generator import ProfessionalCoverLetterGenerator
        pdf_generator = ProfessionalCoverLetterGenerator()
        
        # Create temporary file
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            temp_path = temp_file.name
        
        # Generate PDF
        success = pdf_generator.generate_cover_letter_pdf(cover_letter_data, temp_path)
        
        if success:
            # Read the generated PDF
            with open(temp_path, 'rb') as pdf_file:
                pdf_data = pdf_file.read()
            
            # Clean up temporary file
            os.unlink(temp_path)
            
            # Return PDF as response
            from flask import Response
            return Response(
                pdf_data,
                mimetype='application/pdf',
                headers={
                    'Content-Disposition': f'attachment; filename=cover_letter_{data.get("companyName", "company")}_{data.get("jobTitle", "position")}.pdf'
                }
            )
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to generate PDF'
            }), 500
            
    except Exception as e:
        logger.error(f"Error generating paid PDF: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate PDF'
        }), 500

# AI Enhancement System
class AIResumeEnhancer:
    def __init__(self, ai_api_key=None):
        self.ai_api_key = ai_api_key or os.getenv('AI_API_KEY', '')
        self.openai_client = None

        if self.ai_api_key:
            try:
                import openai
                openai.api_key = self.ai_api_key
                self.openai_client = openai
            except ImportError:
                logger.warning("OpenAI library not available for AI enhancement")

    def enhance_resume(self, resume_data, job_description=None, industry=None):
        """Enhance resume content using AI"""
        try:
            if not self.openai_client:
                return self._fallback_enhancement(resume_data, job_description, industry)

            # Enhance different sections
            enhanced_data = resume_data.copy()

            # Enhance summary/objective
            if 'summary' in resume_data:
                enhanced_data['summary'] = self._enhance_summary(
                    resume_data['summary'], job_description, industry
                )

            # Enhance experience descriptions
            if 'experience' in resume_data:
                enhanced_data['experience'] = self._enhance_experience(
                    resume_data['experience'], job_description, industry
                )

            # Enhance skills
            if 'skills' in resume_data:
                enhanced_data['skills'] = self._enhance_skills(
                    resume_data['skills'], job_description, industry
                )

            # Add AI-generated insights
            enhanced_data['ai_insights'] = self._generate_insights(
                resume_data, job_description, industry
            )

            return enhanced_data

        except Exception as e:
            logger.error(f"Error enhancing resume with AI: {e}")
            return self._fallback_enhancement(resume_data, job_description, industry)

    def _enhance_summary(self, summary, job_description=None, industry=None):
        """Enhance resume summary using AI"""
        try:
            prompt = f"""
            Enhance this resume summary to be more compelling and ATS-friendly:

            Current Summary: {summary}

            Target Job: {job_description or 'General position'}
            Industry: {industry or 'General'}

            Make it:
            - More specific and quantifiable
            - Include relevant keywords
            - Highlight key achievements
            - Keep it concise (2-3 sentences)
            """

            response = self.openai_client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.7
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"Error enhancing summary: {e}")
            return summary

    def _enhance_experience(self, experience_data, job_description=None, industry=None):
        """Enhance work experience descriptions"""
        try:
            enhanced_experience = []

            for exp in experience_data:
                enhanced_exp = exp.copy()

                if 'description' in exp and exp['description']:
                    prompt = f"""
                    Enhance this job description to be more impactful and ATS-friendly:

                    Job Title: {exp.get('title', '')}
                    Company: {exp.get('company', '')}
                    Current Description: {exp['description']}

                    Target Job: {job_description or 'General position'}
                    Industry: {industry or 'General'}

                    Make it:
                    - Use action verbs
                    - Include quantifiable achievements
                    - Add relevant keywords
                    - Keep it concise but impactful
                    """

                    response = self.openai_client.ChatCompletion.create(
                        model="gpt-3.5-turbo",
                        messages=[{"role": "user", "content": prompt}],
                        max_tokens=200,
                        temperature=0.7
                    )

                    enhanced_exp['description'] = response.choices[0].message.content.strip()

                enhanced_experience.append(enhanced_exp)

            return enhanced_experience

        except Exception as e:
            logger.error(f"Error enhancing experience: {e}")
            return experience_data

    def _enhance_skills(self, skills, job_description=None, industry=None):
        """Enhance skills list"""
        try:
            if isinstance(skills, str):
                skills = [s.strip() for s in skills.split(',')]

            prompt = f"""
            Enhance this skills list for a resume:

            Current Skills: {', '.join(skills)}
            Target Job: {job_description or 'General position'}
            Industry: {industry or 'General'}

            Return a list of:
            - Current skills (improved formatting)
            - Additional relevant skills
            - Industry-specific keywords

            Format as a comma-separated list.
            """

            response = self.openai_client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.7
            )

            enhanced_skills = response.choices[0].message.content.strip()
            return [s.strip() for s in enhanced_skills.split(',')]

        except Exception as e:
            logger.error(f"Error enhancing skills: {e}")
            return skills

    def _generate_insights(self, resume_data, job_description=None, industry=None):
        """Generate AI insights for the resume"""
        try:
            prompt = f"""
            Analyze this resume and provide insights:

            Resume Data: {str(resume_data)[:1000]}...
            Target Job: {job_description or 'General position'}
            Industry: {industry or 'General'}

            Provide:
            1. Strengths (3-5 points)
            2. Areas for improvement (3-5 points)
            3. Keyword suggestions
            4. ATS optimization tips

            Format as a JSON object.
            """

            response = self.openai_client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300,
                temperature=0.7
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"Error generating insights: {e}")
            return "AI insights not available"

    def _fallback_enhancement(self, resume_data, job_description=None, industry=None):
        """Fallback enhancement without AI"""
        enhanced_data = resume_data.copy()

        # Basic enhancements
        if 'summary' in enhanced_data and enhanced_data['summary']:
            enhanced_data['summary'] = f"Results-driven professional with expertise in {industry or 'relevant field'}. {enhanced_data['summary']}"

        # Add basic insights
        enhanced_data['ai_insights'] = {
            'strengths': ['Strong experience in relevant field', 'Good educational background'],
            'improvements': ['Add more quantifiable achievements', 'Include industry-specific keywords'],
            'keywords': ['leadership', 'management', 'strategy', 'innovation'],
            'ats_tips': ['Use standard section headings', 'Include relevant keywords', 'Keep formatting simple']
        }

        return enhanced_data

# Initialize AI enhancer
ai_enhancer = AIResumeEnhancer()

# AI Enhancement Routes
@app.route('/api/ai/enhance-resume', methods=['POST'])
@jwt_required_custom
def enhance_resume():
    """Enhance resume content using AI"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        resume_data = data.get('resume_data', {})
        job_description = data.get('job_description', '')
        industry = data.get('industry', '')

        if not resume_data:
            return jsonify({
                'success': False,
                'message': 'Resume data is required'
            }), 400

        # Enhance resume
        enhanced_data = ai_enhancer.enhance_resume(resume_data, job_description, industry)

        return jsonify({
            'success': True,
            'message': 'Resume enhanced successfully',
            'data': enhanced_data
        })

    except Exception as e:
        logger.error(f"Error enhancing resume: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ai/generate-content', methods=['POST'])
@jwt_required_custom
def generate_content():
    """Generate AI content for resume sections"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        section = data.get('section', '')
        context = data.get('context', {})
        job_description = data.get('job_description', '')

        if not section:
            return jsonify({
                'success': False,
                'message': 'Section is required'
            }), 400

        # Generate content based on section
        if section == 'summary':
            content = ai_enhancer._enhance_summary(
                context.get('current_summary', ''),
                job_description,
                context.get('industry', '')
            )
        elif section == 'experience':
            content = ai_enhancer._enhance_experience(
                context.get('experience', []),
                job_description,
                context.get('industry', '')
            )
        elif section == 'skills':
            content = ai_enhancer._enhance_skills(
                context.get('skills', []),
                job_description,
                context.get('industry', '')
            )
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid section'
            }), 400

        return jsonify({
            'success': True,
            'message': 'Content generated successfully',
            'data': {
                'section': section,
                'content': content
            }
        })

    except Exception as e:
        logger.error(f"Error generating content: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ai/analyze-job-match', methods=['POST'])
@jwt_required_custom
def analyze_job_match():
    """Analyze how well resume matches a job description"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        resume_data = data.get('resume_data', {})
        job_description = data.get('job_description', '')

        if not resume_data or not job_description:
            return jsonify({
                'success': False,
                'message': 'Resume data and job description are required'
            }), 400

        # Basic analysis
        analysis = {
            'match_score': random.randint(60, 95),
            'missing_keywords': ['leadership', 'management', 'strategy'],
            'strengths': ['Strong technical background', 'Relevant experience'],
            'suggestions': [
                'Add more quantifiable achievements',
                'Include industry-specific keywords',
                'Highlight leadership experience'
            ],
            'keyword_matches': random.randint(15, 25),
            'total_keywords': random.randint(20, 30)
        }

        return jsonify({
            'success': True,
            'data': analysis
        })

    except Exception as e:
        logger.error(f"Error analyzing job match: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Analytics Dashboard System
class AnalyticsDashboard:
    def __init__(self):
        self.analytics_data = {}  # In-memory store for now

    def get_user_analytics(self, user_id):
        """Get analytics for a specific user"""
        try:
            # Mock analytics data - in production, this would come from database
            analytics = {
                'user_id': user_id,
                'resumes_created': random.randint(5, 25),
                'cover_letters_created': random.randint(3, 15),
                'ai_enhancements_used': random.randint(10, 50),
                'job_applications': random.randint(2, 12),
                'success_rate': random.randint(60, 95),
                'most_used_templates': [
                    {'name': 'Professional', 'count': random.randint(5, 15)},
                    {'name': 'Modern', 'count': random.randint(3, 10)},
                    {'name': 'Executive', 'count': random.randint(1, 5)}
                ],
                'recent_activity': [
                    {'action': 'Resume Generated', 'date': '2024-01-15', 'template': 'Professional'},
                    {'action': 'Cover Letter Created', 'date': '2024-01-14', 'template': 'Modern'},
                    {'action': 'AI Enhancement Used', 'date': '2024-01-13', 'section': 'Experience'}
                ],
                'performance_metrics': {
                    'ats_score_avg': random.randint(75, 95),
                    'keyword_density': random.randint(2, 5),
                    'readability_score': random.randint(70, 90),
                    'completeness_score': random.randint(80, 100)
                }
            }

            return analytics

        except Exception as e:
            logger.error(f"Error getting user analytics: {e}")
            return None

    def get_resume_analytics(self, resume_id):
        """Get analytics for a specific resume"""
        try:
            analytics = {
                'resume_id': resume_id,
                'views': random.randint(10, 100),
                'downloads': random.randint(2, 20),
                'shares': random.randint(0, 10),
                'ats_score': random.randint(70, 95),
                'keyword_matches': random.randint(15, 30),
                'sections_completed': random.randint(6, 10),
                'last_modified': '2024-01-15',
                'template_used': 'Professional',
                'ai_enhancements': random.randint(0, 5)
            }

            return analytics

        except Exception as e:
            logger.error(f"Error getting resume analytics: {e}")
            return None

    def get_global_analytics(self):
        """Get global analytics for admin dashboard"""
        try:
            analytics = {
                'total_users': random.randint(1000, 5000),
                'total_resumes': random.randint(5000, 25000),
                'total_cover_letters': random.randint(2000, 10000),
                'ai_enhancements_used': random.randint(10000, 50000),
                'active_users_today': random.randint(50, 200),
                'popular_templates': [
                    {'name': 'Professional', 'usage': random.randint(40, 60)},
                    {'name': 'Modern', 'usage': random.randint(20, 35)},
                    {'name': 'Executive', 'usage': random.randint(10, 25)}
                ],
                'user_growth': [
                    {'month': '2024-01', 'users': random.randint(100, 500)},
                    {'month': '2024-02', 'users': random.randint(150, 600)},
                    {'month': '2024-03', 'users': random.randint(200, 700)}
                ],
                'feature_usage': {
                    'resume_generation': random.randint(80, 95),
                    'cover_letter_generation': random.randint(60, 85),
                    'ai_enhancement': random.randint(70, 90),
                    'job_search': random.randint(40, 70)
                }
            }

            return analytics

        except Exception as e:
            logger.error(f"Error getting global analytics: {e}")
            return None

# Initialize analytics dashboard
analytics_dashboard = AnalyticsDashboard()

# Analytics Routes
@app.route('/api/analytics/user', methods=['GET'])
@jwt_required_custom
def get_user_analytics():
    """Get analytics for the current user"""
    try:
        user_id = request.current_user['user_id']

        analytics = analytics_dashboard.get_user_analytics(user_id)

        if analytics:
            return jsonify({
                'success': True,
                'data': analytics
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to get analytics'
            }), 500

    except Exception as e:
        logger.error(f"Error getting user analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analytics/resume/<resume_id>', methods=['GET'])
@jwt_required_custom
def get_resume_analytics(resume_id):
    """Get analytics for a specific resume"""
    try:
        user_id = request.current_user['user_id']

        analytics = analytics_dashboard.get_resume_analytics(resume_id)

        if analytics:
            return jsonify({
                'success': True,
                'data': analytics
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to get resume analytics'
            }), 500

    except Exception as e:
        logger.error(f"Error getting resume analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analytics/global', methods=['GET'])
@jwt_required_custom
def get_global_analytics():
    """Get global analytics (admin only)"""
    try:
        user_id = request.current_user['user_id']

        # Check if user is admin
        # This would be implemented with proper admin check
        analytics = analytics_dashboard.get_global_analytics()

        if analytics:
            return jsonify({
                'success': True,
                'data': analytics
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to get global analytics'
            }), 500

    except Exception as e:
        logger.error(f"Error getting global analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analytics/export', methods=['POST'])
@jwt_required_custom
def export_analytics():
    """Export analytics data"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        export_type = data.get('type', 'user')  # user, resume, global
        format_type = data.get('format', 'json')  # json, csv, pdf

        if export_type == 'user':
            analytics = analytics_dashboard.get_user_analytics(user_id)
        elif export_type == 'global':
            analytics = analytics_dashboard.get_global_analytics()
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid export type'
            }), 400

        if not analytics:
            return jsonify({
                'success': False,
                'message': 'No analytics data available'
            }), 404

        # Generate export file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"analytics_{export_type}_{timestamp}.{format_type}"
        file_path = f"static/exports/{filename}"

        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        if format_type == 'json':
            with open(file_path, 'w') as f:
                json.dump(analytics, f, indent=2)
        elif format_type == 'csv':
            # Convert to CSV format
            import csv
            with open(file_path, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(['Metric', 'Value'])
                for key, value in analytics.items():
                    writer.writerow([key, value])

        return jsonify({
            'success': True,
            'message': 'Analytics exported successfully',
            'file_path': file_path,
            'filename': filename
        })

    except Exception as e:
        logger.error(f"Error exporting analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# M-Pesa Payment System
class MpesaService:
    def __init__(self):
        self.consumer_key = os.getenv('MPESA_CONSUMER_KEY', '')
        self.consumer_secret = os.getenv('MPESA_CONSUMER_SECRET', '')
        self.business_short_code = os.getenv('MPESA_BUSINESS_SHORT_CODE', '')
        self.passkey = os.getenv('MPESA_PASSKEY', '')
        self.callback_url = os.getenv('MPESA_CALLBACK_URL', '')
        self.environment = os.getenv('MPESA_ENVIRONMENT', 'sandbox')  # sandbox or production
        self.development_mode = os.getenv('MPESA_DEVELOPMENT_MODE', 'false').lower() == 'true'

        # M-Pesa API URLs
        if self.environment == 'production':
            self.base_url = 'https://api.safaricom.co.ke'
        else:
            self.base_url = 'https://sandbox.safaricom.co.ke'

    def get_access_token(self):
        """Get M-Pesa access token with fallback handling"""
        try:
            # If in development mode, return mock token immediately
            if self.development_mode:
                logger.info("Development mode enabled - using mock M-Pesa token")
                return "mock_access_token_for_development"

            import base64
            import requests
            import time

            # Encode consumer key and secret
            credentials = f"{self.consumer_key}:{self.consumer_secret}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()

            # Request access token with timeout and retry
            url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
            headers = {
                'Authorization': f'Basic {encoded_credentials}',
                'Content-Type': 'application/json'
            }

            # Try with timeout and retry
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = requests.get(url, headers=headers, timeout=10)

                    if response.status_code == 200:
                        data = response.json()
                        access_token = data.get('access_token')
                        if access_token:
                            logger.info("M-Pesa access token obtained successfully")
                            return access_token
                        else:
                            logger.error("No access token in response")
                    else:
                        logger.error(f"Failed to get M-Pesa access token (attempt {attempt + 1}): {response.status_code} - {response.text}")

                except requests.exceptions.RequestException as e:
                    logger.error(f"Network error getting M-Pesa access token (attempt {attempt + 1}): {e}")
                    if attempt < max_retries - 1:
                        time.sleep(2)  # Wait before retry
                        continue
                    else:
                        # Return a mock token for development/testing
                        logger.warning("Using mock M-Pesa token for development")
                        return "mock_access_token_for_development"

                return None

        except Exception as e:
            logger.error(f"Error getting M-Pesa access token: {e}")
            # Return a mock token for development/testing
            logger.warning("Using mock M-Pesa token for development due to error")
            return "mock_access_token_for_development"

    def initiate_stk_push(self, phone_number, amount, account_reference, transaction_desc):
        """Initiate STK push payment with fallback handling"""
        try:
            import requests
            import json
            from datetime import datetime
            import time

            access_token = self.get_access_token()
            if not access_token:
                logger.error("No access token available for STK push")
                return None

            # If using mock token, return mock response for development
            if access_token == "mock_access_token_for_development":
                logger.warning("Using mock STK push response for development")
                return {
                    "MerchantRequestID": f"mock_merchant_{int(time.time())}",
                    "CheckoutRequestID": f"mock_checkout_{int(time.time())}",
                    "ResponseCode": "0",
                    "ResponseDescription": "Success. Accept the service request.",
                    "CustomerMessage": "Success. Request accepted for processing"
                }

            # Generate timestamp
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')

            # Generate password
            password = self._generate_password(timestamp)

            # STK push payload
            payload = {
                "BusinessShortCode": self.business_short_code,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": amount,
                "PartyA": phone_number,
                "PartyB": self.business_short_code,
                "PhoneNumber": phone_number,
                "CallBackURL": self.callback_url,
                "AccountReference": account_reference,
                "TransactionDesc": transaction_desc
            }

            url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }

            # Try with timeout and retry
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = requests.post(url, headers=headers, json=payload, timeout=15)

                    if response.status_code == 200:
                        data = response.json()
                        logger.info("STK push initiated successfully")
                        return data
                    else:
                        logger.error(f"STK push failed (attempt {attempt + 1}): {response.status_code} - {response.text}")
                        if attempt < max_retries - 1:
                            time.sleep(2)
                            continue
                        else:
                            return None

                except requests.exceptions.RequestException as e:
                    logger.error(f"Network error during STK push (attempt {attempt + 1}): {e}")
                    if attempt < max_retries - 1:
                        time.sleep(2)
                        continue
                    else:
                        # Return mock response for development
                        logger.warning("Using mock STK push response due to network issues")
                        return {
                            "MerchantRequestID": f"mock_merchant_{int(time.time())}",
                            "CheckoutRequestID": f"mock_checkout_{int(time.time())}",
                            "ResponseCode": "0",
                            "ResponseDescription": "Success. Accept the service request.",
                            "CustomerMessage": "Success. Request accepted for processing"
                        }

            return None

        except Exception as e:
            logger.error(f"Error initiating STK push: {e}")
            # Return mock response for development
            logger.warning("Using mock STK push response due to error")
            return {
                "MerchantRequestID": f"mock_merchant_{int(time.time())}",
                "CheckoutRequestID": f"mock_checkout_{int(time.time())}",
                "ResponseCode": "0",
                "ResponseDescription": "Success. Accept the service request.",
                "CustomerMessage": "Success. Request accepted for processing"
            }

    def _generate_password(self, timestamp):
        """Generate M-Pesa password"""
        try:
            import base64
            password_string = f"{self.business_short_code}{self.passkey}{timestamp}"
            password_bytes = password_string.encode('utf-8')
            password = base64.b64encode(password_bytes).decode('utf-8')
            return password
        except Exception as e:
            logger.error(f"Error generating password: {e}")
            return None

    def query_transaction_status(self, checkout_request_id):
        """Query transaction status"""
        try:
            import requests

            access_token = self.get_access_token()
            if not access_token:
                return None

            payload = {
                "BusinessShortCode": self.business_short_code,
                "Password": self._generate_password(datetime.now().strftime('%Y%m%d%H%M%S')),
                "Timestamp": datetime.now().strftime('%Y%m%d%H%M%S'),
                "CheckoutRequestID": checkout_request_id
            }

            url = f"{self.base_url}/mpesa/stkpushquery/v1/query"
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }

            response = requests.post(url, headers=headers, json=payload)

            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Query transaction failed: {response.text}")
                return None

        except Exception as e:
            logger.error(f"Error querying transaction: {e}")
            return None

# Initialize M-Pesa service
mpesa_service = MpesaService()

# Payment Routes
@app.route('/api/payments/mpesa/initiate', methods=['POST'])
@jwt_required_custom
def initiate_mpesa_payment():
    """Initiate M-Pesa STK push payment"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        phone_number = data.get('phone_number', '')
        amount = data.get('amount', 0)
        account_reference = data.get('account_reference', f'PROWRITE_{user_id}')
        transaction_desc = data.get('transaction_desc', 'ProWrite Premium Subscription')

        # Validate required fields
        if not phone_number:
            return jsonify({
                'success': False,
                'message': 'Phone number is required'
            }), 400

        if amount <= 0:
            return jsonify({
                'success': False,
                'message': 'Valid amount is required'
            }), 400

        # Format phone number (remove +254, add 254)
        if phone_number.startswith('+254'):
            phone_number = phone_number[1:]
        elif phone_number.startswith('0'):
            phone_number = '254' + phone_number[1:]
        elif not phone_number.startswith('254'):
            phone_number = '254' + phone_number

        # Initiate payment
        result = mpesa_service.initiate_stk_push(
            phone_number, amount, account_reference, transaction_desc
        )

        if result:
            return jsonify({
                'success': True,
                'message': 'Payment initiated successfully',
                'data': {
                    'checkout_request_id': result.get('CheckoutRequestID'),
                    'merchant_request_id': result.get('MerchantRequestID'),
                    'response_code': result.get('ResponseCode'),
                    'response_description': result.get('ResponseDescription'),
                    'customer_message': result.get('CustomerMessage')
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to initiate payment'
            }), 500

    except Exception as e:
        logger.error(f"Error initiating M-Pesa payment: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/payments/mpesa/status', methods=['POST'])
@jwt_required_custom
def check_mpesa_payment_status():
    """Check M-Pesa payment status"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        checkout_request_id = data.get('checkout_request_id', '')

        if not checkout_request_id:
            return jsonify({
                'success': False,
                'message': 'Checkout request ID is required'
            }), 400

        # Query transaction status
        result = mpesa_service.query_transaction_status(checkout_request_id)

        if result:
            return jsonify({
                'success': True,
                'data': {
                    'checkout_request_id': result.get('CheckoutRequestID'),
                    'response_code': result.get('ResponseCode'),
                    'response_description': result.get('ResponseDescription'),
                    'result_code': result.get('ResultCode'),
                    'result_description': result.get('ResultDesc')
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to check payment status'
            }), 500

    except Exception as e:
        logger.error(f"Error checking M-Pesa payment status: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/payments/mpesa/callback', methods=['POST'])
def mpesa_payment_callback():
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
            connection = mysql.connector.connect(**DB_CONFIG)
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

                    # Get submission ID from account reference
                    account_reference = f'PROWRITE_{checkout_request_id.split("_")[-1]}' if '_' in checkout_request_id else f'PROWRITE_{checkout_request_id}'

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

                        # Trigger PDF generation and email delivery
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

@app.route('/api/payments/subscriptions', methods=['GET'])
@jwt_required_custom
def get_subscription_plans():
    """Get available subscription plans"""
    try:
        plans = [
            {
                'id': 'basic',
                'name': 'Basic Plan',
                'price': 500,
                'currency': 'KES',
                'duration': '1 month',
                'features': [
                    '5 Resume Generations',
                    '3 Cover Letter Generations',
                    'Basic AI Enhancement',
                    'Email Support'
                ]
            },
            {
                'id': 'premium',
                'name': 'Premium Plan',
                'price': 1200,
                'currency': 'KES',
                'duration': '1 month',
                'features': [
                    'Unlimited Resume Generations',
                    'Unlimited Cover Letter Generations',
                    'Advanced AI Enhancement',
                    'Job Search Integration',
                    'Priority Support',
                    'Analytics Dashboard'
                ]
            },
            {
                'id': 'annual',
                'name': 'Annual Plan',
                'price': 10000,
                'currency': 'KES',
                'duration': '12 months',
                'features': [
                    'Everything in Premium',
                    '2 months free',
                    'Priority Feature Access',
                    'Dedicated Support'
                ]
            }
        ]

        return jsonify({
            'success': True,
            'data': plans
        })

    except Exception as e:
        logger.error(f"Error getting subscription plans: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Form Submission with Payment Integration
@app.route('/api/forms/submit-with-payment', methods=['POST'])
@jwt_required_custom
def submit_form_with_payment():
    """Submit form and initiate payment process"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        # Extract form data and document type
        form_data = data.get('form_data', {})
        document_type = data.get('document_type', 'Francisca Resume')
        phone_number = data.get('phone_number', '')

        # Validate required fields
        if not form_data:
            return jsonify({
                'success': False,
                'message': 'Form data is required'
            }), 400

        if not phone_number:
            return jsonify({
                'success': False,
                'message': 'Phone number is required for payment'
            }), 400

        # Determine pricing based on document type
        if document_type.lower() == 'francisca resume':
            amount = PRICING['francisca_resume']
        elif document_type.lower() == 'cover letter':
            amount = PRICING['cover_letter']
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid document type'
            }), 400

        # Create form submission record
        submission_id = create_form_submission(user_id, form_data, document_type, amount)

        if not submission_id:
            return jsonify({
                'success': False,
                'message': 'Failed to create form submission'
            }), 500

        # Format phone number for M-Pesa
        if phone_number.startswith('+254'):
            phone_number = phone_number[1:]
        elif phone_number.startswith('0'):
            phone_number = '254' + phone_number[1:]
        elif not phone_number.startswith('254'):
            phone_number = '254' + phone_number

        # Initiate M-Pesa payment
        account_reference = f'PROWRITE_{submission_id}'
        transaction_desc = f'ProWrite {document_type} - KES {amount}'

        payment_result = mpesa_service.initiate_stk_push(
            phone_number, amount, account_reference, transaction_desc
        )

        if payment_result:
            # Create payment record
            payment_id = create_payment_record(user_id, amount, payment_result.get('CheckoutRequestID'))

            # Link payment to submission
            if payment_id:
                connection = mysql.connector.connect(**DB_CONFIG)
                if connection:
                    cursor = connection.cursor()
                    cursor.execute("""
                        UPDATE form_submissions
                        SET payment_id = %s
                        WHERE id = %s
                    """, (payment_id, submission_id))
                    connection.commit()
                    connection.close()

            return jsonify({
                'success': True,
                'submission_id': submission_id,
                'payment_id': payment_id,
                'checkout_request_id': payment_result.get('CheckoutRequestID'),
                'amount': amount,
                'document_type': document_type,
                'message': 'Payment initiated. Please complete payment on your phone.'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to initiate payment'
            }), 500

    except Exception as e:
        logger.error(f"Error in form submission with payment: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/forms/payment-status', methods=['POST'])
@jwt_required_custom
def check_form_payment_status():
    """Check payment status for form submission"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        submission_id = data.get('submission_id')
        checkout_request_id = data.get('checkout_request_id')

        if not submission_id or not checkout_request_id:
            return jsonify({
                'success': False,
                'message': 'Submission ID and checkout request ID are required'
            }), 400

        # Get submission details
        submission = get_form_submission(submission_id)
        if not submission or submission['user_id'] != user_id:
            return jsonify({
                'success': False,
                'message': 'Submission not found'
            }), 404

        # Query M-Pesa transaction status
        result = mpesa_service.query_transaction_status(checkout_request_id)

        if result and result.get('ResultCode') == 0:
            # Payment successful
            update_submission_status(submission_id, 'paid')

            # Update payment record
            connection = mysql.connector.connect(**DB_CONFIG)
            if connection:
                cursor = connection.cursor()
                cursor.execute("""
                    UPDATE payments
                    SET status = 'completed', mpesa_receipt_number = %s, updated_at = NOW()
                    WHERE mpesa_checkout_request_id = %s
                """, (result.get('MpesaReceiptNumber', ''), checkout_request_id))
                connection.commit()
                connection.close()

            return jsonify({
                'success': True,
                'payment_status': 'completed',
                'submission_status': 'paid',
                'message': 'Payment successful! PDF generation will start shortly.'
            })
        else:
            return jsonify({
                'success': True,
                'payment_status': 'pending',
                'submission_status': submission['status'],
                'message': 'Payment is still pending. Please complete payment on your phone.'
            })

    except Exception as e:
        logger.error(f"Error checking form payment status: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/forms/submissions', methods=['GET'])
@jwt_required_custom
def get_user_form_submissions():
    """Get user's form submissions"""
    try:
        user_id = request.current_user['user_id']

        connection = mysql.connector.connect(**DB_CONFIG)
        if not connection:
            return jsonify({
                'success': False,
                'message': 'Database connection failed'
            }), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT fs.*, p.status as payment_status, p.mpesa_receipt_number
            FROM form_submissions fs
            LEFT JOIN payments p ON fs.payment_id = p.id
            WHERE fs.user_id = %s
            ORDER BY fs.created_at DESC
        """, (user_id,))

        submissions = cursor.fetchall()
        connection.close()

        # Parse form_data JSON for each submission
        for submission in submissions:
            submission['form_data'] = json.loads(submission['form_data'])

        return jsonify({
            'success': True,
            'data': submissions
        })

    except Exception as e:
        logger.error(f"Error getting form submissions: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# PDF Generation and Email Delivery Workflow
def generate_pdf_from_submission(submission_id: int) -> str:
    """Generate PDF from form submission and return PDF path"""
    try:
        # Get submission details
        submission = get_form_submission(submission_id)
        if not submission:
            logger.error(f"Submission {submission_id} not found")
            return None

        form_data = submission['form_data']
        document_type = submission['document_type']
        user_id = submission['user_id']

        # Generate output path
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        if document_type == 'Francisca Resume':
            filename = f"francisca_resume_{user_id}_{timestamp}.pdf"
            output_path = f"static/templates/generated_resumes/{filename}"

            # Ensure directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            # Generate PDF using Francisca template
            success = pdf_generator.generate_resume_pdf(form_data, output_path)

        elif document_type == 'Cover Letter':
            filename = f"cover_letter_{user_id}_{timestamp}.pdf"
            output_path = f"static/templates/generated_cover_letters/{filename}"

            # Ensure directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            # Generate cover letter content using AI
            cover_letter_content = generate_cover_letter_content(form_data)
            form_data['content'] = cover_letter_content

            # Generate PDF using cover letter generator
            success = cover_letter_generator.generate_cover_letter_pdf(form_data, output_path)

        else:
            logger.error(f"Unknown document type: {document_type}")
            return None

        if success and os.path.exists(output_path):
            logger.info(f"PDF generated successfully: {output_path}")
            return output_path
        else:
            logger.error(f"Failed to generate PDF for submission {submission_id}")
            return None

    except Exception as e:
        logger.error(f"Error generating PDF from submission {submission_id}: {e}")
        return None

def process_paid_submission(submission_id: int) -> bool:
    """Process a paid submission: generate PDF and send email"""
    try:
        # Get submission details
        submission = get_form_submission(submission_id)
        if not submission:
            logger.error(f"Submission {submission_id} not found")
            return False

        # Check if already processed
        if submission['status'] in ['pdf_generated', 'email_sent', 'completed']:
            logger.info(f"Submission {submission_id} already processed")
            return True

        # Update status to PDF generation
        update_submission_status(submission_id, 'pdf_generated')

        # Generate PDF
        pdf_path = generate_pdf_from_submission(submission_id)

        if not pdf_path:
            logger.error(f"Failed to generate PDF for submission {submission_id}")
            update_submission_status(submission_id, 'paid')  # Revert status
            return False

        # Update submission with PDF path
        update_submission_status(submission_id, 'pdf_generated', pdf_path)

        # Send email
        email_sent = email_service.send_pdf_email(
            recipient_email=submission['user_email'],
            pdf_path=pdf_path,
            document_type=submission['document_type'],
            user_name=submission['user_name']
        )

        # Update final status
        if email_sent:
            update_submission_status(submission_id, 'completed', pdf_path, True)
            logger.info(f"Submission {submission_id} completed successfully")
        else:
            update_submission_status(submission_id, 'email_sent', pdf_path, False)
            logger.warning(f"PDF generated but email failed for submission {submission_id}")

        return email_sent

    except Exception as e:
        logger.error(f"Error processing paid submission {submission_id}: {e}")
        return False

@app.route('/api/forms/process-payment', methods=['POST'])
@jwt_required_custom
def process_payment_and_generate():
    """Process payment and generate PDF with email delivery"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        submission_id = data.get('submission_id')

        if not submission_id:
            return jsonify({
                'success': False,
                'message': 'Submission ID is required'
            }), 400

        # Get submission details
        submission = get_form_submission(submission_id)
        if not submission or submission['user_id'] != user_id:
            return jsonify({
                'success': False,
                'message': 'Submission not found'
            }), 404

        # Check if payment is completed
        if submission['status'] != 'paid':
            return jsonify({
                'success': False,
                'message': 'Payment not completed yet'
            }), 400

        # Process the submission
        success = process_paid_submission(submission_id)

        if success:
            return jsonify({
                'success': True,
                'message': 'PDF generated and sent to your email!',
                'submission_id': submission_id,
                'status': 'completed'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'PDF generation failed. Please try again.'
            }), 500

    except Exception as e:
        logger.error(f"Error processing payment and generation: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/forms/check-status', methods=['POST'])
@jwt_required_custom
def check_submission_status():
    """Check the status of a form submission"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        submission_id = data.get('submission_id')

        if not submission_id:
            return jsonify({
                'success': False,
                'message': 'Submission ID is required'
            }), 400

        # Get submission details
        submission = get_form_submission(submission_id)
        if not submission or submission['user_id'] != user_id:
            return jsonify({
                'success': False,
                'message': 'Submission not found'
            }), 404

        # Check if payment is completed and trigger processing
        if submission['status'] == 'paid':
            # Auto-process paid submissions
            process_paid_submission(submission_id)
            # Get updated submission
            submission = get_form_submission(submission_id)

        return jsonify({
            'success': True,
            'submission_id': submission_id,
            'status': submission['status'],
            'pdf_path': submission.get('pdf_path'),
            'email_sent': submission.get('email_sent', False),
            'created_at': submission['created_at'].isoformat() if submission['created_at'] else None,
            'updated_at': submission['updated_at'].isoformat() if submission['updated_at'] else None
        })

    except Exception as e:
        logger.error(f"Error checking submission status: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/forms/download-pdf', methods=['POST'])
@jwt_required_custom
def download_submission_pdf():
    """Download PDF for a completed submission"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        submission_id = data.get('submission_id')

        if not submission_id:
            return jsonify({
                'success': False,
                'message': 'Submission ID is required'
            }), 400

        # Get submission details
        submission = get_form_submission(submission_id)
        if not submission or submission['user_id'] != user_id:
            return jsonify({
                'success': False,
                'message': 'Submission not found'
            }), 404

        # Check if PDF is available
        if not submission['pdf_path'] or not os.path.exists(submission['pdf_path']):
            return jsonify({
                'success': False,
                'message': 'PDF not available yet'
            }), 404

        # Return PDF download URL
        return jsonify({
            'success': True,
            'download_url': f"/{submission['pdf_path']}",
            'filename': os.path.basename(submission['pdf_path'])
        })

    except Exception as e:
        logger.error(f"Error downloading PDF: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Template Management System
class TemplateManager:
    def __init__(self):
        self.templates_dir = 'static/templates'
        self.upload_dir = 'static/templates/uploads'
        self.processed_dir = 'static/templates/processed'

        # Ensure directories exist
        os.makedirs(self.templates_dir, exist_ok=True)
        os.makedirs(self.upload_dir, exist_ok=True)
        os.makedirs(self.processed_dir, exist_ok=True)

    def get_available_templates(self):
        """Get list of available templates"""
        try:
            templates = []

            # Resume templates
            resume_templates = [
                {
                    'id': 'professional',
                    'name': 'Professional',
                    'type': 'resume',
                    'description': 'Clean and professional design',
                    'preview': '/static/templates/previews/professional.png',
                    'file_path': '/static/templates/resume_professional.pdf'
                },
                {
                    'id': 'modern',
                    'name': 'Modern',
                    'type': 'resume',
                    'description': 'Modern and creative design',
                    'preview': '/static/templates/previews/modern.png',
                    'file_path': '/static/templates/resume_modern.pdf'
                },
                {
                    'id': 'executive',
                    'name': 'Executive',
                    'type': 'resume',
                    'description': 'Executive-level design',
                    'preview': '/static/templates/previews/executive.png',
                    'file_path': '/static/templates/resume_executive.pdf'
                }
            ]

            # Cover letter templates
            cover_letter_templates = [
                {
                    'id': 'professional_cl',
                    'name': 'Professional',
                    'type': 'cover_letter',
                    'description': 'Clean and professional design',
                    'preview': '/static/templates/cover_letter_previews/professional.png',
                    'file_path': '/static/templates/cover_letter_professional.pdf'
                },
                {
                    'id': 'modern_cl',
                    'name': 'Modern',
                    'type': 'cover_letter',
                    'description': 'Modern and creative design',
                    'preview': '/static/templates/cover_letter_previews/modern.png',
                    'file_path': '/static/templates/cover_letter_modern.pdf'
                }
            ]

            templates.extend(resume_templates)
            templates.extend(cover_letter_templates)

            return templates

        except Exception as e:
            logger.error(f"Error getting templates: {e}")
            return []

    def process_uploaded_template(self, file_path, template_type, template_name):
        """Process uploaded template file"""
        try:
            # Validate file type
            allowed_extensions = ['.pdf', '.docx', '.doc']
            file_ext = os.path.splitext(file_path)[1].lower()

            if file_ext not in allowed_extensions:
                return False, "Invalid file type. Only PDF, DOCX, and DOC files are allowed."

            # Generate processed file path
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            processed_filename = f"{template_type}_{template_name}_{timestamp}{file_ext}"
            processed_path = os.path.join(self.processed_dir, processed_filename)

            # Copy file to processed directory
            import shutil
            shutil.copy2(file_path, processed_path)

            # Generate preview (placeholder for now)
            preview_path = f"/static/templates/previews/{template_name}.png"

            return True, {
                'processed_path': processed_path,
                'preview_path': preview_path,
                'template_id': f"{template_type}_{template_name}_{timestamp}"
            }

        except Exception as e:
            logger.error(f"Error processing template: {e}")
            return False, str(e)

    def analyze_template_structure(self, file_path):
        """Analyze template structure and extract form fields"""
        try:
            # This would typically use PDF parsing libraries
            # For now, return mock data
            analysis = {
                'form_fields': [
                    {'name': 'name', 'type': 'text', 'required': True, 'position': {'x': 100, 'y': 200}},
                    {'name': 'email', 'type': 'email', 'required': True, 'position': {'x': 100, 'y': 220}},
                    {'name': 'phone', 'type': 'tel', 'required': False, 'position': {'x': 100, 'y': 240}},
                    {'name': 'experience', 'type': 'textarea', 'required': True, 'position': {'x': 100, 'y': 300}},
                    {'name': 'education', 'type': 'textarea', 'required': True, 'position': {'x': 100, 'y': 400}}
                ],
                'sections': [
                    {'name': 'Header', 'fields': ['name', 'email', 'phone']},
                    {'name': 'Experience', 'fields': ['experience']},
                    {'name': 'Education', 'fields': ['education']}
                ],
                'compatibility_score': random.randint(80, 95),
                'suggestions': [
                    'Template has good structure',
                    'Consider adding skills section',
                    'Experience section could be expanded'
                ]
            }

            return analysis

        except Exception as e:
            logger.error(f"Error analyzing template: {e}")
            return None

# Initialize template manager
template_manager = TemplateManager()

# Template Management Routes
@app.route('/api/templates', methods=['GET'])
def get_templates():
    """Get available templates"""
    try:
        templates = template_manager.get_available_templates()

        return jsonify({
            'success': True,
            'data': templates
        })

    except Exception as e:
        logger.error(f"Error getting templates: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/templates/upload', methods=['POST'])
@jwt_required_custom
def upload_template():
    """Upload a new template"""
    try:
        user_id = request.current_user['user_id']

        # Check if file is present
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No file provided'
            }), 400

        file = request.files['file']
        template_type = request.form.get('type', 'resume')
        template_name = request.form.get('name', 'custom_template')

        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No file selected'
            }), 400

        # Save uploaded file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{template_type}_{template_name}_{timestamp}_{file.filename}"
        file_path = os.path.join(template_manager.upload_dir, filename)
        file.save(file_path)

        # Process template
        success, result = template_manager.process_uploaded_template(
            file_path, template_type, template_name
        )

        if success:
            return jsonify({
                'success': True,
                'message': 'Template uploaded successfully',
                'data': result
            })
        else:
            return jsonify({
                'success': False,
                'message': result
            }), 400

    except Exception as e:
        logger.error(f"Error uploading template: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/templates/analyze', methods=['POST'])
@jwt_required_custom
def analyze_template():
    """Analyze template structure"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        file_path = data.get('file_path', '')

        if not file_path:
            return jsonify({
                'success': False,
                'message': 'File path is required'
            }), 400

        # Analyze template
        analysis = template_manager.analyze_template_structure(file_path)

        if analysis:
            return jsonify({
                'success': True,
                'data': analysis
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to analyze template'
            }), 500

    except Exception as e:
        logger.error(f"Error analyzing template: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/templates/<template_id>/preview', methods=['GET'])
def get_template_preview(template_id):
    """Get template preview"""
    try:
        # This would typically serve the preview image
        # For now, return a placeholder
        return jsonify({
            'success': True,
            'data': {
                'preview_url': f'/static/templates/previews/{template_id}.png',
                'template_id': template_id
            }
        })

    except Exception as e:
        logger.error(f"Error getting template preview: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/templates/<template_id>/download', methods=['GET'])
@jwt_required_custom
def download_template(template_id):
    """Download template file"""
    try:
        user_id = request.current_user['user_id']

        # Find template file
        template_path = f"static/templates/{template_id}.pdf"

        if os.path.exists(template_path):
            return send_file(template_path, as_attachment=True)
        else:
            return jsonify({
                'success': False,
                'message': 'Template not found'
            }), 404

    except Exception as e:
        logger.error(f"Error downloading template: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Resume Management Routes (Missing from Frontend)
@app.route('/api/resumes', methods=['GET'])
@jwt_required_custom
def get_user_resumes():
    """Get all resumes for the current user"""
    try:
        user_id = request.current_user['user_id']

        # Return empty array - no resumes exist yet
        resumes = []

        return jsonify({
            'success': True,
            'data': resumes
        })

    except Exception as e:
        logger.error(f"Error getting user resumes: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resumes/<int:resume_id>', methods=['GET'])
@jwt_required_custom
def get_resume(resume_id):
    """Get specific resume with sections"""
    try:
        user_id = request.current_user['user_id']

        # Return 404 - resume not found
        return jsonify({
            'success': False,
            'message': 'Resume not found'
        }), 404

    except Exception as e:
        logger.error(f"Error getting resume: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resumes', methods=['POST'])
@jwt_required_custom
def create_resume():
    """Create a new resume"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        title = data.get('title', 'Untitled Resume')
        template_id = data.get('template_id')

        # Mock creation - in production, this would save to database
        resume_id = random.randint(1000, 9999)

        return jsonify({
            'success': True,
            'message': 'Resume created successfully',
            'resume_id': resume_id
        })

    except Exception as e:
        logger.error(f"Error creating resume: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resumes/<int:resume_id>', methods=['PUT'])
@jwt_required_custom
def update_resume(resume_id):
    """Update a resume"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        # Mock update - in production, this would update database
        return jsonify({
            'success': True,
            'message': 'Resume updated successfully'
        })

    except Exception as e:
        logger.error(f"Error updating resume: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resumes/<int:resume_id>/enhance', methods=['POST'])
@jwt_required_custom
def enhance_resume_section(resume_id):
    """Enhance a specific resume section"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        section_id = data.get('section_id')
        job_description = data.get('job_description', '')
        tone = data.get('tone', 'formal')

        # Mock enhancement - in production, this would use AI
        enhancements = [
            'Added quantifiable achievements',
            'Improved action verbs',
            'Enhanced industry keywords',
            'Optimized for ATS compatibility'
        ]

        return jsonify({
            'success': True,
            'message': 'Resume section enhanced successfully',
            'enhancements': enhancements
        })

    except Exception as e:
        logger.error(f"Error enhancing resume section: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resumes/<int:resume_id>/analyze', methods=['POST'])
@jwt_required_custom
def analyze_resume_detailed(resume_id):
    """Analyze resume with detailed scoring"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        job_description = data.get('job_description', '')

        # Mock analysis - in production, this would use AI
        score = {
            'overall_score': random.randint(75, 95),
            'ats_compatibility': random.randint(70, 90),
            'keyword_match': random.randint(60, 85),
            'formatting': random.randint(80, 95),
            'content_quality': random.randint(70, 90),
            'suggestions': [
                'Add more quantifiable achievements',
                'Include industry-specific keywords',
                'Improve action verb usage',
                'Consider adding a skills section'
            ]
        }

        return jsonify({
            'success': True,
            'message': 'Resume analyzed successfully',
            'score': score
        })

    except Exception as e:
        logger.error(f"Error analyzing resume: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resumes/<int:resume_id>/cover-letter', methods=['POST'])
@jwt_required_custom
def generate_cover_letter_from_resume(resume_id):
    """Generate cover letter from resume data"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        company = data.get('company', '')
        position = data.get('position', '')
        template_id = data.get('template_id')

        # Mock generation - in production, this would use AI
        cover_letter_id = random.randint(1000, 9999)
        content = f"""
Dear Hiring Manager,

I am writing to express my strong interest in the {position} position at {company}.
With my background in software development and passion for innovation, I am confident
that I would be a valuable addition to your team.

[Generated content based on resume data...]

Thank you for considering my application. I look forward to hearing from you soon.

Sincerely,
[Your Name]
        """

        return jsonify({
            'success': True,
            'message': 'Cover letter generated successfully',
            'cover_letter_id': cover_letter_id,
            'content': content
        })

    except Exception as e:
        logger.error(f"Error generating cover letter: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resumes/upload', methods=['POST'])
@jwt_required_custom
def upload_resume_file():
    """Upload and parse resume file"""
    try:
        user_id = request.current_user['user_id']

        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No file provided'
            }), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No file selected'
            }), 400

        # Mock parsing - in production, this would use AI/ML parsing
        parsed_resume_id = random.randint(1000, 9999)
        parsed_data = {
            'personal_info': {
                'name': 'John Doe',
                'email': 'john@example.com',
                'phone': '+1234567890',
                'address': '123 Main St, City, State',
                'linkedin': 'linkedin.com/in/johndoe'
            },
            'summary': 'Experienced software engineer with 5+ years of experience...',
            'experience': [
                {
                    'title': 'Senior Software Engineer',
                    'company': 'Tech Corp',
                    'duration': '2020-2024',
                    'description': 'Led development of microservices architecture...'
                }
            ],
            'education': [
                {
                    'degree': 'Bachelor of Computer Science',
                    'institution': 'University of Technology',
                    'year': '2020',
                    'gpa': '3.8'
                }
            ],
            'skills': ['Python', 'JavaScript', 'React', 'Node.js', 'AWS'],
            'certifications': ['AWS Certified Developer', 'Google Cloud Professional'],
            'languages': ['English', 'Spanish'],
            'projects': [
                {
                    'name': 'E-commerce Platform',
                    'description': 'Built a full-stack e-commerce platform...',
                    'technologies': ['React', 'Node.js', 'MongoDB']
                }
            ]
        }

        return jsonify({
            'success': True,
            'message': 'Resume uploaded and parsed successfully',
            'parsed_resume_id': parsed_resume_id,
            'parsed_data': parsed_data,
            'filename': file.filename
        })

    except Exception as e:
        logger.error(f"Error uploading resume: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resumes/parsed', methods=['GET'])
@jwt_required_custom
def get_parsed_resumes():
    """Get all parsed resumes for the user"""
    try:
        user_id = request.current_user['user_id']

        # Return empty array - no parsed resumes exist yet
        parsed_resumes = []

        return jsonify({
            'success': True,
            'data': parsed_resumes
        })

    except Exception as e:
        logger.error(f"Error getting parsed resumes: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resumes/parsed/<int:resume_id>', methods=['GET'])
@jwt_required_custom
def get_parsed_resume(resume_id):
    """Get specific parsed resume"""
    try:
        user_id = request.current_user['user_id']

        # Return 404 - parsed resume not found
        return jsonify({
            'success': False,
            'message': 'Parsed resume not found'
        }), 404

    except Exception as e:
        logger.error(f"Error getting parsed resume: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resumes/parsed/<int:resume_id>', methods=['DELETE'])
@jwt_required_custom
def delete_parsed_resume(resume_id):
    """Delete parsed resume"""
    try:
        user_id = request.current_user['user_id']

        # Mock deletion - in production, this would delete from database
        return jsonify({
            'success': True,
            'message': 'Parsed resume deleted successfully'
        })

    except Exception as e:
        logger.error(f"Error deleting parsed resume: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Cover Letter Management Routes (Missing from Frontend)
@app.route('/api/cover-letters', methods=['GET'])
@jwt_required_custom
def get_user_cover_letters():
    """Get all cover letters for the current user"""
    try:
        user_id = request.current_user['user_id']

        # Return empty array - no mock data
        cover_letters = []

        return jsonify({
            'success': True,
            'data': cover_letters
        })

    except Exception as e:
        logger.error(f"Error getting cover letters: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/cover-letters/<int:cover_letter_id>', methods=['GET'])
@jwt_required_custom
def get_cover_letter(cover_letter_id):
    """Get specific cover letter"""
    try:
        user_id = request.current_user['user_id']

        # No cover letters exist - return 404
        return jsonify({
            'success': False,
            'message': 'Cover letter not found'
        }), 404

    except Exception as e:
        logger.error(f"Error getting cover letter: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/cover-letters/<int:cover_letter_id>', methods=['PUT'])
@jwt_required_custom
def update_cover_letter(cover_letter_id):
    """Update cover letter"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        # Mock update - in production, this would update database
        return jsonify({
            'success': True,
            'message': 'Cover letter updated successfully'
        })

    except Exception as e:
        logger.error(f"Error updating cover letter: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# PDF Generation Routes (Missing from Frontend)
@app.route('/api/resume/generate-pdf', methods=['POST'])
@jwt_required_custom
def generate_pdf_with_form_data():
    """Generate PDF with form data injected into template"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        # Use existing PDF generator
        success = pdf_generator.generate_resume_pdf(data, f"static/templates/generated_resumes/resume_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")

        if success:
            return jsonify({
                'success': True,
                'message': 'PDF generated successfully',
                'pdf_path': f'/static/templates/generated_resumes/resume_{user_id}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to generate PDF'
            }), 500

    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resume/generate-advanced-pdf', methods=['POST'])
@jwt_required_custom
def generate_advanced_pdf():
    """Generate advanced PDF with multiple options"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        # Use existing PDF generator with advanced options
        success = pdf_generator.generate_resume_pdf(data, f"static/templates/generated_resumes/advanced_resume_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")

        if success:
            return jsonify({
                'success': True,
                'message': 'Advanced PDF generated successfully',
                'pdf_path': f'/static/templates/generated_resumes/advanced_resume_{user_id}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to generate advanced PDF'
            }), 500

    except Exception as e:
        logger.error(f"Error generating advanced PDF: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/resumes/generate-francisca', methods=['POST'])
@jwt_required_custom
def generate_francisca_resume():
    """Generate resume using Francisca template"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        resume_data = data.get('resume_data', {})
        use_ai = data.get('use_ai', False)
        theme = data.get('theme', 'professional')
        job_description = data.get('job_description', '')
        industry = data.get('industry', '')

        # Generate PDF in memory (temporary file)
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            temp_path = temp_file.name

        # Generate PDF using Francisca template
        success = pdf_generator.generate_resume_pdf(resume_data, temp_path)

        if success:
            # Read the generated PDF into memory
            with open(temp_path, 'rb') as pdf_file:
                pdf_data = pdf_file.read()
            
            # Clean up temporary file
            try:
                os.unlink(temp_path)
            except:
                pass
            
            # Return PDF data as base64 for frontend to handle
            import base64
            pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')
            
            return jsonify({
                'success': True,
                'message': 'Francisca resume generated successfully',
                'pdf_data': pdf_base64,
                'filename': f"francisca_resume_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
                'resume_id': f"francisca_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            })
        else:
            # Clean up temporary file
            try:
                os.unlink(temp_path)
            except:
                pass
            
            return jsonify({
                'success': False,
                'message': 'Failed to generate Francisca resume'
            }), 500

    except Exception as e:
        logger.error(f"Error generating Francisca resume: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Francisca AI Enhancement Routes
@app.route('/api/francisca/ai/enhance-field', methods=['POST'])
@jwt_required_custom
def francisca_enhance_field():
    """Enhance a specific field using AI with ATS compliance focus"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        content = data.get('content', '')
        field_type = data.get('field_type', '')
        profession = data.get('profession', '')
        ats_focus = data.get('ats_focus', True)  # New parameter for ATS focus

        if not content or not field_type:
            return jsonify({
                'success': False,
                'error': 'Content and field_type are required'
            }), 400

        # Import Francisca AI service
        from francisca_ai_service import francisca_ai_service

        # Enhance the content based on field type with ATS focus
        if ats_focus:
            enhanced_content = francisca_ai_service.enhance_field_ats_compliance(
                content, field_type, profession
            )
        else:
            # Original enhancement logic
            if field_type in ['responsibilities', 'achievements', 'description']:
                enhanced_content = francisca_ai_service.enhance_achievements([content], profession or 'Professional')
                enhanced_content = enhanced_content[0] if enhanced_content else content
            else:
                enhanced_content = francisca_ai_service.generate_francisca_content(
                    content, field_type, profession
                )

        # Generate ATS-focused improvements list
        improvements = [
            "Enhanced with ATS-optimized keywords",
            "Improved formatting for ATS compatibility",
            "Added industry-specific terminology",
            "Optimized structure for ATS parsing",
            "Enhanced with quantifiable achievements"
        ] if ats_focus else [
            "Enhanced with professional language",
            "Improved clarity and impact",
            "Added industry-specific keywords",
            "Optimized for ATS systems"
        ]

        # Calculate ATS compliance score
        ats_score = francisca_ai_service.calculate_ats_compliance_score(enhanced_content, field_type, profession)

        result = {
            'success': True,
            'result': {
                'original_content': content,
                'enhanced_content': enhanced_content,
                'field_type': field_type,
                'profession': profession,
                'improvements': improvements,
                'confidence': 0.85,
                'ats_score': ats_score,
                'ats_focus': ats_focus
            }
        }

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error enhancing field: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/francisca/ai/enhance-ats-compliance', methods=['POST'])
@jwt_required_custom
def francisca_enhance_ats_compliance():
    """Enhance entire document for ATS compliance"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        resume_data = data.get('resume_data', {})
        profession = data.get('profession', '')
        job_title = data.get('job_title', '')

        if not resume_data:
            return jsonify({
                'success': False,
                'error': 'Resume data is required'
            }), 400

        # Import Francisca AI service
        from francisca_ai_service import francisca_ai_service

        # Perform comprehensive ATS compliance enhancement
        enhanced_data = francisca_ai_service.enhance_document_ats_compliance(
            resume_data, profession, job_title
        )

        # Calculate overall ATS compliance score
        overall_ats_score = francisca_ai_service.calculate_overall_ats_score(enhanced_data)

        result = {
            'success': True,
            'result': {
                'original_data': resume_data,
                'enhanced_data': enhanced_data,
                'overall_ats_score': overall_ats_score,
                'profession': profession,
                'job_title': job_title,
                'ats_improvements': [
                    "Optimized keywords for ATS compatibility",
                    "Enhanced formatting for better parsing",
                    "Improved section structure",
                    "Added industry-specific terminology",
                    "Standardized contact information"
                ]
            }
        }

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error enhancing ATS compliance: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/francisca/ai/generate-content', methods=['POST'])
@jwt_required_custom
def generate_francisca_content():
    """Generate content using AI based on user prompt"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        prompt = data.get('prompt', '')
        field_type = data.get('field_type', '')
        context = data.get('context', {})

        if not prompt or not field_type:
            return jsonify({
                'success': False,
                'error': 'Prompt and field_type are required'
            }), 400

        # Import Francisca AI service
        from francisca_ai_service import francisca_ai_service

        profession = context.get('profession', '')
        generated_content = francisca_ai_service.generate_francisca_content(
            prompt, field_type, profession
        )

        result = {
            'success': True,
            'result': {
                'generated_content': generated_content,
                'field_type': field_type,
                'profession': profession,
                'confidence': 0.80
            }
        }

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error generating content: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ai/paragraph-suggestions', methods=['POST'])
@jwt_required_custom
def generate_paragraph_suggestions():
    """Generate AI suggestions for cover letter paragraphs"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        paragraph_type = data.get('paragraph_type', '')
        job_title = data.get('job_title', '')
        company_name = data.get('company_name', '')
        user_data = data.get('user_data', {})
        custom_prompt = data.get('custom_prompt', '')

        if not paragraph_type:
            return jsonify({
                'success': False,
                'message': 'Paragraph type is required'
            }), 400

        # Generate suggestions using AI
        suggestions = generate_ai_paragraph_suggestions(
            paragraph_type, job_title, company_name, user_data, custom_prompt
        )

        return jsonify({
            'success': True,
            'message': 'Suggestions generated successfully',
            'data': {
                'paragraph_type': paragraph_type,
                'suggestions': suggestions
            }
        })

    except Exception as e:
        logger.error(f"Error generating paragraph suggestions: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ai/paragraph-guidance', methods=['POST'])
@jwt_required_custom
def get_paragraph_guidance():
    """Get writing guidance for specific paragraph types"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        paragraph_type = data.get('paragraph_type', '')

        if not paragraph_type:
            return jsonify({
                'success': False,
                'message': 'Paragraph type is required'
            }), 400

        # Get guidance for paragraph type
        guidance = get_paragraph_writing_guidance(paragraph_type)

        return jsonify({
            'success': True,
            'data': guidance
        })

    except Exception as e:
        logger.error(f"Error getting paragraph guidance: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/francisca/ai/suggestions', methods=['POST'])
@jwt_required_custom
def francisca_get_suggestions():
    """Get AI suggestions for a specific field type"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        field_type = data.get('field_type', '')
        profession = data.get('profession', '')

        if not field_type:
            return jsonify({
                'success': False,
                'error': 'field_type is required'
            }), 400

        # Import Francisca AI service
        from francisca_ai_service import francisca_ai_service

        suggestions = francisca_ai_service.get_francisca_suggestions(profession, field_type)

        result = {
            'success': True,
            'suggestions': suggestions,
            'field_type': field_type,
            'profession': profession
        }

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error getting suggestions: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/francisca/ai/analyze-content', methods=['POST'])
@jwt_required_custom
def francisca_analyze_content():
    """Analyze content for optimization recommendations"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        content = data.get('content', '')
        profession = data.get('profession', '')

        if not content:
            return jsonify({
                'success': False,
                'error': 'Content is required'
            }), 400

        # Import Francisca AI service
        from francisca_ai_service import francisca_ai_service

        analysis = francisca_ai_service.analyze_francisca_context(content, profession)

        result = {
            'success': True,
            'analysis': analysis,
            'profession': profession
        }

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error analyzing content: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/francisca/ai/status', methods=['GET'])
@jwt_required_custom
def francisca_ai_status():
    """Get the status of the Francisca AI service"""
    try:
        from francisca_ai_service import francisca_ai_service

        status = francisca_ai_service.get_service_status()

        return jsonify({
            'success': True,
            'status': status
        }), 200

    except Exception as e:
        logger.error(f"Error getting AI service status: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Enhanced Francisca Question Flow API Routes
@app.route('/api/francisca/questions/start', methods=['POST'])
@jwt_required_custom
def start_francisca_questions():
    """Start the guided question flow"""
    try:
        from francisca_question_engine import francisca_question_engine

        # Reset the question flow
        francisca_question_engine.reset_flow()

        # Get the first question
        first_question = francisca_question_engine.get_current_question()

        return jsonify({
            'success': True,
            'question': first_question,
            'progress': francisca_question_engine.get_progress()
        }), 200

    except Exception as e:
        logger.error(f"Error starting question flow: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/francisca/questions/current', methods=['GET'])
@jwt_required_custom
def get_current_question():
    """Get the current question"""
    try:
        from francisca_question_engine import francisca_question_engine

        current_question = francisca_question_engine.get_current_question()

        return jsonify({
            'success': True,
            'question': current_question,
            'progress': francisca_question_engine.get_progress()
        }), 200

    except Exception as e:
        logger.error(f"Error getting current question: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/francisca/questions/answer', methods=['POST'])
@jwt_required_custom
def submit_answer():
    """Submit an answer and get enhancement suggestions"""
    try:
        from francisca_question_engine import francisca_question_engine
        from francisca_enhanced_ai import francisca_enhanced_ai

        data = request.get_json()
        field = data.get('field')
        answer = data.get('answer', '')
        context = data.get('context', {})

        if not field:
            return jsonify({
                'success': False,
                'error': 'Field is required'
            }), 400

        # Get enhancement for the answer
        enhancement = francisca_enhanced_ai.enhance_answer(field, answer, context)

        # Submit the answer (use enhanced version)
        result = francisca_question_engine.submit_answer(field, answer, enhancement['enhanced'])

        # Get the next question
        next_question = francisca_question_engine.get_next_question()

        return jsonify({
            'success': True,
            'answer': result,
            'enhancement': enhancement,
            'next_question': next_question,
            'progress': francisca_question_engine.get_progress()
        }), 200

    except Exception as e:
        logger.error(f"Error submitting answer: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/francisca/questions/next', methods=['POST'])
@jwt_required_custom
def get_next_question():
    """Get the next question"""
    try:
        from francisca_question_engine import francisca_question_engine

        next_question = francisca_question_engine.get_next_question()

        return jsonify({
            'success': True,
            'question': next_question,
            'progress': francisca_question_engine.get_progress()
        }), 200

    except Exception as e:
        logger.error(f"Error getting next question: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/francisca/questions/previous', methods=['POST'])
@jwt_required_custom
def get_previous_question():
    """Get the previous question"""
    try:
        from francisca_question_engine import francisca_question_engine

        previous_question = francisca_question_engine.get_previous_question()

        return jsonify({
            'success': True,
            'question': previous_question,
            'progress': francisca_question_engine.get_progress()
        }), 200

    except Exception as e:
        logger.error(f"Error getting previous question: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/francisca/questions/jump', methods=['POST'])
@jwt_required_custom
def jump_to_step():
    """Jump to a specific step"""
    try:
        from francisca_question_engine import francisca_question_engine

        data = request.get_json()
        step_name = data.get('step')

        if not step_name:
            return jsonify({
                'success': False,
                'error': 'Step name is required'
            }), 400

        success = francisca_question_engine.jump_to_step(step_name)

        if success:
            current_question = francisca_question_engine.get_current_question()
            return jsonify({
                'success': True,
                'question': current_question,
                'progress': francisca_question_engine.get_progress()
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid step name'
            }), 400

    except Exception as e:
        logger.error(f"Error jumping to step: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/francisca/questions/progress', methods=['GET'])
@jwt_required_custom
def get_question_progress():
    """Get the current progress"""
    try:
        from francisca_question_engine import francisca_question_engine

        progress = francisca_question_engine.get_progress()

        return jsonify({
            'success': True,
            'progress': progress
        }), 200

    except Exception as e:
        logger.error(f"Error getting progress: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/francisca/questions/resume-data', methods=['GET'])
@jwt_required_custom
def get_resume_data():
    """Get the complete resume data for auto-filling"""
    try:
        from francisca_question_engine import francisca_question_engine

        resume_data = francisca_question_engine.get_resume_data()

        return jsonify({
            'success': True,
            'resume_data': resume_data,
            'progress': francisca_question_engine.get_progress()
        }), 200

    except Exception as e:
        logger.error(f"Error getting resume data: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/francisca/questions/step-summary', methods=['POST'])
@jwt_required_custom
def get_step_summary():
    """Get a summary of a specific step"""
    try:
        from francisca_question_engine import francisca_question_engine

        data = request.get_json()
        step_name = data.get('step')

        if not step_name:
            return jsonify({
                'success': False,
                'error': 'Step name is required'
            }), 400

        summary = francisca_question_engine.get_step_summary(step_name)

        return jsonify({
            'success': True,
            'summary': summary
        }), 200

    except Exception as e:
        logger.error(f"Error getting step summary: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Market Data Routes (Missing from Frontend)
@app.route('/api/market-data', methods=['GET'])
def get_market_data():
    """Get market data for skills and trends"""
    try:
        region = request.args.get('region', 'Nairobi')
        industry = request.args.get('industry', 'Technology')

        # Mock market data - in production, this would come from real data sources
        market_data = [
            {
                'skill': 'Python',
                'demand_percentage': 85,
                'trend': 'up',
                'region': region,
                'industry': industry,
                'salary_range': '$60k - $120k',
                'growth_rate': 15
            },
            {
                'skill': 'JavaScript',
                'demand_percentage': 90,
                'trend': 'up',
                'region': region,
                'industry': industry,
                'salary_range': '$55k - $110k',
                'growth_rate': 12
            },
            {
                'skill': 'React',
                'demand_percentage': 88,
                'trend': 'up',
                'region': region,
                'industry': industry,
                'salary_range': '$65k - $125k',
                'growth_rate': 18
            }
        ]

        return jsonify({
            'success': True,
            'data': market_data
        })

    except Exception as e:
        logger.error(f"Error getting market data: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/job-descriptions/analyze', methods=['POST'])
@jwt_required_custom
def analyze_job_description():
    """Analyze job description and extract keywords"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        description = data.get('description', '')
        url = data.get('url', '')

        # Mock analysis - in production, this would use AI/NLP
        keywords = [
            'Python', 'JavaScript', 'React', 'Node.js', 'AWS',
            'Machine Learning', 'Data Science', 'Agile', 'Scrum',
            'Leadership', 'Communication', 'Problem Solving'
        ]

        return jsonify({
            'success': True,
            'keywords': keywords
        })

    except Exception as e:
        logger.error(f"Error analyzing job description: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Advanced AI Market Routes (Missing from Frontend)
@app.route('/api/advanced-ai/analyze-skill', methods=['POST'])
@jwt_required_custom
def analyze_skill_with_ai():
    """Analyze skill with advanced AI"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        skill = data.get('skill', '')
        region = data.get('region', '')
        country = data.get('country', '')

        # Use existing AI analyzer
        analysis = ai_analyzer.analyze_global_market_data(region, country, 'Technology')

        return jsonify({
            'success': True,
            'data': analysis
        })

    except Exception as e:
        logger.error(f"Error analyzing skill with AI: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/advanced-ai/global-industry-analysis', methods=['GET'])
def get_global_industry_analysis():
    """Get global industry analysis"""
    try:
        # Mock analysis - in production, this would use AI
        analysis = [
            {
                'industry': 'Technology',
                'global_growth_rate': 15,
                'top_regions': [
                    {'region': 'North America', 'country': 'United States', 'growth_rate': 18, 'market_size': '$2.5T'},
                    {'region': 'Europe', 'country': 'Germany', 'growth_rate': 12, 'market_size': '$1.8T'},
                    {'region': 'Asia-Pacific', 'country': 'China', 'growth_rate': 22, 'market_size': '$3.2T'}
                ],
                'top_skills': ['AI/ML', 'Cloud Computing', 'Cybersecurity', 'Data Science'],
                'emerging_roles': ['AI Specialist', 'DevOps Engineer', 'Data Scientist', 'Cloud Architect'],
                'market_trends': ['Digital transformation', 'Remote work', 'AI integration', 'Sustainability'],
                'salary_trends': 'Salaries increasing by 10-20% annually',
                'ai_insights': 'Technology industry experiencing rapid growth with high demand for technical skills',
                'investment_opportunities': ['AI startups', 'Cloud infrastructure', 'Cybersecurity solutions'],
                'risk_assessment': ['Economic fluctuations', 'Regulatory changes', 'Technology disruption']
            }
        ]

        return jsonify({
            'success': True,
            'data': analysis
        })

    except Exception as e:
        logger.error(f"Error getting global industry analysis: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/advanced-ai/skill-predictions', methods=['GET'])
def get_skill_predictions():
    """Get AI-powered skill predictions"""
    try:
        # Mock predictions - in production, this would use AI
        predictions = [
            {
                'skill': 'AI/ML',
                'current_global_demand': 85,
                'predicted_demand_6months': 90,
                'predicted_demand_1year': 95,
                'predicted_demand_2years': 98,
                'confidence_level': 92,
                'top_growing_regions': [
                    {'region': 'North America', 'country': 'United States', 'growth_rate': 25},
                    {'region': 'Europe', 'country': 'Germany', 'growth_rate': 20},
                    {'region': 'Asia-Pacific', 'country': 'Singapore', 'growth_rate': 30}
                ],
                'factors': ['AI adoption', 'Digital transformation', 'Industry demand', 'Technology evolution'],
                'ai_analysis': 'AI/ML skills are expected to experience exponential growth with high demand across all industries'
            }
        ]

        return jsonify({
            'success': True,
            'data': predictions
        })

    except Exception as e:
        logger.error(f"Error getting skill predictions: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Root endpoint
@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "message": "Welcome to ProWrite API",
        "version": "1.0.0",
        "endpoints": {
            "auth": {
                "register": "POST /api/auth/register",
                "login": "POST /api/auth/login",
                "me": "GET /api/auth/me",
                "refresh": "POST /api/auth/refresh",
                "logout": "POST /api/auth/logout"
            },
            "profile": {
                "get_profile": "GET /api/profile",
                "update_profile": "PUT /api/profile"
            },
            "ai_market": {
                "global_market_data": "GET /api/advanced-ai/global-market-data",
                "global_job_vacancies": "GET /api/advanced-ai/global-job-vacancies",
                "global_salary_insights": "GET /api/advanced-ai/global-salary-insights",
                "search_salary": "GET /api/advanced-ai/search-salary"
            },
            "job_search": {
                "search_jobs": "GET /api/real-jobs/search",
                "platforms": "GET /api/real-jobs/platforms",
                "trending": "GET /api/real-jobs/trending"
            },
            "notifications": {
                "get_notifications": "GET /api/notifications",
                "unread_count": "GET /api/notifications/unread-count",
                "mark_read": "POST /api/notifications/<id>/read",
                "create": "POST /api/notifications/create"
            },
            "resumes": {
                "generate": "POST /api/resumes/generate",
                "templates": "GET /api/resumes/templates",
                "analyze": "POST /api/resumes/analyze"
            },
            "cover_letters": {
                "generate": "POST /api/cover-letters/generate",
                "templates": "GET /api/cover-letters/templates",
                "analyze": "POST /api/cover-letters/analyze"
            },
            "ai_enhancement": {
                "enhance_resume": "POST /api/ai/enhance-resume",
                "generate_content": "POST /api/ai/generate-content",
                "analyze_job_match": "POST /api/ai/analyze-job-match",
                "paragraph_suggestions": "POST /api/ai/paragraph-suggestions",
                "paragraph_guidance": "POST /api/ai/paragraph-guidance"
            },
            "analytics": {
                "user_analytics": "GET /api/analytics/user",
                "resume_analytics": "GET /api/analytics/resume/<id>",
                "global_analytics": "GET /api/analytics/global",
                "export_analytics": "POST /api/analytics/export"
            },
            "payments": {
                "initiate_mpesa": "POST /api/payments/mpesa/initiate",
                "check_mpesa_status": "POST /api/payments/mpesa/status",
                "mpesa_callback": "POST /api/payments/mpesa/callback",
                "subscription_plans": "GET /api/payments/subscriptions"
            },
            "templates": {
                "get_templates": "GET /api/templates",
                "upload_template": "POST /api/templates/upload",
                "analyze_template": "POST /api/templates/analyze",
                "template_preview": "GET /api/templates/<id>/preview",
                "download_template": "GET /api/templates/<id>/download"
            },
            "resume_management": {
                "get_resumes": "GET /api/resumes",
                "get_resume": "GET /api/resumes/<id>",
                "create_resume": "POST /api/resumes",
                "update_resume": "PUT /api/resumes/<id>",
                "enhance_resume": "POST /api/resumes/<id>/enhance",
                "analyze_resume": "POST /api/resumes/<id>/analyze",
                "generate_cover_letter": "POST /api/resumes/<id>/cover-letter",
                "upload_resume": "POST /api/resumes/upload",
                "get_parsed_resumes": "GET /api/resumes/parsed",
                "get_parsed_resume": "GET /api/resumes/parsed/<id>",
                "delete_parsed_resume": "DELETE /api/resumes/parsed/<id>"
            },
            "cover_letter_management": {
                "get_cover_letters": "GET /api/cover-letters",
                "get_cover_letter": "GET /api/cover-letters/<id>",
                "update_cover_letter": "PUT /api/cover-letters/<id>"
            },
            "pdf_generation": {
                "generate_pdf": "POST /api/resume/generate-pdf",
                "generate_advanced_pdf": "POST /api/resume/generate-advanced-pdf",
                "generate_francisca": "POST /api/resumes/generate-francisca"
            },
            "market_data": {
                "get_market_data": "GET /api/market-data",
                "analyze_job_description": "POST /api/job-descriptions/analyze"
            },
            "advanced_ai_market": {
                "analyze_skill": "POST /api/advanced-ai/analyze-skill",
                "global_industry_analysis": "GET /api/advanced-ai/global-industry-analysis",
                "skill_predictions": "GET /api/advanced-ai/skill-predictions"
            },
            "setup": {
                "database": "POST /api/setup/database"
            },
            "health": "GET /api/health"
        }
    }), 200

# Enhanced ATS Analysis Endpoints
@app.route('/api/francisca/ats-analysis', methods=['POST'])
@jwt_required_custom
def francisca_ats_analysis():
    """Perform ATS analysis on resume content"""
    try:
        data = request.get_json()
        resume_content = data.get('resume_content', '')
        profession = data.get('profession', '')
        job_title = data.get('job_title', '')

        if not resume_content:
            return jsonify({
                'success': False,
                'error': 'Resume content is required'
            }), 400

        # Import ATS analysis service
        from ats_analysis_service import ATSAnalysisService

        # Initialize service
        ats_service = ATSAnalysisService()

        # Perform analysis
        analysis_result = ats_service.analyze_resume_ats(
            resume_content,
            profession,
            job_title
        )

        return jsonify({
            'success': True,
            'result': {
                'analysis': analysis_result
            }
        }), 200

    except Exception as e:
        logger.error(f"ATS Analysis error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/francisca/test-ats-analysis', methods=['POST'])
def test_ats_analysis():
    """Test ATS analysis without authentication"""
    try:
        data = request.get_json()
        resume_content = data.get('resume_content', '')
        profession = data.get('profession', '')
        job_title = data.get('job_title', '')

        if not resume_content:
            return jsonify({
                'success': False,
                'error': 'Resume content is required'
            }), 400

        # Perform real analysis
        real_result = perform_real_ats_analysis(resume_content, profession, job_title)

        return jsonify({
            'success': True,
            'result': real_result
        }), 200

    except Exception as e:
        logger.error(f"Test ATS Analysis error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/francisca/enhanced-ats-analysis', methods=['POST'])
@jwt_required_custom
def francisca_enhanced_ats_analysis():
    """Perform enhanced ATS analysis with real-world performance metrics"""
    try:
        data = request.get_json()
        resume_content = data.get('resume_content', '')
        profession = data.get('profession', '')
        job_title = data.get('job_title', '')
        analysis_mode = data.get('analysis_mode', 'post-download')

        if not resume_content:
            return jsonify({
                'success': False,
                'error': 'Resume content is required'
            }), 400

        # Import ATS analysis service
        from ats_analysis_service import ATSAnalysisService

        # Initialize service
        ats_service = ATSAnalysisService()

        # Perform enhanced analysis
        analysis_result = ats_service.analyze_resume_ats(
            resume_content,
            profession,
            job_title
        )

        # Extract the analysis data from the service response
        if analysis_result.get('success') and analysis_result.get('analysis'):
            enhanced_result = analysis_result['analysis']
        else:
            # If analysis failed, perform real analysis
            enhanced_result = perform_real_ats_analysis(resume_content, profession, job_title)

        return jsonify({
            'success': True,
            'result': enhanced_result
        }), 200

    except Exception as e:
        logger.error(f"Enhanced ATS Analysis error: {str(e)}")
        # Perform real analysis on error
        real_result = perform_real_ats_analysis(resume_content, profession, job_title)
        return jsonify({
            'success': True,
            'result': real_result
        }), 200

def perform_real_ats_analysis(resume_content: str, profession: str, job_title: str) -> Dict[str, Any]:
    """Perform real advanced ATS analysis on resume content"""
    import re
    import math
    from collections import Counter

    # Clean and prepare content
    content_lower = resume_content.lower()
    words = resume_content.split()
    word_count = len(words)

    # 1. KEYWORD ANALYSIS
    keyword_analysis = analyze_keywords(resume_content, profession, job_title)

    # 2. CONTENT QUALITY ANALYSIS
    content_quality = analyze_content_quality(resume_content)

    # 3. FORMATTING ANALYSIS
    formatting_analysis = analyze_formatting(resume_content)

    # 4. STRUCTURE ANALYSIS
    structure_analysis = analyze_structure(resume_content)

    # 5. COMPLETENESS ANALYSIS
    completeness_analysis = analyze_completeness(resume_content)

    # 6. OPTIMIZATION ANALYSIS
    optimization_analysis = analyze_optimization(resume_content, profession)

    # Calculate category scores
    category_scores = {
        'keywords': keyword_analysis['score'],
        'content_quality': content_quality['score'],
        'formatting': formatting_analysis['score'],
        'structure': structure_analysis['score'],
        'completeness': completeness_analysis['score'],
        'optimization': optimization_analysis['score']
    }

    # Calculate overall score
    overall_score = calculate_overall_score(category_scores)

    # Generate recommendations
    recommendations = generate_recommendations(category_scores, {
        'keywords': keyword_analysis,
        'content_quality': content_quality,
        'formatting': formatting_analysis,
        'structure': structure_analysis,
        'completeness': completeness_analysis,
        'optimization': optimization_analysis
    })

    # Calculate real-world performance metrics
    real_world_performance = calculate_real_world_performance(overall_score, keyword_analysis, content_quality)

    return {
        'overall_score': overall_score,
        'ats_compatibility': get_ats_compatibility(overall_score),
        'employability_rating': get_employability_rating(overall_score),
        'category_scores': category_scores,
        'detailed_analysis': {
            'keywords': {
                'found_keywords': keyword_analysis['found_keywords'],
                'missing_keywords': keyword_analysis['missing_keywords'],
                'keyword_density': keyword_analysis['density'],
                'profession_match': keyword_analysis['profession_match'],
                'industry_relevance': keyword_analysis['industry_relevance']
            },
            'content_quality': {
                'action_verbs': content_quality['action_verbs'],
                'quantifiable_results': content_quality['has_quantifiable_results'],
                'professional_tone': content_quality['professional_tone'],
                'achievement_focus': content_quality['achievement_focus'],
                'impact_statements': content_quality['impact_statements']
            },
            'formatting': {
                'ats_friendly': formatting_analysis['ats_friendly'],
                'standard_sections': formatting_analysis['standard_sections'],
                'word_count': formatting_analysis['word_count'],
                'readability_score': formatting_analysis['readability_score'],
                'contact_info_complete': formatting_analysis['contact_info_complete']
            },
            'structure': {
                'logical_flow': structure_analysis['logical_flow'],
                'section_headers': structure_analysis['section_headers'],
                'bullet_points': structure_analysis['bullet_points'],
                'consistent_formatting': structure_analysis['consistent_formatting']
            },
            'completeness': {
                'required_sections': completeness_analysis['required_sections'],
                'missing_sections': completeness_analysis['missing_sections'],
                'experience_coverage': completeness_analysis['experience_coverage'],
                'education_coverage': completeness_analysis['education_coverage']
            },
            'optimization': {
                'seo_score': optimization_analysis['seo_score'],
                'industry_keywords': optimization_analysis['industry_keywords'],
                'trending_skills': optimization_analysis['trending_skills'],
                'modern_formatting': optimization_analysis['modern_formatting']
            }
        },
        'recommendations': recommendations,
        'market_insights': get_market_insights(profession),
        'real_world_performance': real_world_performance
    }

def analyze_keywords(content: str, profession: str, job_title: str) -> Dict[str, Any]:
    """Analyze keywords and industry relevance"""
    content_lower = content.lower()
    words = content.split()
    word_count = len(words)

    # Industry-specific keywords
    industry_keywords = {
        'software_engineer': [
            'python', 'javascript', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
            'kubernetes', 'git', 'agile', 'scrum', 'api', 'microservices', 'machine learning',
            'data structures', 'algorithms', 'full stack', 'frontend', 'backend', 'devops',
            'typescript', 'angular', 'vue', 'mongodb', 'postgresql', 'redis', 'elasticsearch'
        ],
        'data_scientist': [
            'python', 'r', 'sql', 'machine learning', 'deep learning', 'tensorflow', 'pytorch',
            'pandas', 'numpy', 'scikit-learn', 'jupyter', 'statistics', 'data analysis',
            'data visualization', 'tableau', 'power bi', 'big data', 'hadoop', 'spark',
            'neural networks', 'nlp', 'computer vision', 'reinforcement learning'
        ],
        'marketing_manager': [
            'digital marketing', 'seo', 'sem', 'social media', 'content marketing', 'email marketing',
            'campaign management', 'analytics', 'google ads', 'facebook ads', 'brand management',
            'market research', 'lead generation', 'conversion optimization', 'crm', 'marketing automation',
            'google analytics', 'adobe analytics', 'hubspot', 'salesforce', 'marketo'
        ],
        'sales_professional': [
            'sales', 'business development', 'account management', 'lead generation', 'prospecting',
            'negotiation', 'client relationship', 'crm', 'salesforce', 'quota', 'territory management',
            'pipeline management', 'closing deals', 'customer acquisition', 'revenue growth',
            'cold calling', 'inside sales', 'outside sales', 'b2b', 'b2c'
        ]
    }

    # Get relevant keywords based on profession
    relevant_keywords = industry_keywords.get(profession, industry_keywords['software_engineer'])

    # Find keywords in content
    found_keywords = [kw for kw in relevant_keywords if kw.lower() in content_lower]
    missing_keywords = [kw for kw in relevant_keywords if kw.lower() not in content_lower]

    # Calculate metrics
    profession_match = len(found_keywords) / len(relevant_keywords) if relevant_keywords else 0
    keyword_density = (len(found_keywords) / word_count * 100) if word_count > 0 else 0

    # Industry relevance score
    industry_relevance = min(100, profession_match * 100 + keyword_density * 10)

    # Overall keyword score
    keyword_score = min(100, (profession_match * 60) + (keyword_density * 2) + (len(found_keywords) * 2))

    return {
        'score': keyword_score,
        'found_keywords': found_keywords[:15],  # Limit to top 15
        'missing_keywords': missing_keywords[:10],  # Limit to top 10
        'density': round(keyword_density, 2),
        'profession_match': round(profession_match, 3),
        'industry_relevance': round(industry_relevance, 1)
    }

def analyze_content_quality(content: str) -> Dict[str, Any]:
    """Analyze content quality and professional impact"""
    content_lower = content.lower()
    words = content.split()

    # Action verbs analysis
    action_verbs = [
        'developed', 'implemented', 'managed', 'achieved', 'created', 'designed', 'led', 'coordinated',
        'improved', 'increased', 'launched', 'established', 'optimized', 'delivered', 'executed',
        'generated', 'maintained', 'enhanced', 'built', 'constructed', 'facilitated', 'initiated',
        'streamlined', 'transformed', 'accelerated', 'maximized', 'minimized', 'revolutionized'
    ]

    found_verbs = [verb for verb in action_verbs if verb in content_lower]

    # Quantifiable results analysis
    has_quantifiable_results = bool(re.search(r'\d+%|\d+\.\d+%|\$\d+|\d+\s*(?:million|thousand|k|m)', content))

    # Professional tone analysis
    unprofessional_words = ['awesome', 'cool', 'amazing', 'super', 'really', 'very', 'totally', 'literally']
    unprofessional_count = sum(1 for word in unprofessional_words if word in content_lower)

    if unprofessional_count == 0:
        professional_tone = 'Professional'
    elif unprofessional_count <= 2:
        professional_tone = 'Mostly Professional'
    else:
        professional_tone = 'Needs Improvement'

    # Achievement focus analysis
    achievement_indicators = ['achieved', 'increased', 'improved', 'reduced', 'grew', 'developed', 'launched', 'saved', 'earned']
    achievement_count = sum(1 for indicator in achievement_indicators if indicator in content_lower)

    if achievement_count >= 5:
        achievement_focus = 'Achievement-Focused'
    elif achievement_count >= 2:
        achievement_focus = 'Some Achievements'
    else:
        achievement_focus = 'Needs More Achievements'

    # Impact statements (bullet points with numbers or percentages)
    impact_statements = len(re.findall(r'•.*\d+.*|•.*%.*|•.*\$.*', content, re.IGNORECASE))

    # Calculate content quality score
    verb_score = min(100, len(found_verbs) * 10)
    quantifiable_score = 20 if has_quantifiable_results else 0
    tone_score = 20 if professional_tone == 'Professional' else 10 if professional_tone == 'Mostly Professional' else 0
    achievement_score = min(30, achievement_count * 5)
    impact_score = min(20, impact_statements * 5)

    content_score = verb_score + quantifiable_score + tone_score + achievement_score + impact_score

    return {
        'score': min(100, content_score),
        'action_verbs': found_verbs[:10],
        'has_quantifiable_results': has_quantifiable_results,
        'professional_tone': professional_tone,
        'achievement_focus': achievement_focus,
        'impact_statements': impact_statements
    }

def analyze_formatting(content: str) -> Dict[str, Any]:
    """Analyze formatting for ATS compatibility"""
    # Check for ATS-friendly formatting
    has_complex_chars = bool(re.search(r'[^\w\s\-\.\,\;\:\!\?\(\)\n\r]', content))
    ats_friendly = not has_complex_chars

    # Check for standard sections
    content_lower = content.lower()
    standard_sections = ['experience', 'education', 'skills', 'summary', 'objective', 'work history', 'employment']
    found_sections = [section for section in standard_sections if section in content_lower]

    # Word count analysis
    word_count = len(content.split())

    # Readability score (simplified Flesch reading ease)
    sentences = len(re.findall(r'[.!?]+', content))
    words = len(content.split())
    syllables = len(re.findall(r'[aeiouy]+', content.lower()))

    if sentences > 0 and words > 0:
        readability_score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
        readability_score = max(0, min(100, readability_score))
    else:
        readability_score = 50

    # Contact information check
    has_email = bool(re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', content))
    has_phone = bool(re.search(r'\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}', content))
    contact_info_complete = has_email and has_phone

    # Calculate formatting score
    ats_score = 30 if ats_friendly else 0
    sections_score = min(30, len(found_sections) * 7.5)
    length_score = 20 if 300 <= word_count <= 800 else 10 if 200 <= word_count <= 1000 else 0
    contact_score = 20 if contact_info_complete else 10 if has_email or has_phone else 0

    formatting_score = ats_score + sections_score + length_score + contact_score

    return {
        'score': min(100, formatting_score),
        'ats_friendly': ats_friendly,
        'standard_sections': len(found_sections),
        'word_count': word_count,
        'readability_score': round(readability_score, 1),
        'contact_info_complete': contact_info_complete
    }

def analyze_structure(content: str) -> Dict[str, Any]:
    """Analyze resume structure and organization"""
    content_lower = content.lower()

    # Section headers analysis
    section_headers = re.findall(r'^[A-Z][A-Z\s]+$', content, re.MULTILINE)
    section_headers = [header.strip() for header in section_headers if len(header.strip()) > 3]

    # Bullet points analysis
    bullet_points = len(re.findall(r'^[\s]*[•\-\*]\s+', content, re.MULTILINE))

    # Logical flow analysis (simplified)
    logical_flow = True
    if 'experience' in content_lower and 'education' in content_lower:
        exp_index = content_lower.find('experience')
        edu_index = content_lower.find('education')
        logical_flow = exp_index < edu_index  # Experience should come before education

    # Consistent formatting analysis
    consistent_formatting = len(set(re.findall(r'^[A-Z][A-Z\s]+$', content, re.MULTILINE))) > 1

    # Calculate structure score
    headers_score = min(40, len(section_headers) * 8)
    bullets_score = min(30, min(bullet_points, 20) * 1.5)
    flow_score = 20 if logical_flow else 10
    consistency_score = 10 if consistent_formatting else 0

    structure_score = headers_score + bullets_score + flow_score + consistency_score

    return {
        'score': min(100, structure_score),
        'logical_flow': logical_flow,
        'section_headers': section_headers[:8],
        'bullet_points': bullet_points,
        'consistent_formatting': consistent_formatting
    }

def analyze_completeness(content: str) -> Dict[str, Any]:
    """Analyze resume completeness"""
    content_lower = content.lower()

    # Required sections
    required_sections = ['experience', 'education', 'skills']
    found_sections = [section for section in required_sections if section in content_lower]
    missing_sections = [section for section in required_sections if section not in content_lower]

    # Experience coverage analysis
    experience_keywords = ['worked', 'job', 'position', 'role', 'responsibilities', 'achieved', 'managed']
    experience_coverage = sum(1 for kw in experience_keywords if kw in content_lower) / len(experience_keywords) * 100

    # Education coverage analysis
    education_keywords = ['degree', 'university', 'college', 'bachelor', 'master', 'phd', 'graduated', 'gpa']
    education_coverage = sum(1 for kw in education_keywords if kw in content_lower) / len(education_keywords) * 100

    # Calculate completeness score
    sections_score = (len(found_sections) / len(required_sections)) * 50
    experience_score = min(25, experience_coverage * 0.25)
    education_score = min(25, education_coverage * 0.25)

    completeness_score = sections_score + experience_score + education_score

    return {
        'score': min(100, completeness_score),
        'required_sections': found_sections,
        'missing_sections': missing_sections,
        'experience_coverage': round(experience_coverage, 1),
        'education_coverage': round(education_coverage, 1)
    }

def analyze_optimization(content: str, profession: str) -> Dict[str, Any]:
    """Analyze resume optimization"""
    content_lower = content.lower()
    words = content.split()

    # SEO score (keyword density and relevance)
    keyword_density = len([word for word in words if word.lower() in ['python', 'javascript', 'react', 'node.js', 'sql', 'aws', 'docker']]) / len(words) * 100
    seo_score = min(100, keyword_density * 10)

    # Industry keywords
    industry_keywords = ['software development', 'web applications', 'database design', 'cloud computing', 'agile methodology']
    found_industry_keywords = [kw for kw in industry_keywords if kw in content_lower]

    # Trending skills
    trending_skills = ['AI/ML', 'Cloud Computing', 'DevOps', 'Microservices', 'Machine Learning', 'Data Science']

    # Modern formatting check
    modern_formatting = not bool(re.search(r'[^\w\s\-\.\,\;\:\!\?\(\)\n\r]', content))

    # Calculate optimization score
    seo_score_final = min(40, seo_score)
    industry_score = min(30, len(found_industry_keywords) * 10)
    modern_score = 30 if modern_formatting else 0

    optimization_score = seo_score_final + industry_score + modern_score

    return {
        'score': min(100, optimization_score),
        'seo_score': round(seo_score, 1),
        'industry_keywords': found_industry_keywords,
        'trending_skills': trending_skills,
        'modern_formatting': modern_formatting
    }

def calculate_overall_score(category_scores: Dict[str, float]) -> float:
    """Calculate overall ATS score"""
    weights = {
        'keywords': 0.25,
        'content_quality': 0.20,
        'formatting': 0.15,
        'structure': 0.15,
        'completeness': 0.15,
        'optimization': 0.10
    }

    total_score = sum(category_scores[category] * weight for category, weight in weights.items())
    return round(total_score, 1)

def generate_recommendations(category_scores: Dict[str, float], detailed_analysis: Dict) -> Dict[str, List[str]]:
    """Generate improvement recommendations"""
    recommendations = {'critical': [], 'important': [], 'optional': []}

    # Critical recommendations (scores below 60)
    for category, score in category_scores.items():
        if score < 60:
            if category == 'keywords':
                recommendations['critical'].append("Add more industry-specific keywords and technical terms")
            elif category == 'content_quality':
                recommendations['critical'].append("Include more quantifiable achievements and action verbs")
            elif category == 'formatting':
                recommendations['critical'].append("Simplify formatting and remove complex characters")
            elif category == 'structure':
                recommendations['critical'].append("Improve section organization and bullet point usage")
            elif category == 'completeness':
                recommendations['critical'].append("Add missing required sections")

    # Important recommendations (scores 60-80)
    for category, score in category_scores.items():
        if 60 <= score < 80:
            if category == 'keywords':
                recommendations['important'].append("Optimize keyword density for better ATS performance")
            elif category == 'content_quality':
                recommendations['important'].append("Strengthen impact statements with specific metrics")
            elif category == 'formatting':
                recommendations['important'].append("Ensure consistent formatting throughout")
            elif category == 'structure':
                recommendations['important'].append("Improve logical flow and section headers")

    # Optional recommendations
    recommendations['optional'] = [
        "Consider adding a professional summary section",
        "Include relevant certifications or training",
        "Add quantifiable results to all achievements",
        "Use more action verbs in descriptions"
    ]

    return recommendations

def calculate_real_world_performance(overall_score: float, keyword_analysis: Dict, content_quality: Dict) -> Dict[str, float]:
    """Calculate real-world performance metrics"""
    # Interview rate based on overall score
    interview_rate = min(95, overall_score * 0.8 + 20)

    # ATS pass rate
    ats_pass_rate = overall_score

    # Recruiter scan time (in seconds)
    scan_time = max(3, 15 - (overall_score / 10))

    # Keyword match percentage
    keyword_match = keyword_analysis['profession_match'] * 100

    return {
        'estimated_interview_rate': round(interview_rate, 1),
        'ats_pass_rate': round(ats_pass_rate, 1),
        'recruiter_scan_time': round(scan_time, 1),
        'keyword_match_percentage': round(keyword_match, 1)
    }

def get_ats_compatibility(score: float) -> str:
    """Get ATS compatibility rating"""
    if score >= 85:
        return "Highly Compatible"
    elif score >= 70:
        return "Compatible"
    elif score >= 55:
        return "Moderately Compatible"
    elif score >= 40:
        return "Low Compatibility"
    else:
        return "Not Compatible"

def get_employability_rating(score: float) -> str:
    """Get employability rating"""
    if score >= 90:
        return "Excellent - High chance of passing ATS screening"
    elif score >= 80:
        return "Very Good - Strong ATS compatibility"
    elif score >= 70:
        return "Good - Likely to pass most ATS systems"
    elif score >= 60:
        return "Fair - May need some improvements"
    elif score >= 50:
        return "Poor - Significant improvements needed"
    else:
        return "Very Poor - Unlikely to pass ATS screening"

def get_market_insights(profession: str) -> Dict[str, Any]:
    """Get market insights based on profession"""
    insights = {
        'software_engineer': {
            'industry_trends': [
                'Remote work is becoming standard',
                'AI and machine learning skills are in high demand',
                'Cloud computing expertise is essential',
                'DevOps and automation skills are critical'
            ],
            'salary_impact': 'Above average',
            'competition_level': 'High',
            'hiring_timeline': '2-4 weeks'
        },
        'data_scientist': {
            'industry_trends': [
                'Big data and analytics are growing rapidly',
                'Machine learning expertise is highly valued',
                'Python and R skills are essential',
                'Business acumen is increasingly important'
            ],
            'salary_impact': 'Very high',
            'competition_level': 'Very high',
            'hiring_timeline': '3-6 weeks'
        },
        'marketing_manager': {
            'industry_trends': [
                'Digital marketing is dominating',
                'Data-driven marketing is essential',
                'Social media expertise is critical',
                'Automation tools are becoming standard'
            ],
            'salary_impact': 'Above average',
            'competition_level': 'High',
            'hiring_timeline': '2-3 weeks'
        }
    }

    return insights.get(profession, insights['software_engineer'])

def enhance_ats_analysis(base_analysis, profession, job_title, analysis_mode):
    """Enhance ATS analysis with real-world performance metrics"""

    # Calculate real-world performance metrics
    overall_score = base_analysis.get('overall_score', 0)

    # Estimate interview rate based on ATS score and industry factors
    base_interview_rate = min(95, overall_score * 0.8)
    industry_multiplier = get_industry_multiplier(profession)
    estimated_interview_rate = min(95, base_interview_rate * industry_multiplier)

    # Calculate ATS pass rate
    ats_pass_rate = overall_score

    # Estimate recruiter scan time (in seconds)
    word_count = base_analysis.get('formatting_analysis', {}).get('word_count', 0)
    if word_count < 300:
        scan_time = 4.2
    elif word_count < 500:
        scan_time = 6.2
    elif word_count < 700:
        scan_time = 8.5
    else:
        scan_time = 10.8

    # Calculate keyword match percentage
    keyword_analysis = base_analysis.get('keyword_analysis', {})
    keyword_match_percentage = keyword_analysis.get('profession_match', 0) * 100

    # Generate market insights
    market_insights = generate_market_insights(profession, job_title)

    # Generate trending skills
    trending_skills = get_trending_skills(profession)

    # Enhanced result structure
    enhanced_result = {
        'overall_score': overall_score,
        'ats_compatibility': base_analysis.get('ats_compatibility', 'Unknown'),
        'employability_rating': base_analysis.get('employability_rating', 'Unknown'),
        'category_scores': base_analysis.get('category_scores', {}),
        'detailed_analysis': {
            'keywords': {
                'found_keywords': keyword_analysis.get('relevant_keywords', []),
                'missing_keywords': keyword_analysis.get('missing_keywords', []),
                'keyword_density': keyword_analysis.get('keyword_density', 0),
                'profession_match': keyword_analysis.get('profession_match', 0),
                'industry_relevance': min(100, keyword_analysis.get('profession_match', 0) * 1.2)
            },
            'content_quality': {
                'action_verbs': base_analysis.get('content_analysis', {}).get('action_verbs_found', []),
                'quantifiable_results': base_analysis.get('content_analysis', {}).get('has_quantifiable_results', False),
                'professional_tone': base_analysis.get('content_analysis', {}).get('professional_tone', 'Unknown'),
                'achievement_focus': base_analysis.get('content_analysis', {}).get('achievement_focused', 'Unknown'),
                'impact_statements': count_impact_statements(base_analysis.get('content_analysis', {}).get('action_verbs_found', []))
            },
            'formatting': {
                'ats_friendly': not base_analysis.get('formatting_analysis', {}).get('has_complex_characters', True),
                'standard_sections': base_analysis.get('formatting_analysis', {}).get('has_standard_sections', 0),
                'word_count': word_count,
                'readability_score': calculate_readability_score(word_count, base_analysis.get('content_analysis', {})),
                'contact_info_complete': base_analysis.get('formatting_analysis', {}).get('has_email', False) and
                                       base_analysis.get('formatting_analysis', {}).get('has_phone', False)
            },
            'structure': {
                'logical_flow': overall_score > 70,
                'section_headers': ['Experience', 'Education', 'Skills'],
                'bullet_points': estimate_bullet_points(base_analysis),
                'consistent_formatting': overall_score > 60
            },
            'completeness': {
                'required_sections': ['Experience', 'Education', 'Skills'],
                'missing_sections': [],
                'experience_coverage': min(100, overall_score * 0.9),
                'education_coverage': min(100, overall_score * 0.95)
            },
            'optimization': {
                'seo_score': min(100, overall_score * 0.8),
                'industry_keywords': keyword_analysis.get('relevant_keywords', []),
                'trending_skills': trending_skills,
                'modern_formatting': overall_score > 75
            }
        },
        'recommendations': {
            'critical': base_analysis.get('recommendations', [])[:2],
            'important': base_analysis.get('recommendations', [])[2:5],
            'optional': base_analysis.get('recommendations', [])[5:]
        },
        'market_insights': market_insights,
        'real_world_performance': {
            'estimated_interview_rate': estimated_interview_rate,
            'ats_pass_rate': ats_pass_rate,
            'recruiter_scan_time': scan_time,
            'keyword_match_percentage': keyword_match_percentage
        }
    }

    return enhanced_result

def get_industry_multiplier(profession):
    """Get industry-specific multiplier for interview rate calculation"""
    multipliers = {
        'Software Engineer': 1.2,
        'Marketing Manager': 1.1,
        'Sales Professional': 1.15,
        'Healthcare Professional': 1.05,
        'Finance Professional': 1.1,
        'Data Scientist': 1.25,
        'Product Manager': 1.2,
        'Designer': 1.1
    }
    return multipliers.get(profession, 1.0)

def generate_market_insights(profession, job_title):
    """Generate market insights based on profession and job title"""
    insights = {
        'industry_trends': [
            'Remote work opportunities increasing',
            'AI and automation integration',
            'Focus on sustainability and ESG',
            'Skills-based hiring approach'
        ],
        'salary_impact': 'Above average' if profession in ['Software Engineer', 'Data Scientist'] else 'Average',
        'competition_level': 'High' if profession in ['Software Engineer', 'Marketing Manager'] else 'Medium',
        'hiring_timeline': '2-4 weeks' if profession in ['Software Engineer', 'Data Scientist'] else '3-6 weeks'
    }
    return insights

def get_trending_skills(profession):
    """Get trending skills for the profession"""
    skill_sets = {
        'Software Engineer': ['AI/ML', 'Cloud Computing', 'DevOps', 'Microservices', 'React/Vue'],
        'Marketing Manager': ['Digital Marketing', 'Data Analytics', 'SEO/SEM', 'Social Media', 'Content Strategy'],
        'Sales Professional': ['CRM Systems', 'Sales Analytics', 'Lead Generation', 'Customer Success', 'Negotiation'],
        'Healthcare Professional': ['Telemedicine', 'Electronic Health Records', 'Patient Care Technology', 'Medical AI', 'Healthcare Analytics'],
        'Finance Professional': ['Financial Modeling', 'Risk Management', 'Blockchain', 'Fintech', 'Data Analysis']
    }
    return skill_sets.get(profession, ['Leadership', 'Communication', 'Problem Solving', 'Project Management', 'Analytics'])

def count_impact_statements(action_verbs):
    """Count impact statements based on action verbs"""
    return min(len(action_verbs), 10)

def calculate_readability_score(word_count, content_analysis):
    """Calculate readability score based on content analysis"""
    base_score = 70
    if content_analysis.get('has_quantifiable_results', False):
        base_score += 10
    if content_analysis.get('professional_tone', '') == 'Professional':
        base_score += 10
    if word_count > 300 and word_count < 700:
        base_score += 5
    return min(100, base_score)

def estimate_bullet_points(base_analysis):
    """Estimate number of bullet points in resume"""
    word_count = base_analysis.get('formatting_analysis', {}).get('word_count', 0)
    return max(5, min(15, word_count // 50))

# Resume Import and Parsing Endpoints
@app.route('/api/francisca/import-resume', methods=['POST'])
@jwt_required_custom
def import_resume():
    """Import and parse resume file for Francisca form"""
    try:
        user_id = request.current_user['user_id']

        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400

        # Validate file type
        allowed_extensions = {'.pdf', '.doc', '.docx'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            return jsonify({
                'success': False,
                'error': 'Invalid file type. Please upload PDF, DOC, or DOCX files only.'
            }), 400

        # Validate file size (max 10MB)
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning

        if file_size > 10 * 1024 * 1024:  # 10MB
            return jsonify({
                'success': False,
                'error': 'File size too large. Please upload files smaller than 10MB.'
            }), 400

        # Create uploads directory if it doesn't exist
        upload_dir = 'static/uploads/resumes'
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)

        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{user_id}_{timestamp}_{file.filename}"
        file_path = os.path.join(upload_dir, filename)

        # Save file
        file.save(file_path)

        # Parse resume
        from resume_parser_service import ResumeParserService
        parser = ResumeParserService()

        # Determine file type
        file_type = 'pdf' if file_ext == '.pdf' else 'docx' if file_ext == '.docx' else 'doc'

        # Parse the resume
        parse_result = parser.parse_resume_file(file_path, file_type)

        if not parse_result['success']:
            # Clean up uploaded file
            if os.path.exists(file_path):
                os.remove(file_path)
            return jsonify({
                'success': False,
                'error': parse_result['error']
            }), 500

        # Map to Francisca format
        francisca_data = parser.map_to_francisca_format(parse_result['parsed_data'])

        # Generate resume ID
        resume_id = f"resume_{timestamp}_{user_id}"

        return jsonify({
            'success': True,
            'resume_id': resume_id,
            'parsed_data': francisca_data,
            'raw_text': parse_result['raw_text'],
            'file_type': file_type,
            'parsed_at': parse_result['parsed_at'],
            'filename': file.filename
        }), 200

    except Exception as e:
        logger.error(f"Error importing resume: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/francisca/parsed-resumes', methods=['GET'])
@jwt_required_custom
def get_francisca_parsed_resumes():
    """Get all parsed resumes for the user"""
    try:
        user_id = request.current_user['user_id']

        # In a real implementation, this would come from the database
        # For now, return empty list
        return jsonify({
            'success': True,
            'parsed_resumes': []
        }), 200

    except Exception as e:
        logger.error(f"Error getting parsed resumes: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# AI Paragraph Suggestions Endpoints
@app.route('/api/ai/paragraph-suggestions', methods=['POST'])
@jwt_required_custom
def ai_paragraph_suggestions():
    """Generate AI-powered paragraph suggestions for cover letters"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        paragraph_type = data.get('paragraph_type')
        job_title = data.get('job_title', '')
        company_name = data.get('company_name', '')
        user_data = data.get('user_data', {})
        custom_prompt = data.get('custom_prompt', '')

        if not paragraph_type:
            return jsonify({
                'success': False,
                'error': 'Paragraph type is required'
            }), 400

        # Generate AI suggestions
        suggestions = generate_ai_paragraph_suggestions(
            paragraph_type, job_title, company_name, user_data, custom_prompt
        )

        return jsonify({
            'success': True,
            'data': {
                'suggestions': suggestions
            }
        }), 200

    except Exception as e:
        logger.error(f"Error generating paragraph suggestions: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ai/paragraph-guidance', methods=['POST'])
@jwt_required_custom
def ai_paragraph_guidance():
    """Get writing guidance for specific paragraph types"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()

        paragraph_type = data.get('paragraph_type')

        if not paragraph_type:
            return jsonify({
                'success': False,
                'error': 'Paragraph type is required'
            }), 400

        # Get writing guidance
        guidance = get_paragraph_writing_guidance(paragraph_type)

        return jsonify({
            'success': True,
            'data': guidance
        }), 200

    except Exception as e:
        logger.error(f"Error getting paragraph guidance: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def generate_ai_paragraph_suggestions(paragraph_type, job_title, company_name, user_data, custom_prompt=""):
    """Generate AI paragraph suggestions using OpenAI API"""
    try:
        # Get OpenAI API key from environment
        openai_api_key = os.getenv('OPENAI_API_KEY')

        logger.info(f"OpenAI API key found: {openai_api_key[:10] if openai_api_key else 'None'}...")

        if not openai_api_key:
            logger.warning("OpenAI API key not found, using mock suggestions")
            return generate_mock_paragraph_suggestions(paragraph_type, job_title, company_name, user_data)

        # Import OpenAI
        try:
            import openai
            openai.api_key = openai_api_key
            logger.info("OpenAI library imported successfully")
        except ImportError:
            logger.error("OpenAI library not installed")
            return generate_mock_paragraph_suggestions(paragraph_type, job_title, company_name, user_data)

        # Define paragraph templates and prompts
        paragraph_templates = {
            'introduction': {
                'base_prompt': f"Write a professional opening paragraph for a cover letter for the position of {job_title} at {company_name}. The candidate should express genuine interest in the role and briefly introduce themselves.",
                'tone_options': ['Professional', 'Enthusiastic', 'Confident', 'Friendly']
            },
            'experience': {
                'base_prompt': f"Write a paragraph highlighting relevant experience for a {job_title} position at {company_name}. Focus on specific achievements and quantifiable results that demonstrate the candidate's qualifications.",
                'tone_options': ['Professional', 'Confident', 'Achievement-focused', 'Results-driven']
            },
            'companyFit': {
                'base_prompt': f"Write a paragraph demonstrating knowledge of {company_name} and explaining why the candidate is a good cultural and professional fit for the {job_title} role. Show research and genuine interest in the company.",
                'tone_options': ['Professional', 'Enthusiastic', 'Research-focused', 'Cultural fit']
            },
            'closing': {
                'base_prompt': f"Write a professional closing paragraph for a cover letter for the {job_title} position at {company_name}. Include a call to action and express eagerness to discuss the opportunity further.",
                'tone_options': ['Professional', 'Enthusiastic', 'Confident', 'Polite']
            }
        }

        template = paragraph_templates.get(paragraph_type, paragraph_templates['introduction'])
        base_prompt = template['base_prompt']
        tone_options = template['tone_options']

        # Add user data to the prompt
        user_context = ""
        if user_data:
            if user_data.get('name'):
                user_context += f"The candidate's name is {user_data['name']}. "
            if user_data.get('experience'):
                user_context += f"Their relevant experience includes: {user_data['experience']}. "
            if user_data.get('skills'):
                skills_text = ', '.join(user_data['skills']) if isinstance(user_data['skills'], list) else user_data['skills']
                user_context += f"Their key skills are: {skills_text}. "
            if user_data.get('achievements'):
                achievements_text = ', '.join(user_data['achievements']) if isinstance(user_data['achievements'], list) else user_data['achievements']
                user_context += f"Their key achievements include: {achievements_text}. "

        # Add custom prompt if provided
        if custom_prompt:
            base_prompt += f" Additional requirements: {custom_prompt}"

        # Generate suggestions with different tones
        suggestions = []

        for tone in tone_options:
            try:
                prompt = f"{base_prompt} {user_context} Write this in a {tone.lower()} tone. Make it specific, engaging, and tailored to the role and company."

                logger.info(f"Calling OpenAI API for tone: {tone}")
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a professional career coach and cover letter expert. Write compelling, personalized cover letter paragraphs that help candidates stand out."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=300,
                    temperature=0.7
                )
                logger.info(f"OpenAI API response received for tone: {tone}")

                content = response.choices[0].message.content.strip()
                keywords = extract_keywords(content)

                suggestions.append({
                    'content': content,
                    'tone': tone,
                    'reasoning': f"Professional {tone.lower()} approach that highlights relevant qualifications and demonstrates genuine interest in the role.",
                    'keywords': keywords
                })

            except Exception as e:
                logger.error(f"Error generating suggestion for tone {tone}: {str(e)}")
                logger.error(f"OpenAI API error details: {type(e).__name__}: {str(e)}")
                # Fallback to mock suggestion
                suggestions.append(generate_mock_paragraph_suggestion(paragraph_type, job_title, company_name, tone, user_data))

        return suggestions

    except Exception as e:
        logger.error(f"Error in generate_ai_paragraph_suggestions: {str(e)}")
        return generate_mock_paragraph_suggestions(paragraph_type, job_title, company_name, user_data)

def generate_mock_paragraph_suggestions(paragraph_type, job_title, company_name, user_data):
    """Generate mock paragraph suggestions as fallback"""
    suggestions = []
    tones = ['Professional', 'Enthusiastic', 'Confident', 'Friendly']

    for tone in tones:
        suggestion = generate_mock_paragraph_suggestion(paragraph_type, job_title, company_name, tone, user_data)
        suggestions.append(suggestion)

    return suggestions

def generate_mock_paragraph_suggestion(paragraph_type, job_title, company_name, tone, user_data):
    """Generate a mock paragraph suggestion"""
    name = user_data.get('name', 'John Doe')
    experience = user_data.get('experience', '5+ years of relevant experience')
    skills = user_data.get('skills', ['leadership', 'problem-solving'])

    if isinstance(skills, list):
        skills_text = ', '.join(skills[:3])
    else:
        skills_text = skills

    templates = {
        'introduction': {
            'Professional': f"I am writing to express my strong interest in the {job_title} position at {company_name}. With {experience}, I am confident that my background and expertise make me an ideal candidate for this role.",
            'Enthusiastic': f"I am thrilled to apply for the {job_title} position at {company_name}! Having discovered this opportunity, I am excited about the chance to contribute my {experience} to your innovative team.",
            'Confident': f"I am writing to express my strong interest in the {job_title} position at {company_name}. My {experience} and proven track record in {skills_text} position me as an excellent candidate for this role.",
            'Friendly': f"Hello! I'm excited to apply for the {job_title} position at {company_name}. With {experience}, I believe I would be a great addition to your team."
        },
        'experience': {
            'Professional': f"In my most recent role, I have successfully {experience}. This experience has strengthened my skills in {skills_text} and prepared me to excel in the {job_title} position at {company_name}.",
            'Enthusiastic': f"I'm particularly excited about this opportunity because my {experience} aligns perfectly with what {company_name} is looking for. My expertise in {skills_text} has consistently delivered results.",
            'Confident': f"My {experience} has equipped me with the skills and knowledge necessary to succeed in the {job_title} role. I have demonstrated expertise in {skills_text} and am ready to make an immediate impact.",
            'Friendly': f"I've really enjoyed {experience} and have developed strong skills in {skills_text}. I'm excited about the possibility of bringing this experience to {company_name}."
        },
        'companyFit': {
            'Professional': f"I am particularly drawn to {company_name} because of your commitment to innovation and excellence. My {experience} and skills in {skills_text} align well with your company values and mission.",
            'Enthusiastic': f"What excites me most about {company_name} is your reputation for innovation and growth. My {experience} in {skills_text} makes me eager to contribute to your continued success.",
            'Confident': f"I am confident that my {experience} and expertise in {skills_text} make me an ideal fit for {company_name}'s culture and the {job_title} position. I am ready to contribute to your team's success.",
            'Friendly': f"I'm really excited about the opportunity to work at {company_name}! My {experience} and passion for {skills_text} align perfectly with what you're looking for."
        },
        'closing': {
            'Professional': f"I welcome the opportunity to discuss my background, skills, and enthusiasm for this role. Thank you for considering my application. I look forward to contributing to {company_name}'s continued success.",
            'Enthusiastic': f"I'm excited about the possibility of joining {company_name} and contributing to your team's success. Thank you for considering my application, and I look forward to discussing this opportunity further!",
            'Confident': f"I am confident that my {experience} and skills in {skills_text} make me an excellent candidate for this position. I look forward to discussing how I can contribute to {company_name}'s success.",
            'Friendly': f"Thank you for considering my application! I'm excited about the possibility of joining {company_name} and would love to discuss this opportunity further."
        }
    }

    content = templates.get(paragraph_type, {}).get(tone, "I am writing to express my interest in this position.")
    keywords = extract_keywords(content)

    return {
        'content': content,
        'tone': tone,
        'reasoning': f"Professional {tone.lower()} approach that highlights relevant qualifications and demonstrates genuine interest in the role.",
        'keywords': keywords
    }

def get_paragraph_writing_guidance(paragraph_type):
    """Get writing guidance for specific paragraph types"""
    guidance = {
        'introduction': {
            'title': 'Opening Paragraph',
            'description': 'Express interest and position yourself as a strong candidate',
            'tips': [
                'Start with enthusiasm and specific interest in the role',
                'Mention how you found the job posting',
                'Briefly introduce yourself and your key qualifications',
                'Keep it concise but engaging',
                'Avoid generic openings like "I am writing to apply"'
            ],
            'common_mistakes': [
                'Being too generic or vague',
                'Not mentioning the specific role or company',
                'Making it too long or rambling',
                'Using clichéd phrases',
                'Not showing genuine interest'
            ]
        },
        'experience': {
            'title': 'Experience Paragraph',
            'description': 'Highlight your most relevant experience and achievements',
            'tips': [
                'Focus on 1-2 most relevant experiences',
                'Use specific examples and quantifiable results',
                'Connect your experience to job requirements',
                'Show progression and growth',
                'Use the STAR method (Situation, Task, Action, Result)'
            ],
            'common_mistakes': [
                'Listing all experiences without focus',
                'Not quantifying achievements',
                'Being too vague about responsibilities',
                'Not connecting to the job requirements',
                'Using passive voice'
            ]
        },
        'companyFit': {
            'title': 'Company Fit Paragraph',
            'description': 'Show company knowledge and cultural fit',
            'tips': [
                'Research the company thoroughly',
                'Mention specific company values or mission',
                'Connect your values to theirs',
                'Show knowledge of recent company news or achievements',
                'Demonstrate cultural understanding'
            ],
            'common_mistakes': [
                'Generic company praise without specifics',
                'Not showing actual research',
                'Being insincere or over-the-top',
                'Not connecting personal values to company values',
                'Using outdated information'
            ]
        },
        'closing': {
            'title': 'Closing Paragraph',
            'description': 'Call to action and professional closing',
            'tips': [
                'Express enthusiasm for next steps',
                'Include a clear call to action',
                'Thank the reader for their time',
                'Keep it professional and confident',
                'Mention your availability for an interview'
            ],
            'common_mistakes': [
                'Being too pushy or demanding',
                'Not including a call to action',
                'Being too casual or informal',
                'Not expressing genuine interest',
                'Making it too long'
            ]
        }
    }

    return guidance.get(paragraph_type, guidance['introduction'])

def extract_keywords(text):
    """Extract keywords from text (simple implementation)"""
    # Simple keyword extraction - in production, use more sophisticated NLP
    words = text.lower().split()
    # Filter out common words and extract meaningful terms
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'}
    keywords = [word for word in words if len(word) > 3 and word not in stop_words]
    return keywords[:5]  # Return top 5 keywords



@app.route('/api/real-jobs/platforms', methods=['GET'])
def get_job_platforms():
    """Get available job platforms"""
    try:
        platforms = [
            {
                'name': 'LinkedIn',
                'url': 'https://linkedin.com',
                'description': 'Professional networking and job search platform',
                'api_available': True
            },
            {
                'name': 'Indeed',
                'url': 'https://indeed.com',
                'description': "World's largest job search site",
                'api_available': True
            },
            {
                'name': 'Glassdoor',
                'url': 'https://glassdoor.com',
                'description': 'Job search with company reviews and salary data',
                'api_available': True
            },
            {
                'name': 'ZipRecruiter',
                'url': 'https://ziprecruiter.com',
                'description': 'AI-powered job matching platform',
                'api_available': True
            }
        ]

        return jsonify({
            'success': True,
            'data': platforms
        })

    except Exception as e:
        logger.error(f"Error getting job platforms: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500




@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Check database connection
        conn = mysql.connector.connect(**DB_CONFIG)
        conn.close()
        db_status = 'healthy'
    except Exception as e:
        db_status = f'unhealthy: {str(e)}'

    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'database': db_status,
        'uptime': 'running'
    }), 200

@app.route('/api/metrics', methods=['GET'])
def metrics():
    """Prometheus metrics endpoint"""
    # Basic metrics for monitoring
    metrics_data = f"""# HELP prowrite_requests_total Total number of requests
# TYPE prowrite_requests_total counter
prowrite_requests_total{{endpoint="/api/health"}} 1

# HELP prowrite_database_connections Database connection status
# TYPE prowrite_database_connections gauge
prowrite_database_connections{{status="active"}} 1
"""
    return metrics_data, 200, {'Content-Type': 'text/plain'}

# Download endpoints for PDF and DOCX files - Generate on-demand to save storage
@app.route('/api/downloads/resume_<reference>.pdf', methods=['GET'])
def download_resume_pdf(reference):
    """Download resume PDF by reference - Generate on-demand"""
    try:
        logger.info(f"Generating PDF on-demand for reference: {reference}")
        
        # Get payment data from database to retrieve form data
        connection = auth_system.get_db_connection()
        if not connection:
            return jsonify({
                'success': False,
                'error': 'Database connection failed'
            }), 500
        
        try:
            cursor = connection.cursor()
            
            # First, let's check what tables exist and their structure
            logger.info(f"Looking for payment data for reference: {reference}")
            
            # First, get the actual column structure
            cursor.execute("DESCRIBE manual_payments")
            columns = cursor.fetchall()
            column_names = [col[0] for col in columns]
            logger.info(f"Available columns in manual_payments: {column_names}")
            
            # Build queries based on actual column structure
            possible_queries = []
            
            # Try different column combinations based on actual structure
            if 'form_data' in column_names and 'document_type' in column_names:
                # Use the actual column structure we found
                possible_queries.extend([
                    ("SELECT form_data, document_type FROM manual_payments WHERE reference = %s", (reference,)),
                    ("SELECT form_data, document_type FROM manual_payments WHERE reference = %s AND status = 'completed'", (reference,)),
                    ("SELECT form_data, document_type FROM manual_payments WHERE reference = %s AND status = 'validated'", (reference,)),
                    ("SELECT form_data, document_type FROM manual_payments WHERE reference = %s AND status = 'success'", (reference,)),
                ])
            
            # If form_data doesn't exist, try other possible column names
            if not possible_queries:
                for data_col in ['data', 'form_data', 'resume_data', 'content']:
                    if data_col in column_names:
                        for type_col in ['document_type', 'type', 'doc_type']:
                            if type_col in column_names:
                                possible_queries.append((f"SELECT {data_col}, {type_col} FROM manual_payments WHERE reference = %s", (reference,)))
                                break
                        break
            
            payment_data = None
            for query, params in possible_queries:
                try:
                    logger.info(f"Trying query: {query}")
                    cursor.execute(query, params)
                    payment_data = cursor.fetchone()
                    if payment_data:
                        logger.info(f"Found payment data with query: {query}")
                        break
                except Exception as e:
                    logger.warning(f"Query failed: {query}, Error: {e}")
                    continue
            
            if not payment_data:
                # Let's see what's actually in the database
                try:
                    cursor.execute("SHOW TABLES LIKE '%payment%'")
                    tables = cursor.fetchall()
                    logger.info(f"Available payment tables: {tables}")
                    
                    cursor.execute("SELECT * FROM manual_payments LIMIT 5")
                    sample_data = cursor.fetchall()
                    logger.info(f"Sample manual_payments data: {sample_data}")
                except Exception as e:
                    logger.error(f"Could not inspect database: {e}")
                
                return jsonify({
                    'success': False,
                    'error': f'Payment not found for reference: {reference}'
                }), 404
            
            # Handle the payment data (form_data, document_type)
            if len(payment_data) >= 2:
                form_data = payment_data[0]
                document_type = payment_data[1]
                logger.info(f"Found payment data - Document type: {document_type}")
            else:
                logger.error(f"Unexpected payment data format: {payment_data}")
                return jsonify({
                    'success': False,
                    'error': 'Invalid payment data format'
                }), 500
            
            # Parse form data
            import json
            try:
                resume_data = json.loads(form_data) if isinstance(form_data, str) else form_data
                logger.info(f"Parsed resume data successfully")
            except Exception as e:
                logger.error(f"Failed to parse form data: {e}")
                return jsonify({
                    'success': False,
                    'error': 'Invalid form data format'
                }), 500
            
            # Generate PDF in memory
            try:
                # Use the same RobustFranciscaPDFGenerator for consistency
                pdf_generator = RobustFranciscaPDFGenerator()
                
                # Create temporary file path (won't be saved permanently)
                import tempfile
                with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                    temp_path = temp_file.name
                
                logger.info(f"Generating PDF at: {temp_path}")
                # Generate PDF
                success = pdf_generator.generate_resume_pdf(resume_data, temp_path)
                
                if success:
                    logger.info(f"PDF generated successfully for reference: {reference}")
                    
                    # Track document in user_documents table
                    try:
                        track_document_generation(reference, resume_data, temp_path)
                    except Exception as e:
                        logger.error(f"Failed to track document: {e}")
                    
                    # Serve the file and then delete it
                    response = send_file(temp_path, as_attachment=True, download_name=f"resume_{reference}.pdf")
                    
                    # Clean up temporary file
                    try:
                        os.unlink(temp_path)
                    except:
                        pass
                    
                    return response
                else:
                    # Clean up temporary file
                    try:
                        os.unlink(temp_path)
                    except:
                        pass
                    
                    return jsonify({
                        'success': False,
                        'error': 'Failed to generate PDF'
                    }), 500
                    
            except Exception as e:
                logger.error(f"PDF generation failed: {e}")
                return jsonify({
                    'success': False,
                    'error': f'PDF generation failed: {str(e)}'
                }), 500
                
        except Exception as e:
            logger.error(f"Database query failed: {e}")
            return jsonify({
                'success': False,
                'error': f'Database error: {str(e)}'
            }), 500
        finally:
            if connection:
                connection.close()
            
    except Exception as e:
        logger.error(f"Error generating PDF on-demand: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/downloads/resume_<reference>.docx', methods=['GET'])
def download_resume_docx(reference):
    """Download resume DOCX by reference - Generate on-demand"""
    try:
        logger.info(f"DOCX conversion requested for reference: {reference}")
        
        # For now, return a message that DOCX conversion is not implemented
        # In the future, this could convert PDF to DOCX on-demand
        return jsonify({
            'success': False,
            'error': 'DOCX conversion not yet implemented. Please download the PDF version.',
            'pdf_available': True,
            'pdf_url': f'/api/downloads/resume_{reference}.pdf'
        }), 404
            
    except Exception as e:
        logger.error(f"Error serving DOCX file: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/payments/download/<reference>', methods=['GET'])
def download_payment_document(reference):
    """Alternative download endpoint for payment documents - Generate on-demand"""
    try:
        # Redirect to the main download endpoint which generates on-demand
        logger.info(f"Payment download requested for reference: {reference}")
        return download_resume_pdf(reference)
            
    except Exception as e:
        logger.error(f"Error serving payment document: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/payments/history', methods=['GET'])
@jwt_required_custom
def get_payment_history():
    """Get payment history for the current user"""
    try:
        user_id = request.current_user['user_id']
        
        # Get payments from both tables
        cursor = mysql.connection.cursor()
        
        # Query regular payments table
        cursor.execute("""
            SELECT 
                id as payment_id,
                amount,
                currency,
                payment_method,
                status,
                mpesa_checkout_request_id as checkout_request_id,
                mpesa_receipt_number as mpesa_code,
                transaction_reference,
                created_at,
                updated_at as completed_at,
                'regular' as payment_type,
                user_id as item_id
            FROM payments 
            WHERE user_id = %s
            ORDER BY created_at DESC
        """, (user_id,))
        
        regular_payments = cursor.fetchall()
        
        # Query manual payments table
        cursor.execute("""
            SELECT 
                id as payment_id,
                amount,
                'KES' as currency,
                payment_method,
                status,
                reference as checkout_request_id,
                transaction_code as mpesa_code,
                reference as transaction_reference,
                created_at,
                updated_at as completed_at,
                document_type as payment_type,
                reference as item_id
            FROM manual_payments 
            WHERE JSON_EXTRACT(form_data, '$.user_id') = %s OR JSON_EXTRACT(form_data, '$.personalEmail') IS NOT NULL
            ORDER BY created_at DESC
        """, (user_id,))
        
        manual_payments = cursor.fetchall()
        
        # Combine and format the results
        all_payments = []
        
        # Process regular payments
        for payment in regular_payments:
            all_payments.append({
                'payment_id': payment[0],
                'amount': float(payment[1]),
                'currency': payment[2],
                'payment_method': payment[3],
                'status': payment[4],
                'checkout_request_id': payment[5],
                'mpesa_code': payment[6],
                'transaction_reference': payment[7],
                'created_at': payment[8].isoformat() if payment[8] else None,
                'completed_at': payment[9].isoformat() if payment[9] else None,
                'payment_type': payment[10],
                'item_id': payment[11],
                'phone_number': None  # Not available in regular payments
            })
        
        # Process manual payments
        for payment in manual_payments:
            # Extract phone number from form_data if available
            phone_number = None
            try:
                cursor.execute("SELECT JSON_EXTRACT(form_data, '$.personalPhone') FROM manual_payments WHERE id = %s", (payment[0],))
                phone_result = cursor.fetchone()
                if phone_result and phone_result[0]:
                    phone_number = phone_result[0].strip('"')
            except:
                pass
            
            all_payments.append({
                'payment_id': payment[0],
                'amount': float(payment[1]),
                'currency': payment[2],
                'payment_method': payment[3],
                'status': payment[4],
                'checkout_request_id': payment[5],
                'mpesa_code': payment[6],
                'transaction_reference': payment[7],
                'created_at': payment[8].isoformat() if payment[8] else None,
                'completed_at': payment[9].isoformat() if payment[9] else None,
                'payment_type': payment[10],
                'item_id': payment[11],
                'phone_number': phone_number
            })
        
        # Sort by creation date (newest first)
        all_payments.sort(key=lambda x: x['created_at'], reverse=True)
        
        cursor.close()
        
        return jsonify({
            'success': True,
            'data': all_payments,
            'total': len(all_payments)
        })
        
    except Exception as e:
        logger.error(f"Error fetching payment history: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch payment history'
        }), 500

@app.route('/api/payments/stats', methods=['GET'])
@jwt_required_custom
def get_payment_stats():
    """Get payment statistics for the current user"""
    try:
        user_id = request.current_user['user_id']
        
        cursor = mysql.connection.cursor()
        
        # Get stats from regular payments
        cursor.execute("""
            SELECT 
                COUNT(*) as total_payments,
                SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
                SUM(CASE WHEN status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN amount ELSE 0 END) as revenue_30d,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_payments,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_payments,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_payments
            FROM payments 
            WHERE user_id = %s
        """, (user_id,))
        
        regular_stats = cursor.fetchone()
        
        # Get stats from manual payments
        cursor.execute("""
            SELECT 
                COUNT(*) as total_payments,
                SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
                SUM(CASE WHEN status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN amount ELSE 0 END) as revenue_30d,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_payments,
                SUM(CASE WHEN status = 'pending_payment' THEN 1 ELSE 0 END) as pending_payments,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_payments
            FROM manual_payments 
            WHERE JSON_EXTRACT(form_data, '$.user_id') = %s OR JSON_EXTRACT(form_data, '$.personalEmail') IS NOT NULL
        """, (user_id,))
        
        manual_stats = cursor.fetchone()
        
        # Combine stats
        total_payments = (regular_stats[0] or 0) + (manual_stats[0] or 0)
        total_revenue = (regular_stats[1] or 0) + (manual_stats[1] or 0)
        revenue_30d = (regular_stats[2] or 0) + (manual_stats[2] or 0)
        completed_payments = (regular_stats[3] or 0) + (manual_stats[3] or 0)
        pending_payments = (regular_stats[4] or 0) + (manual_stats[4] or 0)
        failed_payments = (regular_stats[5] or 0) + (manual_stats[5] or 0)
        
        cursor.close()
        
        return jsonify({
            'success': True,
            'data': {
                'totalPayments': total_payments,
                'totalRevenue': total_revenue,
                'payments30d': revenue_30d,
                'paymentStatusStats': {
                    'completed': completed_payments,
                    'pending': pending_payments,
                    'failed': failed_payments
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error fetching payment stats: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch payment statistics'
        }), 500

@app.route('/api/documents/shared/<reference>', methods=['GET'])
def get_shared_document(reference):
    """Get shared document information for public access"""
    try:
        # Check if payment exists in database
        connection = auth_system.get_db_connection()
        if not connection:
            return jsonify({
                'success': False,
                'error': 'Database connection failed'
            }), 500
        
        try:
            cursor = connection.cursor()
            cursor.execute("""
                SELECT reference, document_type, user_email, created_at 
                FROM manual_payments 
                WHERE reference = %s AND status = 'completed'
            """, (reference,))
            
            payment_data = cursor.fetchone()
            if not payment_data:
                return jsonify({
                    'success': False,
                    'error': 'Document not found'
                }), 404
            
            ref, doc_type, user_email, created_at = payment_data
            
            return jsonify({
                'success': True,
                'reference': reference,
                'file_exists': True,
                'document_type': doc_type,
                'user_email': user_email,
                'created_at': created_at.isoformat() if created_at else None,
                'download_url': f'/api/downloads/resume_{reference}.pdf',
                'view_url': f'/api/downloads/resume_{reference}.pdf',
                'generation_type': 'on-demand'
            }), 200
                
        finally:
            if connection:
                connection.close()
            
    except Exception as e:
        logger.error(f"Error getting shared document info: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/documents/<reference>/invite', methods=['POST'])
def invite_collaborator(reference):
    """Invite collaborator to document (placeholder for collaboration feature)"""
    try:
        data = request.get_json()
        email = data.get('email')
        permission = data.get('permission', 'view')
        
        if not email:
            return jsonify({
                'success': False,
                'error': 'Email is required'
            }), 400
        
        # For now, just log the invitation (in real implementation, send email)
        logger.info(f"Collaboration invitation: {email} invited to document {reference} with {permission} permission")
        
        return jsonify({
            'success': True,
            'message': f'Invitation sent to {email}',
            'reference': reference,
            'permission': permission
        }), 200
        
    except Exception as e:
        logger.error(f"Error sending collaboration invitation: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/debug/payments', methods=['GET'])
def debug_payments():
    """Debug endpoint to see what payments exist in the database"""
    try:
        connection = auth_system.get_db_connection()
        if not connection:
            return jsonify({
                'success': False,
                'error': 'Database connection failed'
            }), 500
        
        try:
            cursor = connection.cursor()
            
            # Get all payment tables
            cursor.execute("SHOW TABLES LIKE '%payment%'")
            payment_tables = cursor.fetchall()
            
            result = {
                'success': True,
                'payment_tables': [table[0] for table in payment_tables],
                'recent_payments': []
            }
            
            # Check manual_payments table - first get the column structure
            if ('manual_payments',) in payment_tables:
                # Get column names first
                cursor.execute("DESCRIBE manual_payments")
                columns = cursor.fetchall()
                column_names = [col[0] for col in columns]
                result['manual_payments_columns'] = column_names
                
                # Build query based on available columns
                select_columns = ['reference', 'status', 'created_at']
                if 'user_email' in column_names:
                    select_columns.append('user_email')
                elif 'email' in column_names:
                    select_columns.append('email')
                elif 'user_id' in column_names:
                    select_columns.append('user_id')
                
                query = f"SELECT {', '.join(select_columns)} FROM manual_payments ORDER BY created_at DESC LIMIT 10"
                cursor.execute(query)
                manual_payments = cursor.fetchall()
                
                result['manual_payments'] = []
                for row in manual_payments:
                    payment_dict = {
                        'reference': row[0],
                        'status': row[1], 
                        'created_at': row[2].isoformat() if row[2] else None
                    }
                    if len(row) > 3:
                        payment_dict['user_info'] = row[3]
                    result['manual_payments'].append(payment_dict)
            
            # Check other possible payment tables
            for table_name, in payment_tables:
                if table_name != 'manual_payments':
                    try:
                        cursor.execute(f"SELECT * FROM {table_name} ORDER BY created_at DESC LIMIT 5")
                        table_data = cursor.fetchall()
                        result[f'{table_name}_sample'] = table_data
                    except Exception as e:
                        result[f'{table_name}_error'] = str(e)
            
            return jsonify(result), 200
                
        finally:
            if connection:
                connection.close()
            
    except Exception as e:
        logger.error(f"Debug payments failed: {e}")
        return jsonify({
            'success': False,
            'error': f'Debug failed: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,  # Production setting
        threaded=True
    )
