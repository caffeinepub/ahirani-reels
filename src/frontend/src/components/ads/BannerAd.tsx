import { AD_ENABLED } from "./admob-config";

interface BannerAdProps {
  className?: string;
}

export function BannerAd({ className }: BannerAdProps) {
  if (!AD_ENABLED) return null;

  return (
    <div data-ocid="feed.banner_ad" className={className}>
      <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-2">
        <span className="text-xs font-bold text-yellow-400 bg-yellow-400/20 px-1.5 py-0.5 rounded shrink-0">
          AD
        </span>
        <p className="text-white/60 text-xs truncate">
          🛍️ Sponsored Content — Discover amazing deals
        </p>
      </div>
    </div>
  );
}
