# Development Test Transaction Codes

## FOR TESTING ONLY - DO NOT USE IN PRODUCTION

### Valid Test Codes:

1. **TEST123** - KES 500 (Francisca Resume)
2. **DEV456** - KES 500 (Francisca Resume)  
3. **VALID789** - KES 500 (Francisca Resume)
4. **DEMO001** - KES 300 (Cover Letter)
5. **SAMPLE999** - KES 500 (Francisca Resume)

### How to Test:

1. Start payment process
2. Enter your email address
3. Use one of the test codes above
4. PDF will be generated and sent to your email

### Security Features:

- ✅ Each code can only be used ONCE
- ✅ Amount must match exactly
- ✅ Invalid codes are rejected
- ✅ Prevents fraud with fake codes

### Production Setup:

In production, replace `DevelopmentValidator` with `SecureMpesaValidator` which:

- ✅ Validates real M-Pesa transactions via API
- ✅ Checks transaction exists in M-Pesa system
- ✅ Verifies amount and till number
- ✅ Prevents duplicate usage
- ✅ Connects to real Safaricom API

### Environment Variables for Production:

```
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=your_passkey
MPESA_ENVIRONMENT=production
FLASK_ENV=production
```
