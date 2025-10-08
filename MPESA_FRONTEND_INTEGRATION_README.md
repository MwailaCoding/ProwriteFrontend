# M-Pesa Frontend Integration Guide

This guide explains how to integrate the real M-Pesa payment system into your ProWrite frontend application.

## 🚀 Overview

The M-Pesa payment system has been implemented with real production-ready components that integrate with your backend M-Pesa Daraja API. No demo or mock data - this is the real implementation.

## 📁 Component Structure

```
frontend/src/components/payments/
├── MpesaPaymentModal.tsx      # Real payment modal with M-Pesa integration
├── PaymentButton.tsx          # Reusable payment buttons
├── PaymentIntegration.tsx     # Complete payment flow integration
└── index.ts                   # Component exports
```

## 🔧 Core Components

### 1. MpesaPaymentModal

The main payment modal that handles the complete M-Pesa payment flow:

```tsx
import { MpesaPaymentModal } from '../components/payments';

<MpesaPaymentModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  itemType="resume"
  itemId={123}
  itemName="Professional Resume"
  amount={500}
  onPaymentSuccess={(paymentData) => {
    // Handle successful payment
    console.log('Payment successful:', paymentData);
  }}
/>
```

**Features:**
- Real M-Pesa API integration
- Phone number validation and formatting
- Payment status polling
- Error handling and user feedback
- Automatic payment verification

### 2. PaymentButton

Reusable payment buttons for different content types:

```tsx
import { PaymentButton } from '../components/payments';

// Basic payment button
<PaymentButton
  itemType="resume"
  itemId={123}
  itemName="Professional Resume"
  amount={500}
  onPaymentSuccess={handlePaymentSuccess}
/>

// Specialized buttons
<ResumePaymentButton
  resumeId={123}
  resumeName="Professional Resume"
  amount={500}
  onPaymentSuccess={handlePaymentSuccess}
/>

<CoverLetterPaymentButton
  coverLetterId={456}
  coverLetterName="Executive Cover Letter"
  amount={300}
  onPaymentSuccess={handlePaymentSuccess}
/>

<PremiumUpgradeButton
  userId={789}
  amount={1500}
  onPaymentSuccess={handlePaymentSuccess}
/>
```

### 3. PaymentIntegration

Complete payment flow integration that handles access control:

```tsx
import { PaymentIntegration } from '../components/payments';

<PaymentIntegration
  itemType="resume"
  itemId={123}
  itemName="Professional Resume"
  amount={500}
  userId={currentUserId}
  onDownload={handleDownload}
/>
```

**Features:**
- Automatic payment status checking
- Access control based on payment status
- Seamless download after payment
- User experience optimization

## 🎯 Usage Examples

### Resume Download with Payment

```tsx
import { ResumePaymentIntegration } from '../components/payments';

const ResumePage = () => {
  const handleDownload = async () => {
    try {
      // Your download logic here
      const response = await downloadResume(resumeId);
      // Handle successful download
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="resume-page">
      <h1>Professional Resume</h1>
      <p>High-quality resume template for job applications</p>
      
      <ResumePaymentIntegration
        resumeId={resumeId}
        resumeName="Professional Resume"
        amount={500}
        userId={currentUserId}
        onDownload={handleDownload}
      />
    </div>
  );
};
```

### Cover Letter with Payment

```tsx
import { CoverLetterPaymentIntegration } from '../components/payments';

const CoverLetterPage = () => {
  const handleDownload = async () => {
    try {
      const response = await downloadCoverLetter(coverLetterId);
      // Handle successful download
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="cover-letter-page">
      <h1>Executive Cover Letter</h1>
      <p>Professional cover letter template</p>
      
      <CoverLetterPaymentIntegration
        coverLetterId={coverLetterId}
        coverLetterName="Executive Cover Letter"
        amount={300}
        userId={currentUserId}
        onDownload={handleDownload}
      />
    </div>
  );
};
```

### Premium Upgrade

```tsx
import { PremiumUpgradeIntegration } from '../components/payments';

const PremiumPage = () => {
  const handleUpgrade = async () => {
    try {
      // Update user to premium
      await updateUserToPremium(userId);
      // Redirect or show success message
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  return (
    <div className="premium-page">
      <h1>Upgrade to Premium</h1>
      <p>Get access to all premium features</p>
      
      <PremiumUpgradeIntegration
        userId={currentUserId}
        amount={1500}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
};
```

## 🔒 Payment Flow

1. **User clicks payment button**
2. **Payment modal opens** with item details and amount
3. **User enters phone number** (auto-formatted for M-Pesa)
4. **Payment initiated** via M-Pesa STK Push
5. **User receives M-Pesa prompt** on their phone
6. **Payment completed** on M-Pesa
7. **Backend callback** processes the payment
8. **Frontend polls** for payment status
9. **Access granted** automatically
10. **Download/upgrade** proceeds

## 📱 Phone Number Handling

The system automatically formats phone numbers for M-Pesa:

- `0712345678` → `254712345678`
- `+254712345678` → `254712345678`
- `254712345678` → `254712345678`

## 🎨 Styling and Theming

All components use Tailwind CSS and are fully responsive. You can customize:

```tsx
<PaymentButton
  variant="primary"        // primary, secondary, outline
  size="lg"               // sm, md, lg
  className="custom-class" // Additional CSS classes
  showPrice={true}        // Show/hide price in button text
/>
```

## 🚨 Error Handling

The system handles various error scenarios:

- **Invalid phone numbers** - User-friendly validation messages
- **Payment failures** - Clear error messages with retry options
- **Network issues** - Graceful fallbacks and user guidance
- **Timeout scenarios** - Automatic cleanup and user notification

## 🔧 Configuration

### Environment Variables

Ensure these are set in your frontend:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_MPESA_ENVIRONMENT=sandbox
```

### Backend Integration

The frontend expects these backend endpoints:

- `POST /api/payments/initiate` - Initiate M-Pesa payment
- `GET /api/payments/verify/{checkout_request_id}` - Verify payment status
- `GET /api/payments/history` - Get payment history
- `GET /api/admin/stats` - Get payment statistics (admin)
- `GET /api/admin/payments` - Get all payments (admin)

## 📊 Admin Features

For administrators, the system provides:

- **Payment Management** - View and manage all payments
- **Analytics Dashboard** - Revenue and payment statistics
- **Export Functionality** - CSV export of payment data
- **Filtering and Search** - Advanced payment filtering

## 🧪 Testing

To test the payment system:

1. **Use sandbox credentials** for M-Pesa testing
2. **Test phone numbers** with M-Pesa test accounts
3. **Verify payment flow** end-to-end
4. **Check error handling** with invalid inputs
5. **Test admin features** with admin user accounts

## 🚀 Production Deployment

When deploying to production:

1. **Update M-Pesa credentials** to production values
2. **Configure callback URLs** for production domain
3. **Set up SSL certificates** for secure payment processing
4. **Monitor payment logs** for any issues
5. **Test with real M-Pesa accounts** before going live

## 📞 Support

For issues or questions:

1. Check the backend logs for M-Pesa API responses
2. Verify phone number formatting
3. Ensure backend endpoints are accessible
4. Check M-Pesa credentials and environment settings

## 🔄 Updates and Maintenance

The system is designed for easy maintenance:

- **Modular components** for easy updates
- **TypeScript interfaces** for type safety
- **Comprehensive error handling** for debugging
- **Responsive design** for all devices

---

**This is a production-ready M-Pesa integration. No demo data or mock payments - everything connects to real M-Pesa APIs and processes real transactions.**
















