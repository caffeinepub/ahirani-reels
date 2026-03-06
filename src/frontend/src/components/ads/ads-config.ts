// ads-config.ts
// Single source of truth for all ad configuration.
// Replace placeholder IDs with real credentials when going live.

export const AD_ENABLED = true; // Master toggle: false = no ads shown anywhere

// ─── Local Ads ─────────────────────────────────────────────────────────────
export const LOCAL_AD_RATE_PER_DAY = 300; // ₹300 per day

// ─── Google Ads (AdSense / AdMob) ──────────────────────────────────────────
// Replace with real unit IDs from your Google AdMob account
export const GOOGLE_AD_SLOTS = {
  BANNER: "ca-app-pub-XXXXXXXXXXXXXXXX/1000000001",
  INTERSTITIAL: "ca-app-pub-XXXXXXXXXXXXXXXX/1000000002",
  REWARDED: "ca-app-pub-XXXXXXXXXXXXXXXX/1000000003",
  PRE_ROLL: "ca-app-pub-XXXXXXXXXXXXXXXX/1000000004",
} as const;

// ─── Meta Ads (Audience Network) ──────────────────────────────────────────
// Replace with real placement IDs from your Meta Audience Network account
export const META_AD_SLOTS = {
  BANNER: "YOUR_META_APP_ID_123456789_BANNER",
  INTERSTITIAL: "YOUR_META_APP_ID_123456789_INTERSTITIAL",
  PRE_ROLL: "YOUR_META_APP_ID_123456789_PRE_ROLL",
} as const;

export const REWARDED_AD_COINS = 5;
