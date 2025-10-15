# Africa's Talking Complete Setup Guide

## Overview
This guide will help you set up Africa's Talking to fetch real M-Pesa transactions for your till number 6340351.

## Prerequisites
- Africa's Talking account with production access
- Valid API credentials (API Key and Username)
- Till number 6340351

## Step 1: Set Up Payment Product

### 1.1 Login to Africa's Talking Dashboard
1. Go to: https://account.africastalking.com/
2. Login with your account credentials

### 1.2 Create Payment Product
1. Navigate to **Payments** section
2. Click **Create Payment Product**
3. Fill in the details:
   - **Product Name**: `Mpesa` (or your preferred name)
   - **Product Type**: Mobile Money
   - **Provider**: M-Pesa
   - **Country**: Kenya
4. Save the product

### 1.3 Link Your Till Number
1. In the Payment Product settings
2. Add your till number: `6340351`
3. Configure the till as a **Paybill** or **Buy Goods** account
4. Save the configuration

## Step 2: Configure Environment Variables

Add these variables to your PythonAnywhere `.env` file:

```bash
# Africa's Talking Configuration
AFRICAS_TALKING_API_KEY=your_primary_api_key_here
AFRICAS_TALKING_USERNAME=your_username_here
AFRICAS_TALKING_ENV=production
AFRICAS_TALKING_PAYMENT_PRODUCT=Mpesa
AFRICAS_TALKING_TILL_NUMBER=6340351

# Flask Environment
FLASK_ENV=production
```

## Step 3: Get Your Credentials

### 3.1 Get API Key
1. Go to **API Keys** section in your dashboard
2. Copy your **Primary API Key**
3. Add it to `.env` as `AFRICAS_TALKING_API_KEY`

### 3.2 Get Username
1. Go to **Account** section
2. Copy your **Username**
3. Add it to `.env` as `AFRICAS_TALKING_USERNAME`

## Step 4: Test the Setup

### 4.1 Test API Connection
Run this command in your PythonAnywhere console:

```bash
python3 -c "
import os
from dotenv import load_dotenv
load_dotenv()

print('API Key:', 'SET' if os.getenv('AFRICAS_TALKING_API_KEY') else 'NOT SET')
print('Username:', 'SET' if os.getenv('AFRICAS_TALKING_USERNAME') else 'NOT SET')
print('Environment:', os.getenv('AFRICAS_TALKING_ENV'))
print('Product:', os.getenv('AFRICAS_TALKING_PAYMENT_PRODUCT'))
"
```

### 4.2 Test Transaction Validation
```bash
curl -X POST "https://prowrite.pythonanywhere.com/api/payments/manual/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_code": "TJBL8759KU",
    "reference": "PAY-B76C88F3"
  }'
```

## Step 5: How It Works

### 5.1 Real-Time Transaction Fetching
The system now:
1. **Fetches recent transactions** from Africa's Talking API (last 7 days)
2. **Filters by till number** 6340351
3. **Searches for the transaction code** in the fetched data
4. **Validates the amount** matches (with 1 KES tolerance)
5. **Caches results** for 5 minutes to reduce API calls

### 5.2 Security Features
- Only accepts transactions from the last 7 days
- Rejects all transactions if API fetch fails
- Caches results to reduce API load
- Logs all validation attempts for audit trail

## Step 6: Monitoring and Logs

### 6.1 Check Logs
Monitor your application logs for:
- `Fetching transactions: Mpesa from [date] to [date]`
- `Fetched X transactions for till 6340351`
- `Transaction verified via API: [transaction_id]`

### 6.2 Common Issues

**Issue**: "API fetch failed"
- **Solution**: Check your API credentials and payment product setup

**Issue**: "Transaction not found in fetched transactions"
- **Solution**: Ensure the transaction was sent to till 6340351 within the last 7 days

**Issue**: "Amount mismatch"
- **Solution**: Verify the transaction amount matches exactly (within 1 KES tolerance)

## Step 7: Support

If you encounter issues:
1. Check Africa's Talking documentation: https://developers.africastalking.com/
2. Contact Africa's Talking support: support@africastalking.com
3. Verify your payment product is properly configured

## Success Indicators

✅ **Setup Complete When:**
- Environment variables are set correctly
- Payment product is created and linked to till 6340351
- API connection test passes
- Real transaction validation works
- Fake transactions are rejected

## Next Steps

After setup is complete:
1. Test with a real M-Pesa transaction to your till
2. Monitor the logs to ensure proper API integration
3. The system will automatically validate all future transactions in real-time
