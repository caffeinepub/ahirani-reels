import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { LocalAd } from "../../context/AppContext";
import { AD_ENABLED } from "./ads-config";

interface LocalAdBannerProps {
  ads: LocalAd[];
  className?: string;
}

export function LocalAdBanner({ ads, className }: LocalAdBannerProps) {
  const activeAds = ads.filter((a) => a.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Rotate through ads every 5 seconds
  useEffect(() => {
    if (activeAds.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAds.length);
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeAds.length]);

  // Reset index if active ads shrink
  useEffect(() => {
    if (currentIndex >= activeAds.length && activeAds.length > 0) {
      setCurrentIndex(0);
    }
  }, [activeAds.length, currentIndex]);

  if (!AD_ENABLED || activeAds.length === 0) return null;

  const ad = activeAds[currentIndex] ?? activeAds[0];

  const handleClick = () => {
    toast.info(`Opening ${ad.businessName}...`, { duration: 2000 });
  };

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.button
          key={ad.id}
          type="button"
          data-ocid="feed.local_ad.button"
          onClick={handleClick}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35 }}
          className="relative w-full overflow-hidden rounded-2xl text-left group"
          style={{
            boxShadow:
              "0 0 0 1.5px oklch(0.65 0.28 60 / 0.35), 0 0 20px oklch(0.65 0.28 60 / 0.15)",
          }}
        >
          {/* Ad image */}
          <img
            src={ad.imageUrl}
            alt={ad.businessName}
            className="w-full h-28 object-cover"
            loading="lazy"
          />

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background:
                "linear-gradient(to right, oklch(0.05 0.01 240 / 0.85) 0%, oklch(0.05 0.01 240 / 0.2) 60%, transparent 100%)",
            }}
          />

          {/* "Ad" badge top-right */}
          <div className="absolute top-2 right-2 bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wider z-10">
            AD
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-between p-3 z-10">
            {/* Top: business name */}
            <p className="text-white font-bold text-sm drop-shadow-lg truncate max-w-[70%]">
              {ad.businessName}
            </p>

            {/* Bottom: tagline + "Sponsored" label */}
            <div className="flex items-end justify-between gap-2">
              <p className="text-white/90 text-xs leading-snug line-clamp-2 max-w-[75%] drop-shadow">
                {ad.tagline}
              </p>
              <span className="text-white/50 text-[9px] font-medium shrink-0 mb-0.5">
                Sponsored
              </span>
            </div>
          </div>

          {/* Animated glow border on hover */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              boxShadow: "inset 0 0 0 1.5px oklch(0.65 0.28 60 / 0.6)",
            }}
          />

          {/* Rotation dots indicator */}
          {activeAds.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
              {activeAds.map((a, idx) => (
                <div
                  key={a.id}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: idx === currentIndex ? 12 : 4,
                    height: 4,
                    background:
                      idx === currentIndex
                        ? "oklch(0.85 0.18 60)"
                        : "oklch(0.85 0 0 / 0.4)",
                  }}
                />
              ))}
            </div>
          )}
        </motion.button>
      </AnimatePresence>
    </div>
  );
}
