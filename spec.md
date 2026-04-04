# फक्त अहिराणी

## Current State
- App is live with full reel feed, artist/viewer roles, subscription system, admin panel
- Manifest has `"purpose":"any maskable"` combined string which causes 4 icons to appear on install
- Premium locked overlay button redirects to `/upload` instead of showing payment modal
- `getTrendingFeed` includes ALL video types (reel, long, premium) without filtering by subscription
- Artists without active subscription can currently browse premium videos in the feed
- Viewers see premium locked videos but clicking subscribe shows wrong action

## Requested Changes (Diff)

### Add
- Payment modal in FeedPage premium lock overlay: when viewer/unsubscribed artist taps "Subscribe करा ₹600" on a locked video, show inline payment modal with admin UPI/bank details and UTR input (same as ProfilePage payment modal)

### Modify
- `manifest.json`: Change `"purpose":"any maskable"` to two separate icon entries: one with `"purpose":"any"` and one with `"purpose":"maskable"` -- wait, this would create 2. Instead keep single entry with `"purpose":"any"` only to show 1 icon
- `FeedPage.tsx`: 
  - For artists WITHOUT active subscription: filter feed to only show `videoType === "reel"` or `videoType === "long"` videos (no premium)
  - For viewers: free videos (reel/long) always visible, premium locked with payment modal
  - Premium locked overlay button: open payment modal instead of redirecting to /upload
- Feed `getTrendingFeed` call: pre-filter to exclude premium videos for unsubscribed users before passing to feed

### Remove
- `window.location.href = "/upload"` from premium overlay button

## Implementation Plan
1. Fix manifest.json -- change `"purpose":"any maskable"` to `"purpose":"any"` (single string, no duplicate icons)
2. In FeedPage, add state for showSubscribeModal + selected video
3. In FeedPage, filter `feedRaw` to exclude premium videos when user has no active subscription
4. In FeedPage premium overlay button: call setShowSubscribeModal(true) instead of navigating to /upload
5. Add inline payment modal in FeedPage (reuse same pattern as ProfilePage SubscriptionCard modal)
6. Artists without subscription: also exclude premium from `longVideos` shown in Long tab (they can still see Long tab but not Premium tab content)
