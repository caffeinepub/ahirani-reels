# Ahirani Reels

## Current State
- Full TikTok-style short video app with feed, upload, profile, wallet, admin panel
- Videos have: id, uploaderId, url, caption, hashtags, likesCount, commentsCount, createdAt, isDeleted
- Wallet shows coins balance, referral system, ad rewards
- Admin panel has user/video management with block/delete
- No video type classification, no view count tracking, no earnings system

## Requested Changes (Diff)

### Add
- `videoType` field on Video: `"reel" | "long" | "premium"`
- `viewsCount` field on Video (unique views per user, incremented on markVideoSeen)
- `AdRPM` config object: per-type rates (Reel: $2, Long: $4, Premium: $8), admin-configurable
- Earnings calculation: `VideoEarn = (viewsCount × AdRPM) / 1000`
- `artistEarnings` (60%) and `adminEarnings` (40%) derived from VideoEarn
- `totalEarnings` field on User (cumulative artist share in USD)
- "Earnings" tab in WalletPage: per-video earnings breakdown, total payout, artist/admin split display
- Video type selector on UploadPage (Reel / Long / Premium chips)
- Video type badge on feed cards and admin video table
- Admin RPM config panel in AdminPage Overview tab (editable rates per type)
- Admin earnings overview: total platform revenue, admin 40% share, total paid to artists

### Modify
- `Video` type in AppContext: add `videoType`, `viewsCount`
- `User` type in AppContext: add `totalEarnings`
- `UPLOAD_VIDEO` action: include `videoType`, `viewsCount: 0`
- `TRACK_SEEN` action: also increment `viewsCount` on the video and recalculate artist earnings
- Mock seed videos: assign videoType values
- AdminPage Overview: add RPM config card and platform earnings card
- WalletPage: add "Earnings" tab alongside existing content

### Remove
- Nothing removed

## Implementation Plan
1. Add `AdRpmConfig` type and default RPM rates to AppContext; add to AppState
2. Add `SET_RPM` action to update RPM rates from admin
3. Extend `Video` type with `videoType` and `viewsCount`
4. Extend `User` type with `totalEarnings`
5. Update `TRACK_SEEN` reducer to increment viewsCount and update user totalEarnings
6. Update `UPLOAD_VIDEO` reducer to include new fields
7. Seed mock videos with videoType assignments
8. Update UploadPage: add 3-chip type selector (Reel / Long / Premium), pass videoType on submit
9. Update WalletPage: add "Earnings" tab with per-video table and total payout summary
10. Update AdminPage: add RPM config panel in Overview, add earnings stats card, show videoType badge in Videos table
11. Show videoType badge on feed video cards
