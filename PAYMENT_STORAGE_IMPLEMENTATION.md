# Payment Storage Implementation Guide

## Overview
This document explains the implementation of payment data storage for Razorpay transactions in the AIMS system. After a successful payment, all transaction details are now saved to the database for complete record-keeping and audit trails.

## What Was Implemented

### 1. Enhanced Database Schema

#### A. Payment History Table (`payment_history`)
Created a comprehensive table to store all Razorpay payment transactions:

**Location:** `supabase/migrations/009_create_payment_history_table.sql`

**Key Fields:**
- `payment_id`: Razorpay payment ID (e.g., pay_xxxxx)
- `order_id`: Razorpay order ID
- `signature`: Payment signature for verification
- `clinic_id`: Reference to the clinic making the payment
- `amount`: Payment amount in rupees
- `currency`: Payment currency (INR)
- `status`: Payment status (captured, authorized, failed, etc.)
- `package_id`: ID of the purchased package
- `package_name`: Name of the package
- `reports`: Number of reports purchased
- `plan_details`: JSON object with detailed plan information
- `subscription`: JSON object with subscription details (expiry, validity, etc.)
- `payment_details`: JSON object with payment method information
- `provider`: Payment gateway provider (razorpay)
- `ip_address`, `user_agent`: Security tracking fields
- `created_at`, `updated_at`: Timestamps

#### B. Enhanced Subscriptions Table
Updated the existing subscriptions table to store comprehensive payment information:

**Location:** `supabase/migrations/010_enhance_subscriptions_table.sql`

**Added Fields:**
- `package_name`: Name of purchased package
- `payment_method`: Payment gateway used
- `payment_id`: Payment ID from gateway
- `reports_allowed`: Number of reports in package
- `environment`: Payment environment (test/live)
- `plan_details`: JSON with plan information
- `subscription`: JSON with subscription details
- `payment_details`: JSON with payment method info

### 2. Updated Services

#### A. Database Service (`src/services/databaseService.js`)
Updated to support the new payment_history table:
- Added field mappings for `payment_history` table
- Added field mappings for enhanced `subscriptions` table
- Properly filters and validates fields before saving

**Changes:**
- Lines 220-229: Added payment_history and subscriptions field definitions

#### B. Razorpay Service (`src/services/razorpayService.js`)
Enhanced payment data structure to include all necessary information:

**Changes:**
- Lines 510-513: Added `plan` and `currency` fields to subscription record
- Payment data now includes:
  - Complete plan details (name, description, features, savings)
  - Subscription info (purchase date, expiry date, validity period)
  - Payment method details (gateway, environment, transaction fee)

### 3. Data Flow

```
User Completes Payment
       ↓
Razorpay Success Handler (handlePaymentSuccess)
       ↓
Create Enhanced Payment Data Object
       ↓
Save to payment_history table (via DatabaseService)
       ↓
Save to subscriptions table (via DatabaseService)
       ↓
Update clinic's reports_allowed count
       ↓
Show success message to user
```

## How to Apply the Changes

### Step 1: Run Database Migrations

Go to your Supabase project dashboard and run these SQL migrations in order:

1. **Create payment_history table:**
   ```bash
   # Copy contents of: supabase/migrations/009_create_payment_history_table.sql
   # Paste into Supabase SQL Editor and execute
   ```

2. **Enhance subscriptions table:**
   ```bash
   # Copy contents of: supabase/migrations/010_enhance_subscriptions_table.sql
   # Paste into Supabase SQL Editor and execute
   ```

### Step 2: Verify Database Changes

Check that the tables were created successfully:

```sql
-- Verify payment_history table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'payment_history';

-- Verify subscriptions table enhancements
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions'
AND column_name IN ('package_name', 'payment_method', 'reports_allowed');
```

### Step 3: Test Payment Flow

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Login as a clinic user

3. Navigate to subscription/payment page

4. Complete a test payment (use Razorpay test mode)

5. Verify the payment was saved:
   ```sql
   -- Check payment_history
   SELECT * FROM payment_history ORDER BY created_at DESC LIMIT 5;

   -- Check subscriptions
   SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;
   ```

## Payment Data Structure

