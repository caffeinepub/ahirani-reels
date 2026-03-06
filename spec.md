# फक्त अहिराणी

## Current State
- Privacy Policy page exists at `/privacy` (public, bilingual EN + मराठी)
- App.tsx has `/privacy` route bypassing auth guard
- AuthPage footer has Privacy Policy link
- ProfilePage footer has Privacy Policy link
- No Terms & Conditions page exists

## Requested Changes (Diff)

### Add
- `TermsPage.tsx` at `/terms` — bilingual English + मराठी, public route, same design language as PrivacyPolicyPage
- Sections: Introduction, Rules for Artists, Prohibited Content, Admin Rights, Withdrawal Policy, Fraud & Fake Accounts, Changes to Terms, Contact
- Contact email: support@faktahirani.app
- Terms & Conditions link in AuthPage footer (alongside existing Privacy Policy link)
- Terms & Conditions link in ProfilePage footer (alongside existing Privacy Policy link)

### Modify
- `App.tsx` — add `/terms` route, add `/terms` to the auth bypass condition
- `AuthPage.tsx` footer — add Terms & Conditions link (EN + मराठी) next to Privacy Policy
- `ProfilePage.tsx` footer — add Terms & Conditions link (EN + मराठी) next to Privacy Policy

### Remove
- Nothing

## Implementation Plan
1. Create `src/frontend/src/pages/TermsPage.tsx` with full bilingual content (8 sections, contact card)
2. Update `App.tsx`: import TermsPage, create `/terms` route, add `/terms` to auth bypass list
3. Update `AuthPage.tsx` footer: add Terms & Conditions link to `/terms`
4. Update `ProfilePage.tsx` footer: add Terms & Conditions link alongside Privacy Policy
