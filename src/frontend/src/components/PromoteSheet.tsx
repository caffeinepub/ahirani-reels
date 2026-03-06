import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CheckCircle, Rocket, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

// ─── Promotion tier config ────────────────────────────────────────────────────

interface PromotionTier {
  id: "basic" | "standard" | "premium";
  label: string;
  cost: number;
  reach: number;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  glowColor: string;
}

const PROMOTION_TIERS: PromotionTier[] = [
  {
    id: "basic",
    label: "Basic Boost",
    cost: 100,
    reach: 1000,
    icon: <Zap className="w-5 h-5" />,
    color: "oklch(0.65 0.15 200)",
    borderColor: "oklch(0.5 0.15 200 / 0.4)",
    glowColor: "oklch(0.5 0.15 200 / 0.15)",
  },
  {
    id: "standard",
    label: "Standard Boost",
    cost: 300,
    reach: 5000,
    icon: <Rocket className="w-5 h-5" />,
    color: "oklch(0.7 0.2 280)",
    borderColor: "oklch(0.55 0.2 280 / 0.4)",
    glowColor: "oklch(0.55 0.2 280 / 0.15)",
  },
  {
    id: "premium",
    label: "Premium Blast",
    cost: 500,
    reach: 10000,
    icon: <CheckCircle className="w-5 h-5" />,
    color: "oklch(0.75 0.18 55)",
    borderColor: "oklch(0.6 0.18 55 / 0.4)",
    glowColor: "oklch(0.6 0.18 55 / 0.15)",
  },
];

// ─── PromoteSheet ─────────────────────────────────────────────────────────────

interface PromoteSheetProps {
  videoId: string;
  open: boolean;
  onClose: () => void;
}

export default function PromoteSheet({
  videoId,
  open,
  onClose,
}: PromoteSheetProps) {
  const { state, dispatch } = useApp();
  const [selectedTier, setSelectedTier] = useState<
    "basic" | "standard" | "premium"
  >("standard");

  const currentUser = state.currentUser;
  const video = state.videos.find((v) => v.id === videoId);
  const balance = currentUser?.pendingEarnings ?? 0;
  const tier = PROMOTION_TIERS.find((t) => t.id === selectedTier)!;

  const isAlreadyPromoted = video?.isPromoted;
  const promotionExpiry = video?.promotionExpiry;
  const isActivePromotion =
    isAlreadyPromoted && promotionExpiry && promotionExpiry > Date.now();

  const handlePromote = () => {
    if (!currentUser || !video) return;
    if (balance < tier.cost) {
      toast.error("Insufficient balance", {
        description: `You need ₹${tier.cost} but have ₹${balance.toFixed(0)}`,
      });
      return;
    }

    dispatch({
      type: "PROMOTE_VIDEO",
      videoId,
      tier: tier.id,
      cost: tier.cost,
    });

    toast.success("Video promoted! 🚀", {
      description: `Your video now reaches ${tier.reach.toLocaleString()} more viewers.`,
    });

    onClose();
  };

  const formatExpiry = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        data-ocid="promote.sheet"
        className="rounded-t-3xl border-t border-white/10"
        style={{
          background:
            "linear-gradient(to top, oklch(0.06 0.02 280), oklch(0.12 0.03 280))",
          maxHeight: "80dvh",
          overflowY: "auto",
        }}
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="text-white text-center">
            Promote Video 🚀
          </SheetTitle>
        </SheetHeader>

        {isActivePromotion ? (
          /* Already promoted view */
          <div className="space-y-4 pb-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-violet-500/30 p-5 text-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.2 0.08 280 / 0.5), oklch(0.15 0.06 280 / 0.4))",
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Rocket className="w-6 h-6 text-violet-400" />
                <Badge
                  data-ocid="promote.active.toggle"
                  className="bg-violet-500/30 text-violet-300 border-violet-500/40 text-xs font-bold"
                >
                  ACTIVE PROMOTION
                </Badge>
              </div>
              <p className="text-white font-semibold mb-1 text-lg">
                {PROMOTION_TIERS.find((t) => t.id === video?.promotionTier)
                  ?.label ?? "Promotion"}
              </p>
              <p className="text-white/60 text-sm mb-3">
                +{(video?.promotedReach ?? 0).toLocaleString()} extra viewers
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-white/40 text-xs">Expires:</span>
                <span className="text-violet-300 text-xs font-semibold">
                  {promotionExpiry ? formatExpiry(promotionExpiry) : "—"}
                </span>
              </div>
            </motion.div>

            <Button
              data-ocid="promote.close_button"
              onClick={onClose}
              className="w-full"
              variant="outline"
              style={{
                borderColor: "oklch(0.4 0 0)",
                color: "white",
                background: "transparent",
              }}
            >
              Close
            </Button>
          </div>
        ) : (
          /* Tier selection view */
          <div className="space-y-4 pb-4">
            {/* Balance display */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: "oklch(0.15 0.02 0 / 0.6)" }}
            >
              <span className="text-white/60 text-sm">Available Balance</span>
              <span className="text-white font-bold text-base">
                ₹{balance.toFixed(2)}
              </span>
            </div>

            {/* Tier cards */}
            <div className="space-y-2">
              {PROMOTION_TIERS.map((t) => {
                const isSelected = selectedTier === t.id;
                const canAfford = balance >= t.cost;
                return (
                  <motion.button
                    key={t.id}
                    type="button"
                    data-ocid={`promote.${t.id}.button`}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTier(t.id)}
                    className="w-full text-left rounded-2xl border p-4 transition-all duration-200"
                    style={{
                      borderColor: isSelected
                        ? t.borderColor
                        : "rgba(255,255,255,0.08)",
                      background: isSelected ? t.glowColor : "transparent",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{
                            background: isSelected
                              ? `${t.color}30`
                              : "rgba(255,255,255,0.06)",
                            color: isSelected
                              ? t.color
                              : "rgba(255,255,255,0.4)",
                          }}
                        >
                          {t.icon}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {t.label}
                          </p>
                          <p className="text-white/50 text-xs">
                            +{t.reach.toLocaleString()} extra reach · 7 days
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-bold text-base"
                          style={{ color: t.color }}
                        >
                          ₹{t.cost}
                        </p>
                        {!canAfford && (
                          <p className="text-red-400 text-[10px]">
                            Insufficient
                          </p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 pt-3 border-t border-white/8"
                      >
                        <p className="text-white/50 text-xs leading-relaxed">
                          Your video will appear with a{" "}
                          <span className="text-amber-400 font-semibold">
                            Sponsored
                          </span>{" "}
                          badge and be boosted to the top of For You and
                          Trending feeds for 7 days.
                        </p>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Promote button */}
            <Button
              data-ocid="promote.submit_button"
              onClick={handlePromote}
              disabled={balance < tier.cost}
              className="w-full h-12 font-bold text-base rounded-xl"
              style={{
                background:
                  balance >= tier.cost
                    ? "linear-gradient(135deg, oklch(0.55 0.2 280), oklch(0.6 0.22 300))"
                    : undefined,
                color: "white",
              }}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Promote for ₹{tier.cost}
            </Button>

            <p className="text-center text-white/25 text-xs">
              Promotion cost deducted from your earnings balance
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
