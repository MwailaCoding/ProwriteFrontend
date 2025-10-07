#!/usr/bin/env python3
"""
SendGrid email test script to verify SendGrid configuration
"""
import os
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from datetime import datetime

def test_sendgrid():
    """Test SendGrid email sending with current configuration"""
    
    # Load environment variables
    load_dotenv('.env')
    
    # Get SendGrid configuration
    api_key = os.getenv('SENDGRID_API_KEY')
    from_email = os.getenv('SENDGRID_FROM_EMAIL', os.getenv('SMTP_EMAIL'))
    from_name = os.getenv('SENDGRID_FROM_NAME', 'ProWrite')
    
    print(f"SendGrid Configuration:")
    print(f"API Key: {'*' * 20 if api_key else 'NOT SET'}")
    print(f"From Email: {from_email}")
    print(f"From Name: {from_name}")
    
    if not api_key:
        print("❌ ERROR: SENDGRID_API_KEY not set in .env file")
        return False
    
    if not from_email:
        print("❌ ERROR: SENDGRID_FROM_EMAIL not set in .env file")
        return False
    
    try:
        # Create test email
        test_email = "hamiltonmwaila06@gmail.com"
        subject = "ProWrite SendGrid Test"
        
        body = f"""This is a test email from ProWrite system using SendGrid.
        
Test Details:
- Time: {datetime.now()}
- API Key: {'*' * 20}
- From Email: {from_email}
- From Name: {from_name}
- To Email: {test_email}

If you receive this email, the SendGrid configuration is working correctly!

Best regards,
The ProWrite Team

---
ProWrite - Professional Resume & Cover Letter Generator
Website: https://prowrite-frontend.vercel.app"""
        
        # Create SendGrid mail object
        message = Mail(
            from_email=(from_email, from_name),
            to_emails=test_email,
            subject=subject,
            html_content=body.replace('\n', '<br>')
        )
        
        # Send email
        print("Sending email via SendGrid...")
        sg = SendGridAPIClient(api_key=api_key)
        response = sg.send(message)
        
        if response.status_code in [200, 201, 202]:
            print("✅ Email sent successfully via SendGrid!")
            print(f"SendGrid response status: {response.status_code}")
            print(f"Check {test_email} for the test email")
            return True
        else:
            print(f"❌ SendGrid error: {response.status_code}")
            print(f"Response body: {response.body}")
            return False
            
    except Exception as e:
        print(f"❌ Email sending failed: {e}")
        return False

if __name__ == "__main__":
    test_sendgrid()
