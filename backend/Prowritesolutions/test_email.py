#!/usr/bin/env python3
"""
Simple email test script to verify SMTP configuration
"""
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

def test_email():
    """Test email sending with current configuration"""
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv('.env')
    
    # Get SMTP configuration
    smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_email = os.getenv('SMTP_EMAIL', '')
    smtp_password = os.getenv('SMTP_PASSWORD', '')
    smtp_from_name = os.getenv('SMTP_FROM_NAME', 'ProWrite')
    
    print(f"SMTP Configuration:")
    print(f"Server: {smtp_server}")
    print(f"Port: {smtp_port}")
    print(f"Email: {smtp_email}")
    print(f"Password: {'*' * len(smtp_password) if smtp_password else 'NOT SET'}")
    print(f"From Name: {smtp_from_name}")
    
    if not smtp_email or not smtp_password:
        print("❌ ERROR: SMTP_EMAIL or SMTP_PASSWORD not set in .env file")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = f"{smtp_from_name} <{smtp_email}>"
        msg['To'] = "hamiltonmwaila06@gmail.com"
        msg['Subject'] = "ProWrite Email Test"
        
        body = f"""This is a test email from ProWrite system.
        
Test Details:
- Time: {datetime.now()}
- SMTP Server: {smtp_server}
- SMTP Port: {smtp_port}
- From Email: {smtp_email}
- To Email: hamiltonmwaila06@gmail.com

If you receive this email, the SMTP configuration is working correctly!
"""
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        print("Connecting to SMTP server...")
        server = smtplib.SMTP(smtp_server, smtp_port)
        print("Starting TLS...")
        server.starttls()
        print("Logging in...")
        server.login(smtp_email, smtp_password)
        print("Sending email...")
        text = msg.as_string()
        server.sendmail(smtp_email, "hamiltonmwaila06@gmail.com", text)
        server.quit()
        
        print("✅ Email sent successfully!")
        print("Check hamiltonmwaila06@gmail.com for the test email")
        return True
        
    except Exception as e:
        print(f"❌ Email sending failed: {e}")
        return False

if __name__ == "__main__":
    test_email()
