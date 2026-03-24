# फक्त अहिराणी

## Current State
Admin payment settings (UPI/Bank details) are stored in `localStorage` under key `adminPaymentSettings`. This is device-local, so when admin saves payment info on their device, users on other devices cannot see it. The subscription modal in AuthPage and ProfilePage reads from `state.adminPaymentSettings`, which is null for all non-admin users.

No app update notification exists -- users don't know when a new version is deployed.

## Requested Changes (Diff)

### Add
- Backend functions: `setAdminPaymentSettings(json: text)` and `getAdminPaymentSettings()` to store admin payment details in Motoko canister (shared across all users)
- App update notification: PWA service worker update detection banner ("नवीन अपडेट उपलब्ध आहे - Refresh करा" with a button to reload)

### Modify
- AdminPage Settings tab: when admin saves payment info, call `actor.setAdminPaymentSettings(JSON.stringify(settings))`
- AppContext initialization: call `actor.getAdminPaymentSettings()` on app load, parse and store in state. All users will then see admin's payment info.
- AuthPage subscription modal and ProfilePage subscription section: already use `state.adminPaymentSettings` -- will work once context is populated from backend

### Remove
- Reliance on localStorage-only for adminPaymentSettings (keep localStorage as fallback/cache)

## Implementation Plan
1. Generate Motoko backend with new admin settings storage functions
2. Update AppContext to fetch adminPaymentSettings from backend on init
3. Update AdminPage to save payment settings to backend
4. Add PWA service worker update detection and banner UI
