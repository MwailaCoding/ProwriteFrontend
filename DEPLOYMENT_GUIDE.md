# M-Pesa STK Push Deployment Guide

## Overview
This guide covers the deployment of the M-Pesa STK Push payment system to PythonAnywhere and the registration of callback URLs with Safaricom.

## Pre-Deployment Checklist

### 1. Environment Variables Setup
Ensure the following environment variables are configured in PythonAnywhere:

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

### 2. Database Migration
Run the database migration script to update the schema:

```sql
-- Execute the update_payment_schema.sql file
source frontend/ProwriteFrontend/backend/Prowritesolutions/update_payment_schema.sql
```

### 3. File Deployment
Upload the following new files to PythonAnywhere:
- `mpesa_routes.py` (new)
- Updated `app.py` (modified)
- Updated `update_payment_schema.sql` (modified)

Remove the following PesaPal files:
- `pesapal_service.py` (deleted)
- `pesapal_payment_routes.py` (deleted)
- `pesapal_callback_routes.py` (deleted)
- `pesapal_embedded_routes.py` (deleted)

## Deployment Steps

### Step 1: Backup Current System
1. **Database Backup**
   ```bash
   mysqldump -u Prowrite -p Prowrite$dbprowrite > backup_before_mpesa_migration.sql
   ```

2. **File Backup**
   ```bash
   # Create backup of current files
   mkdir backup_before_mpesa_migration
   cp -r frontend/ProwriteFrontend/backend/Prowritesolutions/* backup_before_mpesa_migration/
   ```

### Step 2: Update PythonAnywhere Files
1. **Upload New Files**
   - Upload `mpesa_routes.py` to the backend directory
   - Update `app.py` with the new M-Pesa routes
   - Update `update_payment_schema.sql`

2. **Remove PesaPal Files**
   - Delete all `pesapal_*.py` files
   - Remove PesaPal imports from `app.py`

### Step 3: Database Migration
1. **Connect to MySQL**
   ```bash
   mysql -u Prowrite -p Prowrite$dbprowrite
   ```

2. **Run Migration Script**
   ```sql
   source /home/Prowrite/frontend/ProwriteFrontend/backend/Prowritesolutions/update_payment_schema.sql;
   ```

3. **Verify Schema Updates**
   ```sql
   DESCRIBE payments;
   SHOW COLUMNS FROM payments LIKE 'payment_method';
   ```

### Step 4: Update Environment Variables
1. **Access PythonAnywhere Console**
   - Go to the "Files" tab
   - Navigate to your project directory
   - Edit the `.env` file

2. **Add M-Pesa Variables**
   ```bash
   # Add these lines to your .env file
   MPESA_CONSUMER_KEY=your_consumer_key_here
   MPESA_CONSUMER_SECRET=your_consumer_secret_here
   MPESA_BUSINESS_SHORT_CODE=your_business_short_code
   MPESA_PASSKEY=your_passkey_here
   MPESA_CALLBACK_URL=https://prowrite.pythonanywhere.com/api/payments/mpesa/callback
   MPESA_ENVIRONMENT=sandbox
   ```

3. **Remove PesaPal Variables**
   - Remove any `PESAPAL_*` variables from `.env`

### Step 5: Restart Application
1. **Reload Web App**
   - Go to the "Web" tab in PythonAnywhere
   - Click "Reload" to restart your application

2. **Check Logs**
   - Monitor the error logs for any issues
   - Look for successful M-Pesa service initialization

## Safaricom Daraja API Setup

