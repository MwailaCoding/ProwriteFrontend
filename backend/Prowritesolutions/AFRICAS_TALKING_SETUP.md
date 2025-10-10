# Africa's Talking Integration Setup

## 🔧 **ENVIRONMENT VARIABLES TO ADD TO YOUR .env FILE:**

```bash
# Africa's Talking Configuration
AFRICAS_TALKING_API_KEY=your_api_key_here
AFRICAS_TALKING_USERNAME=your_username_here
AFRICAS_TALKING_ENV=sandbox
```

## 📋 **STEPS TO GET YOUR CREDENTIALS:**

### **1. Login to Africa's Talking Dashboard:**
- Go to: https://account.africastalking.com/
- Login with your credentials

### **2. Get Your API Key:**
- Go to "Settings" → "API Keys"
- Copy your "Primary API Key"
- Add to .env: `AFRICAS_TALKING_API_KEY=your_primary_api_key`

### **3. Get Your Username:**
- Go to "Settings" → "Account"
- Copy your "Username"
- Add to .env: `AFRICAS_TALKING_USERNAME=your_username`

### **4. Set Environment:**
- For testing: `AFRICAS_TALKING_ENV=sandbox`
- For production: `AFRICAS_TALKING_ENV=production`

## 🧪 **TESTING WITH SANDBOX:**

### **Test Transaction Codes (Sandbox):**
```
TEST123 - KES 500
DEV456 - KES 500
VALID789 - KES 500
DEMO001 - KES 300
SAMPLE999 - KES 500
```

### **How to Test:**
1. Add credentials to .env file
2. Upload files to PythonAnywhere
3. Restart web app
4. Try payment with test codes
5. Check logs for Africa's Talking API calls

## 🚀 **PRODUCTION SETUP:**

### **1. Switch to Production:**
```bash
AFRICAS_TALKING_ENV=production
FLASK_ENV=production
```

### **2. Real M-Pesa Integration:**
- User pays to Till 6340351
- User enters real transaction code
- System verifies via Africa's Talking
- PDF generated and sent

## 📊 **MONITORING:**

### **Check Logs:**
```bash
# Look for these log messages:
"Africa's Talking validator initialized"
"Verifying M-Pesa transaction: TJ28L68TJR"
"Africa's Talking API call: /version1/mpesa/transaction/status"
"Transaction verified successfully via Africa's Talking"
```

### **API Response Examples:**
```json
// Success Response
{
  "status": "Success",
  "transactionId": "TJ28L68TJR",
  "amount": 500,
  "tillNumber": "6340351"
}

// Error Response
{
  "status": "Failed",
  "message": "Transaction not found"
}
```

## 🔒 **SECURITY FEATURES:**

✅ **Real M-Pesa Verification** - Checks actual M-Pesa transactions
✅ **Amount Validation** - Verifies correct payment amount
✅ **Till Validation** - Confirms payment to correct till (6340351)
✅ **Duplicate Prevention** - Each transaction code can only be used once
✅ **Time Validation** - Transactions must be recent
✅ **API Security** - Uses secure API keys and HTTPS

## 💰 **COST TRACKING:**

### **Per Transaction Costs:**
- Transaction Verification: ~KES 2-5
- SMS Notifications: ~KES 1.50 (optional)

### **Monthly Estimates:**
- 100 transactions: KES 200-500
- 200 transactions: KES 400-1,000
- 500 transactions: KES 1,000-2,500

## 🆘 **TROUBLESHOOTING:**

### **Common Issues:**
1. **API Key Invalid** - Check credentials in .env
2. **Transaction Not Found** - Verify transaction code format
3. **Amount Mismatch** - Ensure user paid correct amount
4. **Network Error** - Check internet connection

### **Support:**
- Africa's Talking Support: support@africastalking.com
- Documentation: https://developers.africastalking.com/
