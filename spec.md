# Ahirani Reels

## Current State

The app is a full-stack regional short-video platform with:

- **Auth**: Phone OTP login (dev OTP: 123456), role-based (viewer/artist/admin)
- **Feed**: Vertical reels feed with trending algorithm, long/premium tabs
- **Wallet**: Coins + pendingEarnings (₹), ad revenue split 60/40, daily bonus, lucky spin
- **Earnings tab**: Per-video ad impressions, gross/artist share display
- **Referral system**: ₹10 on signup + ₹60 subscription bonus for artist referrals; viewer referral requires 3 videos watched
- **Withdrawal system**: Request with UPI ID, 4 statuses (pending/approved/rejected/paid), min ₹500, admin controls approve/reject/mark-paid
- **Admin panel**: Hidden behind 5s logo long-press, email: admin@ahiranireels.com / ssm; manages users, videos, withdrawals, ads, RPM config, upload tab
- **Subscription**: ₹600/year artist subscription required to upload; admin can grant manually
- **Notifications**: In-app bell for likes, comments, follows, referral rewards, withdrawal approvals
- **Search**: Dedicated search page with creator/hashtag results + follow buttons
- **Leaderboard**: Top creators/referrers/earners
- **Ads**: Local ads (₹300/day), Google/Meta placeholder slots, pre-roll, banner, rewarded

**Wallet limitations (current)**:
- No dedicated "Total earnings" breakdown card showing ad revenue vs referral vs bonus separately
- No "Name" field on withdrawal requests (only UPI ID)
- Minimum withdrawal is ₹500; user requested ₹200
- Withdrawal form missing "Name" field
- No referral history table with referred user / date / amount columns clearly visible
- No fraud protection indicators in UI
- Notification types don't include "withdrawal requested" or "payment sent"
- Admin stats don't prominently show total earnings, total withdrawals side-by-side

## Requested Changes (Diff)

### Add

- **Wallet dashboard summary card** showing 5 distinct rows: Total Earnings, Referral Earnings, Ad Revenue Earnings, Pending Withdrawal, Withdrawn Amount
- **"Name" field** on withdrawal request form (store on WithdrawalRequest type)
- **Minimum withdrawal changed from ₹500 → ₹200**
- **Referral history table** with columns: Referred User, Date, Amount Earned (already partially exists, refine into clear table layout)
- **Notification types**: add `withdrawal_requested` and `withdrawal_paid` (payment sent) to notification system
- **Admin: send notification when withdrawal is requested** (currently only on approve)
- **Admin stats panel**: prominent 4-stat bar — Total Users, Total Videos, Total Earnings, Total Withdrawals
- **Fraud protection section in admin**: device/duplicate referral detection info panel
- **OTT-ready backend fields**: already present; confirm contentType, seriesId, episodeNumber, isPaid, streamingUrl on Video type

### Modify

- **WithdrawalRequest type**: add `userName: string` field
- **Withdrawal form**: add Name input field above UPI ID
- **Minimum withdrawal**: change ₹500 → ₹200 throughout all validation, labels, and hints
- **Wallet hero card**: replace single pending balance with 5-line earnings summary
- **Referral dashboard**: convert activity list into a clear table with Referred User, Date, Amount Earned columns
- **Notification reducer**: add cases for `withdrawal_requested` (sent to admin) and `withdrawal_paid` (sent to user)
- **Admin Withdrawals tab**: on approve/reject show user Name alongside UPI ID; on REQUEST_WITHDRAWAL dispatch, add admin notification
- **Admin overview stats**: make Total Earnings and Total Withdrawals more prominent

### Remove

- Nothing removed; all existing features preserved

## Implementation Plan

1. **AppContext.tsx** — Update `WithdrawalRequest` to add `userName` field; change MIN_WITHDRAWAL constant to 200; add `withdrawal_requested` and `withdrawal_paid` notification types; update `REQUEST_WITHDRAWAL` reducer to send admin notification; update `MARK_PAID` reducer to send user "payment sent" notification
2. **WalletPage.tsx** — Add 5-line earnings summary card at top of Wallet tab; add Name input to withdrawal form; change ₹500 min → ₹200; refactor referral activity list into a clean table with Referred User / Date / Amount columns
3. **AdminPage.tsx** — Show userName in withdrawals table; add prominent 4-stat overview cards at top; add fraud protection info panel in Users or a new Security tab
4. **Backend main.mo** — Upgrade to full monetized backend with wallet, earnings, referral, withdrawal, fraud protection, and OTT-ready structure
