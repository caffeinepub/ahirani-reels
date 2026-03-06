import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { GIFT_COSTS, type Gift, useApp } from "../context/AppContext";
import { generateId } from "../utils/trending";

// ─── Gift config ──────────────────────────────────────────────────────────────

const GIFTS: Array<{
  type: Gift["giftType"];
  emoji: string;
  name: string;
}> = [
  { type: "clap", emoji: "👏", name: "Clap" },
  { type: "star", emoji: "⭐", name: "Star" },
  { type: "fire", emoji: "🔥", name: "Fire" },
  { type: "crown", emoji: "👑", name: "Crown" },
];

// ─── Floating emoji animation ─────────────────────────────────────────────────

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
}

// ─── Gift Card ────────────────────────────────────────────────────────────────

function GiftCard({
  gift,
  onSend,
}: {
  gift: (typeof GIFTS)[0];
  onSend: (type: Gift["giftType"]) => void;
}) {
  const cost = GIFT_COSTS[gift.type];
  const artistShare = ((cost / 10) * 0.6).toFixed(2);

  return (
    <motion.button
      type="button"
      data-ocid={`gift.${gift.type}.button`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => onSend(gift.type)}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/10 transition-colors"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.15 0.03 60 / 0.6), oklch(0.1 0.02 60 / 0.4))",
      }}
    >
      <span className="text-4xl leading-none">{gift.emoji}</span>
      <span className="text-white font-semibold text-sm">{gift.name}</span>
      <div className="flex flex-col items-center gap-0.5">
        <span
          className="text-xs font-bold"
          style={{ color: "oklch(0.85 0.15 60)" }}
        >
          {cost} coins
        </span>
        <span className="text-white/40 text-[10px]">
          ₹{artistShare} to artist
        </span>
      </div>
    </motion.button>
  );
}

// ─── GiftPanel (main export) ──────────────────────────────────────────────────

interface GiftPanelProps {
  artistId: string;
  videoId?: string;
  liveStreamId?: string;
  open: boolean;
  onClose: () => void;
}

export default function GiftPanel({
  artistId,
  videoId,
  liveStreamId,
  open,
  onClose,
}: GiftPanelProps) {
  const { state, dispatch } = useApp();
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);

  const currentUser = state.currentUser;
  const userCoins = currentUser?.coins ?? 0;

  const triggerFloatingEmoji = (emoji: string) => {
    const id = generateId();
    const x = 20 + Math.random() * 60; // random x position %
    setFloatingEmojis((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
    }, 1200);
  };

  const handleSend = (giftType: Gift["giftType"]) => {
    if (!currentUser) return;

    const cost = GIFT_COSTS[giftType];
    if (currentUser.coins < cost) {
      toast.error("Not enough coins. Earn more from daily tasks!", {
        description: `You have ${currentUser.coins} coins, need ${cost}`,
      });
      return;
    }

    const giftConfig = GIFTS.find((g) => g.type === giftType);

    const gift: Gift = {
      id: generateId(),
      senderId: currentUser.id,
      receiverId: artistId,
      videoId,
      liveStreamId,
      giftType,
      coinCost: cost,
      createdAt: Date.now(),
    };

    dispatch({ type: "SEND_GIFT", gift });
    toast.success("Gift sent! 🎁", {
      description: `You sent a ${giftConfig?.emoji} ${giftConfig?.name} gift!`,
    });

    if (giftConfig) {
      triggerFloatingEmoji(giftConfig.emoji);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        data-ocid="gift.sheet"
        className="rounded-t-3xl border-t border-white/10"
        style={{
          background:
            "linear-gradient(to top, oklch(0.08 0.02 60), oklch(0.12 0.03 60))",
          maxHeight: "70dvh",
        }}
      >
        {/* Floating emoji animations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-t-3xl">
          <AnimatePresence>
            {floatingEmojis.map((fe) => (
              <motion.span
                key={fe.id}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -160, scale: 1.8 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute bottom-24 text-4xl"
                style={{ left: `${fe.x}%` }}
              >
                {fe.emoji}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        <SheetHeader className="pb-4">
          <SheetTitle className="text-white text-center">
            Send a Gift 🎁
          </SheetTitle>
        </SheetHeader>

        {/* Coin balance */}
        <div
          className="mx-auto w-fit flex items-center gap-2 px-4 py-2 rounded-full mb-5"
          style={{ background: "oklch(0.18 0.04 60 / 0.8)" }}
        >
          <span className="text-lg">🪙</span>
          <span className="text-white font-bold text-sm">
            {userCoins} coins
          </span>
          <span className="text-white/40 text-xs">
            = ₹{(userCoins / 10).toFixed(2)}
          </span>
        </div>

        {/* Gift grid */}
        <div className="grid grid-cols-2 gap-3 px-1">
          {GIFTS.map((gift) => (
            <GiftCard key={gift.type} gift={gift} onSend={handleSend} />
          ))}
        </div>

        <p className="text-center text-white/30 text-xs mt-4 pb-2">
          100 coins = ₹10 · Artists receive 60% of gift value
        </p>
      </SheetContent>
    </Sheet>
  );
}

// ─── Gift trigger button ──────────────────────────────────────────────────────

interface GiftButtonProps {
  artistId: string;
  videoId?: string;
  liveStreamId?: string;
  className?: string;
  size?: "sm" | "md";
}

export function GiftButton({
  artistId,
  videoId,
  liveStreamId,
  className = "",
  size = "md",
}: GiftButtonProps) {
  const [open, setOpen] = useState(false);
  const { state } = useApp();
  const currentUser = state.currentUser;

  // Don't show gift button on own content
  if (!currentUser || currentUser.id === artistId) return null;

  return (
    <>
      <button
        type="button"
        data-ocid="gift.open_modal_button"
        onClick={() => setOpen(true)}
        className={`flex flex-col items-center gap-1 active:scale-90 transition-transform ${className}`}
        aria-label="Send gift"
      >
        <span className={size === "sm" ? "text-xl" : "text-2xl"}>🎁</span>
        {size === "md" && (
          <span className="text-white text-xs font-semibold drop-shadow">
            Gift
          </span>
        )}
      </button>

      <GiftPanel
        artistId={artistId}
        videoId={videoId}
        liveStreamId={liveStreamId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
