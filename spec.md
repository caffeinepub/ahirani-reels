# Ahirani Reels

## Current State
- `WithdrawalRequest` has `status: "pending" | "approved" | "rejected"` and a single `resolvedAt` timestamp.
- Admin can Approve or Reject pending withdrawals. No further state after approval.
- Both `WalletPage` and `AdminPage` have a `WithdrawalStatusBadge` showing 3 states (amber/green/red).
- Seed mock data (`MOCK_WITHDRAWALS`) uses only the 3 existing statuses.

## Requested Changes (Diff)

### Add
- `"paid"` as a 4th status on `WithdrawalRequest` (admin-only, set after `approved`)
- `processedAt` timestamp field on `WithdrawalRequest`:
  - Set when status transitions to `approved`
  - Updated again when status transitions to `paid`
- `MARK_PAID` action in the reducer: transitions `approved → paid`, updates `processedAt`
- "Mark as Paid" button in admin Withdrawals table for rows with `status === "approved"`
- Blue `Paid` badge in both `WalletPage` and `AdminPage` withdrawal status badges

### Modify
- `WithdrawalRequest` type: status union extended to include `"paid"`, rename `resolvedAt` → keep `resolvedAt` for backward compat but also add `processedAt` (set on approve, updated on paid)
- `WithdrawalStatusBadge` in both files: handle `"paid"` → blue style
- `APPROVE_WITHDRAWAL` reducer: also set `processedAt: Date.now()`
- Mock seed data: update `w1` (currently `approved`) to include `processedAt`
- Admin Withdrawals table action cell: show "Mark as Paid" for `approved` rows

### Remove
- Nothing removed

## Implementation Plan
1. Update `WithdrawalRequest` type in `AppContext.tsx`: add `"paid"` to status union, add `processedAt: number` field
2. Add `MARK_PAID` to the `Action` union in `AppContext.tsx`
3. Update `APPROVE_WITHDRAWAL` reducer case to set `processedAt: Date.now()`
4. Add `MARK_PAID` reducer case: set `status: "paid"`, update `processedAt: Date.now()`
5. Update `MOCK_WITHDRAWALS` seed: add `processedAt` to existing entries
6. Update `getInitialState` migration to hydrate `processedAt` field
7. Update `WithdrawalStatusBadge` in `WalletPage.tsx` to handle `"paid"` (blue)
8. Update `WithdrawalStatusBadge` in `AdminPage.tsx` to handle `"paid"` (blue)
9. Add `handleMarkPaid` in `AdminDashboard` and wire "Mark as Paid" button for `approved` rows
10. Import `Banknote` icon (or `CreditCard`) from lucide-react for the "Mark as Paid" button
