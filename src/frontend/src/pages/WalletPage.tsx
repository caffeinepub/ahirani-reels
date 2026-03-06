import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Flame,
  Gift,
  IndianRupee,
  Link2,
  Megaphone,
  Play,
  ReceiptText,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SiInstagram, SiTelegram, SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";
import { RewardedAd } from "../components/ads/RewardedAd";
import type {
  Transaction,
  VideoType,
  WithdrawalRequest,
} from "../context/AppContext";
import { useApp } from "../context/AppContext";
import { formatCount, formatTime } from "../utils/trending";

// ─── Daily Bonus Card ─────────────────────────────────────────────────────────

function DailyBonusCard() {
  const { state, dispatch } = useApp();
  const user = state.currentUser;

  const liveUser = user
    ? (state.users.find((u) => u.id === user.id) ?? user)
    : null;

  const todayStr = new Date().toDateString();
  const lastStr = new Date(liveUser?.lastLoginDate ?? 0).toDateString();
  const alreadyClaimed = todayStr === lastStr;
  const streak = liveUser?.loginStreak ?? 0;

  // Countdown timer to midnight
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    if (!alreadyClaimed) return;
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setDate(midnight.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [alreadyClaimed]);

  const DAYS = [
    { day: 1, reward: 1 },
    { day: 2, reward: 2 },
    { day: 3, reward: 3 },
    { day: 4, reward: 4 },
    { day: 5, reward: 5 },
    { day: 6, reward: 6 },
    { day: 7, reward: 10, star: true },
  ];

  if (!user || !liveUser) return null;

  const nextStreak = alreadyClaimed ? streak : streak + 1;
  const nextReward = nextStreak >= 7 ? 10 : nextStreak;

  const handleClaim = () => {
    dispatch({ type: "CLAIM_DAILY_BONUS", userId: user.id });
    const newStreak = streak === 0 ? 1 : streak + 1;
    const reward = newStreak >= 7 ? 10 : newStreak;
    toast.success(`🎁 Day ${newStreak} bonus claimed! +₹${reward}`, {
      description: "Added to your wallet",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      data-ocid="wallet.daily_bonus.card"
      className="rounded-2xl overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.18 0.06 280 / 0.9), oklch(0.12 0.04 260 / 0.95))",
        border: "1px solid oklch(0.6 0.18 280 / 0.35)",
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-violet-500/25 border border-violet-500/30 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-violet-300" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">
              Daily Login Bonus
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-orange-300 text-xs font-semibold">
                Day {streak} Streak
              </span>
            </div>
          </div>
          <div className="ml-auto text-right">
            <p className="text-violet-300 font-black text-2xl leading-none">
              ₹{nextReward}
            </p>
            <p className="text-white/40 text-[10px]">today</p>
          </div>
        </div>
      </div>

      {/* Day calendar strip */}
      <div className="px-4 pb-4">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {DAYS.map((d) => {
            const claimed = d.day <= streak;
            const isToday = d.day === (alreadyClaimed ? streak : streak + 1);
            const isFuture = d.day > (alreadyClaimed ? streak : streak + 1);
            return (
              <div
                key={d.day}
                className={`flex-shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 w-[42px] h-[52px] border transition-all ${
                  claimed && !isToday
                    ? "bg-violet-600/30 border-violet-500/40"
                    : isToday
                      ? "bg-violet-600/50 border-violet-400/70 shadow-lg shadow-violet-500/20"
                      : isFuture
                        ? "bg-white/5 border-white/10"
                        : "bg-white/5 border-white/10"
                }`}
              >
                {claimed && !isToday ? (
                  <Check className="w-3.5 h-3.5 text-violet-300" />
                ) : d.star ? (
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                ) : (
                  <Sparkles
                    className={`w-3 h-3 ${isToday ? "text-violet-300" : "text-white/30"}`}
                  />
                )}
                <span
                  className={`text-[9px] font-bold ${
                    isToday
                      ? "text-white"
                      : claimed
                        ? "text-violet-300"
                        : "text-white/30"
                  }`}
                >
                  ₹{d.reward}
                  {d.star ? "★" : ""}
                </span>
                <span
                  className={`text-[8px] ${
                    isToday
                      ? "text-violet-200"
                      : claimed
                        ? "text-violet-400/60"
                        : "text-white/20"
                  }`}
                >
                  D{d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-5">
        {alreadyClaimed ? (
          <div className="rounded-xl bg-white/8 border border-white/10 py-3 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" />
              <span className="text-white/50 text-sm">Come back tomorrow</span>
            </div>
            <span className="text-white font-mono text-sm font-bold tabular-nums">
              {timeLeft}
            </span>
          </div>
        ) : (
          <Button
            data-ocid="wallet.daily_bonus.claim_button"
            onClick={handleClaim}
            className="w-full h-11 font-bold text-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.6 0.22 280), oklch(0.55 0.2 260))",
            }}
          >
            <Gift className="w-4 h-4 mr-2" />
            Claim ₹{nextReward} Today
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Lucky Spin Wheel ─────────────────────────────────────────────────────────

const SPIN_SEGMENTS = [
  { label: "₹1", value: 1, color: "oklch(0.55 0.2 160)", weight: 35 },
  { label: "₹2", value: 2, color: "oklch(0.55 0.2 240)", weight: 30 },
  { label: "₹5", value: 5, color: "oklch(0.55 0.2 280)", weight: 20 },
  { label: "₹10", value: 10, color: "oklch(0.7 0.18 80)", weight: 10 },
  { label: "Try Again", value: 0, color: "oklch(0.35 0.02 240)", weight: 5 },
];

function getWeightedResult(): number {
  const total = SPIN_SEGMENTS.reduce((s, seg) => s + seg.weight, 0);
  let rand = Math.random() * total;
  for (const seg of SPIN_SEGMENTS) {
    rand -= seg.weight;
    if (rand <= 0) return seg.value;
  }
  return 0;
}

function SpinWheel() {
  const { state, dispatch } = useApp();
  const user = state.currentUser;

  const liveUser = user
    ? (state.users.find((u) => u.id === user.id) ?? user)
    : null;

  const todayStr = new Date().toDateString();
  const lastSpinStr = new Date(liveUser?.lastSpinDate ?? 0).toDateString();
  const alreadySpun = todayStr === lastSpinStr;

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  if (!user || !liveUser) return null;

  const segmentAngle = 360 / SPIN_SEGMENTS.length;

  const handleSpin = () => {
    if (spinning || alreadySpun) return;
    setResult(null);

    const reward = getWeightedResult();
    const segIdx = SPIN_SEGMENTS.findIndex((s) => s.value === reward);

    // Land the wheel so segment center aligns with top (pointer)
    // Segment center = segIdx * segmentAngle + segmentAngle/2
    // We want that to end at 0° (top of wheel)
    const targetAngle = 360 - (segIdx * segmentAngle + segmentAngle / 2);
    const fullSpins = 5 * 360;
    const newRotation = rotation + fullSpins + targetAngle;

    setSpinning(true);
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(reward);
      dispatch({ type: "SPIN_WHEEL", userId: user.id, reward });
      if (reward > 0) {
        toast.success(`🎰 You won ₹${reward}!`, {
          description: "Added to your wallet",
        });
      } else {
        toast("🎰 Better luck tomorrow!", {
          description: "Spin again tomorrow for another chance",
        });
      }
    }, 2500);
  };

  const conicGradient = SPIN_SEGMENTS.map((seg, i) => {
    const start = i * segmentAngle;
    const end = (i + 1) * segmentAngle;
    return `${seg.color} ${start}deg ${end}deg`;
  }).join(", ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      data-ocid="wallet.spin_wheel.card"
      className="rounded-2xl overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.16 0.05 60 / 0.9), oklch(0.12 0.03 50 / 0.95))",
        border: "1px solid oklch(0.7 0.18 80 / 0.3)",
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/25 border border-amber-500/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Lucky Spin</h3>
            <p className="text-white/40 text-xs">One spin per day</p>
          </div>
          {alreadySpun && (
            <div className="ml-auto">
              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                <Check className="w-2.5 h-2.5" />
                Spun Today
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Wheel */}
      <div className="flex flex-col items-center pb-5 px-5 gap-5">
        {/* Pointer + wheel container */}
        <div className="relative flex items-center justify-center">
          {/* Pointer arrow at top */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
          >
            <div
              className="w-0 h-0"
              style={{
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: "16px solid oklch(0.95 0.02 60)",
              }}
            />
          </div>

          {/* Outer ring */}
          <div
            className="rounded-full p-1.5"
            style={{
              background: "oklch(0.2 0.04 60 / 0.8)",
              boxShadow:
                "0 0 0 2px oklch(0.7 0.18 80 / 0.3), 0 8px 32px oklch(0 0 0 / 0.4)",
            }}
          >
            {/* Wheel */}
            <div
              ref={wheelRef}
              className="rounded-full relative overflow-hidden"
              style={{
                width: 200,
                height: 200,
                background: `conic-gradient(${conicGradient})`,
                transition: spinning
                  ? "transform 2.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                  : "none",
                transform: `rotate(${rotation}deg)`,
              }}
            >
              {/* Segment labels */}
              {SPIN_SEGMENTS.map((seg, i) => {
                const angle = i * segmentAngle + segmentAngle / 2;
                const rad = ((angle - 90) * Math.PI) / 180;
                const r = 68;
                const x = 100 + r * Math.cos(rad);
                const y = 100 + r * Math.sin(rad);
                return (
                  <span
                    key={seg.label}
                    className="absolute text-[11px] font-black text-white"
                    style={{
                      left: x,
                      top: y,
                      transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                      textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                      pointerEvents: "none",
                    }}
                  >
                    {seg.label}
                  </span>
                );
              })}

              {/* Center hub */}
              <div
                className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black/60 border-2 border-white/20 flex items-center justify-center"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Result display */}
        {result !== null && !spinning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl px-6 py-3 text-center border ${
              result > 0
                ? "bg-amber-500/20 border-amber-500/40"
                : "bg-white/8 border-white/15"
            }`}
          >
            <p
              className={`font-black text-2xl ${result > 0 ? "text-amber-300" : "text-white/40"}`}
            >
              {result > 0 ? `+₹${result}` : "No Reward"}
            </p>
            <p
              className={`text-xs mt-0.5 ${result > 0 ? "text-amber-400/70" : "text-white/30"}`}
            >
              {result > 0 ? "Added to wallet!" : "Better luck next time"}
            </p>
          </motion.div>
        )}

        {/* Spin button */}
        <Button
          data-ocid="wallet.spin_wheel.spin_button"
          onClick={handleSpin}
          disabled={spinning || alreadySpun}
          className="w-full h-12 font-bold text-base"
          style={{
            background:
              spinning || alreadySpun
                ? "oklch(0.25 0.02 60)"
                : "linear-gradient(135deg, oklch(0.7 0.18 80), oklch(0.65 0.2 50))",
            color: "oklch(0.1 0.02 60)",
          }}
        >
          {spinning ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black/80 rounded-full animate-spin" />
              Spinning...
            </span>
          ) : alreadySpun ? (
            <>
              <Clock className="w-4 h-4 mr-2" />
              Spun Today! Come back tomorrow
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Spin Now!
            </>
          )}
        </Button>

        {/* Reward odds */}
        <div className="w-full rounded-xl bg-white/5 border border-white/8 px-3 py-2.5">
          <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-2">
            Possible Rewards
          </p>
          <div className="grid grid-cols-5 gap-1">
            {SPIN_SEGMENTS.map((seg) => (
              <div key={seg.label} className="text-center">
                <div
                  className="w-full h-1.5 rounded-full mb-1"
                  style={{ background: seg.color }}
                />
                <p className="text-white font-bold text-[10px]">{seg.label}</p>
                <p className="text-white/30 text-[9px]">{seg.weight}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Video type badge ─────────────────────────────────────────────────────────

function VideoTypeBadge({ type }: { type: VideoType }) {
  const config = {
    reel: {
      label: "Reel",
      className: "bg-reels-pink/20 text-reels-pink border-reels-pink/30",
    },
    long: {
      label: "Long",
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    premium: {
      label: "Premium",
      className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
  };
  const { label, className } = config[type];
  return (
    <Badge
      variant="secondary"
      className={`text-[10px] px-1.5 py-0 ${className}`}
    >
      {label}
    </Badge>
  );
}

// ─── Withdrawal status badge ──────────────────────────────────────────────────

function WithdrawalStatusBadge({
  status,
}: {
  status: WithdrawalRequest["status"];
}) {
  const config: Record<WithdrawalRequest["status"], string> = {
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    approved: "bg-green-500/20 text-green-400 border-green-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    paid: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };
  return (
    <Badge
      variant="secondary"
      className={`text-[10px] px-1.5 py-0 capitalize ${config[status]}`}
    >
      {status}
    </Badge>
  );
}

// ─── Transaction type badge ───────────────────────────────────────────────────

function TxTypeBadge({ txType }: { txType: Transaction["txType"] }) {
  const config: Record<
    Transaction["txType"],
    { label: string; className: string }
  > = {
    ad_earnings: {
      label: "Ad Earnings",
      className: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    referral_credit: {
      label: "Referral",
      className: "bg-reels-pink/20 text-reels-pink border-reels-pink/30",
    },
    withdrawal_requested: {
      label: "Withdrawal",
      className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    withdrawal_approved: {
      label: "Approved",
      className: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    withdrawal_rejected: {
      label: "Rejected",
      className: "bg-red-500/20 text-red-400 border-red-500/30",
    },
    withdrawal_paid: {
      label: "Paid",
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    subscription_payment: {
      label: "Subscription",
      className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    daily_bonus: {
      label: "Daily Bonus",
      className: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    },
    spin_reward: {
      label: "Spin Reward",
      className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
  };
  const { label, className } = config[txType];
  return (
    <Badge
      variant="secondary"
      className={`text-[10px] px-1.5 py-0 ${className}`}
    >
      {label}
    </Badge>
  );
}

// ─── Share Buttons Row ────────────────────────────────────────────────────────

function ShareButtonsRow({ referralCode }: { referralCode: string }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const referralUrl = `https://ahirani-reels.app/referral/${referralCode}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Join Ahirani Reels with my referral code ${referralCode}! Sign up, verify OTP and watch 3 videos to activate the referral. ${referralUrl}`,
  )}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(
    `Join Ahirani Reels with my referral code ${referralCode}`,
  )}`;

  const handleWhatsApp = () => window.open(whatsappUrl, "_blank");
  const handleTelegram = () => window.open(telegramUrl, "_blank");

  const handleInstagram = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast.success("Link copied — paste it on Instagram!");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success("Referral link copied!");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {/* WhatsApp */}
      <button
        type="button"
        data-ocid="wallet.referral.whatsapp_button"
        onClick={handleWhatsApp}
        className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 transition-all hover:scale-105 active:scale-95 border border-green-500/20"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.06 160), oklch(0.12 0.04 155))",
        }}
      >
        <SiWhatsapp className="w-5 h-5 text-green-400" />
        <span className="text-green-300 text-[10px] font-semibold">
          WhatsApp
        </span>
      </button>

      {/* Instagram */}
      <button
        type="button"
        data-ocid="wallet.referral.instagram_button"
        onClick={handleInstagram}
        className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 transition-all hover:scale-105 active:scale-95 border border-pink-500/20"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.05 330), oklch(0.12 0.04 300))",
        }}
      >
        <SiInstagram className="w-5 h-5 text-pink-400" />
        <span className="text-pink-300 text-[10px] font-semibold">
          Instagram
        </span>
      </button>

      {/* Telegram */}
      <button
        type="button"
        data-ocid="wallet.referral.telegram_button"
        onClick={handleTelegram}
        className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 transition-all hover:scale-105 active:scale-95 border border-blue-500/20"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.04 240), oklch(0.12 0.03 235))",
        }}
      >
        <SiTelegram className="w-5 h-5 text-blue-400" />
        <span className="text-blue-300 text-[10px] font-semibold">
          Telegram
        </span>
      </button>

      {/* Copy Link */}
      <button
        type="button"
        data-ocid="wallet.referral.copy_link_button"
        onClick={handleCopyLink}
        className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 transition-all hover:scale-105 active:scale-95 border border-white/15"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.01 0), oklch(0.13 0.01 0))",
        }}
      >
        {copiedLink ? (
          <Check className="w-5 h-5 text-green-400" />
        ) : (
          <Copy className="w-5 h-5 text-white/60" />
        )}
        <span className="text-white/60 text-[10px] font-semibold">
          {copiedLink ? "Copied!" : "Copy Link"}
        </span>
      </button>
    </div>
  );
}

// ─── Viewer Referral Earnings Dashboard ──────────────────────────────────────

function ViewerReferralDashboard() {
  const { state, dispatch } = useApp();
  const user = state.currentUser!;
  const liveUser = state.users.find((u) => u.id === user.id) ?? user;

  const myReferrals = state.referrals.filter((r) => r.referrerId === user.id);
  const successfulReferrals = myReferrals.filter((r) => {
    const progress = state.viewerReferralProgress[r.referredUserId];
    return progress?.rewardPaid === true;
  });

  const pendingEarnings = liveUser.pendingEarnings ?? 0;
  const referralUrl = `https://ahirani-reels.app/referral/${user.referralCode}`;

  const [copiedCode, setCopiedCode] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [viewerWithdrawName, setViewerWithdrawName] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const myWithdrawals = state.withdrawalRequests.filter(
    (w) => w.userId === user.id,
  );

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(user.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.success("Referral code copied!");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast.success("Referral link copied!");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const handleWithdraw = async () => {
    const amount = Number.parseFloat(withdrawAmount);
    if (!viewerWithdrawName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!upiId.trim()) {
      toast.error("Please enter your UPI ID");
      return;
    }
    if (!withdrawAmount || Number.isNaN(amount) || amount < 200) {
      toast.error("Minimum withdrawal amount is ₹200");
      return;
    }
    if (amount > pendingEarnings) {
      toast.error(
        `Insufficient balance. Available: ₹${pendingEarnings.toFixed(2)}`,
      );
      return;
    }

    setWithdrawLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const request: WithdrawalRequest = {
      id: `w${Date.now()}`,
      userId: user.id,
      upiId: upiId.trim(),
      userName: viewerWithdrawName.trim(),
      amount,
      status: "pending",
      createdAt: Date.now(),
      resolvedAt: 0,
      processedAt: 0,
    };

    dispatch({ type: "REQUEST_WITHDRAWAL", request });
    setUpiId("");
    setViewerWithdrawName("");
    setWithdrawAmount("");
    setWithdrawLoading(false);

    toast.success("Withdrawal request submitted!", {
      description: `₹${amount.toFixed(2)} to ${upiId.trim()} — pending admin approval`,
    });
  };

  return (
    <div className="space-y-5">
      {/* ── Hero earnings card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.15 0.06 160), oklch(0.10 0.04 150))",
          border: "1px solid oklch(0.55 0.15 160 / 0.3)",
        }}
      >
        <div className="absolute top-0 right-0 opacity-10 text-7xl flex items-center justify-center w-28 h-28">
          🎁
        </div>
        <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">
          Referral Earnings
        </p>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-bold font-display text-emerald-400">
            ₹{pendingEarnings.toFixed(2)}
          </span>
          <span className="text-emerald-400/60 text-sm">available</span>
        </div>

        {/* Stats 2×2 grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-blue-300 font-bold text-lg font-display leading-none">
              {myReferrals.length}
            </p>
            <p className="text-white/50 text-[10px] mt-0.5">Total Referrals</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-emerald-400 font-bold text-lg font-display leading-none">
              {successfulReferrals.length}
            </p>
            <p className="text-white/50 text-[10px] mt-0.5">
              Successful Referrals
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Referral Code + Link card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07 }}
        data-ocid="wallet.viewer_referral.code_card"
        className="rounded-2xl border border-white/10 bg-card p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-reels-pink" />
          <h3 className="text-white font-semibold">Your Referral Code</h3>
        </div>

        {/* Big code display */}
        <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-center">
          <p className="font-display text-3xl font-bold text-white tracking-widest">
            {user.referralCode}
          </p>
          <p className="text-white/40 text-xs mt-2">
            Earn ₹10 for every friend who signs up, verifies OTP &amp; watches 3
            videos
          </p>
        </div>

        {/* Referral link row */}
        <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
          <Link2 className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <p className="flex-1 text-white/50 text-xs truncate font-mono">
            {referralUrl}
          </p>
          <button
            type="button"
            data-ocid="wallet.viewer_referral.copy_link_button"
            onClick={handleCopyLink}
            className="shrink-0 text-white/50 hover:text-white transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Copy code button */}
        <Button
          data-ocid="wallet.viewer_referral.copy_code_button"
          onClick={handleCopyCode}
          variant="secondary"
          className="w-full h-10 bg-white/10 hover:bg-white/20 text-white border-white/20"
        >
          {copiedCode ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Code
            </>
          )}
        </Button>
      </motion.div>

      {/* ── Share Buttons ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="rounded-2xl border border-white/10 bg-card p-5 space-y-3"
      >
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-white/50" />
          <h3 className="text-white font-semibold">Share Your Link</h3>
        </div>
        <ShareButtonsRow referralCode={user.referralCode} />
      </motion.div>

      {/* ── Reward Conditions card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="rounded-2xl border border-white/10 bg-card p-5 space-y-3"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <h3 className="text-white font-semibold">How Rewards Work</h3>
        </div>
        <p className="text-white/50 text-xs">
          Your referrals earn you ₹10 when they complete all 3 steps:
        </p>
        <div className="space-y-2">
          {[
            {
              icon: <Users className="w-3.5 h-3.5" />,
              label: "Sign up with your referral link",
            },
            {
              icon: <CheckCircle2 className="w-3.5 h-3.5" />,
              label: "Verify their OTP (phone number)",
            },
            {
              icon: <Play className="w-3.5 h-3.5" />,
              label: "Watch at least 3 videos",
            },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                {step.icon}
              </div>
              <div className="flex-1">
                <p className="text-white/70 text-xs">{step.label}</p>
              </div>
              <span className="text-white/30 text-[10px] font-mono">
                Step {i + 1}
              </span>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2">
          <p className="text-amber-300 text-[10px] text-center">
            ₹10 is credited instantly after step 3 is completed · Minimum
            withdrawal ₹200
          </p>
        </div>
      </motion.div>

      {/* ── Referral Activity ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/10 bg-card overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
          <Users className="w-4 h-4 text-white/50" />
          <h3 className="text-white font-semibold text-sm">
            Referral Activity
          </h3>
          <span className="ml-auto text-white/30 text-xs">
            {myReferrals.length} referral{myReferrals.length !== 1 ? "s" : ""}
          </span>
        </div>

        {myReferrals.length === 0 ? (
          <div
            data-ocid="wallet.viewer_referral.empty_state"
            className="py-12 text-center"
          >
            <p className="text-3xl mb-2">👥</p>
            <p className="text-white/40 text-sm">No referrals yet</p>
            <p className="text-white/30 text-xs mt-1">
              Share your code to start earning ₹10 per successful referral
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="px-4 py-2 bg-white/5 border-b border-white/10 grid grid-cols-[1fr_auto_auto] gap-3 items-center">
              <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">
                Referred User
              </span>
              <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider w-20 text-center">
                Date
              </span>
              <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider w-16 text-right">
                Earned
              </span>
            </div>
            <div className="divide-y divide-white/5">
              {myReferrals.map((referral, i) => {
                const progress =
                  state.viewerReferralProgress[referral.referredUserId];
                return (
                  <div
                    key={`${referral.referrerId}-${referral.referredUserId}`}
                    data-ocid={`wallet.viewer_referral.item.${i + 1}`}
                    className="px-4 py-3 grid grid-cols-[1fr_auto_auto] gap-3 items-center"
                  >
                    {/* Referred user */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-xs">
                          {referral.referredUsername[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">
                          @{referral.referredUsername}
                        </p>
                        {/* Progress bar if in progress */}
                        {progress &&
                          !progress.rewardPaid &&
                          progress.otpVerified && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full bg-amber-400 rounded-full transition-all"
                                  style={{
                                    width: `${Math.min((progress.videosWatched / 3) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-white/30 text-[9px] tabular-nums">
                                {Math.min(progress.videosWatched, 3)}/3
                              </span>
                            </div>
                          )}
                        {progress?.rewardPaid && (
                          <span className="text-emerald-400/80 text-[10px]">
                            Reward paid ✓
                          </span>
                        )}
                        {!progress?.rewardPaid && !progress?.otpVerified && (
                          <span className="text-white/30 text-[10px]">
                            Pending OTP
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Date */}
                    <span className="text-white/40 text-[10px] w-20 text-center">
                      {new Date(referral.createdAt).toLocaleDateString(
                        "en-IN",
                        { day: "2-digit", month: "short" },
                      )}
                    </span>
                    {/* Amount */}
                    <span className="text-emerald-400 font-bold text-sm w-16 text-right">
                      +₹{referral.commissionEarned}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </motion.div>

      {/* ── Withdrawal Form ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-white/10 bg-card p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" />
          <h3 className="text-white font-semibold">Request Withdrawal</h3>
        </div>
        <p className="text-white/40 text-xs -mt-1">
          Minimum ₹200 · Processed within 2-3 business days
        </p>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="viewer-withdraw-name"
              className="text-white/70 text-xs font-medium"
            >
              Full Name
            </Label>
            <Input
              id="viewer-withdraw-name"
              data-ocid="wallet.viewer_withdrawal.name_input"
              placeholder="Your full name"
              value={viewerWithdrawName}
              onChange={(e) => setViewerWithdrawName(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="viewer-upi-id"
              className="text-white/70 text-xs font-medium"
            >
              UPI ID
            </Label>
            <Input
              id="viewer-upi-id"
              data-ocid="wallet.viewer_withdrawal.upi_input"
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="viewer-withdraw-amount"
              className="text-white/70 text-xs font-medium"
            >
              Amount (₹)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm font-medium">
                ₹
              </span>
              <Input
                id="viewer-withdraw-amount"
                data-ocid="wallet.viewer_withdrawal.amount_input"
                type="number"
                min={200}
                step={1}
                placeholder="200"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="pl-7 bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
              />
            </div>
            <p className="text-white/30 text-[10px]">
              Available: ₹{pendingEarnings.toFixed(2)} · Min: ₹200
            </p>
          </div>
        </div>

        <Button
          data-ocid="wallet.viewer_withdrawal.submit_button"
          onClick={handleWithdraw}
          disabled={withdrawLoading || pendingEarnings < 200}
          className="w-full h-11 font-semibold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.5 0.18 160), oklch(0.45 0.14 160))",
          }}
        >
          {withdrawLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            <>
              <IndianRupee className="w-4 h-4 mr-1.5" />
              Request Withdrawal
            </>
          )}
        </Button>

        {pendingEarnings < 200 && pendingEarnings >= 0 && (
          <p className="text-amber-400/70 text-[10px] text-center">
            Earn at least ₹200 in referral rewards to unlock withdrawals
          </p>
        )}
      </motion.div>

      {/* ── Withdrawal History ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-white/10 bg-card overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-white font-semibold text-sm">
            Withdrawal History
          </h3>
        </div>

        {myWithdrawals.length === 0 ? (
          <div
            data-ocid="wallet.viewer_withdrawal.empty_state"
            className="py-10 text-center"
          >
            <p className="text-3xl mb-2">💸</p>
            <p className="text-white/40 text-sm">No withdrawal requests yet</p>
            <p className="text-white/30 text-xs mt-1">
              Your requests will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {myWithdrawals.map((w, i) => (
              <div
                key={w.id}
                data-ocid={`wallet.viewer_withdrawal.item.${i + 1}`}
                className="px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">
                    ₹{w.amount.toFixed(2)}
                  </p>
                  <p className="text-white/40 text-xs truncate">{w.upiId}</p>
                  <p className="text-white/30 text-[10px] mt-0.5">
                    {formatTime(w.createdAt)} ago
                  </p>
                </div>
                <WithdrawalStatusBadge status={w.status} />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Wallet Page ──────────────────────────────────────────────────────────────

export default function WalletPage() {
  const { state, dispatch } = useApp();
  const user = state.currentUser;
  const [copied, setCopied] = useState(false);
  const [adOpen, setAdOpen] = useState(false);

  // Withdrawal form state (for artists)
  const [upiId, setUpiId] = useState("");
  const [withdrawName, setWithdrawName] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  if (!user) return null;

  const liveUser = state.users.find((u) => u.id === user.id) ?? user;

  const myReferrals = state.referrals.filter((r) => r.referrerId === user.id);
  const totalReferralCommission = myReferrals.reduce(
    (sum, r) => sum + r.commissionEarned,
    0,
  );
  const subscriptionBonusCount = myReferrals.filter(
    (r) => r.subscriptionReferralEarned,
  ).length;

  const myVideos = state.videos.filter(
    (v) => v.uploaderId === user.id && !v.isDeleted,
  );

  const rpm = state.rpmConfig;

  const totalEarned = myVideos.reduce((sum, v) => {
    const rate = rpm[v.videoType] ?? 2;
    const gross = (v.viewsCount * rate) / 1000;
    return sum + gross * 0.6;
  }, 0);

  const pendingEarnings = liveUser.pendingEarnings ?? 0;

  const myWithdrawals = state.withdrawalRequests.filter(
    (w) => w.userId === user.id,
  );

  const myTransactions = (state.transactions ?? []).filter(
    (tx) => tx.userId === user.id,
  );

  const referralUrl = `https://ahirani-reels.app/referral/${user.referralCode}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Referral code copied!");
    } catch {
      toast.error("Couldn't copy, try manually");
    }
  };

  const handleEarnCoins = () => {
    dispatch({ type: "ADD_COINS", userId: user.id, amount: 5 });
  };

  const handleWithdraw = async () => {
    const amount = Number.parseFloat(withdrawAmount);

    if (!withdrawName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!upiId.trim()) {
      toast.error("Please enter your UPI ID");
      return;
    }
    if (!withdrawAmount || Number.isNaN(amount) || amount < 200) {
      toast.error("Minimum withdrawal amount is ₹200");
      return;
    }
    if (amount > pendingEarnings) {
      toast.error(
        `Insufficient balance. Available: ₹${pendingEarnings.toFixed(2)}`,
      );
      return;
    }

    setWithdrawLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const request: WithdrawalRequest = {
      id: `w${Date.now()}`,
      userId: user.id,
      upiId: upiId.trim(),
      userName: withdrawName.trim(),
      amount,
      status: "pending",
      createdAt: Date.now(),
      resolvedAt: 0,
      processedAt: 0,
    };

    dispatch({ type: "REQUEST_WITHDRAWAL", request });
    setUpiId("");
    setWithdrawName("");
    setWithdrawAmount("");
    setWithdrawLoading(false);

    toast.success("Withdrawal request submitted!", {
      description: `₹${amount.toFixed(2)} to ${upiId.trim()} — pending admin approval`,
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-white/10 px-4 py-4">
        <h1 className="font-display text-xl font-bold text-white">Wallet</h1>
        <p className="text-white/40 text-xs mt-0.5">
          Your coins, earnings &amp; referrals
        </p>
      </div>

      <div className="px-4 py-4 pb-24">
        <Tabs defaultValue="wallet">
          <TabsList className="w-full bg-white/5 border border-white/10 mb-5 h-10">
            <TabsTrigger
              value="wallet"
              data-ocid="wallet.wallet_tab"
              className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs"
            >
              Wallet
            </TabsTrigger>
            <TabsTrigger
              value="earnings"
              data-ocid="wallet.earnings_tab"
              className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs"
            >
              {liveUser.role === "viewer" ? "Refs" : "Earn"}
            </TabsTrigger>
            <TabsTrigger
              value="rewards"
              data-ocid="wallet.rewards_tab"
              className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs"
            >
              🎁 Rewards
            </TabsTrigger>
            <TabsTrigger
              value="referral"
              data-ocid="wallet.referral_tab"
              className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs"
            >
              Share
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              data-ocid="wallet.transactions_tab"
              className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs"
            >
              History
            </TabsTrigger>
          </TabsList>

          {/* ── Wallet Tab ─────────────────────────────────────────────────── */}
          <TabsContent value="wallet" className="space-y-5 mt-0">
            {/* Earnings Overview card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              data-ocid="wallet.earnings_overview.card"
              className="rounded-2xl p-5 space-y-3 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.14 0.04 160), oklch(0.10 0.02 160))",
                border: "1px solid oklch(0.55 0.15 160 / 0.3)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <h3 className="text-white font-semibold text-sm">
                  Earnings Overview
                </h3>
              </div>
              {/* Total Earnings */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-white/70 text-xs">Total Earnings</span>
                </div>
                <span className="text-emerald-400 font-bold text-sm">
                  ₹{(liveUser.totalEarnings ?? 0).toFixed(2)}
                </span>
              </div>
              {/* Ad Revenue */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-white/70 text-xs">
                    Ad Revenue (60%)
                  </span>
                </div>
                <span className="text-blue-400 font-bold text-sm">
                  ₹
                  {myVideos
                    .reduce((sum, v) => {
                      const rate = rpm[v.videoType] ?? 2;
                      const gross = (v.viewsCount * rate) / 1000;
                      return sum + gross * 0.6;
                    }, 0)
                    .toFixed(2)}
                </span>
              </div>
              {/* Referral Earnings */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-reels-pink" />
                  <span className="text-white/70 text-xs">
                    Referral Earnings
                  </span>
                </div>
                <span className="text-reels-pink font-bold text-sm">
                  ₹
                  {myReferrals
                    .reduce((sum, r) => sum + r.commissionEarned, 0)
                    .toFixed(0)}
                </span>
              </div>
              {/* Pending Withdrawal */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-white/70 text-xs">
                    Pending Withdrawal
                  </span>
                </div>
                <span className="text-amber-400 font-bold text-sm">
                  ₹{pendingEarnings.toFixed(2)}
                </span>
              </div>
              {/* Withdrawn Amount */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-white/70 text-xs">Withdrawn</span>
                </div>
                <span className="text-green-400 font-bold text-sm">
                  ₹
                  {myWithdrawals
                    .filter((w) => w.status === "paid")
                    .reduce((sum, w) => sum + w.amount, 0)
                    .toFixed(2)}
                </span>
              </div>
            </motion.div>

            {/* Coin balance card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.2 0.06 60), oklch(0.15 0.04 40))",
                border: "1px solid oklch(0.75 0.18 80 / 0.3)",
              }}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10 text-8xl flex items-center justify-center">
                🪙
              </div>

              <p className="text-white/60 text-sm font-medium mb-3">
                Total Balance
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold font-display text-gold">
                  {liveUser.coins}
                </span>
                <span className="text-gold/70 text-lg font-semibold">
                  coins
                </span>
              </div>

              <div className="mt-4 flex gap-3">
                <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-gold font-bold text-lg">
                    {liveUser.coins}
                  </p>
                  <p className="text-white/50 text-xs">Total Coins</p>
                </div>
                <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-gold font-bold text-lg">
                    ₹{(liveUser.pendingEarnings ?? 0).toFixed(0)}
                  </p>
                  <p className="text-white/50 text-xs">₹ Balance</p>
                </div>
              </div>
            </motion.div>

            {/* Referral code card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              data-ocid="wallet.referral_code_card"
              className="rounded-2xl border border-white/10 bg-card p-5 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-reels-pink" />
                <h3 className="text-white font-semibold">Your Referral Code</h3>
              </div>

              <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-center">
                <p className="font-display text-3xl font-bold text-white tracking-widest">
                  {user.referralCode}
                </p>
                <p className="text-white/40 text-xs mt-2">
                  {liveUser.role === "viewer"
                    ? "Share this code · Earn ₹10 per successful referral"
                    : "Share this code · Earn ₹10 per signup + ₹60 when they subscribe"}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  data-ocid="wallet.copy_referral_button"
                  onClick={handleCopyCode}
                  variant="secondary"
                  className="flex-1 h-11 bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
                <Button
                  data-ocid="wallet.share_referral_button"
                  onClick={async () => {
                    const text =
                      liveUser.role === "viewer"
                        ? `Join Ahirani Reels with my referral code ${user.referralCode}! Sign up, verify OTP and watch 3 videos to activate the referral. ${referralUrl}`
                        : `Join Ahirani Reels with my referral code ${user.referralCode} and start watching! 🎬`;
                    try {
                      if (navigator.share) {
                        await navigator.share({
                          title: "Ahirani Reels",
                          text,
                          url: referralUrl,
                        });
                      } else {
                        await navigator.clipboard.writeText(text);
                        toast.success("Share text copied!");
                      }
                    } catch {
                      toast.error("Couldn't share");
                    }
                  }}
                  className="flex-1 h-11 font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </motion.div>

            {/* Watch ad to earn */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-white/10 bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-reels-pink/20 flex items-center justify-center">
                    <Play className="w-5 h-5 text-reels-pink" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Watch Ad</p>
                    <p className="text-white/50 text-xs">
                      Earn 5 coins instantly
                    </p>
                  </div>
                </div>
                <Button
                  data-ocid="wallet.watch_ad_button"
                  onClick={() => setAdOpen(true)}
                  size="sm"
                  className="font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
                  }}
                >
                  +5 🪙
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          {/* ── Earnings / Referrals Tab ─────────────────────────────────────── */}
          <TabsContent value="earnings" className="space-y-5 mt-0">
            {liveUser.role === "viewer" ? (
              /* Viewer gets the full referral earnings dashboard */
              <ViewerReferralDashboard />
            ) : (
              <>
                {/* ── Summary Stats Row (2×2 grid) ── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-ocid="wallet.earnings.section"
                  className="grid grid-cols-2 gap-3"
                >
                  {/* Total Views */}
                  <div
                    className="rounded-2xl p-4 flex flex-col gap-1.5 relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.18 0.04 240), oklch(0.12 0.03 240))",
                      border: "1px solid oklch(0.55 0.15 240 / 0.25)",
                    }}
                  >
                    <Eye className="w-4 h-4 text-blue-400" />
                    <p className="text-blue-300 font-bold text-xl font-display leading-none">
                      {formatCount(
                        myVideos.reduce((s, v) => s + (v.viewsCount ?? 0), 0),
                      )}
                    </p>
                    <p className="text-white/50 text-[11px]">Total Views</p>
                  </div>

                  {/* Ad Impressions */}
                  <div
                    className="rounded-2xl p-4 flex flex-col gap-1.5 relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.18 0.05 10), oklch(0.12 0.03 10))",
                      border: "1px solid oklch(0.65 0.28 15 / 0.25)",
                    }}
                  >
                    <Megaphone className="w-4 h-4 text-reels-pink" />
                    <p className="text-reels-pink font-bold text-xl font-display leading-none">
                      {formatCount(
                        myVideos.reduce(
                          (s, v) => s + (v.adImpressions ?? 0),
                          0,
                        ),
                      )}
                    </p>
                    <p className="text-white/50 text-[11px]">Ad Impressions</p>
                  </div>

                  {/* Total Earned */}
                  <div
                    className="rounded-2xl p-4 flex flex-col gap-1.5 relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.18 0.04 160), oklch(0.12 0.03 160))",
                      border: "1px solid oklch(0.55 0.15 160 / 0.25)",
                    }}
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <p className="text-emerald-400 font-bold text-xl font-display leading-none">
                      ₹{totalEarned.toFixed(2)}
                    </p>
                    <p className="text-white/50 text-[11px]">Total Earned</p>
                  </div>

                  {/* Available Balance */}
                  <div
                    className="rounded-2xl p-4 flex flex-col gap-1.5 relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.18 0.05 70), oklch(0.12 0.03 60))",
                      border: "1px solid oklch(0.75 0.18 80 / 0.25)",
                    }}
                  >
                    <Wallet className="w-4 h-4 text-amber-400" />
                    <p className="text-amber-400 font-bold text-xl font-display leading-none">
                      ₹{pendingEarnings.toFixed(2)}
                    </p>
                    <p className="text-white/50 text-[11px]">
                      Available Balance
                    </p>
                  </div>
                </motion.div>

                {/* Split info */}
                <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/8 px-4 py-2.5">
                  <div className="flex-1 text-center">
                    <p className="text-emerald-400 font-bold text-sm">60%</p>
                    <p className="text-white/40 text-[10px]">Artist Share</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex-1 text-center">
                    <p className="text-white/50 font-bold text-sm">40%</p>
                    <p className="text-white/40 text-[10px]">Platform Share</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex-1 text-center">
                    <p className="text-white/60 font-bold text-sm">
                      ₹{rpm.reel}/{rpm.long}/{rpm.premium}
                    </p>
                    <p className="text-white/40 text-[10px]">
                      RPM Reel/Long/Prem
                    </p>
                  </div>
                </div>

                {/* ── Per-video earnings table ── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-2xl border border-white/10 bg-card overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-white/10">
                    <h3 className="text-white font-semibold text-sm">
                      Video Earnings Breakdown
                    </h3>
                  </div>

                  {myVideos.length === 0 ? (
                    <div
                      data-ocid="wallet.earnings.empty_state"
                      className="py-10 text-center"
                    >
                      <p className="text-3xl mb-2">🎬</p>
                      <p className="text-white/40 text-sm">No videos yet</p>
                      <p className="text-white/30 text-xs mt-1">
                        Upload your first reel to start earning
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Table header */}
                      <div className="px-3 py-2 border-b border-white/5 grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center">
                        <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
                          Video
                        </span>
                        <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider w-12 text-right">
                          Views
                        </span>
                        <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider w-12 text-right">
                          Ad Imp.
                        </span>
                        <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider w-12 text-right">
                          Gross
                        </span>
                        <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider w-14 text-right">
                          Your Share
                        </span>
                      </div>

                      <div className="divide-y divide-white/5">
                        {myVideos.map((video, i) => {
                          const rate = rpm[video.videoType] ?? 2;
                          const gross = (video.viewsCount * rate) / 1000;
                          const artistEarn = gross * 0.6;
                          return (
                            <div
                              key={video.id}
                              data-ocid={`wallet.earnings.item.${i + 1}`}
                              className="px-3 py-2.5 grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center"
                            >
                              <div className="min-w-0">
                                <p className="text-white text-[11px] font-medium truncate leading-tight mb-0.5">
                                  {video.caption.length > 32
                                    ? `${video.caption.slice(0, 32)}…`
                                    : video.caption}
                                </p>
                                <VideoTypeBadge type={video.videoType} />
                              </div>
                              <span className="text-white/50 text-[11px] w-12 text-right tabular-nums">
                                {formatCount(video.viewsCount ?? 0)}
                              </span>
                              <span className="text-reels-pink/80 text-[11px] w-12 text-right tabular-nums">
                                {formatCount(video.adImpressions ?? 0)}
                              </span>
                              <span className="text-white/40 text-[11px] w-12 text-right tabular-nums">
                                ₹{gross.toFixed(1)}
                              </span>
                              <span className="text-emerald-400 font-bold text-[11px] w-14 text-right tabular-nums">
                                ₹{artistEarn.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </motion.div>

                {/* ── Withdrawal form ── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-white/10 bg-card p-5 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-white font-semibold">
                      Request Withdrawal
                    </h3>
                  </div>
                  <p className="text-white/40 text-xs -mt-1">
                    Minimum ₹200 · Processed within 2-3 business days
                  </p>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="withdraw-name"
                        className="text-white/70 text-xs font-medium"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="withdraw-name"
                        data-ocid="wallet.withdraw_name_input"
                        placeholder="Your full name"
                        value={withdrawName}
                        onChange={(e) => setWithdrawName(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="upi-id"
                        className="text-white/70 text-xs font-medium"
                      >
                        UPI ID
                      </Label>
                      <Input
                        id="upi-id"
                        data-ocid="wallet.upi_input"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="withdraw-amount"
                        className="text-white/70 text-xs font-medium"
                      >
                        Amount (₹)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm font-medium">
                          ₹
                        </span>
                        <Input
                          id="withdraw-amount"
                          data-ocid="wallet.amount_input"
                          type="number"
                          min={200}
                          step={1}
                          placeholder="200"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="pl-7 bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
                        />
                      </div>
                      <p className="text-white/30 text-[10px]">
                        Available: ₹{pendingEarnings.toFixed(2)} · Min: ₹200
                      </p>
                    </div>
                  </div>

                  <Button
                    data-ocid="wallet.withdraw_button"
                    onClick={handleWithdraw}
                    disabled={withdrawLoading}
                    className="w-full h-11 font-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.5 0.18 160), oklch(0.45 0.14 160))",
                    }}
                  >
                    {withdrawLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <>
                        <IndianRupee className="w-4 h-4 mr-1.5" />
                        Request Withdrawal
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* ── Withdrawal history ── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl border border-white/10 bg-card overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-white/10">
                    <h3 className="text-white font-semibold text-sm">
                      Withdrawal History
                    </h3>
                  </div>

                  {myWithdrawals.length === 0 ? (
                    <div
                      data-ocid="wallet.withdrawals.empty_state"
                      className="py-10 text-center"
                    >
                      <p className="text-3xl mb-2">💸</p>
                      <p className="text-white/40 text-sm">
                        No withdrawal requests yet
                      </p>
                      <p className="text-white/30 text-xs mt-1">
                        Your requests will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {myWithdrawals.map((w, i) => (
                        <div
                          key={w.id}
                          data-ocid={`wallet.withdrawal.item.${i + 1}`}
                          className="px-4 py-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium">
                              ₹{w.amount.toFixed(2)}
                            </p>
                            <p className="text-white/40 text-xs truncate">
                              {w.upiId}
                            </p>
                            <p className="text-white/30 text-[10px] mt-0.5">
                              {formatTime(w.createdAt)} ago
                            </p>
                          </div>
                          <WithdrawalStatusBadge status={w.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* ── RPM info ── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-2xl border border-white/10 bg-card p-4"
                >
                  <p className="text-white/50 text-xs mb-3 font-medium">
                    Current RPM Rates (per 1,000 views)
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["reel", "long", "premium"] as VideoType[]).map((t) => (
                      <div
                        key={t}
                        className="rounded-xl bg-white/5 p-2 text-center"
                      >
                        <VideoTypeBadge type={t} />
                        <p className="text-white font-bold text-sm mt-1.5">
                          ₹{rpm[t].toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/30 text-[10px] mt-2 text-center">
                    Formula: (Views × RPM) / 1000 × 60% artist share
                  </p>
                </motion.div>
              </>
            )}
          </TabsContent>

          {/* ── Share / Referrals Tab ────────────────────────────────────────── */}
          <TabsContent value="referral" className="space-y-5 mt-0">
            {/* Stats row — 3 cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-2"
              data-ocid="wallet.referral.section"
            >
              <div
                className="rounded-2xl p-3 flex flex-col gap-1.5 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.18 0.04 300), oklch(0.12 0.03 300))",
                  border: "1px solid oklch(0.55 0.12 300 / 0.25)",
                }}
              >
                <Users className="w-4 h-4 text-blue-400" />
                <p className="text-blue-300 font-bold text-xl font-display leading-none">
                  {myReferrals.length}
                </p>
                <p className="text-white/50 text-[10px]">Total Referrals</p>
              </div>
              <div
                className="rounded-2xl p-3 flex flex-col gap-1.5 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.18 0.04 160), oklch(0.12 0.03 160))",
                  border: "1px solid oklch(0.55 0.15 160 / 0.25)",
                }}
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <p className="text-emerald-400 font-bold text-xl font-display leading-none">
                  ₹{totalReferralCommission}
                </p>
                <p className="text-white/50 text-[10px]">Total Commission</p>
              </div>
              <div
                className="rounded-2xl p-3 flex flex-col gap-1.5 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.18 0.05 70), oklch(0.12 0.03 60))",
                  border: "1px solid oklch(0.75 0.18 80 / 0.25)",
                }}
              >
                <Gift className="w-4 h-4 text-amber-400" />
                <p className="text-amber-400 font-bold text-xl font-display leading-none">
                  ₹{subscriptionBonusCount * 60}
                </p>
                <p className="text-white/50 text-[10px]">Sub Bonuses</p>
              </div>
            </motion.div>

            {/* Referral code card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              data-ocid="wallet.referral.code_card"
              className="rounded-2xl border border-white/10 bg-card p-5 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-reels-pink" />
                <h3 className="text-white font-semibold">Your Referral Code</h3>
              </div>

              <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-center">
                <p className="font-display text-3xl font-bold text-white tracking-widest">
                  {user.referralCode}
                </p>
                <p className="text-white/40 text-xs mt-2">
                  {liveUser.role === "viewer"
                    ? "Earn ₹10 per successful referral"
                    : "Share your code · Earn ₹60 when they subscribe"}
                </p>
              </div>

              {/* Referral link row */}
              <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                <Link2 className="w-3.5 h-3.5 text-white/30 shrink-0" />
                <p className="flex-1 text-white/50 text-xs truncate font-mono">
                  {referralUrl}
                </p>
                <button
                  type="button"
                  data-ocid="wallet.referral.copy_link_button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(referralUrl);
                      toast.success("Referral link copied!");
                    } catch {
                      toast.error("Couldn't copy link");
                    }
                  }}
                  className="shrink-0 text-white/50 hover:text-white transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Copy code button */}
              <Button
                data-ocid="wallet.referral.copy_button"
                onClick={handleCopyCode}
                variant="secondary"
                className="w-full h-11 bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
            </motion.div>

            {/* Share buttons row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="rounded-2xl border border-white/10 bg-card p-5 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-white/50" />
                <h3 className="text-white font-semibold">Share Via</h3>
              </div>
              <ShareButtonsRow referralCode={user.referralCode} />
            </motion.div>

            {/* Per-referral activity list */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-white/10 bg-card overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                <Users className="w-4 h-4 text-white/50" />
                <h3 className="text-white font-semibold text-sm">
                  Referral Activity
                </h3>
                <span className="ml-auto text-white/30 text-xs">
                  {myReferrals.length} referral
                  {myReferrals.length !== 1 ? "s" : ""}
                </span>
              </div>

              {myReferrals.length === 0 ? (
                <div
                  data-ocid="wallet.referral.empty_state"
                  className="py-12 text-center"
                >
                  <p className="text-3xl mb-2">👥</p>
                  <p className="text-white/40 text-sm">No referrals yet</p>
                  <p className="text-white/30 text-xs mt-1">
                    Share your code to start earning
                  </p>
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div className="px-4 py-2 bg-white/5 border-b border-white/10 grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                    <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">
                      Referred User
                    </span>
                    <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider w-20 text-center">
                      Date
                    </span>
                    <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider w-16 text-right">
                      Earned
                    </span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {myReferrals.map((referral, i) => {
                      const progress =
                        state.viewerReferralProgress[referral.referredUserId];
                      return (
                        <div
                          key={`${referral.referrerId}-${referral.referredUserId}`}
                          data-ocid={`wallet.referral.item.${i + 1}`}
                          className="px-4 py-3 grid grid-cols-[1fr_auto_auto] gap-3 items-center"
                        >
                          {/* Referred user */}
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                              <span className="text-white font-bold text-xs">
                                {referral.referredUsername[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-xs font-medium truncate">
                                @{referral.referredUsername}
                              </p>
                              {referral.subscriptionReferralEarned ? (
                                <span className="text-emerald-400/80 text-[10px]">
                                  Subscribed
                                </span>
                              ) : progress?.rewardPaid ? (
                                <span className="text-emerald-400/80 text-[10px]">
                                  Reward paid
                                </span>
                              ) : progress?.otpVerified ? (
                                <span className="text-amber-400/80 text-[10px]">
                                  {Math.min(progress.videosWatched, 3)}/3 videos
                                </span>
                              ) : (
                                <span className="text-white/30 text-[10px]">
                                  Pending OTP
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Date */}
                          <span className="text-white/40 text-[10px] w-20 text-center">
                            {new Date(referral.createdAt).toLocaleDateString(
                              "en-IN",
                              { day: "2-digit", month: "short" },
                            )}
                          </span>
                          {/* Amount */}
                          <span className="text-emerald-400 font-bold text-sm w-16 text-right">
                            +₹{referral.commissionEarned}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          </TabsContent>

          {/* ── Rewards Tab ──────────────────────────────────────────────────── */}
          <TabsContent value="rewards" className="space-y-5 mt-0">
            <DailyBonusCard />
            <SpinWheel />
          </TabsContent>

          {/* ── Transactions Tab ─────────────────────────────────────────────── */}
          <TabsContent value="transactions" className="space-y-5 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-card overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-white/50" />
                <h3 className="text-white font-semibold text-sm">
                  Transaction History
                </h3>
                <span className="ml-auto text-white/30 text-xs">
                  {myTransactions.length} entries
                </span>
              </div>

              {myTransactions.length === 0 ? (
                <div
                  data-ocid="wallet.transactions.empty_state"
                  className="py-12 text-center"
                >
                  <p className="text-3xl mb-2">📋</p>
                  <p className="text-white/40 text-sm">No transactions yet</p>
                  <p className="text-white/30 text-xs mt-1">
                    Your earnings and withdrawals will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {myTransactions.map((tx, i) => {
                    const isCredit =
                      tx.txType === "ad_earnings" ||
                      tx.txType === "referral_credit" ||
                      tx.txType === "withdrawal_rejected" ||
                      tx.txType === "daily_bonus" ||
                      tx.txType === "spin_reward";
                    const isDebit =
                      tx.txType === "withdrawal_requested" ||
                      tx.txType === "subscription_payment";
                    return (
                      <div
                        key={tx.id}
                        data-ocid={`wallet.transaction.item.${i + 1}`}
                        className="px-4 py-3 flex items-start gap-3"
                      >
                        {/* Icon */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isCredit
                              ? "bg-green-500/15"
                              : isDebit
                                ? "bg-amber-500/15"
                                : "bg-blue-500/15"
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-400" />
                          ) : isDebit ? (
                            <ArrowUpRight className="w-4 h-4 text-amber-400" />
                          ) : (
                            <IndianRupee className="w-3.5 h-3.5 text-blue-400" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <TxTypeBadge txType={tx.txType} />
                          </div>
                          <p className="text-white/70 text-xs truncate leading-relaxed">
                            {tx.description}
                          </p>
                          <p className="text-white/30 text-[10px] mt-0.5">
                            {formatTime(tx.createdAt)} ago
                          </p>
                        </div>

                        {/* Amount */}
                        <div className="shrink-0 text-right">
                          <p
                            className={`font-bold text-sm ${
                              isCredit
                                ? "text-green-400"
                                : isDebit
                                  ? "text-amber-400"
                                  : "text-blue-400"
                            }`}
                          >
                            {isCredit ? "+" : isDebit ? "-" : ""}₹
                            {tx.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Rewarded ad modal */}
      <RewardedAd
        open={adOpen}
        onClose={() => setAdOpen(false)}
        onEarn={handleEarnCoins}
        userId={user.id}
      />
    </div>
  );
}
