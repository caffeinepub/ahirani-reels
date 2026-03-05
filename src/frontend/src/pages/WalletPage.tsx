import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  Copy,
  DollarSign,
  Gift,
  Play,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { RewardedAd } from "../components/ads/RewardedAd";
import type { VideoType } from "../context/AppContext";
import { useApp } from "../context/AppContext";
import { formatCount, formatTime } from "../utils/trending";

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

// ─── Wallet Page ──────────────────────────────────────────────────────────────

export default function WalletPage() {
  const { state, dispatch } = useApp();
  const user = state.currentUser;
  const [copied, setCopied] = useState(false);
  const [adOpen, setAdOpen] = useState(false);

  if (!user) return null;

  const myReferrals = state.referrals.filter((r) => r.referrerId === user.id);
  const totalReferralCoins = myReferrals.reduce(
    (sum, r) => sum + r.coinsEarned,
    0,
  );

  const myVideos = state.videos.filter(
    (v) => v.uploaderId === user.id && !v.isDeleted,
  );

  const rpm = state.rpmConfig;

  const totalEarned = myVideos.reduce((sum, v) => {
    const rate = rpm[v.videoType] ?? 2;
    const gross = (v.viewsCount * rate) / 1000;
    return sum + gross * 0.6;
  }, 0);

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

  const handleShare = async () => {
    const text = `Join Ahirani Reels with my referral code ${user.referralCode} and start watching! 🎬`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Ahirani Reels", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Share text copied!");
      }
    } catch {
      toast.error("Couldn't share");
    }
  };

  const handleEarnCoins = () => {
    dispatch({ type: "ADD_COINS", userId: user.id, amount: 5 });
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-white/10 px-4 py-4">
        <h1 className="font-display text-xl font-bold text-white">Wallet</h1>
        <p className="text-white/40 text-xs mt-0.5">
          Your coins, earnings & referrals
        </p>
      </div>

      <div className="px-4 py-4 pb-24">
        <Tabs defaultValue="wallet">
          <TabsList className="w-full bg-white/5 border border-white/10 mb-5 h-10">
            <TabsTrigger
              value="wallet"
              data-ocid="wallet.wallet_tab"
              className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10"
            >
              Wallet
            </TabsTrigger>
            <TabsTrigger
              value="earnings"
              data-ocid="wallet.earnings_tab"
              className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10"
            >
              Earnings
            </TabsTrigger>
          </TabsList>

          {/* ── Wallet Tab ─────────────────────────────────────────────────── */}
          <TabsContent value="wallet" className="space-y-5 mt-0">
            {/* Coin balance card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
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
                  {state.users.find((u) => u.id === user.id)?.coins ??
                    user.coins}
                </span>
                <span className="text-gold/70 text-lg font-semibold">
                  coins
                </span>
              </div>

              <div className="mt-4 flex gap-3">
                <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-gold font-bold text-lg">
                    {totalReferralCoins}
                  </p>
                  <p className="text-white/50 text-xs">From Referrals</p>
                </div>
                <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-gold font-bold text-lg">
                    {myReferrals.length}
                  </p>
                  <p className="text-white/50 text-xs">Friends Referred</p>
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
                  Share this code · Earn 10 coins per signup
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
                  onClick={handleShare}
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

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="rounded-2xl border border-white/10 bg-card p-4 flex flex-col gap-1">
                <TrendingUp className="w-5 h-5 text-reels-pink mb-1" />
                <p className="text-white font-bold text-2xl">
                  {totalReferralCoins}
                </p>
                <p className="text-white/50 text-xs">Coins from referrals</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-card p-4 flex flex-col gap-1">
                <Users className="w-5 h-5 text-blue-400 mb-1" />
                <p className="text-white font-bold text-2xl">
                  {myReferrals.length}
                </p>
                <p className="text-white/50 text-xs">Users referred</p>
              </div>
            </motion.div>

            {/* Referral history */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-white/10 bg-card p-5 space-y-3"
            >
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Gift className="w-4 h-4 text-reels-pink" />
                Referral History
              </h3>

              {myReferrals.length === 0 ? (
                <div
                  data-ocid="wallet.referral.empty_state"
                  className="py-6 text-center"
                >
                  <p className="text-4xl mb-2">👥</p>
                  <p className="text-white/40 text-sm">No referrals yet</p>
                  <p className="text-white/30 text-xs mt-1">
                    Share your code to earn coins
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myReferrals.map((referral, i) => (
                    <div
                      key={`${referral.referrerId}-${referral.referredUserId}`}
                      data-ocid={`wallet.referral.item.${i + 1}`}
                      className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                    >
                      <div>
                        <p className="text-white text-sm font-medium">
                          @{referral.referredUsername}
                        </p>
                        <p className="text-white/40 text-xs">
                          {formatTime(referral.createdAt)} ago
                        </p>
                      </div>
                      <span className="text-gold font-bold text-sm">
                        +{referral.coinsEarned} 🪙
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* ── Earnings Tab ────────────────────────────────────────────────── */}
          <TabsContent value="earnings" className="space-y-5 mt-0">
            {/* Summary card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.18 0.04 160), oklch(0.12 0.02 160))",
                border: "1px solid oklch(0.55 0.15 160 / 0.3)",
              }}
            >
              <div className="absolute top-0 right-0 w-28 h-28 opacity-10 text-7xl flex items-center justify-center">
                💰
              </div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <p className="text-white/60 text-sm font-medium">
                  Total Earned (USD)
                </p>
              </div>
              <p className="text-4xl font-bold font-display text-emerald-400 mb-4">
                ${totalEarned.toFixed(2)}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-emerald-400 font-bold text-base">60%</p>
                  <p className="text-white/50 text-xs">Artist Share</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-white/60 font-bold text-base">40%</p>
                  <p className="text-white/50 text-xs">Platform Share</p>
                </div>
              </div>
            </motion.div>

            {/* Per-video earnings */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
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
                <div className="divide-y divide-white/5">
                  {myVideos.map((video, i) => {
                    const rate = rpm[video.videoType] ?? 2;
                    const gross = (video.viewsCount * rate) / 1000;
                    const artistEarn = gross * 0.6;
                    return (
                      <div
                        key={video.id}
                        data-ocid={`wallet.earnings.item.${i + 1}`}
                        className="px-4 py-3 flex items-start gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate mb-1">
                            {video.caption}
                          </p>
                          <div className="flex items-center gap-2">
                            <VideoTypeBadge type={video.videoType} />
                            <span className="text-white/40 text-[10px]">
                              {formatCount(video.viewsCount)} views
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-white/60 text-[10px]">
                            Gross: ${gross.toFixed(2)}
                          </p>
                          <p className="text-emerald-400 font-bold text-sm">
                            ${artistEarn.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* RPM info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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
                      ${rpm[t].toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-[10px] mt-2 text-center">
                Formula: (Views × RPM) / 1000 × 60% artist share
              </p>
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
