// admob-config.ts
// Replace placeholder values with real AdMob unit IDs when going live.

export const AD_ENABLED = true; // Set to false to hide all ads globally

export const ADMOB_SLOTS = {
  BANNER: "ca-app-pub-XXXXXXXXXXXXXXXX/1000000001", // Feed banner
  INTERSTITIAL: "ca-app-pub-XXXXXXXXXXXXXXXX/1000000002", // Feed interstitial
  REWARDED: "ca-app-pub-XXXXXXXXXXXXXXXX/1000000003", // Wallet rewarded
} as const;

export const REWARDED_AD_COINS = 5; // coins awarded per rewarded ad watch