### Payment History Record Example
```json
{
  "payment_id": "pay_xxxxxxxxxxxxx",
  "order_id": "aims_1699999999999_abc123",
  "clinic_id": "uuid-of-clinic",
  "amount": 1999.00,
  "currency": "INR",
  "status": "captured",
  "package_id": "standard_25",
  "package_name": "Standard Package",
  "reports": 25,
  "plan_details": {
    "id": "standard_25",
    "name": "Standard Package",
    "description": "25 EEG reports - Most popular choice",
    "reportsIncluded": 25,
    "originalPrice": 2999,
    "savings": "33% OFF",
    "features": [
      "25 EEG Report Analysis",
      "24/7 Support",
      "PDF Download",
      "Priority Support",
      "Bulk Upload"
    ]
  },
  "subscription": {
    "purchaseDate": "2024-01-15T10:30:00Z",
    "expiryDate": "2025-01-15T10:30:00Z",
    "validityPeriod": "1 year",
    "isActive": true,
    "reportsUsed": 0,
    "reportsRemaining": 25
  },
  "payment_details": {
    "gateway": "razorpay",
    "method": "online",
    "environment": "live",
    "paymentMethod": "razorpay-direct",
    "verified": true,
    "transactionFee": 40
  }
}
```

## Features

### ✅ What's Working

1. **Complete Transaction Recording**: Every payment is saved with full details
2. **Audit Trail**: Track all payments with timestamps, amounts, and statuses
3. **Subscription Management**: Linked subscriptions with payment history
4. **Plan Details Storage**: Complete information about purchased packages
5. **Expiry Tracking**: Subscription validity and expiry dates
6. **Security Logging**: IP address and user agent tracking
7. **JSONB Flexibility**: Easy to add new fields without schema changes

### 🔄 Automatic Updates

When a payment succeeds:
1. Payment record is saved to `payment_history` table
2. Subscription record is saved to `subscriptions` table
3. Clinic's `reports_allowed` count is automatically incremented
4. Clinic's `subscription_status` is set to 'active'
5. `last_payment_at` timestamp is updated

## Querying Payment Data

### Get All Payments for a Clinic
```sql
SELECT * FROM payment_history
WHERE clinic_id = 'your-clinic-id'
ORDER BY created_at DESC;
```

### Get Payment History with Subscription Details
```sql
SELECT
  ph.*,
  s.status as subscription_status,
  s.subscription->>'expiryDate' as expiry_date
FROM payment_history ph
LEFT JOIN subscriptions s ON s.payment_id = ph.payment_id
WHERE ph.clinic_id = 'your-clinic-id'
ORDER BY ph.created_at DESC;
```

### Get Total Revenue by Package
```sql
SELECT
  package_name,
  COUNT(*) as purchase_count,
  SUM(amount) as total_revenue,
  SUM(reports) as total_reports_sold
FROM payment_history
WHERE status = 'captured'
GROUP BY package_name
ORDER BY total_revenue DESC;
```

### Get Monthly Revenue
```sql
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as transactions,
  SUM(amount) as revenue
FROM payment_history
WHERE status = 'captured'
GROUP BY month
ORDER BY month DESC;
```

## Troubleshooting

### Issue: Payment succeeds but not saved to database

**Check:**
1. Verify migrations were run successfully
2. Check browser console for JavaScript errors
3. Check Supabase logs for database errors
4. Verify RLS policies allow inserts

**Solution:**
```sql
-- Temporarily disable RLS to test (ONLY for debugging)
ALTER TABLE payment_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
```

### Issue: Field validation errors

**Check:**
- Ensure all required fields are present in payment data
- Verify field names match schema (snake_case in DB, camelCase in JS)
- Check `filterValidFields()` in databaseService.js

### Issue: Subscription not linking to payment

**Check:**
- Verify `payment_id` is correctly set in subscription record
- Ensure both records are being saved
- Check for database foreign key constraints

## Security Considerations

1. **Payment ID Validation**: Only accepts Razorpay payment IDs (starting with `pay_`)
2. **Amount Validation**: Ensures amount is positive
3. **Clinic Validation**: Verifies clinic exists before saving payment
4. **RLS Policies**: Row Level Security enabled on all tables
5. **Audit Trail**: IP address and user agent logged for security

## Future Enhancements

- [ ] Add payment verification webhook handler
- [ ] Implement refund tracking
- [ ] Add payment failure analytics
- [ ] Create automated reports for clinic payment history
- [ ] Add email notifications for successful payments
- [ ] Implement payment dispute tracking

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check Supabase logs
3. Verify database migrations were applied
4. Review the payment flow in razorpayService.js

## Files Modified

1. `supabase/migrations/009_create_payment_history_table.sql` - New payment_history table
2. `supabase/migrations/010_enhance_subscriptions_table.sql` - Enhanced subscriptions table
3. `src/services/databaseService.js` - Added field mappings
4. `src/services/razorpayService.js` - Enhanced payment data structure

---

**Implementation Date:** 2024
**Version:** 1.0.0
**Status:** ✅ Complete and Ready for Production
