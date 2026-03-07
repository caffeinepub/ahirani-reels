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
  CircleDollarSign,
  Clock,
  Copy,
  Eye,
  Flame,
  Gift,
  Heart,
  IndianRupee,
  Link2,
  ListChecks,
  Megaphone,
  Play,
  ReceiptText,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  SiFacebook,
  SiInstagram,
  SiTelegram,
  SiWhatsapp,
} from "react-icons/si";
import { toast } from "sonner";
import { RewardedAd } from "../components/ads/RewardedAd";
import type {
  Transaction,
  VideoType,
  WithdrawalRequest,
} from "../context/AppContext";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";
import { getReferralLink, shareReferralLink } from "../hooks/useReferralShare";
import { formatCount, formatTime } from "../utils/trending";

// ─── Coin Balance Card ────────────────────────────────────────────────────────

function CoinBalanceCard() {
  const { state } = useApp();
  const user = state.currentUser;
  const liveUser = user
    ? (state.users.find((u) => u.id === user.id) ?? user)
    : null;

  if (!liveUser) return null;

  const coins = liveUser.coins ?? 0;
  const rupeesEquivalent = (coins / 100) * 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      data-ocid="wallet.coin_balance.card"
      className="rounded-2xl relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.2 0.08 70), oklch(0.14 0.05 55))",
        border: "1px solid oklch(0.78 0.2 85 / 0.4)",
      }}
    >
      {/* Decorative glow */}
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none opacity-20"
        style={{
          background:
            "radial-gradient(circle, oklch(0.88 0.22 80), transparent 70%)",
        }}
      />
      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "oklch(0.78 0.2 80 / 0.25)" }}
            >
              <CircleDollarSign className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Coin Balance</p>
              <p className="text-amber-300/60 text-[10px]">100 coins = ₹10</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-amber-200 font-black text-3xl font-display leading-none">
              {coins}
            </p>
            <p className="text-amber-300/60 text-[10px] mt-0.5">coins</p>
          </div>
        </div>
        <div
          className="rounded-xl flex items-center justify-between px-4 py-3"
          style={{
            background: "oklch(1 0 0 / 0.07)",
            border: "1px solid oklch(1 0 0 / 0.12)",
          }}
        >
          <span className="text-white/60 text-xs">Equivalent value</span>
          <span className="text-amber-300 font-bold text-base">
            ₹{rupeesEquivalent.toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Daily Tasks Card ─────────────────────────────────────────────────────────

function DailyTasksCard() {
  const { state } = useApp();
  const user = state.currentUser;
  const liveUser = user
    ? (state.users.find((u) => u.id === user.id) ?? user)
    : null;

  // Countdown to midnight
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
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
  }, []);

  if (!liveUser) return null;

  const todayStr = new Date().toDateString();
  const isToday = (liveUser.dailyTasksDate ?? "") === todayStr;

  // Use today's values if same day, otherwise show 0
  const watchCount = isToday ? (liveUser.dailyWatchCount ?? 0) : 0;
  const likeCount = isToday ? (liveUser.dailyLikeCount ?? 0) : 0;
  const followCount = isToday ? (liveUser.dailyFollowCount ?? 0) : 0;
  const shareCount = isToday ? (liveUser.dailyShareCount ?? 0) : 0;

  const taskWatchDone = isToday && (liveUser.taskWatchDone ?? false);
  const taskLikeDone = isToday && (liveUser.taskLikeDone ?? false);
  const taskFollowDone = isToday && (liveUser.taskFollowDone ?? false);
  const taskShareDone = isToday && (liveUser.taskShareDone ?? false);

  const allDone =
    taskWatchDone && taskLikeDone && taskFollowDone && taskShareDone;

  const tasks = [
    {
      icon: <Eye className="w-4 h-4 text-blue-400" />,
      label: "Watch 5 videos",
      reward: 2,
      current: Math.min(taskWatchDone ? 5 : watchCount, 5),
      target: 5,
      done: taskWatchDone,
      ocid: "wallet.tasks.watch_task",
    },
    {
      icon: <Heart className="w-4 h-4 text-reels-pink" />,
      label: "Like 3 videos",
      reward: 1,
      current: Math.min(taskLikeDone ? 3 : likeCount, 3),
      target: 3,
      done: taskLikeDone,
      ocid: "wallet.tasks.like_task",
    },
    {
      icon: <UserPlus className="w-4 h-4 text-emerald-400" />,
      label: "Follow 1 artist",
      reward: 1,
      current: Math.min(taskFollowDone ? 1 : followCount, 1),
      target: 1,
      done: taskFollowDone,
      ocid: "wallet.tasks.follow_task",
    },
    {
      icon: <Share2 className="w-4 h-4 text-violet-400" />,
      label: "Share 1 video",
      reward: 1,
      current: Math.min(taskShareDone ? 1 : shareCount, 1),
      target: 1,
      done: taskShareDone,
      ocid: "wallet.tasks.share_task",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      data-ocid="wallet.tasks.card"
      className="rounded-2xl overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.13 0.04 200 / 0.95), oklch(0.10 0.02 190 / 0.98))",
        border: "1px solid oklch(0.55 0.15 200 / 0.3)",
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(0.55 0.18 200 / 0.25)" }}
          >
            <ListChecks className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Daily Tasks</h3>
            <p className="text-white/40 text-[10px]">
              Complete tasks to earn coins
            </p>
          </div>
        </div>
        {allDone ? (
          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <Check className="w-2.5 h-2.5" />
            All Done!
          </span>
        ) : (
          <span className="text-white/30 text-[10px] font-mono">
            {timeLeft}
          </span>
        )}
      </div>

      {/* Tasks list */}
      <div className="px-5 pb-4 space-y-3">
        {tasks.map((task) => {
          const progress = (task.current / task.target) * 100;
          return (
            <div
              key={task.ocid}
              data-ocid={task.ocid}
              className="rounded-xl p-3.5"
              style={{
                background: task.done
                  ? "oklch(0.55 0.18 160 / 0.12)"
                  : "oklch(1 0 0 / 0.05)",
                border: task.done
                  ? "1px solid oklch(0.55 0.18 160 / 0.25)"
                  : "1px solid oklch(1 0 0 / 0.08)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: task.done
                        ? "oklch(0.55 0.18 160 / 0.2)"
                        : "oklch(1 0 0 / 0.08)",
                    }}
                  >
                    {task.done ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      task.icon
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${task.done ? "text-emerald-400" : "text-white"}`}
                    >
                      {task.label}
                    </p>
                    <p className="text-white/40 text-[10px]">
                      {task.done
                        ? `Done! +${task.reward} coin${task.reward > 1 ? "s" : ""}`
                        : `${task.current}/${task.target}`}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold ${task.done ? "text-emerald-400" : "text-amber-300"}`}
                >
                  +{task.reward}🪙
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: task.done
                      ? "oklch(0.65 0.2 160)"
                      : "linear-gradient(90deg, oklch(0.6 0.18 200), oklch(0.7 0.2 210))",
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* All tasks complete message */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-center"
          >
            <p className="text-emerald-300 text-xs font-semibold">
              🎉 All tasks complete! Come back tomorrow.
            </p>
            <p className="text-white/30 text-[10px] mt-1 font-mono">
              Resets in {timeLeft}
            </p>
          </motion.div>
        )}

        {/* Coins earned today */}
        {!allDone && (
          <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/8 px-3.5 py-2.5">
            <span className="text-white/50 text-xs">Coins from tasks</span>
            <span className="text-amber-300 font-bold text-sm">
              {(taskWatchDone ? 2 : 0) +
                (taskLikeDone ? 1 : 0) +
                (taskFollowDone ? 1 : 0) +
                (taskShareDone ? 1 : 0)}{" "}
              / 5 🪙
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

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
    watch_reward: {
      label: "Watch Reward",
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    task_reward: {
      label: "Task Reward",
      className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    },
    gift_sent: {
      label: "Gift Sent",
      className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    gift_received: {
      label: "Gift Received",
      className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    },
    promotion_payment: {
      label: "Promotion",
      className: "bg-violet-500/20 text-violet-400 border-violet-500/30",
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
  const referralUrl = getReferralLink(referralCode);

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `खान्देशी कलाकारांसाठी Reel App. माझ्या लिंकने जॉइन करा. ${referralUrl}`,
  )}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(
    "खान्देशी कलाकारांसाठी Reel App. माझ्या लिंकने जॉइन करा.",
  )}`;

  const handleWhatsApp = () => window.open(whatsappUrl, "_blank");
  const handleFacebook = () => window.open(facebookUrl, "_blank");
  const handleTelegram = () => window.open(telegramUrl, "_blank");

  const handleInstagram = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast.success("लिंक कॉपी झाली — Instagram वर paste करा!");
    } catch {
      toast.error("लिंक कॉपी होऊ शकली नाही");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success("रेफरल लिंक कॉपी झाली!");
    } catch {
      toast.error("लिंक कॉपी होऊ शकली नाही");
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
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

      {/* Facebook */}
      <button
        type="button"
        data-ocid="wallet.referral.facebook_button"
        onClick={handleFacebook}
        className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 transition-all hover:scale-105 active:scale-95 border border-blue-600/20"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.07 250), oklch(0.13 0.05 248))",
        }}
      >
        <SiFacebook className="w-5 h-5 text-blue-400" />
        <span className="text-blue-300 text-[10px] font-semibold">
          Facebook
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
  const { state } = useApp();
  const user = state.currentUser!;
  const liveUser = state.users.find((u) => u.id === user.id) ?? user;

  const myReferrals = state.referrals.filter((r) => r.referrerId === user.id);
  const successfulReferrals = myReferrals.filter((r) => {
    const progress = state.viewerReferralProgress[r.referredUserId];
    return progress?.rewardPaid === true;
  });

  const pendingEarnings = liveUser.pendingEarnings ?? 0;
  const referralUrl = getReferralLink(user.referralCode);

  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.success("रेफरल लिंक कॉपी झाली!");
    } catch {
      toast.error("कॉपी होऊ शकली नाही");
    }
  };

  const handleShareLink = async () => {
    await shareReferralLink(user.referralCode);
  };

  // ── Tier milestone calculations ────────────────────────────────────────────
  const tiers = [
    { referrals: 1, earning: 5, label: "Starter", icon: "🏁" },
    { referrals: 10, earning: 50, label: "Pro", icon: "🎯" },
    { referrals: 100, earning: 500, label: "Champion", icon: "🏆" },
  ];
  const totalReferrals = myReferrals.length;
  const currentTierIdx = tiers.reduce(
    (acc, tier, i) => (totalReferrals >= tier.referrals ? i : acc),
    -1,
  );
  const nextTier = tiers[currentTierIdx + 1];
  const prevTierCount =
    currentTierIdx >= 0 ? tiers[currentTierIdx].referrals : 0;
  const progressToNext = nextTier
    ? Math.min(
        ((totalReferrals - prevTierCount) /
          (nextTier.referrals - prevTierCount)) *
          100,
        100,
      )
    : 100;

  return (
    <div className="space-y-4">
      {/* ── SECTION 1: TikTok-style Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        data-ocid="wallet.viewer_referral.hero_card"
        className="rounded-2xl relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.12 0.08 280), oklch(0.10 0.06 320), oklch(0.08 0.04 350))",
          border: "1px solid oklch(0.45 0.18 300 / 0.35)",
        }}
      >
        {/* Decorative glows */}
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.7 0.25 330), transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-15 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.22 160), transparent 70%)",
          }}
        />

        <div className="relative z-10 p-5">
          {/* Top label */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "oklch(0.55 0.22 330 / 0.3)" }}
              >
                <Gift className="w-4 h-4 text-pink-300" />
              </div>
              <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">
                Referral Dashboard
              </span>
            </div>
            <Badge
              className="text-[10px] px-2 py-0.5 font-semibold"
              style={{
                background: "oklch(0.55 0.22 160 / 0.25)",
                color: "oklch(0.8 0.18 160)",
                border: "1px solid oklch(0.55 0.18 160 / 0.4)",
              }}
            >
              {successfulReferrals.length} Successful
            </Badge>
          </div>

          {/* Big earnings number — center stage */}
          <div className="text-center mb-4">
            <p className="text-white/40 text-xs font-medium mb-1">
              Total Earnings
            </p>
            <p
              className="font-display font-black leading-none"
              style={{
                fontSize: "clamp(3rem, 12vw, 4.5rem)",
                background:
                  "linear-gradient(135deg, oklch(0.85 0.18 160), oklch(0.75 0.22 180))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ₹{pendingEarnings.toFixed(0)}
            </p>
            <p className="text-emerald-400/60 text-xs mt-1">
              available to withdraw
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div
              className="rounded-xl p-3 text-center"
              style={{
                background: "oklch(1 0 0 / 0.06)",
                border: "1px solid oklch(1 0 0 / 0.1)",
              }}
            >
              <p className="text-white font-black text-2xl font-display leading-none">
                {totalReferrals}
              </p>
              <p className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wider">
                Total Referrals
              </p>
            </div>
            <div
              className="rounded-xl p-3 text-center"
              style={{
                background: "oklch(0.55 0.22 330 / 0.15)",
                border: "1px solid oklch(0.55 0.22 330 / 0.25)",
              }}
            >
              <p className="text-pink-300 font-black text-2xl font-display leading-none">
                ₹5
              </p>
              <p className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wider">
                Per Referral
              </p>
            </div>
          </div>

          {/* Referral code — large and bold */}
          <div
            className="rounded-xl p-3 flex items-center justify-between gap-3 mb-3"
            style={{
              background: "oklch(1 0 0 / 0.07)",
              border: "1px solid oklch(1 0 0 / 0.15)",
            }}
          >
            <div className="min-w-0">
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">
                Your Code
              </p>
              <p className="font-display font-black text-white text-xl tracking-widest truncate">
                {user.referralCode}
              </p>
              <p className="text-white/25 text-[9px] font-mono truncate mt-0.5">
                {referralUrl}
              </p>
            </div>
            <button
              type="button"
              data-ocid="wallet.viewer_referral.copy_code_button"
              onClick={handleCopyCode}
              className="shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all active:scale-95"
              style={{
                background: copiedCode
                  ? "oklch(0.55 0.18 160 / 0.4)"
                  : "oklch(1 0 0 / 0.12)",
                border: copiedCode
                  ? "1px solid oklch(0.55 0.18 160 / 0.5)"
                  : "1px solid oklch(1 0 0 / 0.2)",
                color: copiedCode ? "oklch(0.8 0.18 160)" : "white",
              }}
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Share CTA */}
          <Button
            data-ocid="wallet.viewer_referral.share_button"
            onClick={handleShareLink}
            className="w-full h-11 font-bold text-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.22 330), oklch(0.5 0.2 300))",
              border: "none",
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Referral Link
          </Button>
        </div>
      </motion.div>

      {/* ── SECTION 2: Tier Milestone Track ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07 }}
        data-ocid="wallet.viewer_referral.milestone_card"
        className="rounded-2xl border border-white/10 bg-card p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <h3 className="text-white font-semibold">Earning Milestones</h3>
        </div>

        {/* Tier milestones */}
        <div className="grid grid-cols-3 gap-2">
          {tiers.map((tier, i) => {
            const reached = totalReferrals >= tier.referrals;
            const isNext = i === currentTierIdx + 1;
            return (
              <div
                key={tier.referrals}
                data-ocid={`wallet.viewer_referral.milestone.${i + 1}`}
                className="rounded-xl p-3 text-center relative overflow-hidden transition-all"
                style={{
                  background: reached
                    ? "linear-gradient(135deg, oklch(0.18 0.06 80), oklch(0.14 0.04 75))"
                    : isNext
                      ? "oklch(1 0 0 / 0.05)"
                      : "oklch(1 0 0 / 0.03)",
                  border: reached
                    ? "1px solid oklch(0.65 0.18 80 / 0.5)"
                    : isNext
                      ? "1px solid oklch(0.65 0.18 80 / 0.25)"
                      : "1px solid oklch(1 0 0 / 0.08)",
                }}
              >
                {reached && (
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at top, oklch(0.75 0.22 80), transparent 70%)",
                    }}
                  />
                )}
                <div className="text-2xl mb-1">{tier.icon}</div>
                <p
                  className="font-black text-xl font-display leading-none"
                  style={{
                    color: reached
                      ? "oklch(0.82 0.2 80)"
                      : isNext
                        ? "oklch(0.7 0.14 80)"
                        : "oklch(0.5 0.03 0)",
                  }}
                >
                  ₹{tier.earning}
                </p>
                <p
                  className="text-[10px] mt-0.5"
                  style={{
                    color: reached
                      ? "oklch(0.7 0.12 80)"
                      : "oklch(0.45 0.02 0)",
                  }}
                >
                  {tier.referrals} ref{tier.referrals > 1 ? "s" : ""}
                </p>
                {reached && (
                  <div className="mt-1.5 flex justify-center">
                    <CheckCircle2
                      className="w-3.5 h-3.5"
                      style={{ color: "oklch(0.75 0.2 80)" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar toward next milestone */}
        {nextTier && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/50 text-xs">
                Progress to{" "}
                <span className="text-amber-400 font-semibold">
                  {nextTier.icon} ₹{nextTier.earning}
                </span>
              </span>
              <span className="text-white/50 text-xs tabular-nums">
                {totalReferrals}/{nextTier.referrals}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="h-full rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.65 0.18 80), oklch(0.75 0.22 90))",
                }}
              />
            </div>
            <p className="text-white/40 text-[10px] text-center">
              {nextTier.referrals - totalReferrals} more referral
              {nextTier.referrals - totalReferrals !== 1 ? "s" : ""} to reach ₹
              {nextTier.earning}
            </p>
          </div>
        )}
        {!nextTier && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-center">
            <p className="text-amber-300 text-xs font-semibold">
              🏆 Champion Tier Reached! Keep earning ₹5 per referral.
            </p>
          </div>
        )}
      </motion.div>

      {/* ── SECTION 3: Share Row (5 buttons) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        data-ocid="wallet.viewer_referral.share_card"
        className="rounded-2xl border border-white/10 bg-card p-5 space-y-3"
      >
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-white/50" />
          <h3 className="text-white font-semibold">Share Your Link</h3>
        </div>

        {/* Referral link display */}
        <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
          <Link2 className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <p className="flex-1 text-white/50 text-xs truncate font-mono">
            {referralUrl}
          </p>
          <button
            type="button"
            data-ocid="wallet.viewer_referral.copy_link_button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(referralUrl);
                toast.success("रेफरल लिंक कॉपी झाली!");
              } catch {
                toast.error("लिंक कॉपी होऊ शकली नाही");
              }
            }}
            className="shrink-0 text-white/50 hover:text-white transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        <ShareButtonsRow referralCode={user.referralCode} />
      </motion.div>

      {/* ── SECTION 4: Referral Activity ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
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
              Share your code to start earning ₹5 per successful referral
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
    </div>
  );
}

// ─── Viewer Points Dashboard ──────────────────────────────────────────────────

type PaymentMethod = "upi" | "paytm" | "bank";

function ViewerPointsDashboard() {
  const { state, dispatch } = useApp();
  const user = state.currentUser!;
  const liveUser = state.users.find((u) => u.id === user.id) ?? user;

  const myTransactions = (state.transactions ?? []).filter(
    (tx) => tx.userId === user.id,
  );
  const myReferrals = state.referrals.filter((r) => r.referrerId === user.id);
  const myWithdrawals = state.withdrawalRequests.filter(
    (w) => w.userId === user.id,
  );

  // Compute category sums
  const referralEarnings = myTransactions
    .filter((tx) => tx.txType === "referral_credit")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const watchRewards = myTransactions
    .filter((tx) => tx.txType === "watch_reward")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const loginRewards = myTransactions
    .filter((tx) => tx.txType === "daily_bonus")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalPoints = liveUser.points ?? 0;
  const pendingEarnings = liveUser.pendingEarnings ?? 0;

  // Withdrawal form state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [fullName, setFullName] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [paytmNumber, setPaytmNumber] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const handleWithdraw = async () => {
    const amount = Number.parseFloat(withdrawAmount);

    if (!fullName.trim()) {
      toast.error("Please enter your full name");
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

    if (paymentMethod === "upi" && !upiId.trim()) {
      toast.error("Please enter your UPI ID");
      return;
    }
    if (
      paymentMethod === "paytm" &&
      (!paytmNumber.trim() || paytmNumber.trim().length !== 10)
    ) {
      toast.error("Please enter a valid 10-digit Paytm number");
      return;
    }
    if (paymentMethod === "bank") {
      if (!bankAccount.trim() || !bankIfsc.trim() || !bankHolder.trim()) {
        toast.error("Please fill in all bank transfer details");
        return;
      }
    }

    setWithdrawLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const request: import("../context/AppContext").WithdrawalRequest = {
      id: `w${Date.now()}`,
      userId: user.id,
      upiId: paymentMethod === "upi" ? upiId.trim() : "",
      userName: fullName.trim(),
      amount,
      status: "pending",
      createdAt: Date.now(),
      resolvedAt: 0,
      processedAt: 0,
      paymentMethod,
      paytmNumber: paymentMethod === "paytm" ? paytmNumber.trim() : undefined,
      bankAccountNumber:
        paymentMethod === "bank" ? bankAccount.trim() : undefined,
      bankIfsc: paymentMethod === "bank" ? bankIfsc.trim() : undefined,
      bankAccountHolder:
        paymentMethod === "bank" ? bankHolder.trim() : undefined,
    };

    dispatch({ type: "REQUEST_WITHDRAWAL", request });

    // Reset form
    setFullName("");
    setWithdrawAmount("");
    setUpiId("");
    setPaytmNumber("");
    setBankAccount("");
    setBankIfsc("");
    setBankHolder("");
    setWithdrawLoading(false);

    const methodLabel =
      paymentMethod === "upi"
        ? `UPI: ${upiId.trim()}`
        : paymentMethod === "paytm"
          ? `Paytm: ${paytmNumber.trim()}`
          : `Bank: ${bankHolder.trim()}`;

    toast.success("Withdrawal request submitted!", {
      description: `₹${amount.toFixed(2)} to ${methodLabel} — pending admin approval`,
    });
  };

  const watchedToday = liveUser.watchedVideosToday ?? 0;
  const watchProgress = Math.min((watchedToday / 10) * 100, 100);

  const totalEarningsAll = referralEarnings + watchRewards + loginRewards;

  return (
    <div className="space-y-4">
      {/* ── Total Earnings Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        data-ocid="wallet.earnings.hero_card"
        className="rounded-2xl relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.06 160), oklch(0.10 0.04 160))",
          border: "1px solid oklch(0.55 0.18 160 / 0.4)",
        }}
      >
        <div
          className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-15 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.7 0.22 160), transparent 70%)",
          }}
        />
        <div className="relative z-10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">
              गुण / Earnings
            </span>
          </div>
          <div className="text-center mb-4">
            <p className="text-white/40 text-xs mb-1">Total Earnings</p>
            <p
              className="font-display font-black leading-none"
              style={{
                fontSize: "clamp(2.5rem, 10vw, 4rem)",
                background:
                  "linear-gradient(135deg, oklch(0.82 0.18 160), oklch(0.72 0.22 180))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ₹{totalEarningsAll.toFixed(0)}
            </p>
            <p className="text-emerald-400/60 text-xs mt-1">
              available to withdraw
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div
              className="rounded-xl p-2.5 text-center"
              style={{
                background: "oklch(1 0 0 / 0.06)",
                border: "1px solid oklch(1 0 0 / 0.1)",
              }}
            >
              <p className="text-reels-pink font-bold text-base font-display leading-none">
                ₹{referralEarnings.toFixed(0)}
              </p>
              <p className="text-white/40 text-[9px] mt-0.5 uppercase tracking-wider">
                Referral
              </p>
            </div>
            <div
              className="rounded-xl p-2.5 text-center"
              style={{
                background: "oklch(1 0 0 / 0.06)",
                border: "1px solid oklch(1 0 0 / 0.1)",
              }}
            >
              <p className="text-blue-300 font-bold text-base font-display leading-none">
                ₹{watchRewards.toFixed(0)}
              </p>
              <p className="text-white/40 text-[9px] mt-0.5 uppercase tracking-wider">
                Watch
              </p>
            </div>
            <div
              className="rounded-xl p-2.5 text-center"
              style={{
                background: "oklch(1 0 0 / 0.06)",
                border: "1px solid oklch(1 0 0 / 0.1)",
              }}
            >
              <p className="text-violet-300 font-bold text-base font-display leading-none">
                ₹{loginRewards.toFixed(0)}
              </p>
              <p className="text-white/40 text-[9px] mt-0.5 uppercase tracking-wider">
                Login
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        data-ocid="wallet.points.section"
        className="grid grid-cols-2 gap-3"
      >
        {/* Total Points */}
        <div
          className="rounded-2xl p-4 flex flex-col gap-1.5 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.06 280), oklch(0.12 0.04 280))",
            border: "1px solid oklch(0.6 0.2 280 / 0.3)",
          }}
        >
          <Sparkles className="w-4 h-4 text-violet-400" />
          <p className="text-violet-300 font-bold text-2xl font-display leading-none">
            {totalPoints}
          </p>
          <p className="text-white/50 text-[11px]">Total Points</p>
        </div>

        {/* Referral Earnings */}
        <div
          className="rounded-2xl p-4 flex flex-col gap-1.5 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.05 340), oklch(0.12 0.03 340))",
            border: "1px solid oklch(0.65 0.25 340 / 0.3)",
          }}
        >
          <Users className="w-4 h-4 text-reels-pink" />
          <p className="text-reels-pink font-bold text-2xl font-display leading-none">
            ₹{referralEarnings.toFixed(0)}
          </p>
          <p className="text-white/50 text-[11px]">Referral Earnings</p>
        </div>

        {/* Watch Rewards */}
        <div
          className="rounded-2xl p-4 flex flex-col gap-1.5 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.04 240), oklch(0.12 0.03 240))",
            border: "1px solid oklch(0.55 0.15 240 / 0.3)",
          }}
        >
          <Play className="w-4 h-4 text-blue-400" />
          <p className="text-blue-300 font-bold text-2xl font-display leading-none">
            ₹{watchRewards.toFixed(0)}
          </p>
          <p className="text-white/50 text-[11px]">Watch Rewards</p>
        </div>

        {/* Daily Login Rewards */}
        <div
          className="rounded-2xl p-4 flex flex-col gap-1.5 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.05 70), oklch(0.12 0.03 60))",
            border: "1px solid oklch(0.75 0.18 80 / 0.3)",
          }}
        >
          <CalendarDays className="w-4 h-4 text-amber-400" />
          <p className="text-amber-300 font-bold text-2xl font-display leading-none">
            ₹{loginRewards.toFixed(0)}
          </p>
          <p className="text-white/50 text-[11px]">Login Rewards</p>
        </div>
      </motion.div>

      {/* ── Points Rules Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07 }}
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.05 280 / 0.8), oklch(0.10 0.03 280 / 0.9))",
        }}
      >
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
          <Star className="w-4 h-4 text-violet-400" />
          <h3 className="text-white font-semibold text-sm">
            How to Earn Points
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/25 flex items-center justify-center shrink-0">
              <Play className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Watch 10 videos</p>
              <p className="text-white/40 text-xs">
                Earn 2 pts (₹2) per 10 videos watched
              </p>
            </div>
            <span className="text-blue-300 font-bold text-sm shrink-0">
              +2 pts
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/25 flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4 text-violet-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Daily login</p>
              <p className="text-white/40 text-xs">
                Claim your daily bonus in the Rewards tab
              </p>
            </div>
            <span className="text-violet-300 font-bold text-sm shrink-0">
              +1 pt
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/25 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-reels-pink" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Invite a friend</p>
              <p className="text-white/40 text-xs">
                Share your referral code · earn on signup
              </p>
            </div>
            <span className="text-reels-pink font-bold text-sm shrink-0">
              +5 pts
            </span>
          </div>

          {/* Today's watch progress */}
          <div className="mt-2 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white/60 text-xs">
                Today's videos watched
              </span>
              <span className="text-white/60 text-xs tabular-nums">
                {watchedToday}/10
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${watchProgress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.55 0.15 240), oklch(0.65 0.18 250))",
                }}
              />
            </div>
            <p className="text-white/30 text-[10px] mt-1">
              {watchedToday >= 10
                ? "Reward earned! Keep watching tomorrow."
                : `${10 - watchedToday} more videos for +2 pts`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Withdrawal Form ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="rounded-2xl border border-white/10 bg-card p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-violet-400" />
          <h3 className="text-white font-semibold">Request Withdrawal</h3>
        </div>
        <p className="text-white/40 text-xs -mt-1">
          Minimum ₹200 · Available: ₹{pendingEarnings.toFixed(2)}
        </p>

        {/* Payment method selector */}
        <div className="space-y-1.5">
          <Label className="text-white/70 text-xs font-medium">
            Payment Method
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {(["upi", "paytm", "bank"] as PaymentMethod[]).map((method) => {
              const labels = { upi: "UPI", paytm: "Paytm", bank: "Bank" };
              const icons = { upi: "🏦", paytm: "📱", bank: "🏛️" };
              return (
                <button
                  key={method}
                  type="button"
                  data-ocid={`wallet.points_withdraw.${method}_tab`}
                  onClick={() => setPaymentMethod(method)}
                  className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border transition-all text-xs font-medium"
                  style={{
                    background:
                      paymentMethod === method
                        ? "oklch(0.6 0.2 280 / 0.25)"
                        : "oklch(1 0 0 / 0.05)",
                    borderColor:
                      paymentMethod === method
                        ? "oklch(0.6 0.2 280 / 0.6)"
                        : "oklch(1 0 0 / 0.12)",
                    color:
                      paymentMethod === method
                        ? "oklch(0.8 0.15 280)"
                        : "oklch(0.6 0.02 0)",
                  }}
                >
                  <span>{icons[method]}</span>
                  {labels[method]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {/* Full Name — always */}
          <div className="space-y-1.5">
            <Label
              htmlFor="points-withdraw-name"
              className="text-white/70 text-xs font-medium"
            >
              Full Name
            </Label>
            <Input
              id="points-withdraw-name"
              data-ocid="wallet.points_withdraw.name_input"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
            />
          </div>

          {/* Method-specific fields */}
          {paymentMethod === "upi" && (
            <div className="space-y-1.5">
              <Label
                htmlFor="points-upi-id"
                className="text-white/70 text-xs font-medium"
              >
                UPI ID
              </Label>
              <Input
                id="points-upi-id"
                data-ocid="wallet.points_withdraw.upi_input"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
              />
            </div>
          )}

          {paymentMethod === "paytm" && (
            <div className="space-y-1.5">
              <Label
                htmlFor="points-paytm"
                className="text-white/70 text-xs font-medium"
              >
                Paytm Mobile Number
              </Label>
              <Input
                id="points-paytm"
                data-ocid="wallet.points_withdraw.paytm_input"
                placeholder="10-digit mobile number"
                type="tel"
                maxLength={10}
                value={paytmNumber}
                onChange={(e) =>
                  setPaytmNumber(e.target.value.replace(/\D/g, ""))
                }
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
              />
            </div>
          )}

          {paymentMethod === "bank" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="points-bank-account"
                  className="text-white/70 text-xs font-medium"
                >
                  Account Number
                </Label>
                <Input
                  id="points-bank-account"
                  data-ocid="wallet.points_withdraw.bank_account_input"
                  placeholder="Enter account number"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="points-ifsc"
                  className="text-white/70 text-xs font-medium"
                >
                  IFSC Code
                </Label>
                <Input
                  id="points-ifsc"
                  data-ocid="wallet.points_withdraw.ifsc_input"
                  placeholder="e.g. SBIN0001234"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="points-bank-holder"
                  className="text-white/70 text-xs font-medium"
                >
                  Account Holder Name
                </Label>
                <Input
                  id="points-bank-holder"
                  data-ocid="wallet.points_withdraw.bank_holder_input"
                  placeholder="Name as per bank records"
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
                />
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-1.5">
            <Label
              htmlFor="points-amount"
              className="text-white/70 text-xs font-medium"
            >
              Amount (₹)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm font-medium">
                ₹
              </span>
              <Input
                id="points-amount"
                data-ocid="wallet.points_withdraw.amount_input"
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
          data-ocid="wallet.points_withdraw.submit_button"
          onClick={handleWithdraw}
          disabled={withdrawLoading || pendingEarnings < 200}
          className="w-full h-11 font-semibold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.2 280), oklch(0.5 0.18 270))",
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

        {pendingEarnings < 200 && (
          <p className="text-amber-400/70 text-[10px] text-center">
            Earn at least ₹200 in rewards to unlock withdrawals
          </p>
        )}
      </motion.div>

      {/* ── History Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="rounded-2xl border border-white/10 bg-card overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
          <ReceiptText className="w-4 h-4 text-white/50" />
          <h3 className="text-white font-semibold text-sm">History</h3>
        </div>

        <Tabs defaultValue="points_hist" className="p-0">
          <TabsList className="w-full bg-white/5 border-b border-white/10 rounded-none h-9 gap-0 p-0">
            <TabsTrigger
              value="points_hist"
              data-ocid="wallet.points.history.points_tab"
              className="flex-1 h-full rounded-none text-white/50 data-[state=active]:text-white data-[state=active]:bg-white/10 text-[11px] border-none"
            >
              Points
            </TabsTrigger>
            <TabsTrigger
              value="referrals_hist"
              data-ocid="wallet.points.history.referrals_tab"
              className="flex-1 h-full rounded-none text-white/50 data-[state=active]:text-white data-[state=active]:bg-white/10 text-[11px] border-none"
            >
              Referrals
            </TabsTrigger>
            <TabsTrigger
              value="withdrawals_hist"
              data-ocid="wallet.points.history.withdrawals_tab"
              className="flex-1 h-full rounded-none text-white/50 data-[state=active]:text-white data-[state=active]:bg-white/10 text-[11px] border-none"
            >
              Withdrawals
            </TabsTrigger>
          </TabsList>

          {/* Points history */}
          <TabsContent value="points_hist" className="mt-0">
            {(() => {
              const pointTxs = myTransactions.filter((tx) =>
                (
                  [
                    "watch_reward",
                    "daily_bonus",
                    "referral_credit",
                    "spin_reward",
                  ] as Transaction["txType"][]
                ).includes(tx.txType),
              );
              if (pointTxs.length === 0) {
                return (
                  <div
                    data-ocid="wallet.points.history.points_empty_state"
                    className="py-10 text-center"
                  >
                    <p className="text-3xl mb-2">⭐</p>
                    <p className="text-white/40 text-sm">
                      No points activity yet
                    </p>
                    <p className="text-white/30 text-xs mt-1">
                      Watch videos, login daily, and invite friends to earn
                    </p>
                  </div>
                );
              }
              return (
                <div className="divide-y divide-white/5">
                  {pointTxs.map((tx, i) => {
                    const icons: Partial<
                      Record<Transaction["txType"], ReactNode>
                    > = {
                      watch_reward: (
                        <Play className="w-3.5 h-3.5 text-blue-400" />
                      ),
                      daily_bonus: (
                        <CalendarDays className="w-3.5 h-3.5 text-violet-400" />
                      ),
                      referral_credit: (
                        <Users className="w-3.5 h-3.5 text-reels-pink" />
                      ),
                      spin_reward: (
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                      ),
                    };
                    return (
                      <div
                        key={tx.id}
                        data-ocid={`wallet.points.history.item.${i + 1}`}
                        className="px-4 py-3 flex items-center gap-3"
                      >
                        <div className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center shrink-0">
                          {icons[tx.txType] ?? (
                            <Star className="w-3.5 h-3.5 text-white/40" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-xs truncate">
                            {tx.description}
                          </p>
                          <p className="text-white/30 text-[10px] mt-0.5">
                            {formatTime(tx.createdAt)} ago
                          </p>
                        </div>
                        <span className="text-green-400 font-bold text-sm shrink-0">
                          +₹{tx.amount.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </TabsContent>

          {/* Referrals history */}
          <TabsContent value="referrals_hist" className="mt-0">
            {myReferrals.length === 0 ? (
              <div
                data-ocid="wallet.points.history.referrals_empty_state"
                className="py-10 text-center"
              >
                <p className="text-3xl mb-2">👥</p>
                <p className="text-white/40 text-sm">No referrals yet</p>
                <p className="text-white/30 text-xs mt-1">
                  Share your code to start earning
                </p>
              </div>
            ) : (
              <>
                <div className="px-4 py-2 bg-white/5 border-b border-white/10 grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                  <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">
                    User
                  </span>
                  <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider w-20 text-center">
                    Date
                  </span>
                  <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider w-16 text-right">
                    Earned
                  </span>
                </div>
                <div className="divide-y divide-white/5">
                  {myReferrals.map((referral, i) => (
                    <div
                      key={`${referral.referrerId}-${referral.referredUserId}`}
                      data-ocid={`wallet.points.referral.item.${i + 1}`}
                      className="px-4 py-3 grid grid-cols-[1fr_auto_auto] gap-3 items-center"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <span className="text-white font-bold text-[10px]">
                            {referral.referredUsername[0]?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-white text-xs font-medium truncate">
                          @{referral.referredUsername}
                        </p>
                      </div>
                      <span className="text-white/40 text-[10px] w-20 text-center">
                        {new Date(referral.createdAt).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short" },
                        )}
                      </span>
                      <span className="text-emerald-400 font-bold text-sm w-16 text-right">
                        +₹{referral.commissionEarned}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Withdrawals history */}
          <TabsContent value="withdrawals_hist" className="mt-0">
            {myWithdrawals.length === 0 ? (
              <div
                data-ocid="wallet.points.history.withdrawals_empty_state"
                className="py-10 text-center"
              >
                <p className="text-3xl mb-2">💸</p>
                <p className="text-white/40 text-sm">
                  No withdrawal requests yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {myWithdrawals.map((w, i) => {
                  const methodLabel =
                    w.paymentMethod === "paytm"
                      ? `Paytm: ${w.paytmNumber}`
                      : w.paymentMethod === "bank"
                        ? `Bank · ${w.bankAccountHolder}`
                        : `UPI: ${w.upiId}`;
                  return (
                    <div
                      key={w.id}
                      data-ocid={`wallet.points.withdrawal.item.${i + 1}`}
                      className="px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">
                          ₹{w.amount.toFixed(2)}
                        </p>
                        <p className="text-white/40 text-xs truncate">
                          {methodLabel}
                        </p>
                        <p className="text-white/30 text-[10px] mt-0.5">
                          {formatTime(w.createdAt)} ago
                        </p>
                      </div>
                      <WithdrawalStatusBadge status={w.status} />
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

// ─── Wallet Page ──────────────────────────────────────────────────────────────

export default function WalletPage() {
  const { state, dispatch } = useApp();
  const { t } = useLang();
  const user = state.currentUser;
  const [copied, setCopied] = useState(false);
  const [adOpen, setAdOpen] = useState(false);

  // Artist withdrawal form state
  const [artistPaymentMethod, setArtistPaymentMethod] = useState<
    "upi" | "bank"
  >("upi");
  const [artistFullName, setArtistFullName] = useState("");
  const [artistUpiId, setArtistUpiId] = useState("");
  const [artistWithdrawAmount, setArtistWithdrawAmount] = useState("");
  const [artistBankName, setArtistBankName] = useState("");
  const [artistBankAccount, setArtistBankAccount] = useState("");
  const [artistBankIfsc, setArtistBankIfsc] = useState("");
  const [artistBankHolder, setArtistBankHolder] = useState("");
  const [artistWithdrawLoading, setArtistWithdrawLoading] = useState(false);

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
    const gross = ((v.adImpressions ?? 0) * rate) / 1000;
    return sum + gross * 0.6;
  }, 0);

  const pendingEarnings = liveUser.pendingEarnings ?? 0;

  const myWithdrawals = state.withdrawalRequests.filter(
    (w) => w.userId === user.id,
  );

  const myTransactions = (state.transactions ?? []).filter(
    (tx) => tx.userId === user.id,
  );

  const referralUrl = getReferralLink(user.referralCode);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("रेफरल लिंक कॉपी झाली!");
    } catch {
      toast.error("कॉपी होऊ शकली नाही, manually try करा");
    }
  };

  const handleEarnCoins = () => {
    dispatch({ type: "ADD_COINS", userId: user.id, amount: 5 });
  };

  const handleArtistWithdraw = async () => {
    const amount = Number.parseFloat(artistWithdrawAmount);

    if (!artistFullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!artistWithdrawAmount || Number.isNaN(amount) || amount < 500) {
      toast.error("Minimum withdrawal amount is ₹500");
      return;
    }
    if (amount > pendingEarnings) {
      toast.error(
        `Insufficient balance. Available: ₹${pendingEarnings.toFixed(2)}`,
      );
      return;
    }

    if (artistPaymentMethod === "upi" && !artistUpiId.trim()) {
      toast.error("Please enter your UPI ID");
      return;
    }
    if (artistPaymentMethod === "bank") {
      if (
        !artistBankName.trim() ||
        !artistBankAccount.trim() ||
        !artistBankIfsc.trim() ||
        !artistBankHolder.trim()
      ) {
        toast.error("Please fill in all bank transfer details");
        return;
      }
    }

    setArtistWithdrawLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const request: WithdrawalRequest = {
      id: `w${Date.now()}`,
      userId: user.id,
      upiId: artistPaymentMethod === "upi" ? artistUpiId.trim() : "",
      userName: artistFullName.trim(),
      amount,
      status: "pending",
      createdAt: Date.now(),
      resolvedAt: 0,
      processedAt: 0,
      paymentMethod: artistPaymentMethod,
      bankName:
        artistPaymentMethod === "bank" ? artistBankName.trim() : undefined,
      bankAccountNumber:
        artistPaymentMethod === "bank" ? artistBankAccount.trim() : undefined,
      bankIfsc:
        artistPaymentMethod === "bank" ? artistBankIfsc.trim() : undefined,
      bankAccountHolder:
        artistPaymentMethod === "bank" ? artistBankHolder.trim() : undefined,
    };

    dispatch({ type: "REQUEST_WITHDRAWAL", request });

    // Reset form
    setArtistFullName("");
    setArtistUpiId("");
    setArtistWithdrawAmount("");
    setArtistBankName("");
    setArtistBankAccount("");
    setArtistBankIfsc("");
    setArtistBankHolder("");
    setArtistWithdrawLoading(false);

    toast.success("Withdrawal request submitted! Pending admin approval", {
      description: `₹${amount.toFixed(2)} via ${artistPaymentMethod === "upi" ? `UPI: ${artistUpiId.trim()}` : `Bank: ${artistBankHolder.trim()}`}`,
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
          <TabsList className="w-full bg-white/5 border border-white/10 mb-5 h-10 overflow-x-auto flex-nowrap">
            <TabsTrigger
              value="wallet"
              data-ocid="wallet.wallet_tab"
              className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs whitespace-nowrap"
            >
              {t("wallet.title")}
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              data-ocid="wallet.tasks_tab"
              className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs whitespace-nowrap"
            >
              ✅ {t("wallet.tasks")}
            </TabsTrigger>
            <TabsTrigger
              value="earnings"
              data-ocid="wallet.earnings_tab"
              className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs whitespace-nowrap"
            >
              {liveUser.role === "viewer"
                ? "👥 Referral"
                : t("wallet.earnings")}
            </TabsTrigger>
            {liveUser.role === "viewer" && (
              <TabsTrigger
                value="points"
                data-ocid="wallet.points_tab"
                className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs whitespace-nowrap"
              >
                गुण / Earnings
              </TabsTrigger>
            )}
            <TabsTrigger
              value="rewards"
              data-ocid="wallet.rewards_tab"
              className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs whitespace-nowrap"
            >
              🎁 {t("wallet.rewards")}
            </TabsTrigger>
            {liveUser.role !== "viewer" && (
              <TabsTrigger
                value="referral"
                data-ocid="wallet.referral_tab"
                className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs whitespace-nowrap"
              >
                {t("wallet.refs")}
              </TabsTrigger>
            )}
            <TabsTrigger
              value="transactions"
              data-ocid="wallet.transactions_tab"
              className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs whitespace-nowrap"
            >
              {t("wallet.history")}
            </TabsTrigger>
          </TabsList>

          {/* ── Tasks Tab ──────────────────────────────────────────────────── */}
          <TabsContent value="tasks" className="space-y-5 mt-0">
            <CoinBalanceCard />
            <DailyTasksCard />
            {/* Info card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/8 bg-white/3 px-5 py-4 space-y-2"
            >
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                How it works
              </p>
              <ul className="space-y-1.5 text-white/40 text-xs">
                <li>• Complete all 4 daily tasks to earn up to 5 coins</li>
                <li>• 100 coins = ₹10 redeemable in wallet</li>
                <li>• Tasks reset every day at midnight</li>
                <li>• Coins are credited instantly on task completion</li>
              </ul>
            </motion.div>
          </TabsContent>

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
                      const gross = ((v.adImpressions ?? 0) * rate) / 1000;
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

              <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-center space-y-1">
                <p className="font-display text-3xl font-bold text-white tracking-widest">
                  {user.referralCode}
                </p>
                <p className="text-white/30 text-[10px] font-mono break-all">
                  {referralUrl}
                </p>
                <p className="text-white/40 text-xs">
                  {liveUser.role === "viewer"
                    ? "Share this code · Earn ₹5 per successful referral"
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
                  onClick={() => shareReferralLink(user.referralCode)}
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
                {/* ── Earnings Breakdown (3 cards) ── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-ocid="wallet.earnings.breakdown.section"
                  className="grid grid-cols-3 gap-2"
                >
                  {/* Total Ad Earnings */}
                  <div
                    className="rounded-2xl p-3 flex flex-col gap-1.5 relative overflow-hidden"
                    data-ocid="wallet.earnings.ad_earnings.card"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.18 0.04 240), oklch(0.12 0.03 240))",
                      border: "1px solid oklch(0.55 0.15 240 / 0.3)",
                    }}
                  >
                    <IndianRupee className="w-3.5 h-3.5 text-blue-400" />
                    <p className="text-blue-300 font-bold text-lg font-display leading-none">
                      ₹
                      {myTransactions
                        .filter((tx) => tx.txType === "ad_earnings")
                        .reduce((s, tx) => s + tx.amount, 0)
                        .toFixed(2)}
                    </p>
                    <p className="text-white/50 text-[10px] leading-tight">
                      Total Ad Earnings
                    </p>
                  </div>

                  {/* Total Gift Earnings */}
                  <div
                    className="rounded-2xl p-3 flex flex-col gap-1.5 relative overflow-hidden"
                    data-ocid="wallet.earnings.gift_earnings.card"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.18 0.05 70), oklch(0.12 0.03 60))",
                      border: "1px solid oklch(0.75 0.18 80 / 0.3)",
                    }}
                  >
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    <p className="text-amber-300 font-bold text-lg font-display leading-none">
                      ₹
                      {myTransactions
                        .filter((tx) => tx.txType === "gift_received")
                        .reduce((s, tx) => s + tx.amount, 0)
                        .toFixed(2)}
                    </p>
                    <p className="text-white/50 text-[10px] leading-tight">
                      Total Gift Earnings
                    </p>
                  </div>

                  {/* Total Referral Earnings */}
                  <div
                    className="rounded-2xl p-3 flex flex-col gap-1.5 relative overflow-hidden"
                    data-ocid="wallet.earnings.referral_earnings.card"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.18 0.06 340), oklch(0.12 0.04 330))",
                      border: "1px solid oklch(0.65 0.22 340 / 0.3)",
                    }}
                  >
                    <Users className="w-3.5 h-3.5 text-reels-pink" />
                    <p className="text-reels-pink font-bold text-lg font-display leading-none">
                      ₹
                      {myTransactions
                        .filter((tx) => tx.txType === "referral_credit")
                        .reduce((s, tx) => s + tx.amount, 0)
                        .toFixed(2)}
                    </p>
                    <p className="text-white/50 text-[10px] leading-tight">
                      Total Referral Earnings
                    </p>
                  </div>
                </motion.div>

                {/* Revenue split info line */}
                <div
                  className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs"
                  style={{
                    background: "oklch(0.55 0.15 160 / 0.1)",
                    border: "1px solid oklch(0.55 0.15 160 / 0.2)",
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 font-semibold">
                    60% Artist
                  </span>
                  <span className="text-white/30">/</span>
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                  <span className="text-white/50">40% Platform</span>
                </div>

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
                          const gross =
                            ((video.adImpressions ?? 0) * rate) / 1000;
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

                {/* ── Artist Withdrawal Form ── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  data-ocid="wallet.artist_withdraw.card"
                  className="rounded-2xl border border-white/10 bg-card p-5 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-white font-semibold">
                      Request Withdrawal
                    </h3>
                  </div>
                  <p className="text-white/40 text-xs -mt-1">
                    Minimum ₹500 · Processed within 2-3 business days
                  </p>

                  {/* Payment method selector */}
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs font-medium">
                      Payment Method
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["upi", "bank"] as const).map((method) => {
                        const cfg = {
                          upi: { icon: "🏦", label: "UPI" },
                          bank: { icon: "🏛️", label: "Bank Transfer" },
                        };
                        return (
                          <button
                            key={method}
                            type="button"
                            data-ocid={`wallet.artist_withdraw.${method}_toggle`}
                            onClick={() => setArtistPaymentMethod(method)}
                            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border transition-all text-sm font-medium"
                            style={{
                              background:
                                artistPaymentMethod === method
                                  ? "oklch(0.5 0.18 160 / 0.25)"
                                  : "oklch(1 0 0 / 0.05)",
                              borderColor:
                                artistPaymentMethod === method
                                  ? "oklch(0.5 0.18 160 / 0.6)"
                                  : "oklch(1 0 0 / 0.12)",
                              color:
                                artistPaymentMethod === method
                                  ? "oklch(0.8 0.15 160)"
                                  : "oklch(0.6 0.02 0)",
                            }}
                          >
                            <span>{cfg[method].icon}</span>
                            {cfg[method].label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Full Name — always visible */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="artist-withdraw-name"
                        className="text-white/70 text-xs font-medium"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="artist-withdraw-name"
                        data-ocid="wallet.artist_withdraw.name_input"
                        placeholder="Your full name"
                        value={artistFullName}
                        onChange={(e) => setArtistFullName(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
                      />
                    </div>

                    {/* UPI ID — visible when UPI selected */}
                    {artistPaymentMethod === "upi" && (
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="artist-upi-id"
                          className="text-white/70 text-xs font-medium"
                        >
                          UPI ID
                        </Label>
                        <Input
                          id="artist-upi-id"
                          data-ocid="wallet.artist_withdraw.upi_input"
                          placeholder="yourname@upi"
                          value={artistUpiId}
                          onChange={(e) => setArtistUpiId(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
                        />
                      </div>
                    )}

                    {/* Bank fields — visible when Bank Transfer selected */}
                    {artistPaymentMethod === "bank" && (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="artist-bank-name"
                            className="text-white/70 text-xs font-medium"
                          >
                            Bank Name
                          </Label>
                          <Input
                            id="artist-bank-name"
                            data-ocid="wallet.artist_withdraw.bank_name_input"
                            placeholder="e.g. State Bank of India"
                            value={artistBankName}
                            onChange={(e) => setArtistBankName(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="artist-bank-account"
                            className="text-white/70 text-xs font-medium"
                          >
                            Account Number
                          </Label>
                          <Input
                            id="artist-bank-account"
                            data-ocid="wallet.artist_withdraw.bank_account_input"
                            placeholder="Enter account number"
                            value={artistBankAccount}
                            onChange={(e) =>
                              setArtistBankAccount(e.target.value)
                            }
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="artist-bank-ifsc"
                            className="text-white/70 text-xs font-medium"
                          >
                            IFSC Code
                          </Label>
                          <Input
                            id="artist-bank-ifsc"
                            data-ocid="wallet.artist_withdraw.ifsc_input"
                            placeholder="e.g. SBIN0001234"
                            value={artistBankIfsc}
                            onChange={(e) =>
                              setArtistBankIfsc(e.target.value.toUpperCase())
                            }
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="artist-bank-holder"
                            className="text-white/70 text-xs font-medium"
                          >
                            Account Holder Name
                          </Label>
                          <Input
                            id="artist-bank-holder"
                            data-ocid="wallet.artist_withdraw.bank_holder_input"
                            placeholder="Name as per bank records"
                            value={artistBankHolder}
                            onChange={(e) =>
                              setArtistBankHolder(e.target.value)
                            }
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
                          />
                        </div>
                      </div>
                    )}

                    {/* Amount */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="artist-withdraw-amount"
                        className="text-white/70 text-xs font-medium"
                      >
                        Amount (₹)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm font-medium">
                          ₹
                        </span>
                        <Input
                          id="artist-withdraw-amount"
                          data-ocid="wallet.artist_withdraw.amount_input"
                          type="number"
                          min={500}
                          step={1}
                          placeholder="500"
                          value={artistWithdrawAmount}
                          onChange={(e) =>
                            setArtistWithdrawAmount(e.target.value)
                          }
                          className="pl-7 bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
                        />
                      </div>
                      <p className="text-white/30 text-[10px]">
                        Available: ₹{pendingEarnings.toFixed(2)} · Min: ₹500
                      </p>
                    </div>
                  </div>

                  <Button
                    data-ocid="wallet.artist_withdraw.submit_button"
                    onClick={handleArtistWithdraw}
                    disabled={artistWithdrawLoading || pendingEarnings < 500}
                    className="w-full h-11 font-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.5 0.18 160), oklch(0.45 0.14 160))",
                    }}
                  >
                    {artistWithdrawLoading ? (
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

                  {pendingEarnings < 500 && (
                    <p className="text-amber-400/70 text-[10px] text-center">
                      Earn at least ₹500 to unlock withdrawals
                    </p>
                  )}
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
                      {myWithdrawals.map((w, i) => {
                        const methodLabel =
                          w.paymentMethod === "bank"
                            ? `Bank: ${w.bankAccountHolder ?? w.bankName ?? "—"}`
                            : w.paymentMethod === "paytm"
                              ? `Paytm: ${w.paytmNumber ?? "—"}`
                              : `UPI: ${w.upiId || "—"}`;
                        return (
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
                                {methodLabel}
                              </p>
                              <p className="text-white/30 text-[10px] mt-0.5">
                                {formatTime(w.createdAt)} ago
                              </p>
                            </div>
                            <WithdrawalStatusBadge status={w.status} />
                          </div>
                        );
                      })}
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
                    Formula: (Ad Impressions × RPM) / 1000 × 60% artist share
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

              <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-center space-y-1">
                <p className="font-display text-3xl font-bold text-white tracking-widest">
                  {user.referralCode}
                </p>
                <p className="text-white/30 text-[10px] font-mono break-all">
                  {referralUrl}
                </p>
                <p className="text-white/40 text-xs">
                  {liveUser.role === "viewer"
                    ? "Earn ₹5 per successful referral"
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
                      toast.success("रेफरल लिंक कॉपी झाली!");
                    } catch {
                      toast.error("लिंक कॉपी होऊ शकली नाही");
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

          {/* ── Points Tab (Viewer only) ──────────────────────────────────────── */}
          {liveUser.role === "viewer" && (
            <TabsContent value="points" className="space-y-5 mt-0">
              <ViewerPointsDashboard />
            </TabsContent>
          )}

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
                      tx.txType === "spin_reward" ||
                      tx.txType === "watch_reward";
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
