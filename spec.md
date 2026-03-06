# फक्त अहिराणी

## Current State

The app has partial follow infrastructure:
- `followingIds` array in AppState, `FOLLOW` / `UNFOLLOW` reducer cases fully implemented
- `useIsFollowing(targetUserId)` hook exists
- Reel cards have an icon-only follow button (small +/checkmark icon on avatar) with no text label
- ProfilePage already shows Followers / Following / Likes stats row
- ArtistSearchSheet shows follow buttons on search result cards
- No "Following Feed" tab in FeedPage
- No explicit "Follow" / "Following" labeled button on artist profiles or standalone profile views
- `getTrendingFeed` already accepts `followingIds` and boosts those videos (+30 score)

## Requested Changes (Diff)

### Add
- **Following Feed tab** in FeedPage: a 4th tab "Following" that shows only reels from artists the current user follows, using the existing `followingIds` state
- **Follow/Unfollow button on artist profile** when viewing another user's profile (a dedicated profile view accessible from tapping an artist's username anywhere in the feed)
- **ArtistProfileSheet** component: a bottom sheet showing an artist's full profile (avatar, username, bio, Followers/Following/Likes stats, Follow/Following button, their uploaded videos grid)

### Modify
- **FeedPage tab bar**: add a 4th "Following" tab after "Premium"
- **ReelCard bottom overlay**: make the `@username` text tappable to open the ArtistProfileSheet
- **VideoCard** (Long/Premium): make uploader username tappable to open ArtistProfileSheet
- **ArtistSearchSheet**: ensure Follow button is visible and correctly labeled "Follow" / "Following"
- **ReelCard follow button**: upgrade from icon-only to a small labeled pill ("Follow" / "Following") for clarity, or keep icon but ensure it works correctly (already works — keep as is, just ensure consistency)

### Remove
- Nothing removed

## Implementation Plan

1. Create `ArtistProfileSheet.tsx` component:
   - Bottom sheet (90dvh) triggered by tapping uploader name
   - Shows: avatar, username, bio, role badge, creator badge
   - Stats row: Followers count, Following count, Likes count
   - Follow / Following button (if not viewing own profile)
   - Grid of their uploaded videos (same 2-col grid as ProfilePage)

2. Update `FeedPage.tsx`:
   - Add `"following"` to the `FeedTab` type
   - Add "Following" tab button to the tab bar
   - Compute `followingFeed`: videos from artists in `followingIds`, sorted by recency
   - Render a `VideoListFeed`-style or reel-scroll for the Following tab
   - Show empty state: "Follow artists to see their videos here"
   - Make `@username` in ReelCard bottom overlay tappable → opens ArtistProfileSheet
   - Make uploader name in VideoCard tappable → opens ArtistProfileSheet

3. Follow button on reel cards: already exists as icon — add a text label beneath or convert to a small pill button for clearer UX ("Follow" text)

4. Ensure all follow/unfollow interactions update `followingIds`, `followers` count on the target user, and `following` count on the current user (already handled by reducer — just wire correctly)
