# फक्त अहिराणी

## Current State

- `ads-config.ts` holds hardcoded AdMob/Meta Ad Unit IDs (BANNER, INTERSTITIAL, REWARDED, PRE_ROLL).
- Admin Panel has tabs: overview, users, videos, comments, withdrawals, upload, ads, live, reports, security.
- The "ads" tab currently shows local/business ad management (create local ads, manage active ones).
- No UI exists to update AdMob/Meta Ad Unit IDs without editing code files.
- AppContext manages all frontend state; backend (main.mo) stores local ads only.

## Requested Changes (Diff)

### Add
- A new "Ad Settings" sub-section inside the existing Admin Panel "ads" tab (or as a clearly separated card within it).
- Four editable fields for Google AdMob IDs: Banner, Interstitial, Rewarded, Pre-roll Video.
- Three editable fields for Meta Audience Network IDs: Banner, Interstitial, Pre-roll.
- A "Save" button that persists the IDs to AppContext state (adUnitIds).
- On app load, the ad components (BannerAd, InterstitialAd, RewardedAd, PreRollAd) read IDs from AppContext state instead of hardcoded ads-config.ts.
- A new `adUnitIds` field in AppContext AppState with default values seeded from `ads-config.ts`.
- A `SET_AD_UNIT_IDS` dispatch action in AppContext reducer.
- Success toast on save.

### Modify
- AdminPage.tsx: Add "Ad Settings" card in the "ads" tab with Google AdMob and Meta sections.
- AppContext.tsx: Add `adUnitIds` to state shape and reducer.
- BannerAd.tsx, InterstitialAd.tsx, RewardedAd.tsx, PreRollAd.tsx: Read IDs from AppContext `adUnitIds` instead of directly from ads-config.ts constants.

### Remove
- Nothing removed. ads-config.ts remains as the fallback/default source.

## Implementation Plan

1. Add `AdUnitIds` type and `adUnitIds` field to AppContext state, seeded from ads-config.ts defaults.
2. Add `SET_AD_UNIT_IDS` action to AppContext reducer.
3. Update ad components to use `useApp().state.adUnitIds` for their unit IDs.
4. In AdminPage.tsx "ads" tab, add a new "Ad Settings" card with labeled inputs for all 7 IDs (4 Google AdMob + 3 Meta), and a Save button that dispatches SET_AD_UNIT_IDS.
5. Show current saved IDs pre-filled in the inputs.
6. Add deterministic data-ocid markers to all inputs, selects, and buttons in the new card.
