import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { AD_ENABLED } from "./admob-config";

interface InterstitialAdProps {
  open: boolean;
  onClose: () => void;
}

export function InterstitialAd({ open, onClose }: InterstitialAdProps) {
  const [countdown, setCountdown] = useState(5);

  // Reset countdown each time the ad opens
  useEffect(() => {
    if (!open) return;
    setCountdown(5);
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [open]);

  if (!AD_ENABLED || !open) return null;

  return (
    <div
      data-ocid="feed.interstitial_ad.modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-sm mx-4"
      >
        {/* Ad badge */}
        <div className="absolute top-3 left-3 z-10 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
          AD
        </div>

        {/* Ad content placeholder */}
        <div className="rounded-2xl overflow-hidden border border-white/10">
          <div
            className="w-full aspect-video flex flex-col items-center justify-center gap-3"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.15 0.05 280), oklch(0.1 0.03 240))",
            }}
          >
            <span className="text-5xl">📱</span>
            <p className="text-white/60 text-sm font-medium">
              Sponsored Content
            </p>
            <p className="text-white/40 text-xs">Download the latest app</p>
          </div>
          <div className="p-4 bg-card flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">Super App 2024</p>
              <p className="text-white/50 text-xs">Install now — Free</p>
            </div>
            <button
              type="button"
              className="bg-reels-pink text-white text-sm font-semibold px-4 py-2 rounded-full"
            >
              Install
            </button>
          </div>
        </div>

        {/* Skip button */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            data-ocid="feed.interstitial_ad.skip_button"
            onClick={countdown === 0 ? onClose : undefined}
            disabled={countdown > 0}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
              countdown > 0
                ? "bg-white/10 text-white/40 cursor-not-allowed"
                : "bg-white text-black hover:bg-white/90"
            }`}
          >
            {countdown > 0 ? `Skip Ad (${countdown}s)` : "Skip Ad →"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
