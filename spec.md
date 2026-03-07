# फक्त अहिराणी

## Current State

Artist wallet (WalletPage.tsx) has a minimal withdrawal section inside the main "Wallet" tab. It only supports UPI ID as a payment method. It collects Full Name, UPI ID, and Amount. There is no Bank Transfer option for Artists.

The Viewer wallet already has a full withdrawal form with UPI, Paytm, and Bank Transfer options (in `ViewerPointsDashboard`).

Admin panel (AdminPage.tsx) has a withdrawals tab that shows all requests and allows approve/reject/mark-paid actions -- this already works for all roles.

## Requested Changes (Diff)

### Add
- Bank Transfer payment method for Artist withdrawal form (alongside existing UPI)
- Bank Transfer fields: Account Holder Name, Bank Name, Account Number, IFSC Code
- Payment method toggle (UPI / Bank Transfer) in Artist withdrawal section
- Artist withdrawal history section showing past requests with status badges

### Modify
- Artist withdrawal form: replace the simple UPI-only form with a full form that has:
  - Payment method selector: UPI | Bank Transfer (2 options, no Paytm)
  - Full Name field (always shown)
  - UPI ID field (shown when UPI selected)
  - Bank fields: Account Holder Name, Bank Name, Account Number, IFSC Code (shown when Bank Transfer selected)
  - Amount field (minimum ₹500 for artists)
- The withdrawal form should be clearly placed in the Artist "Earnings" tab (already the `wallet.earnings_tab`)
- Update `handleWithdraw` in WalletPage for artists to support both methods and pass bank details to WithdrawalRequest

### Remove
- Nothing removed; existing Admin panel withdrawal management remains intact

## Implementation Plan

1. In `WalletPage.tsx`, update the artist withdrawal form (inside `TabsContent value="earnings"`) to:
   - Add a `paymentMethod` state (`"upi" | "bank"`)
   - Add state for: `bankName`, `bankAccount`, `bankIfsc`, `bankHolder`
   - Render a 2-option payment method selector (UPI / Bank Transfer)
   - Conditionally show UPI ID field OR Bank fields based on selected method
   - Update `handleWithdraw` for artists to build a `WithdrawalRequest` with `paymentMethod`, `bankAccountNumber`, `bankIfsc`, `bankAccountHolder`, and a new `bankName` field (add to `WithdrawalRequest` type)
   - Add minimum ₹500 validation for artists
   - Add a withdrawal history list below the form showing `myWithdrawals` with status badges

2. In `AppContext.tsx`, add optional `bankName?: string` field to `WithdrawalRequest` type for storing bank name.

3. In `AdminPage.tsx`, display `bankName` in the withdrawal detail row when present (alongside existing bank fields).
