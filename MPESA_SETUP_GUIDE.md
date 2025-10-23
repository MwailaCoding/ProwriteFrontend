# M-Pesa Daraja API Setup Guide

## Overview
This guide explains how to set up M-Pesa Daraja API STK Push for ProWrite payment system.

## Required Environment Variables

### Backend Environment Variables (.env)
```bash
# M-Pesa Daraja API Configuration
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_BUSINESS_SHORT_CODE=your_business_short_code
MPESA_PASSKEY=your_passkey_here
MPESA_CALLBACK_URL=https://prowrite.pythonanywhere.com/api/payments/mpesa/callback
MPESA_ENVIRONMENT=sandbox  # or 'production' for live environment

# Database Configuration (existing)
DB_HOST=Prowrite.mysql.pythonanywhere-services.com
DB_USER=Prowrite
DB_PASSWORD=your_db_password
DB_NAME=Prowrite$dbprowrite
DB_PORT=3306
```

### Removed PesaPal Variables
The following PesaPal environment variables are no longer needed:
- `PESAPAL_CONSUMER_KEY`
- `PESAPAL_CONSUMER_SECRET`
- `PESAPAL_BUSINESS_SHORT_CODE`
- `PESAPAL_CALLBACK_URL`

## Getting M-Pesa Daraja API Credentials

### 1. Register with Safaricom Developer Portal
1. Go to [https://developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create an account and log in
3. Create a new app for your business

### 2. Get Sandbox Credentials (for testing)
1. In the developer portal, go to "My Apps"
2. Select your app
3. Copy the following credentials:
   - **Consumer Key**: Found in app details
   - **Consumer Secret**: Found in app details
   - **Business Short Code**: Use `174379` for sandbox testing
   - **Passkey**: Use the provided passkey for sandbox

### 3. Get Production Credentials (for live environment)
1. Complete the app review process with Safaricom
2. Submit required business documents
3. Once approved, you'll receive production credentials
4. Update `MPESA_ENVIRONMENT=production` in your environment variables

## Callback URL Registration

### 1. Register Callback URL with Safaricom
1. In the Safaricom Developer Portal, go to your app settings
2. Set the **Callback URL** to: `https://prowrite.pythonanywhere.com/api/payments/mpesa/callback`
3. This URL must be accessible from the internet
4. The URL should return a JSON response with `ResultCode: 0` and `ResultDesc: "Success"`

### 2. Test Callback URL
You can test your callback URL using the test endpoint:
```bash
curl -X POST https://prowrite.pythonanywhere.com/api/payments/mpesa/callback \
  -H "Content-Type: application/json" \
  -d '{"Body":{"stkCallback":{"MerchantRequestID":"test","CheckoutRequestID":"test","ResultCode":0,"ResultDesc":"Success"}}}'
```

## Database Setup

### 1. Run Database Migration
Execute the SQL script to update the database schema:
```sql
-- Run the update_payment_schema.sql file
source frontend/ProwriteFrontend/backend/Prowritesolutions/update_payment_schema.sql
```

### 2. Verify Schema Updates
Check that the following columns exist in the `payments` table:
- `payment_method` (ENUM: 'mpesa_stk', 'manual_admin')
- `checkout_request_id` (VARCHAR)
- `merchant_request_id` (VARCHAR)
- `phone_number` (VARCHAR)

## Testing the Integration

### 1. Test STK Push Initiation
```bash
curl -X POST https://prowrite.pythonanywhere.com/api/payments/mpesa/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "254708374149",
    "amount": 500,
    "document_type": "Prowrite Template Resume",
    "form_data": {"name": "Test User"},
    "user_email": "test@example.com",
    "user_id": 1
  }'
```

### 2. Test Status Query
```bash
curl -X GET https://prowrite.pythonanywhere.com/api/payments/mpesa/status/{checkout_request_id}
```

### 3. Test Service Status
```bash
curl -X GET https://prowrite.pythonanywhere.com/api/payments/mpesa/service-status
```

## Phone Number Format

### Supported Formats
- `254708374149` (recommended)
- `0708374149` (will be converted to 254 format)
- `708374149` (will be converted to 254 format)

### Validation
The system automatically validates and formats phone numbers to the required `254XXXXXXXXX` format.

## Payment Flow

### 1. User Initiates Payment
- User enters phone number and email
- System sends STK push to user's phone
- User receives M-Pesa prompt on their phone

### 2. User Completes Payment
- User enters M-Pesa PIN on their phone
- Payment is processed by M-Pesa
- M-Pesa sends callback to our system

### 3. System Processes Payment
- Callback handler receives payment confirmation
- Payment status is updated in database
- PDF generation is triggered
- Email is sent to user with PDF attachment

### 4. Frontend Polling
- Frontend polls payment status every 2 seconds
- Shows real-time status updates to user
- Displays success/failure messages

## Troubleshooting

### Common Issues

#### 1. STK Push Not Received
- Check phone number format (must be 254XXXXXXXXX)
- Verify M-Pesa credentials are correct
- Check if phone number is registered with M-Pesa

#### 2. Callback Not Working
- Verify callback URL is accessible from internet
- Check that callback URL returns correct JSON format
- Ensure callback URL is registered with Safaricom

#### 3. Payment Status Not Updating
- Check database connection
- Verify payment_logs table exists
- Check application logs for errors

### Debug Mode
Set `MPESA_DEVELOPMENT_MODE=true` in environment variables to use mock responses for testing.

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use different credentials for sandbox and production
- Rotate credentials regularly

### 2. Callback Security
- Validate callback data before processing
- Log all callback attempts for audit
- Implement rate limiting on callback endpoint

### 3. Database Security
- Use parameterized queries to prevent SQL injection
- Encrypt sensitive payment data
- Implement proper access controls

## Monitoring and Logs

### 1. Payment Logs
All payment activities are logged in the `payment_logs` table:
- Payment initiation
- Callback received
- Status updates
- PDF generation

### 2. Application Logs
Check application logs for:
- STK push initiation errors
- Callback processing errors
- Database connection issues

### 3. M-Pesa Dashboard
Monitor payments in the Safaricom Developer Portal:
- View transaction history
- Check callback delivery status
- Monitor API usage

## Support

For issues with M-Pesa integration:
1. Check Safaricom Developer Portal documentation
2. Review application logs
3. Test with sandbox environment first
4. Contact Safaricom support for production issues

## Migration from PesaPal

### What Changed
- Removed all PesaPal integration files
- Updated payment flow to use M-Pesa STK Push
- Changed frontend components to use new payment method
- Updated database schema for M-Pesa fields

### Rollback Plan
If you need to rollback to PesaPal:
1. Restore PesaPal service files from backup
2. Update app.py to register PesaPal blueprints
3. Revert frontend components to PesaPal flow
4. Update database schema if needed

### Testing After Migration
1. Test STK push initiation
2. Test callback handling
3. Test frontend payment flow
4. Test PDF generation and email delivery
5. Verify payment status updates
