import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { LocalAd } from "../../context/AppContext";
import { useApp } from "../../context/AppContext";
import { AD_ENABLED } from "./ads-config";

interface PreRollAdProps {
  onComplete: () => void;
  ads: LocalAd[];
}

export function PreRollAd({ onComplete, ads }: PreRollAdProps) {
  const { state } = useApp();
  const adUnitIds = state.adUnitIds;
  const activeAds = ads.filter((a) => a.isActive);
  const [ad] = useState<LocalAd | null>(() => {
    if (activeAds.length === 0) return null;
    return activeAds[Math.floor(Math.random() * activeAds.length)];
  });

  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!AD_ENABLED) {
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setCanSkip(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    // Auto-close at 8s if user hasn't skipped
    autoCloseRef.current = setTimeout(() => {
      onComplete();
    }, 8000);

    return () => {
      clearInterval(interval);
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  }, [onComplete]);

  if (!AD_ENABLED) return null;

  const handleSkip = () => {
    if (!canSkip) return;
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    onComplete();
  };

  const adSource = ad ? "local" : Math.random() > 0.5 ? "google" : "meta";

  return (
    <AnimatePresence>
      <motion.div
        data-ocid="feed.preroll_ad.modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black flex flex-col"
      >
        {/* Ad badge top-right */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
          <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
            AD
          </span>
          {adSource === "google" && (
            <span className="bg-white/10 text-white/60 text-[9px] font-medium px-2 py-0.5 rounded-full border border-white/10">
              Google Ads · {adUnitIds.google.PRE_ROLL}
            </span>
          )}
          {adSource === "meta" && (
            <span className="bg-white/10 text-white/60 text-[9px] font-medium px-2 py-0.5 rounded-full border border-white/10">
              Meta Ads · {adUnitIds.meta.PRE_ROLL}
            </span>
          )}
          {adSource === "local" && (
            <span className="bg-white/10 text-white/60 text-[9px] font-medium px-2 py-0.5 rounded-full border border-white/10">
              Local Ad
            </span>
          )}
        </div>

        {/* Skip countdown top-left */}
        <div className="absolute top-4 left-4 z-20">
          {canSkip ? (
            <motion.button
              type="button"
              data-ocid="feed.preroll_ad.skip_button"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleSkip}
              className="flex items-center gap-1.5 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full hover:bg-white/90 active:scale-95 transition-all"
            >
              Skip Ad →
            </motion.button>
          ) : (
            <div className="flex items-center gap-1.5 bg-black/60 border border-white/20 text-white/70 text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
              <div
                className="relative w-4 h-4"
                style={{ transform: "rotate(-90deg)" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  role="img"
                  aria-label="Skip countdown"
                >
                  <title>Skip countdown</title>
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    fill="none"
                    stroke="oklch(1 0 0 / 0.2)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    fill="none"
                    stroke="oklch(0.85 0.18 60)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={`${((5 - countdown) / 5) * 37.7} 37.7`}
                    style={{ transition: "stroke-dasharray 1s linear" }}
                  />
                </svg>
              </div>
              Skip in {countdown}s
            </div>
          )}
        </div>

        {/* Ad content */}
        {ad ? (
          // Local ad
          <div className="flex-1 relative">
            <img
              src={ad.imageUrl}
              alt={ad.businessName}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, oklch(0 0 0 / 0.9) 0%, oklch(0 0 0 / 0.2) 50%, transparent 100%)",
              }}
            />
            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">
                Sponsored · Local Business
              </p>
              <p className="text-white font-bold text-2xl leading-tight mb-2">
                {ad.businessName}
              </p>
              <p className="text-white/80 text-base leading-relaxed mb-5">
                {ad.tagline}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  data-ocid="feed.preroll_ad.cta_button"
                  onClick={() => {
                    // In production: open ad.linkUrl
                  }}
                  className="bg-amber-500 text-black font-bold px-6 py-2.5 rounded-full text-sm active:scale-95 transition-transform"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Google / Meta placeholder
          <div
            className="flex-1 flex flex-col items-center justify-center gap-5 px-8"
            style={{
              background:
                "linear-gradient(160deg, oklch(0.12 0.03 260) 0%, oklch(0.06 0.01 240) 100%)",
            }}
          >
            {adSource === "google" ? (
              <>
                <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-4xl">
                  🔍
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-xl mb-1">
                    Google Ads
                  </p>
                  <p className="text-white/50 text-sm">Premium ad placement</p>
                  <p className="text-white/30 text-xs mt-2 font-mono">
                    Slot: {adUnitIds.google.PRE_ROLL}
                  </p>
                </div>
                <p className="text-white/30 text-xs text-center max-w-xs">
                  Replace the slot ID in{" "}
                  <span className="text-amber-400/70 font-mono">
                    ads-config.ts
                  </span>{" "}
                  to serve real Google ads
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-4xl">
                  📘
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-xl mb-1">Meta Ads</p>
                  <p className="text-white/50 text-sm">
                    Audience Network placement
                  </p>
                  <p className="text-white/30 text-xs mt-2 font-mono">
                    Slot: {adUnitIds.meta.PRE_ROLL}
                  </p>
                </div>
                <p className="text-white/30 text-xs text-center max-w-xs">
                  Replace the placement ID in{" "}
                  <span className="text-amber-400/70 font-mono">
                    ads-config.ts
                  </span>{" "}
                  to serve real Meta ads
                </p>
              </>
            )}
          </div>
        )}

        {/* Progress bar at bottom */}
        <div className="h-1 bg-white/10 w-full">
          <motion.div
            className="h-full bg-amber-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 8, ease: "linear" }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
