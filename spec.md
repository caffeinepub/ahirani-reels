# फक्त अहिराणी — Complete Earning System Upgrade

## Current State

The app already has:
- `coins` field on User, `ADD_COINS` reducer action
- `pendingEarnings` (₹ wallet), withdrawal system with UPI/Paytm/bank transfer
- Daily login bonus (CLAIM_DAILY_BONUS) and lucky spin wheel in Wallet > Rewards tab
- Referral system: ₹10 on join (as coins), ₹60 subscription bonus (as pendingEarnings)
- Notification system (follow, like, comment, referral_reward, withdrawal_approved, withdrawal_requested, withdrawal_paid)
- LeaderboardPage with Top Creators (by likes), Top Referrers, Top Earners
- Admin withdrawal approval (pending → approved → paid / rejected)
- Watch reward: 10 videos = 2 points (tracked as `watchedVideosToday`, resets daily)
- Transaction types: ad_earnings, referral_credit, withdrawal_*, subscription_payment, daily_bonus, spin_reward, watch_reward
- Follow/unfollow system, like/unlike, comments
- Artist subscription ₹600/year gating for uploads

## Requested Changes (Diff)

### Add

1. **Daily Tasks Section** — A new "Daily Tasks" card/section (in Wallet or as separate tab) showing 4 tasks with daily-reset progress:
   - Watch 5 videos → earn 2 coins (currently: 10 videos = 2 points; change to 5 videos = 2 coins per task spec)
   - Like 3 videos → earn 1 coin (new task)
   - Follow 1 artist → earn 1 coin (new task)
   - Share 1 video → earn 1 coin (new task)
   - Each task completable only once per day; checkmark when done

2. **Coin Balance in Wallet** — Prominent coin display (coin icon + balance) in the Wallet page header/overview. Conversion rate label: "100 coins = ₹10"

3. **Daily task tracking fields on User**:
   - `dailyTasksDate: string` — date string for daily reset
   - `taskWatchDone: boolean` — watch 5 videos completed today
   - `taskLikeDone: boolean` — liked 3 videos completed today
   - `taskFollowDone: boolean` — followed 1 artist completed today
   - `taskShareDone: boolean` — shared 1 video completed today
   - `dailyLikeCount: number` — likes done today (for task tracking)
   - `dailyFollowCount: number` — follows done today
   - `dailyShareCount: number` — shares done today
   - `dailyWatchCount: number` — videos watched today (separate from watchedVideosToday, for 5-video task)

4. **Referral earning update** — Referral join reward should also credit ₹10 to `pendingEarnings` (in addition to or replacing coins), and explicitly show ₹60 if referred user subscribes.

5. **Leaderboard upgrade** — Update Top Creators leaderboard to rank by: views + likes + followers (composite score). Add "Followers" column to the creators leaderboard. Already has views/likes columns.

6. **Notification for daily task completion** — When a daily task is completed, fire a toast notification.

### Modify

1. **Watch task threshold**: Currently 10 videos = 2 points. Change watch task to 5 videos = 2 coins (daily task).
2. **LIKE_VIDEO reducer**: When user likes a video, increment `dailyLikeCount`. If it reaches 3 and task not done, award 1 coin and mark `taskLikeDone`.
3. **FOLLOW reducer**: When user follows someone, increment `dailyFollowCount`. If it reaches 1 and task not done, award 1 coin and mark `taskFollowDone`.
4. **SHARE_VIDEO_BOOST**: When user shares a video, increment `dailyShareCount`. If reaches 1 and task not done, award 1 coin and mark `taskShareDone`.
5. **TRACK_VIEW/TRACK_SEEN**: Use `dailyWatchCount` for 5-video watch task (separate from the 10-video points system).
6. **LeaderboardPage**: Update creators tab to sort by composite score (views + likes + followers) and show followers column.
7. **WalletPage**: Add coin balance card/section prominently showing coin count, conversion rate, and coins-to-rupees value.
8. **Withdrawal minimum**: Currently ₹200 in some places, ₹500 in others — standardize to ₹200 everywhere as per spec.
9. **AppContext User type**: Add daily task tracking fields with migration defaults.
10. **Transaction types**: Add `task_reward` type for task coin rewards.

### Remove

- Nothing removed. All existing features preserved.

## Implementation Plan

1. **AppContext.tsx**:
   - Add `dailyTasksDate`, `taskWatchDone`, `taskLikeDone`, `taskFollowDone`, `taskShareDone`, `dailyLikeCount`, `dailyFollowCount`, `dailyShareCount`, `dailyWatchCount` to User interface
   - Add `task_reward` to Transaction txType union
   - Add `COMPLETE_TASK` action or fold task logic into existing LIKE_VIDEO, FOLLOW, SHARE_VIDEO_BOOST, TRACK_VIEW
   - Modify LIKE_VIDEO: reset daily counts if new day, increment dailyLikeCount, award 1 coin + mark done when reaches 3
   - Modify FOLLOW: increment dailyFollowCount, award 1 coin when first follow of day
   - Modify SHARE_VIDEO_BOOST: increment dailyShareCount, award 1 coin when first share of day
   - Modify TRACK_VIEW: use dailyWatchCount for 5-video task (separate track), award 2 coins when reaches 5
   - Add migration defaults for new fields in getInitialState
   - Seed users updated with new fields

2. **WalletPage.tsx**:
   - Add coin balance section: coin icon, balance number, "100 coins = ₹10" conversion label, coins-in-rupees value
   - Add Daily Tasks card (new component `DailyTasksCard`) showing 4 tasks with progress and checkmarks
   - Place Daily Tasks and coin balance in the main wallet view (or a new "Tasks" tab)

3. **LeaderboardPage.tsx**:
   - Update Top Creators sort to composite: `totalLikes + totalViews + followers`
   - Add Followers column to creators leaderboard row
   - Adjust grid layout to accommodate new column

4. **Notification toasts for task completion**: Fire toast when each task is completed (in reducers or in UI components).
