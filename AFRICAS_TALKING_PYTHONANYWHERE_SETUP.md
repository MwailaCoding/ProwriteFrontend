# Africa's Talking Setup for PythonAnywhere

## Problem Identified
Your payment validation system was **FORCED** to use the Development Validator instead of the real Africa's Talking API. This is why your real transaction code "TGBL8759KU" was not being validated.

## Solution Applied
I've updated the code to use the real Africa's Talking validator when properly configured.

## Required Environment Variables for PythonAnywhere

Add these environment variables to your PythonAnywhere Web App:

### 1. Africa's Talking Configuration
```
AFRICAS_TALKING_API_KEY=your_africas_talking_api_key_here
AFRICAS_TALKING_USERNAME=your_africas_talking_username_here
AFRICAS_TALKING_ENV=production
```

### 2. Flask Environment
```
FLASK_ENV=production
```

## How to Add Environment Variables in PythonAnywhere

1. **Login to PythonAnywhere Dashboard**
2. **Go to Web Tab**
3. **Click on your Web App**
4. **Scroll down to "Environment variables"**
5. **Add the following variables:**

| Variable Name | Value |
|---------------|-------|
| `AFRICAS_TALKING_API_KEY` | Your Africa's Talking API Key |
| `AFRICAS_TALKING_USERNAME` | Your Africa's Talking Username |
| `AFRICAS_TALKING_ENV` | `production` |
| `FLASK_ENV` | `production` |

## Getting Africa's Talking Credentials

### 1. Login to Africa's Talking Dashboard
- Go to: https://account.africastalking.com/
- Login with your account

### 2. Get API Key
- Go to "API Keys" section
- Copy your Primary API Key
- Add to PythonAnywhere: `AFRICAS_TALKING_API_KEY=your_primary_api_key`

### 3. Get Username
- Go to "Account" section
- Copy your Username
- Add to PythonAnywhere: `AFRICAS_TALKING_USERNAME=your_username`

## After Adding Environment Variables

1. **Reload your Web App** in PythonAnywhere
2. **Test with your real transaction code**: `TGBL8759KU`
3. **The system will now use Africa's Talking API** to validate real M-Pesa transactions

## Testing

Once configured, your real transaction code "TGBL8759KU" should be validated through Africa's Talking API, which will:

1. **Query M-Pesa directly** for transaction details
2. **Verify the transaction** was sent to Till 6340351
3. **Confirm the amount** matches (KES 500)
4. **Validate the transaction code** format

## Important Notes

- **Production Environment**: Set `AFRICAS_TALKING_ENV=production` for real transactions
- **Sandbox Environment**: Set `AFRICAS_TALKING_ENV=sandbox` for testing
- **Real Money**: Your transaction code "TGBL8759KU" represents a real payment, so use production environment

## Support

If you need help getting Africa's Talking credentials:
- Africa's Talking Support: support@africastalking.com
- Documentation: https://developers.africastalking.com/
