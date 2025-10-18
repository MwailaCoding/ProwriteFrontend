# 🚀 Pesapal Embedded Payment Page Setup

## **Overview**
This system uses Pesapal's embedded payment page feature, which is perfect for personal accounts and doesn't require complex API integration.

## **Your Embedded Code**
```html
<iframe width="200" height="40" src="https://store.pesapal.com/embed-code?pageUrl=https://store.pesapal.com/prowrite2" frameborder="0" allowfullscreen></iframe>
```

## **🔧 How It Works**

### **1. Payment Page Display**
- **URL**: `/api/payments/pesapal/payment-page`
- **Parameters**: 
  - `order_reference` - Your order ID
  - `amount` - Payment amount
  - `description` - Payment description

**Example URL:**
```
https://prowrite.pythonanywhere.com/api/payments/pesapal/payment-page?order_reference=PAY-123&amount=500&description=Payment for services
```

### **2. Payment Success Callback**
- **URL**: `/api/payments/pesapal/payment-success`
- **Method**: POST
- **Updates**: Database with payment status

### **3. Payment Cancellation Callback**
- **URL**: `/api/payments/pesapal/payment-cancelled`
- **Method**: GET
- **Updates**: Database with cancelled status

## **📋 Setup Steps**

### **Step 1: Upload Files to PythonAnywhere**
Upload these files to your PythonAnywhere backend:
- `pesapal_embedded_routes.py` (new file)
- Updated `app.py` (with new blueprint registration)

### **Step 2: Configure Pesapal Store**
In your Pesapal dashboard:
1. Go to your store settings
2. Set **Success URL**: `https://prowrite.pythonanywhere.com/api/payments/pesapal/payment-success`
3. Set **Cancel URL**: `https://prowrite.pythonanywhere.com/api/payments/pesapal/payment-cancelled`

**Important:** The success URL will automatically trigger:
- ✅ Payment verification
- 📄 PDF generation
- 📧 Email delivery with attachment
- 🔗 Download link creation

### **Step 3: Test the System**
Run the test script:
```bash
python test_embedded_payment_page.py
```

## **🎯 Usage in Your Frontend**

### **Option 1: Direct Link**
```html
<a href="https://prowrite.pythonanywhere.com/api/payments/pesapal/payment-page?order_reference=PAY-123&amount=500&description=Payment for services" target="_blank">
    Pay Now
</a>
```

### **Option 2: Embedded in Your Page**
```html
<iframe 
    src="https://prowrite.pythonanywhere.com/api/payments/pesapal/payment-page?order_reference=PAY-123&amount=500&description=Payment for services"
    width="100%" 
    height="600px" 
    frameborder="0">
</iframe>
```

### **Option 3: JavaScript Integration**
```javascript
function showPaymentPage(orderRef, amount, description) {
    const url = `https://prowrite.pythonanywhere.com/api/payments/pesapal/payment-page?order_reference=${orderRef}&amount=${amount}&description=${description}`;
    window.open(url, '_blank');
}
```

## **💳 Payment Flow (Redirect-Based Confirmation)**

1. **User clicks "Pay Now"** → Redirected to payment page
2. **Payment page loads** → Shows order details + embedded Pesapal iframe
3. **User completes payment** → Pesapal processes payment
4. **Pesapal redirects to success URL** → **REDIRECT CONFIRMS PAYMENT**
5. **System automatically (on redirect):**
   - ✅ Updates database with payment status to 'COMPLETED'
   - 📄 Generates PDF in background thread
   - 📧 Sends email with PDF attachment
   - 🔗 Creates download link
6. **User sees success page** → With download button and email confirmation
7. **User receives email** → With PDF attachment
8. **User can download** → Direct download link available

**Key Point:** The redirect from Pesapal to your success URL is the confirmation that payment was successful. No additional verification needed!

## **🔍 Verification Process**

### **Manual Verification (Recommended)**
1. **Check Pesapal dashboard** for new payments
2. **Verify payment details** match order
3. **Confirm payment status** is "Completed"
4. **Update system** if needed

### **Email Notifications**
- Pesapal sends email notifications for payments
- Check your email for payment confirmations
- Use email details to verify payments

## **📊 Database Updates**

The system automatically updates the `manual_payments` table with:
- `status`: 'COMPLETED' or 'CANCELLED'
- `payment_reference`: Transaction reference from Pesapal
- `amount`: Payment amount
- `currency`: 'KES'
- `payment_method`: 'Pesapal'
- `payment_account`: 'Embedded Payment Page'
- `pdf_path`: Path to generated PDF file
- `email_sent`: Boolean indicating if email was sent
- `updated_at`: Current timestamp

## **🔗 Available Endpoints**

### **Payment Page**
- **URL**: `/api/payments/pesapal/payment-page`
- **Method**: GET
- **Purpose**: Display embedded payment form

### **Payment Success**
- **URL**: `/api/payments/pesapal/payment-success`
- **Method**: GET/POST
- **Purpose**: Handle successful payment callback

### **Payment Cancelled**
- **URL**: `/api/payments/pesapal/payment-cancelled`
- **Method**: GET
- **Purpose**: Handle cancelled payment

### **PDF Download**
- **URL**: `/api/payments/pesapal/download/{order_reference}`
- **Method**: GET
- **Purpose**: Download generated PDF

## **🎉 Benefits**

✅ **Works with personal accounts**
✅ **No complex API integration**
✅ **No IPN ID issues**
✅ **Simple setup and maintenance**
✅ **Reliable payment processing**
✅ **Automatic database updates**
✅ **Professional payment page**

## **🚨 Important Notes**

1. **Configure callback URLs** in your Pesapal store settings
2. **Test with small amounts** first
3. **Monitor your Pesapal dashboard** for payments
4. **Check email notifications** for payment confirmations
5. **Verify payments manually** before processing orders

## **🔧 Troubleshooting**

### **Payment page not loading**
- Check if files are uploaded to PythonAnywhere
- Verify app.py has the new blueprint registered
- Check PythonAnywhere logs for errors

### **Callbacks not working**
- Verify callback URLs in Pesapal store settings
- Check if URLs are accessible from internet
- Test callback URLs manually

### **Database not updating**
- Check database connection settings
- Verify manual_payments table exists
- Check PythonAnywhere logs for database errors

## **📞 Support**

If you need help:
1. Check PythonAnywhere logs
2. Test individual endpoints
3. Verify Pesapal store configuration
4. Contact Pesapal support for payment issues