### Step 1: Register Callback URL
1. **Login to Safaricom Developer Portal**
   - Go to [https://developer.safaricom.co.ke](https://developer.safaricom.co.ke)
   - Login with your credentials

2. **Navigate to Your App**
   - Go to "My Apps"
   - Select your application

3. **Set Callback URL**
   - In the app settings, set the callback URL to:
   ```
   https://prowrite.pythonanywhere.com/api/payments/mpesa/callback
   ```

### Step 2: Test Callback URL
1. **Test Endpoint Accessibility**
   ```bash
   curl -X GET https://prowrite.pythonanywhere.com/api/payments/mpesa/service-status
   ```

2. **Test Callback Endpoint**
   ```bash
   curl -X POST https://prowrite.pythonanywhere.com/api/payments/mpesa/callback \
     -H "Content-Type: application/json" \
     -d '{"Body":{"stkCallback":{"MerchantRequestID":"test","CheckoutRequestID":"test","ResultCode":0,"ResultDesc":"Success"}}}'
   ```

### Step 3: Verify Callback Registration
1. **Check Safaricom Dashboard**
   - Verify the callback URL is registered
   - Check for any validation errors

2. **Test with Sandbox**
   - Use sandbox credentials for testing
   - Verify callback URL is accessible

## Testing the Deployment

### Step 1: Run Test Suite
1. **Upload Test Files**
   - Upload `test_mpesa_stk_flow.py`
   - Upload `test_mpesa_callback.py`
   - Upload `test_payment_integration.py`

2. **Run Tests**
   ```bash
   cd /home/Prowrite/frontend/ProwriteFrontend/backend/Prowritesolutions
   python test_mpesa_stk_flow.py
   python test_mpesa_callback.py
   python test_payment_integration.py
   ```

### Step 2: Manual Testing
1. **Test STK Push Initiation**
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

2. **Test Status Query**
   ```bash
   curl -X GET https://prowrite.pythonanywhere.com/api/payments/mpesa/status/{checkout_request_id}
   ```

3. **Test Callback**
   ```bash
   curl -X POST https://prowrite.pythonanywhere.com/api/payments/mpesa/callback \
     -H "Content-Type: application/json" \
     -d '{
       "Body": {
         "stkCallback": {
           "MerchantRequestID": "test_merchant",
           "CheckoutRequestID": "test_checkout",
           "ResultCode": 0,
           "ResultDesc": "Success"
         }
       }
     }'
   ```

### Step 3: Frontend Testing
1. **Test Payment Modal**
   - Open the payment modal
   - Enter phone number and email
   - Test STK push initiation

2. **Test Status Polling**
   - Verify status updates in real-time
   - Check for success/failure handling

## Monitoring and Maintenance

### Step 1: Set Up Monitoring
1. **Application Logs**
   - Monitor PythonAnywhere error logs
   - Check for M-Pesa API errors
   - Monitor callback processing

2. **Database Monitoring**
   - Check payment_logs table
   - Monitor payment status updates
   - Verify PDF generation triggers

### Step 2: Performance Monitoring
1. **Response Times**
   - Monitor STK push initiation time
   - Check callback processing time
   - Monitor PDF generation time

2. **Error Rates**
   - Track failed payments
   - Monitor callback failures
   - Check database errors

### Step 3: Regular Maintenance
1. **Daily Checks**
   - Verify M-Pesa service status
   - Check payment processing
   - Monitor error logs

2. **Weekly Checks**
   - Review payment statistics
   - Check callback success rates
   - Monitor system performance

## Rollback Plan

### If Issues Occur
1. **Database Rollback**
   ```bash
   mysql -u Prowrite -p Prowrite$dbprowrite < backup_before_mpesa_migration.sql
   ```

2. **File Rollback**
   ```bash
   # Restore backed up files
   cp -r backup_before_mpesa_migration/* frontend/ProwriteFrontend/backend/Prowritesolutions/
   ```

3. **Environment Rollback**
   - Restore PesaPal environment variables
   - Remove M-Pesa environment variables
   - Restart application

## Troubleshooting

### Common Issues

#### 1. Callback URL Not Working
- **Check URL accessibility**: Ensure the URL is accessible from the internet
- **Verify JSON response**: Callback must return `{"ResultCode": 0, "ResultDesc": "Success"}`
- **Check CORS settings**: Ensure proper CORS headers are set

#### 2. STK Push Not Received
- **Check phone number format**: Must be in 254XXXXXXXXX format
- **Verify M-Pesa credentials**: Ensure credentials are correct
- **Check phone registration**: Ensure phone is registered with M-Pesa

#### 3. Payment Status Not Updating
- **Check database connection**: Verify database is accessible
- **Check payment_logs**: Look for errors in payment processing
- **Verify callback processing**: Ensure callbacks are being processed

#### 4. PDF Generation Issues
- **Check form data**: Ensure form data is valid
- **Verify email service**: Check email delivery service
- **Check file permissions**: Ensure PDF generation has proper permissions

### Debug Mode
Enable debug mode for testing:
```bash
MPESA_DEVELOPMENT_MODE=true
```

This will use mock responses for testing without actual M-Pesa API calls.

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

## Support and Documentation

### 1. M-Pesa Documentation
- [Safaricom Developer Portal](https://developer.safaricom.co.ke)
- [Daraja API Documentation](https://developer.safaricom.co.ke/docs)

### 2. Application Logs
- Check PythonAnywhere error logs
- Monitor payment_logs table
- Review callback processing logs

### 3. Contact Information
- Safaricom Support: [support@safaricom.co.ke](mailto:support@safaricom.co.ke)
- Technical Support: [developer@safaricom.co.ke](mailto:developer@safaricom.co.ke)

## Success Metrics

### 1. Payment Success Rate
- Target: >95% successful payments
- Monitor: Failed payment reasons
- Track: Callback success rates

### 2. Response Times
- STK Push Initiation: <5 seconds
- Callback Processing: <2 seconds
- PDF Generation: <30 seconds

### 3. System Reliability
- Uptime: >99.9%
- Error Rate: <1%
- Callback Success: >98%

## Conclusion

This deployment guide provides a comprehensive approach to deploying the M-Pesa STK Push payment system. Follow the steps carefully, test thoroughly, and monitor the system after deployment to ensure smooth operation.

For any issues or questions, refer to the troubleshooting section or contact the development team.
