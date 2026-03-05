import { Button } from "@/components/ui/button";
import { Check, Play, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../../hooks/useActor";
import { ADMOB_SLOTS, AD_ENABLED, REWARDED_AD_COINS } from "./admob-config";

interface RewardedAdProps {
  open: boolean;
  onClose: () => void;
  onEarn: () => void;
  userId: string;
}

export function RewardedAd({ open, onClose, onEarn, userId }: RewardedAdProps) {
  const [phase, setPhase] = useState<"ad" | "earned">("ad");
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);
  const { actor } = useActor();

  const handleWatch = () => {
    setStarted(true);
    let p = 0;
    const interval = setInterval(async () => {
      p += 2;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setPhase("earned");
        onEarn();
        // Best-effort backend call — local state already updated
        try {
          await (actor as any)?.rewardAdWatch?.(userId);
        } catch {
          // Silently ignore — backend call is optional
        }
      }
    }, 80);
  };

  const handleClose = () => {
    setPhase("ad");
    setProgress(0);
    setStarted(false);
    onClose();
  };

  // Slot ID referenced for future real AdMob integration
  void ADMOB_SLOTS.REWARDED;

  if (!AD_ENABLED) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-ocid="wallet.rewarded_ad.modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-sm"
          >
            {phase === "ad" ? (
              <div className="bg-card rounded-2xl overflow-hidden">
                {/* Ad placeholder */}
                <div
                  className="w-full aspect-video flex flex-col items-center justify-center gap-3 relative"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.12 0.04 260), oklch(0.08 0.02 220))",
                  }}
                >
                  <span className="text-5xl">🎮</span>
                  <p className="text-white/70 text-sm">
                    Watch this ad to earn coins
                  </p>
                  <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                    AD
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-reels-gold/20 flex items-center justify-center">
                      <span className="text-xl">🪙</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        Watch Ad → Earn {REWARDED_AD_COINS} Coins
                      </p>
                      <p className="text-white/50 text-xs">Takes ~4 seconds</p>
                    </div>
                  </div>

                  {started && (
                    <div className="space-y-1.5">
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-white/40 text-xs text-center">
                        {Math.round(progress)}%
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!started && (
                      <Button
                        data-ocid="wallet.watch_ad_button"
                        onClick={handleWatch}
                        className="flex-1 h-11 font-semibold"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
                        }}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Watch & Earn
                      </Button>
                    )}
                    <Button
                      data-ocid="wallet.rewarded_ad.close_button"
                      variant="ghost"
                      onClick={handleClose}
                      className="text-white/50 hover:text-white"
                      size={started ? "default" : "icon"}
                    >
                      {started ? "Cancel" : <X className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="bg-card rounded-2xl p-8 text-center"
              >
                <motion.div
                  animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                  transition={{ duration: 0.6 }}
                  className="text-6xl mb-4"
                >
                  🪙
                </motion.div>
                <h3 className="text-white font-bold text-2xl mb-2">
                  +{REWARDED_AD_COINS} Coins!
                </h3>
                <p className="text-white/60 text-sm mb-6">
                  Added to your wallet
                </p>
                <Button
                  data-ocid="wallet.rewarded_ad.close_button"
                  onClick={handleClose}
                  className="w-full h-11 font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
                  }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Awesome!
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
