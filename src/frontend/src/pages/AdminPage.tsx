import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  Banknote,
  Camera,
  CheckCircle,
  Clapperboard,
  Crown,
  Eye,
  Film,
  Hash,
  Heart,
  ImageIcon,
  IndianRupee,
  Library,
  Link,
  LogOut,
  Megaphone,
  Music,
  Pause,
  Play,
  Settings,
  Shield,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  UserCheck,
  UserX,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import CreatorBadge from "../components/CreatorBadge";
import { LOCAL_AD_RATE_PER_DAY } from "../components/ads/ads-config";
import type {
  AdRpmConfig,
  AdUnitIds,
  LocalAd,
  MusicGenre,
  MusicTrack,
  SubscriptionStatus,
  UserRole,
  VideoType,
  WithdrawalRequest,
} from "../context/AppContext";
import { computeVideoEarnings, useApp } from "../context/AppContext";
import { formatCount, formatTime, generateId } from "../utils/trending";

const ADMIN_NAME = "समाधान माळी";

// ─── Admin Photo Upload Button ────────────────────────────────────────────────

function AdminPhotoUploadButton({
  navigate,
}: {
  navigate: ReturnType<typeof useNavigate>;
}) {
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    navigate({
      to: "/edit-photo",
      state: { photoFile: file, fromAdmin: true } as never,
    });
  };

  return (
    <>
      <button
        type="button"
        data-ocid="admin.upload_photo_button"
        onClick={() => photoInputRef.current?.click()}
        className="w-full flex items-center gap-3 rounded-xl px-4 py-3.5 border border-white/20 bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all text-left"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: "oklch(0.55 0.22 150 / 0.25)",
            border: "1px solid oklch(0.55 0.22 150 / 0.4)",
          }}
        >
          <ImageIcon
            className="w-5 h-5"
            style={{ color: "oklch(0.7 0.2 150)" }}
          />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Upload Photo</p>
          <p className="text-white/40 text-xs mt-0.5">
            Select a photo from device and post
          </p>
        </div>
      </button>
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoChange}
      />
    </>
  );
}

// ─── Reason Badge ─────────────────────────────────────────────────────────────

function ReasonBadge({ reason }: { reason: string }) {
  const config: Record<string, { className: string }> = {
    "Copyright violation": {
      className: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    },
    Abuse: {
      className: "bg-red-500/20 text-red-400 border-red-500/30",
    },
    Spam: {
      className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    "Inappropriate content": {
      className: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    },
  };
  const { className } = config[reason] ?? {
    className: "bg-white/10 text-white/50 border-white/20",
  };
  return (
    <Badge
      variant="secondary"
      className={`text-[10px] px-1.5 py-0 ${className}`}
    >
      {reason}
    </Badge>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: UserRole }) {
  const config = {
    viewer: {
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      icon: <Eye className="w-3 h-3" />,
      label: "Viewer",
    },
    artist: {
      className: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      icon: <Clapperboard className="w-3 h-3" />,
      label: "Artist",
    },
    admin: {
      className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      icon: <Shield className="w-3 h-3" />,
      label: "Admin",
    },
  };
  const { className, icon, label } = config[role] ?? config.viewer;
  return (
    <Badge
      variant="secondary"
      className={`text-[10px] px-1.5 py-0 ${className}`}
    >
      <span className="flex items-center gap-1">
        {icon}
        {label}
      </span>
    </Badge>
  );
}

// ─── Subscription Badge ───────────────────────────────────────────────────────

function AdminSubBadge({ status }: { status: SubscriptionStatus }) {
  const config = {
    active: {
      className: "bg-green-500/20 text-green-400 border-green-500/30",
      label: "Active",
    },
    expired: {
      className: "bg-red-500/20 text-red-400 border-red-500/30",
      label: "Expired",
    },
    none: {
      className: "bg-white/10 text-white/40 border-white/10",
      label: "No Sub",
    },
  };
  const { className, label } = config[status] ?? config.none;
  return (
    <Badge
      variant="secondary"
      className={`text-[10px] px-1.5 py-0 ${className}`}
    >
      {label}
    </Badge>
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
  const { label, className } = config[type] ?? config.reel;
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

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

// ─── Admin Video Type Chip Config ──────────────────────────────────────────────

const ADMIN_VIDEO_TYPES: Array<{
  type: VideoType;
  label: string;
  hint: string;
}> = [
  { type: "reel", label: "Reel", hint: "Max 60s" },
  { type: "long", label: "Long", hint: "Up to 10 min" },
  { type: "premium", label: "Premium", hint: "Subscribers only" },
];

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "users"
    | "artists"
    | "videos"
    | "comments"
    | "withdrawals"
    | "upload"
    | "ads"
    | "music"
    | "reports"
    | "security"
    | "live"
    | "settings"
  >("overview");

  // Admin upload form state
  const [adminVideoUrl, setAdminVideoUrl] = useState("");
  const [adminCaption, setAdminCaption] = useState("");
  const [adminHashtagInput, setAdminHashtagInput] = useState("");
  const [adminHashtags, setAdminHashtags] = useState<string[]>([]);
  const [adminVideoType, setAdminVideoType] = useState<VideoType>("reel");
  const [adminPosting, setAdminPosting] = useState(false);

  // RPM config local state (pre-filled from global state)
  const [rpmDraft, setRpmDraft] = useState<AdRpmConfig>({ ...state.rpmConfig });

  // Ad Unit IDs draft state (pre-filled from global state)
  const [adIdsDraft, setAdIdsDraft] = useState(() => ({
    googleBanner: state.adUnitIds.google.BANNER,
    googleInterstitial: state.adUnitIds.google.INTERSTITIAL,
    googleRewarded: state.adUnitIds.google.REWARDED,
    googlePreRoll: state.adUnitIds.google.PRE_ROLL,
    metaBanner: state.adUnitIds.meta.BANNER,
    metaInterstitial: state.adUnitIds.meta.INTERSTITIAL,
    metaPreRoll: state.adUnitIds.meta.PRE_ROLL,
  }));

  const activeVideos = state.videos.filter((v) => !v.isDeleted);

  // Platform earnings calculation (impression-based: each ad shown = revenue)
  const totalGross = activeVideos.reduce((sum, v) => {
    const rate = state.rpmConfig[v.videoType as VideoType] ?? 2;
    return sum + ((v.adImpressions ?? 0) * rate) / 1000;
  }, 0);
  const adminShare = totalGross * 0.4;
  const artistPayouts = totalGross * 0.6;

  // Ad impression breakdown by video type
  const reelImpressions = activeVideos
    .filter((v) => v.videoType === "reel")
    .reduce((s, v) => s + (v.adImpressions ?? 0), 0);
  const longImpressions = activeVideos
    .filter((v) => v.videoType === "long")
    .reduce((s, v) => s + (v.adImpressions ?? 0), 0);
  const premiumImpressions = activeVideos
    .filter((v) => v.videoType === "premium")
    .reduce((s, v) => s + (v.adImpressions ?? 0), 0);
  const totalImpressions =
    reelImpressions + longImpressions + premiumImpressions;

  const reelGross = (reelImpressions * (state.rpmConfig.reel ?? 2)) / 1000;
  const longGross = (longImpressions * (state.rpmConfig.long ?? 4)) / 1000;
  const premiumGross =
    (premiumImpressions * (state.rpmConfig.premium ?? 8)) / 1000;

  // Top 5 earning creators (by totalEarnings)
  const topEarningCreators = [...state.users]
    .filter((u) => u.role === "artist")
    .sort((a, b) => (b.totalEarnings ?? 0) - (a.totalEarnings ?? 0))
    .slice(0, 5);

  // Top 5 most viewed videos
  const topViewedVideos = [...activeVideos]
    .sort((a, b) => (b.viewsCount ?? 0) - (a.viewsCount ?? 0))
    .slice(0, 5);

  // Approved + paid withdrawals total
  const approvedWithdrawals = state.withdrawalRequests.filter(
    (w) => w.status === "approved" || w.status === "paid",
  );
  const totalApprovedPayouts = approvedWithdrawals.reduce(
    (sum, w) => sum + w.amount,
    0,
  );

  // Paid (fully confirmed) withdrawals
  const paidWithdrawals = state.withdrawalRequests.filter(
    (w) => w.status === "paid",
  );
  const totalPaidPayouts = paidWithdrawals.reduce(
    (sum, w) => sum + w.amount,
    0,
  );

  // Pending withdrawals total
  const pendingWithdrawals = state.withdrawalRequests.filter(
    (w) => w.status === "pending",
  );
  const totalPendingPayouts = pendingWithdrawals.reduce(
    (sum, w) => sum + w.amount,
    0,
  );

  // Local ads revenue
  const localAds: LocalAd[] = state.localAds ?? [];
  const activeLocalAds = localAds.filter((a) => a.isActive);
  const totalLocalAdRevenue = localAds.reduce(
    (sum, a) => sum + a.durationDays * LOCAL_AD_RATE_PER_DAY,
    0,
  );
  const currentDailyAdRevenue = activeLocalAds.length * LOCAL_AD_RATE_PER_DAY;

  // New ad form state
  const [adForm, setAdForm] = useState({
    businessName: "",
    tagline: "",
    linkUrl: "",
    durationDays: 1,
    imageUrl: "",
  });

  const handleSaveRpm = () => {
    dispatch({ type: "SET_RPM", config: rpmDraft });
    toast.success("RPM rates updated!");
  };

  const handleApprove = (requestId: string, amount: number) => {
    dispatch({ type: "APPROVE_WITHDRAWAL", requestId });
    toast.success(`Withdrawal of ₹${amount.toFixed(2)} approved`);
  };

  const handleReject = (requestId: string, amount: number) => {
    dispatch({ type: "REJECT_WITHDRAWAL", requestId });
    toast.success(`Withdrawal rejected · ₹${amount.toFixed(2)} refunded`);
  };

  const handleMarkPaid = (requestId: string, amount: number) => {
    dispatch({ type: "MARK_PAID", requestId });
    toast.success(`₹${amount.toFixed(2)} marked as paid`);
  };

  const handleAdminPost = async () => {
    if (!adminVideoUrl.trim()) {
      toast.error("Please enter a video URL");
      return;
    }
    if (!adminCaption.trim()) {
      toast.error("Please enter a caption");
      return;
    }
    setAdminPosting(true);
    await new Promise((r) => setTimeout(r, 600));
    dispatch({
      type: "UPLOAD_VIDEO",
      video: {
        id: generateId(),
        uploaderId: "admin",
        url: adminVideoUrl.trim(),
        caption: adminCaption.trim(),
        hashtags: adminHashtags.length > 0 ? adminHashtags : [adminVideoType],
        likesCount: 0,
        commentsCount: 0,
        createdAt: Date.now(),
        isDeleted: false,
        videoType: adminVideoType,
        viewsCount: 0,
        adImpressions: 0,
        shareCount: 0,
      },
    });
    setAdminVideoUrl("");
    setAdminCaption("");
    setAdminHashtagInput("");
    setAdminHashtags([]);
    setAdminVideoType("reel");
    setAdminPosting(false);
    toast.success("Video posted!");
  };

  const pendingReports = state.reports ?? [];

  // Music Library form state
  const [musicForm, setMusicForm] = useState({
    title: "",
    artist: "",
    genre: "folk" as MusicGenre,
    audioUrl: "",
    duration: 180,
  });

  // Settings tab local state
  const [subPriceDraft, setSubPriceDraft] = useState(
    state.subscriptionPrice ?? 600,
  );
  const [broadcastMsg, setBroadcastMsg] = useState("");

  const tabs = [
    "overview",
    "users",
    "artists",
    "videos",
    "comments",
    "withdrawals",
    "upload",
    "ads",
    "music",
    "live",
    "reports",
    "security",
    "settings",
  ] as const;

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-display text-base font-bold text-white leading-tight">
              {ADMIN_NAME}
            </h1>
            <p className="text-white/40 text-[10px]">Admin Dashboard</p>
          </div>
        </div>
        <button
          type="button"
          data-ocid="admin.logout_button"
          onClick={onLogout}
          className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="sticky top-[65px] z-10 bg-background border-b border-white/10 flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab}
            data-ocid={`admin.${tab}.tab`}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[80px] py-3 text-sm font-medium capitalize transition-colors whitespace-nowrap px-2 ${
              activeTab === tab
                ? "text-white border-b-2 border-reels-pink"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {tab}
            {tab === "artists" &&
              state.users.filter(
                (u) =>
                  u.role === "artist" && u.artistApprovalStatus === "pending",
              ).length > 0 && (
                <span className="ml-1.5 bg-amber-500 text-black text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {
                    state.users.filter(
                      (u) =>
                        u.role === "artist" &&
                        u.artistApprovalStatus === "pending",
                    ).length
                  }
                </span>
              )}
            {tab === "withdrawals" && pendingWithdrawals.length > 0 && (
              <span className="ml-1.5 bg-amber-500 text-black text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {pendingWithdrawals.length}
              </span>
            )}
            {tab === "ads" && activeLocalAds.length > 0 && (
              <span className="ml-1.5 bg-emerald-500 text-black text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {activeLocalAds.length}
              </span>
            )}
            {tab === "reports" && pendingReports.length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {pendingReports.length}
              </span>
            )}
            {tab === "live" &&
              state.liveStreams.filter((s) => s.isActive).length > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {state.liveStreams.filter((s) => s.isActive).length}
                </span>
              )}
          </button>
        ))}
      </div>

      <div className="px-4 py-5 pb-10 max-w-4xl mx-auto">
        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">
              Platform Stats
            </h2>
            {/* 4-card stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  icon: <Users className="w-5 h-5 text-blue-400" />,
                  label: "Total Users",
                  value: state.users.length,
                  sub: `${state.users.filter((u) => u.isBlocked).length} blocked`,
                  color: "from-blue-600/20 to-blue-600/5",
                  valueColor: "text-blue-300",
                },
                {
                  icon: <Film className="w-5 h-5 text-reels-pink" />,
                  label: "Total Videos",
                  value: activeVideos.length,
                  sub: `${state.videos.filter((v) => v.isDeleted).length} deleted`,
                  color: "from-pink-600/20 to-pink-600/5",
                  valueColor: "text-reels-pink",
                },
                {
                  icon: <IndianRupee className="w-5 h-5 text-emerald-400" />,
                  label: "Total Earnings",
                  value: `₹${state.users
                    .reduce((s, u) => s + (u.totalEarnings ?? 0), 0)
                    .toFixed(0)}`,
                  sub: "Platform gross",
                  color: "from-emerald-600/20 to-emerald-600/5",
                  valueColor: "text-emerald-400",
                },
                {
                  icon: <Wallet className="w-5 h-5 text-amber-400" />,
                  label: "Total Withdrawals",
                  value: `₹${state.withdrawalRequests
                    .reduce((s, w) => s + w.amount, 0)
                    .toFixed(0)}`,
                  sub: `${state.withdrawalRequests.length} requests`,
                  color: "from-amber-600/20 to-amber-600/5",
                  valueColor: "text-amber-400",
                },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-ocid={`admin.overview.${stat.label.toLowerCase().replace(/\s+/g, "_")}.card`}
                  className={`rounded-2xl bg-gradient-to-br ${stat.color} border border-white/10 p-4`}
                >
                  <div className="flex items-center justify-between mb-2">
                    {stat.icon}
                    <span className="text-white/30 text-[10px]">
                      {stat.sub}
                    </span>
                  </div>
                  <p
                    className={`font-bold text-2xl font-display ${stat.valueColor}`}
                  >
                    {stat.value}
                  </p>
                  <p className="text-white/50 text-xs mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Ad Revenue Distribution cards */}
            <div
              className="grid grid-cols-3 gap-3"
              data-ocid="admin.ad_revenue_distribution.section"
            >
              {[
                {
                  icon: <IndianRupee className="w-4 h-4 text-blue-400" />,
                  label: "Total Ad Revenue",
                  value: `₹${state.adRevenueRecords.reduce((s, r) => s + r.revenueAmount, 0).toFixed(2)}`,
                  sub: `${state.adRevenueRecords.length} records`,
                  color: "from-blue-600/20 to-blue-600/5",
                  valueColor: "text-blue-300",
                  ocid: "admin.total_ad_revenue.card",
                },
                {
                  icon: <IndianRupee className="w-4 h-4 text-emerald-400" />,
                  label: "Artist Earnings (60%)",
                  value: `₹${state.adRevenueRecords.reduce((s, r) => s + r.artistShare, 0).toFixed(2)}`,
                  sub: "Creator share",
                  color: "from-emerald-600/20 to-emerald-600/5",
                  valueColor: "text-emerald-400",
                  ocid: "admin.artist_earnings.card",
                },
                {
                  icon: <IndianRupee className="w-4 h-4 text-purple-400" />,
                  label: "Admin Earnings (40%)",
                  value: `₹${(state.adminTotalEarnings ?? 0).toFixed(2)}`,
                  sub: "Platform profit",
                  color: "from-purple-600/20 to-purple-600/5",
                  valueColor: "text-purple-300",
                  ocid: "admin.admin_earnings.card",
                },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-ocid={stat.ocid}
                  className={`rounded-2xl bg-gradient-to-br ${stat.color} border border-white/10 p-3`}
                >
                  <div className="flex items-center justify-between mb-2">
                    {stat.icon}
                    <span className="text-white/30 text-[10px] text-right leading-tight">
                      {stat.sub}
                    </span>
                  </div>
                  <p
                    className={`font-bold text-base font-display ${stat.valueColor}`}
                  >
                    {stat.value}
                  </p>
                  <p className="text-white/40 text-[10px] mt-0.5 leading-tight">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Video Earnings Table (top 10 by ad revenue) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              data-ocid="admin.video_earnings.table"
              className="rounded-2xl border border-white/10 bg-card overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-white font-semibold text-sm">
                  Video Earnings (Top 10)
                </h3>
              </div>
              {/* Table header */}
              <div className="px-3 py-2 border-b border-white/5 grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 items-center bg-white/3">
                <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
                  Video
                </span>
                <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider w-14 text-right">
                  Views
                </span>
                <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider w-14 text-right">
                  Ad Rev ₹
                </span>
                <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider w-14 text-right">
                  Artist ₹
                </span>
                <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider w-14 text-right">
                  Admin ₹
                </span>
              </div>
              <div className="divide-y divide-white/5">
                {[...activeVideos]
                  .map((v) =>
                    computeVideoEarnings(
                      v.id,
                      state.adRevenueRecords,
                      state.videos,
                    ),
                  )
                  .sort((a, b) => b.totalAdRevenue - a.totalAdRevenue)
                  .slice(0, 10)
                  .map((ve, i) => {
                    const video = activeVideos.find((v) => v.id === ve.videoId);
                    if (!video) return null;
                    return (
                      <div
                        key={ve.videoId}
                        data-ocid={`admin.video_earnings.item.${i + 1}`}
                        className="px-3 py-2.5 grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 items-center"
                      >
                        <div className="min-w-0">
                          <p className="text-white text-[11px] font-medium truncate leading-tight mb-0.5">
                            {video.caption.length > 30
                              ? `${video.caption.slice(0, 30)}…`
                              : video.caption}
                          </p>
                          <VideoTypeBadge type={video.videoType} />
                        </div>
                        <span className="text-white/50 text-[11px] w-14 text-right tabular-nums">
                          {formatCount(ve.totalViews)}
                        </span>
                        <span className="text-blue-300 text-[11px] w-14 text-right tabular-nums font-semibold">
                          ₹{ve.totalAdRevenue.toFixed(2)}
                        </span>
                        <span className="text-emerald-400 text-[11px] w-14 text-right tabular-nums font-semibold">
                          ₹{ve.artistEarnings.toFixed(2)}
                        </span>
                        <span className="text-purple-400 text-[11px] w-14 text-right tabular-nums font-semibold">
                          ₹{ve.adminEarnings.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                {activeVideos.length === 0 && (
                  <div
                    data-ocid="admin.video_earnings.empty_state"
                    className="py-8 text-center"
                  >
                    <p className="text-white/30 text-sm">No videos yet</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* RPM Configuration card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              data-ocid="admin.rpm_config.panel"
              className="rounded-2xl border border-white/10 bg-card p-5 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-semibold">Ad RPM Config</h3>
                <span className="text-white/40 text-xs ml-auto">
                  Per 1,000 views
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    {
                      key: "reel" as VideoType,
                      label: "Reel",
                      color: "text-reels-pink",
                    },
                    {
                      key: "long" as VideoType,
                      label: "Long",
                      color: "text-blue-400",
                    },
                    {
                      key: "premium" as VideoType,
                      label: "Premium",
                      color: "text-amber-400",
                    },
                  ] as const
                ).map(({ key, label, color }) => (
                  <div key={key} className="space-y-1.5">
                    <label
                      htmlFor={`rpm-${key}`}
                      className={`text-xs font-semibold ${color}`}
                    >
                      {label}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                        ₹
                      </span>
                      <Input
                        id={`rpm-${key}`}
                        data-ocid={`admin.rpm_${key}_input`}
                        type="number"
                        min={0}
                        step={0.5}
                        value={rpmDraft[key]}
                        onChange={(e) =>
                          setRpmDraft((prev) => ({
                            ...prev,
                            [key]: Number.parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="pl-7 bg-white/10 border-white/20 text-white h-9 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                data-ocid="admin.rpm_save_button"
                onClick={handleSaveRpm}
                size="sm"
                className="w-full font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.18 260), oklch(0.5 0.22 290))",
                }}
              >
                Save RPM Config
              </Button>
            </motion.div>

            {/* Platform Earnings card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              data-ocid="admin.platform_earnings.panel"
              className="rounded-2xl border border-white/10 bg-card p-5 space-y-4"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="text-white font-semibold">Platform Earnings</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-white/60 text-sm">
                    Total Gross Revenue
                  </span>
                  <span className="text-white font-bold text-base font-display">
                    ₹{totalGross.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white/40" />
                    <span className="text-white/60 text-sm">
                      Admin Share (40%)
                    </span>
                  </div>
                  <span className="text-white font-semibold">
                    ₹{adminShare.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-white/60 text-sm">
                      Artist Payouts (60%)
                    </span>
                  </div>
                  <span className="text-emerald-400 font-semibold">
                    ₹{artistPayouts.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-white/60 text-sm">
                      Approved Payouts
                    </span>
                  </div>
                  <span className="text-green-400 font-semibold">
                    ₹{totalApprovedPayouts.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-white/60 text-sm">
                      Paid (Confirmed)
                    </span>
                  </div>
                  <span className="text-blue-400 font-semibold">
                    ₹{totalPaidPayouts.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-white/60 text-sm">
                      Pending Payouts
                    </span>
                  </div>
                  <span className="text-amber-400 font-semibold">
                    ₹{totalPendingPayouts.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                    <span className="text-white/60 text-sm">
                      Local Ad Revenue
                    </span>
                  </div>
                  <span className="text-orange-400 font-semibold">
                    ₹{totalLocalAdRevenue.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Revenue formula reminder */}
              <div className="rounded-xl bg-white/5 px-3 py-2">
                <p className="text-white/30 text-[10px] text-center">
                  VideoEarn = (VideoViews × AdRPM) / 1000 · ArtistShare = 60% ·
                  AdminShare = 40%
                </p>
              </div>
            </motion.div>

            {/* Ad Revenue Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              data-ocid="admin.ad_revenue.panel"
              className="rounded-2xl border border-white/10 bg-card p-5 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-reels-pink" />
                <h3 className="text-white font-semibold">
                  Ad Revenue Breakdown
                </h3>
                <span className="text-white/40 text-xs ml-auto">
                  {formatCount(totalImpressions)} impressions
                </span>
              </div>

              {/* 3 revenue cards */}
              <div className="grid grid-cols-3 gap-3">
                <div
                  className="rounded-xl p-3 text-center space-y-1"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.18 0.04 240), oklch(0.12 0.03 240))",
                    border: "1px solid oklch(0.55 0.15 240 / 0.25)",
                  }}
                >
                  <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider">
                    Total Ad Revenue
                  </p>
                  <p className="text-blue-300 font-bold text-lg font-display">
                    ₹{totalGross.toFixed(0)}
                  </p>
                  <p className="text-white/30 text-[9px]">
                    {formatCount(totalImpressions)} imp.
                  </p>
                </div>
                <div
                  className="rounded-xl p-3 text-center space-y-1"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.18 0.04 160), oklch(0.12 0.03 160))",
                    border: "1px solid oklch(0.55 0.15 160 / 0.25)",
                  }}
                >
                  <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider">
                    Creator Payouts
                  </p>
                  <p className="text-emerald-400 font-bold text-lg font-display">
                    ₹{artistPayouts.toFixed(0)}
                  </p>
                  <p className="text-white/30 text-[9px]">60% share</p>
                </div>
                <div
                  className="rounded-xl p-3 text-center space-y-1"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.18 0.05 70), oklch(0.12 0.03 60))",
                    border: "1px solid oklch(0.75 0.18 80 / 0.25)",
                  }}
                >
                  <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider">
                    Platform Earnings
                  </p>
                  <p className="text-amber-400 font-bold text-lg font-display">
                    ₹{adminShare.toFixed(0)}
                  </p>
                  <p className="text-white/30 text-[9px]">40% share</p>
                </div>
              </div>

              {/* By video type */}
              <div className="space-y-2">
                <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
                  Revenue by Type
                </p>
                {[
                  {
                    label: "Reel",
                    gross: reelGross,
                    impressions: reelImpressions,
                    color: "text-reels-pink",
                    bar: "bg-reels-pink",
                  },
                  {
                    label: "Long",
                    gross: longGross,
                    impressions: longImpressions,
                    color: "text-blue-400",
                    bar: "bg-blue-400",
                  },
                  {
                    label: "Premium",
                    gross: premiumGross,
                    impressions: premiumImpressions,
                    color: "text-amber-400",
                    bar: "bg-amber-400",
                  },
                ].map(({ label, gross, impressions, color, bar }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${color}`}>
                        {label}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-white/40 text-[10px]">
                          {formatCount(impressions)} imp.
                        </span>
                        <span className="text-white text-xs font-semibold">
                          ₹{gross.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${bar} transition-all`}
                        style={{
                          width:
                            totalGross > 0
                              ? `${(gross / totalGross) * 100}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Top 5 earning creators */}
              <div className="space-y-2">
                <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
                  Top 5 Earning Creators
                </p>
                <div className="space-y-2">
                  {topEarningCreators.map((u, i) => (
                    <div
                      key={u.id}
                      data-ocid={`admin.top_creator.item.${i + 1}`}
                      className="flex items-center gap-3"
                    >
                      <span className="text-white/30 text-xs w-4 text-center">
                        {i + 1}
                      </span>
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback className="text-[10px] bg-white/10 text-white">
                          {u.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">
                          @{u.username}
                        </p>
                      </div>
                      <span className="text-emerald-400 text-xs font-bold">
                        ₹{(u.totalEarnings ?? 0).toFixed(0)}
                      </span>
                    </div>
                  ))}
                  {topEarningCreators.length === 0 && (
                    <p className="text-white/30 text-xs text-center py-2">
                      No artist data yet
                    </p>
                  )}
                </div>
              </div>

              {/* Top 5 most viewed videos */}
              <div className="space-y-2">
                <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
                  Top 5 Most Viewed Videos
                </p>
                <div className="space-y-2">
                  {topViewedVideos.map((v, i) => {
                    const uploader = state.users.find(
                      (u) => u.id === v.uploaderId,
                    );
                    return (
                      <div
                        key={v.id}
                        data-ocid={`admin.top_video.item.${i + 1}`}
                        className="flex items-center gap-3"
                      >
                        <span className="text-white/30 text-xs w-4 text-center">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">
                            {v.caption.length > 36
                              ? `${v.caption.slice(0, 36)}…`
                              : v.caption}
                          </p>
                          <p className="text-white/40 text-[10px]">
                            @{uploader?.username ?? "unknown"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/70 text-xs font-semibold">
                            {formatCount(v.viewsCount ?? 0)} views
                          </p>
                          <p className="text-reels-pink text-[10px]">
                            {formatCount(v.adImpressions ?? 0)} imp.
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {topViewedVideos.length === 0 && (
                    <p className="text-white/30 text-xs text-center py-2">
                      No videos yet
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Platform Policy card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              data-ocid="admin.platform_policy_card"
              className="rounded-2xl border border-amber-500/20 p-5 space-y-4"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.18 60 / 0.08), oklch(0.55 0.22 30 / 0.05))",
              }}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="text-white font-semibold">Platform Policy</h3>
                <span
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.55 0.28 20))",
                  }}
                >
                  <Shield className="w-3 h-3" />
                  Min Age: 13+
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: "No Nudity",
                    mr: "नग्नता नाही",
                    color: "text-rose-400",
                    bg: "bg-rose-500/8 border-rose-500/20",
                  },
                  {
                    label: "No Violence",
                    mr: "हिंसा नाही",
                    color: "text-orange-400",
                    bg: "bg-orange-500/8 border-orange-500/20",
                  },
                  {
                    label: "No Hate Speech",
                    mr: "द्वेष नाही",
                    color: "text-amber-400",
                    bg: "bg-amber-500/8 border-amber-500/20",
                  },
                  {
                    label: "No Illegal Content",
                    mr: "बेकायदेशीर नाही",
                    color: "text-red-400",
                    bg: "bg-red-500/8 border-red-500/20",
                  },
                ].map((rule) => (
                  <div
                    key={rule.label}
                    className={`rounded-xl px-3 py-2.5 border ${rule.bg} flex items-center gap-2`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${rule.color.replace("text-", "bg-")}`}
                    />
                    <div>
                      <p className={`text-xs font-semibold ${rule.color}`}>
                        {rule.label}
                      </p>
                      <p className="text-white/35 text-[10px]">{rule.mr}</p>
                    </div>
                    <span className="ml-auto text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-1.5 py-0.5">
                      Enforced
                    </span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-3 bg-white/5 border border-white/10">
                <p className="text-white/60 text-xs">
                  <strong className="text-white">
                    Admin can remove any content
                  </strong>{" "}
                  violating these rules. Blocked users cannot upload or comment.
                </p>
                <p className="text-white/35 text-[11px] mt-1">
                  Admin या नियमांचे उल्लंघन करणारी कोणतीही सामग्री काढू शकतो.
                </p>
              </div>
            </motion.div>

            {/* Top creators */}
            <div className="rounded-2xl border border-white/10 bg-card p-5">
              <h3 className="text-white font-semibold mb-4">Top Creators</h3>
              <div className="space-y-3">
                {[...state.users]
                  .sort(
                    (a, b) =>
                      (b.pendingEarnings ?? 0) - (a.pendingEarnings ?? 0),
                  )
                  .slice(0, 4)
                  .map((u, i) => (
                    <div key={u.id} className="flex items-center gap-3">
                      <span className="text-white/30 text-sm w-5 text-center">
                        {i + 1}
                      </span>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback className="bg-white/10 text-white text-xs">
                          {u.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          @{u.username}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 text-xs font-medium">
                            {(u.pendingEarnings ?? 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-reels-pink fill-reels-pink" />
                          <span className="text-white/70 text-xs">
                            {formatCount(u.totalLikes)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Users tab */}
        {activeTab === "users" && (
          <div className="space-y-4" data-ocid="admin.users_table">
            <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">
              All Users ({state.users.length})
            </h2>
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white/60">User</TableHead>
                    <TableHead className="text-white/60">Status</TableHead>
                    <TableHead className="text-white/60">Role</TableHead>
                    <TableHead className="text-white/60">
                      Subscription
                    </TableHead>
                    <TableHead className="text-white/60">Badge</TableHead>
                    <TableHead className="text-white/60 text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.users.map((user, i) => {
                    const ocidIndex = i + 1;
                    return (
                      <TableRow
                        key={user.id}
                        className="border-white/5 hover:bg-white/5"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="bg-white/10 text-white text-xs">
                                {user.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">
                                @{user.username}
                              </p>
                              <p className="text-white/30 text-xs">
                                {formatCount(user.followers)} followers
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.isBlocked ? "destructive" : "secondary"
                            }
                            className={
                              user.isBlocked
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : "bg-green-500/20 text-green-400 border-green-500/30"
                            }
                          >
                            {user.isBlocked ? "Blocked" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            <RoleBadge role={user.role ?? "viewer"} />
                            <select
                              data-ocid={`admin.set_role_select.${ocidIndex}`}
                              value={user.role ?? "viewer"}
                              onChange={(e) => {
                                const newRole = e.target.value as UserRole;
                                if (newRole === "admin") return; // admin not self-assignable
                                dispatch({
                                  type: "SET_USER_ROLE",
                                  userId: user.id,
                                  role: newRole,
                                });
                                toast.success(
                                  `@${user.username} role → ${newRole}`,
                                );
                              }}
                              className="text-[10px] bg-white/10 border border-white/20 text-white/70 rounded px-1 py-0.5 outline-none cursor-pointer"
                            >
                              <option value="viewer">viewer</option>
                              <option value="artist">artist</option>
                            </select>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            <AdminSubBadge
                              status={user.subscriptionStatus ?? "none"}
                            />
                            {user.subscriptionStatus === "active" &&
                              user.subscriptionExpiry > 0 && (
                                <p className="text-white/30 text-[10px]">
                                  Exp:{" "}
                                  {new Date(
                                    user.subscriptionExpiry,
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            <Button
                              data-ocid={`admin.grant_sub_button.${ocidIndex}`}
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                dispatch({
                                  type: "SET_SUBSCRIPTION",
                                  userId: user.id,
                                  status: "active",
                                  expiry: Date.now() + 86400000 * 30,
                                });
                                toast.success(
                                  `30-day subscription granted to @${user.username}`,
                                );
                              }}
                              className="text-green-400 hover:text-green-300 hover:bg-green-400/10 text-[10px] h-6 px-2"
                            >
                              Grant 30d
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            <CreatorBadge
                              user={user}
                              userVideos={state.videos.filter(
                                (v) => v.uploaderId === user.id && !v.isDeleted,
                              )}
                              allUsers={state.users}
                              allVideos={state.videos}
                              size="sm"
                            />
                            <Button
                              data-ocid={`admin.badge_button.${ocidIndex}`}
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (user.isVerifiedCreator) {
                                  dispatch({
                                    type: "REVOKE_VERIFIED_BADGE",
                                    userId: user.id,
                                  });
                                  toast.success(
                                    `Verified badge revoked from @${user.username}`,
                                  );
                                } else {
                                  dispatch({
                                    type: "GRANT_VERIFIED_BADGE",
                                    userId: user.id,
                                  });
                                  toast.success(
                                    `Verified badge granted to @${user.username}`,
                                  );
                                }
                              }}
                              className={`text-[10px] h-6 px-2 ${user.isVerifiedCreator ? "text-red-400 hover:text-red-300 hover:bg-red-400/10" : "text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"}`}
                            >
                              {user.isVerifiedCreator ? "Revoke ✓" : "Grant ✓"}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {user.isBlocked ? (
                            <Button
                              data-ocid={`admin.block_button.${ocidIndex}`}
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                dispatch({
                                  type: "UNBLOCK_USER",
                                  userId: user.id,
                                });
                                toast.success(`@${user.username} unblocked`);
                              }}
                              className="text-green-400 hover:text-green-300 hover:bg-green-400/10 text-xs"
                            >
                              <UserCheck className="w-3.5 h-3.5 mr-1" />
                              Unblock
                            </Button>
                          ) : (
                            <Button
                              data-ocid={`admin.block_button.${ocidIndex}`}
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                dispatch({
                                  type: "BLOCK_USER",
                                  userId: user.id,
                                });
                                toast.success(`@${user.username} blocked`);
                              }}
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs"
                            >
                              <UserX className="w-3.5 h-3.5 mr-1" />
                              Block
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Videos tab */}
        {activeTab === "videos" && (
          <div className="space-y-4" data-ocid="admin.videos_table">
            <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">
              All Videos ({state.videos.length})
            </h2>
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white/60">Video</TableHead>
                    <TableHead className="text-white/60">Uploader</TableHead>
                    <TableHead className="text-white/60">Type</TableHead>
                    <TableHead className="text-white/60">Stats</TableHead>
                    <TableHead className="text-white/60">Ad Imp.</TableHead>
                    <TableHead className="text-white/60 text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.videos.map((video, i) => {
                    const uploader = state.users.find(
                      (u) => u.id === video.uploaderId,
                    );
                    const ocidIndex = i + 1;
                    return (
                      <TableRow
                        key={video.id}
                        data-ocid={`admin.videos.item.${ocidIndex}`}
                        className="border-white/5 hover:bg-white/5"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-14 bg-white/10 rounded overflow-hidden shrink-0">
                              <video
                                src={video.url}
                                className="w-full h-full object-cover"
                                muted
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-xs line-clamp-2">
                                {video.caption}
                              </p>
                              <p className="text-white/30 text-xs mt-0.5">
                                {formatTime(video.createdAt)} ago
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-white/70 text-sm">
                          @{uploader?.username ?? "unknown"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <VideoTypeBadge
                              type={(video.videoType as VideoType) ?? "reel"}
                            />
                            {video.isPromoted &&
                              video.promotionExpiry &&
                              video.promotionExpiry > Date.now() && (
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] px-1.5 py-0"
                                  style={{
                                    background: "oklch(0.4 0.2 280 / 0.3)",
                                    color: "oklch(0.8 0.15 280)",
                                    borderColor: "oklch(0.5 0.2 280 / 0.3)",
                                  }}
                                >
                                  🚀{" "}
                                  {(video.promotedReach ?? 0).toLocaleString()}{" "}
                                  reach
                                </Badge>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-white/70 text-xs">
                              ❤️ {formatCount(video.likesCount)}
                            </span>
                            <span className="text-white/50 text-xs">
                              💬 {formatCount(video.commentsCount)}
                            </span>
                            <span className="text-white/40 text-xs">
                              👁 {formatCount(video.viewsCount ?? 0)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Megaphone className="w-3 h-3 text-reels-pink/70" />
                            <span className="text-reels-pink/80 text-xs font-medium">
                              {formatCount(video.adImpressions ?? 0)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {video.isDeleted ? (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-red-500/20 text-red-400"
                            >
                              Deleted
                            </Badge>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {video.isApproved ? (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approved
                                </Badge>
                              ) : (
                                <Button
                                  data-ocid={`admin.approve_video_button.${ocidIndex}`}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    dispatch({
                                      type: "APPROVE_VIDEO",
                                      videoId: video.id,
                                    });
                                    toast.success("Video approved");
                                  }}
                                  className="text-green-400 hover:text-green-300 hover:bg-green-400/10 text-xs h-7 px-2"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                  Approve
                                </Button>
                              )}
                              {video.isFeatured ? (
                                <Button
                                  data-ocid={`admin.unfeature_button.${ocidIndex}`}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    dispatch({
                                      type: "UNFEATURE_VIDEO",
                                      videoId: video.id,
                                    });
                                    toast.success("Removed from featured");
                                  }}
                                  className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 text-xs h-7 px-2"
                                >
                                  <Star className="w-3 h-3 mr-1 fill-amber-400" />
                                  Featured
                                </Button>
                              ) : (
                                <Button
                                  data-ocid={`admin.feature_button.${ocidIndex}`}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    dispatch({
                                      type: "FEATURE_VIDEO",
                                      videoId: video.id,
                                    });
                                    toast.success("Video featured!");
                                  }}
                                  className="text-white/40 hover:text-amber-400 hover:bg-amber-400/10 text-xs h-7 px-2"
                                >
                                  <Star className="w-3 h-3 mr-1" />
                                  Feature
                                </Button>
                              )}
                              <Button
                                data-ocid={`admin.delete_button.${ocidIndex}`}
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  dispatch({
                                    type: "DELETE_VIDEO",
                                    videoId: video.id,
                                  });
                                  toast.success("Video deleted");
                                }}
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs h-7 px-2"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                Delete
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Comments tab */}
        {activeTab === "comments" && (
          <div className="space-y-4">
            <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">
              All Comments ({state.comments.length})
            </h2>
            {state.comments.length === 0 ? (
              <div
                data-ocid="admin.comments.empty_state"
                className="text-center py-12 text-white/30 text-sm"
              >
                No comments yet
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-white/40 text-xs">
                        User
                      </TableHead>
                      <TableHead className="text-white/40 text-xs">
                        Comment
                      </TableHead>
                      <TableHead className="text-white/40 text-xs">
                        Video
                      </TableHead>
                      <TableHead className="text-white/40 text-xs">
                        Time
                      </TableHead>
                      <TableHead className="text-white/40 text-xs text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...state.comments]
                      .sort((a, b) => b.createdAt - a.createdAt)
                      .map((comment, idx) => {
                        const commenter = state.users.find(
                          (u) => u.id === comment.userId,
                        );
                        const video = state.videos.find(
                          (v) => v.id === comment.videoId,
                        );
                        return (
                          <TableRow
                            key={comment.id}
                            data-ocid={`admin.comments.row.${idx + 1}`}
                            className="border-white/5 hover:bg-white/3"
                          >
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-7 h-7">
                                  <AvatarImage src={commenter?.avatar} />
                                  <AvatarFallback className="bg-white/10 text-white text-[10px]">
                                    {commenter?.username?.[0]?.toUpperCase() ??
                                      "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-white/70 text-xs font-medium">
                                  @{commenter?.username ?? "unknown"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <p className="text-white text-xs max-w-[160px] truncate">
                                {comment.text}
                              </p>
                            </TableCell>
                            <TableCell className="py-3">
                              <p className="text-white/40 text-[11px] max-w-[100px] truncate">
                                {video?.caption ?? comment.videoId}
                              </p>
                            </TableCell>
                            <TableCell className="py-3">
                              <span className="text-white/30 text-[11px]">
                                {formatTime(comment.createdAt)}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                data-ocid={`admin.comments.delete_button.${idx + 1}`}
                                onClick={() => {
                                  dispatch({
                                    type: "DELETE_COMMENT",
                                    commentId: comment.id,
                                  });
                                  toast.success("Comment deleted");
                                }}
                                className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* Withdrawals tab */}
        {activeTab === "withdrawals" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">
                Withdrawal Requests ({state.withdrawalRequests.length})
              </h2>
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-sm font-medium">
                  {pendingWithdrawals.length} pending
                </span>
              </div>
            </div>

            {state.withdrawalRequests.length === 0 ? (
              <div
                data-ocid="admin.withdrawals.empty_state"
                className="rounded-2xl border border-white/10 bg-card py-16 text-center"
              >
                <p className="text-4xl mb-3">💸</p>
                <p className="text-white/40 text-sm">
                  No withdrawal requests yet
                </p>
                <p className="text-white/30 text-xs mt-1">
                  Requests from creators will appear here
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-white/60">User</TableHead>
                      <TableHead className="text-white/60">Name</TableHead>
                      <TableHead className="text-white/60">UPI ID</TableHead>
                      <TableHead className="text-white/60">Amount</TableHead>
                      <TableHead className="text-white/60">Status</TableHead>
                      <TableHead className="text-white/60">Date</TableHead>
                      <TableHead className="text-white/60 text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.withdrawalRequests.map((req, i) => {
                      const reqUser = state.users.find(
                        (u) => u.id === req.userId,
                      );
                      const ocidIndex = i + 1;
                      return (
                        <TableRow
                          key={req.id}
                          data-ocid={`admin.withdrawals.item.${ocidIndex}`}
                          className="border-white/5 hover:bg-white/5"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {reqUser && (
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={reqUser.avatar} />
                                  <AvatarFallback className="bg-white/10 text-white text-[10px]">
                                    {reqUser.username[0].toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className="min-w-0">
                                <p className="text-white text-xs font-medium">
                                  @{reqUser?.username ?? "unknown"}
                                </p>
                                {reqUser && (
                                  <div className="mt-0.5">
                                    <RoleBadge
                                      role={reqUser.role ?? "viewer"}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white/70 text-xs max-w-[100px] truncate">
                            {req.userName || "—"}
                          </TableCell>
                          <TableCell className="text-white/50 text-xs max-w-[140px] truncate">
                            {req.paymentMethod === "paytm"
                              ? `Paytm: ${req.paytmNumber}`
                              : req.paymentMethod === "bank"
                                ? `Bank: ${req.bankAccountHolder} · ${req.bankAccountNumber} · ${req.bankIfsc}`
                                : `UPI: ${req.upiId}`}
                          </TableCell>
                          <TableCell>
                            <span className="text-white font-semibold text-sm">
                              ₹{req.amount.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <WithdrawalStatusBadge status={req.status} />
                          </TableCell>
                          <TableCell className="text-white/40 text-xs whitespace-nowrap">
                            {formatTime(req.createdAt)} ago
                          </TableCell>
                          <TableCell className="text-right">
                            {req.status === "pending" ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  data-ocid={`admin.approve_button.${ocidIndex}`}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleApprove(req.id, req.amount)
                                  }
                                  className="text-green-400 hover:text-green-300 hover:bg-green-400/10 text-xs h-7 px-2"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  data-ocid={`admin.reject_button.${ocidIndex}`}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleReject(req.id, req.amount)
                                  }
                                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs h-7 px-2"
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            ) : req.status === "approved" ? (
                              <Button
                                data-ocid={`admin.mark_paid_button.${ocidIndex}`}
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleMarkPaid(req.id, req.amount)
                                }
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 text-xs h-7 px-2"
                              >
                                <Banknote className="w-3.5 h-3.5 mr-1" />
                                Mark as Paid
                              </Button>
                            ) : (
                              <span className="text-white/30 text-xs">
                                {req.processedAt > 0
                                  ? `${formatTime(req.processedAt)} ago`
                                  : req.resolvedAt > 0
                                    ? `${formatTime(req.resolvedAt)} ago`
                                    : "—"}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* Upload tab */}
        {activeTab === "upload" && (
          <div className="space-y-5 max-w-lg">
            <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">
              Admin Upload
            </h2>

            {/* Camera Record option */}
            <button
              type="button"
              data-ocid="admin.upload_camera_button"
              onClick={() =>
                navigate({ to: "/camera", search: { from: "admin" } })
              }
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3.5 border border-white/20 bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all text-left"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "oklch(0.65 0.28 15 / 0.25)",
                  border: "1px solid oklch(0.65 0.28 15 / 0.4)",
                }}
              >
                <Camera
                  className="w-5 h-5"
                  style={{ color: "oklch(0.75 0.22 15)" }}
                />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  Record with Camera
                </p>
                <p className="text-white/40 text-xs mt-0.5">
                  Open in-app camera to record a reel directly
                </p>
              </div>
            </button>

            {/* Photo Upload option */}
            <AdminPhotoUploadButton navigate={navigate} />

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-xs">or paste a URL</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <label
                htmlFor="admin-video-url"
                className="flex items-center gap-2 text-sm font-medium text-white/70"
              >
                <Film className="w-4 h-4" />
                Video URL
              </label>
              <Input
                id="admin-video-url"
                data-ocid="admin.upload_url_input"
                placeholder="https://..."
                value={adminVideoUrl}
                onChange={(e) => setAdminVideoUrl(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
              />
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <label
                htmlFor="admin-caption"
                className="flex items-center gap-2 text-sm font-medium text-white/70"
              >
                <Hash className="w-4 h-4" />
                Caption
              </label>
              <Textarea
                id="admin-caption"
                data-ocid="admin.upload_caption_textarea"
                placeholder="Write a caption..."
                value={adminCaption}
                onChange={(e) => setAdminCaption(e.target.value)}
                rows={3}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 resize-none text-sm"
              />
            </div>

            {/* Hashtags */}
            <div className="space-y-2">
              <label
                htmlFor="admin-hashtag"
                className="text-sm font-medium text-white/70"
              >
                Hashtags (comma-separated)
              </label>
              <div className="flex gap-2">
                <Input
                  id="admin-hashtag"
                  placeholder="fitness, dance, trending"
                  value={adminHashtagInput}
                  onChange={(e) => setAdminHashtagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const tags = adminHashtagInput
                        .split(",")
                        .map((t) => t.trim().replace(/^#/, "").toLowerCase())
                        .filter(Boolean);
                      const merged = [...new Set([...adminHashtags, ...tags])];
                      setAdminHashtags(merged);
                      setAdminHashtagInput("");
                    }
                  }}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 text-sm flex-1"
                />
                <Button
                  onClick={() => {
                    const tags = adminHashtagInput
                      .split(",")
                      .map((t) => t.trim().replace(/^#/, "").toLowerCase())
                      .filter(Boolean);
                    const merged = [...new Set([...adminHashtags, ...tags])];
                    setAdminHashtags(merged);
                    setAdminHashtagInput("");
                  }}
                  variant="secondary"
                  size="sm"
                  disabled={!adminHashtagInput.trim()}
                  className="shrink-0 bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  Add
                </Button>
              </div>
              {adminHashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {adminHashtags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setAdminHashtags(adminHashtags.filter((t) => t !== tag))
                      }
                      className="inline-flex items-center gap-1 text-xs bg-white/10 text-white/70 border border-white/20 rounded-full px-2 py-0.5 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                    >
                      #{tag} ×
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Video type selector */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/70">Video Type</p>
              <div className="grid grid-cols-3 gap-2">
                {ADMIN_VIDEO_TYPES.map((vt) => {
                  const isActive = adminVideoType === vt.type;
                  const isPremium = vt.type === "premium";
                  return (
                    <button
                      key={vt.type}
                      type="button"
                      data-ocid={`admin.upload.type_${vt.type}_button`}
                      onClick={() => setAdminVideoType(vt.type)}
                      className={`relative flex flex-col items-center gap-1 rounded-xl px-3 py-3 border text-center transition-all ${
                        isActive
                          ? "border-transparent text-white"
                          : "border-white/10 text-white/60 hover:border-white/20 hover:text-white/80 bg-white/5"
                      }`}
                      style={
                        isActive
                          ? {
                              background: isPremium
                                ? "linear-gradient(135deg, oklch(0.55 0.18 60), oklch(0.6 0.22 40))"
                                : "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
                            }
                          : {}
                      }
                    >
                      {isPremium && (
                        <Crown
                          className={`w-3 h-3 mb-0.5 ${isActive ? "text-amber-200" : "text-amber-500/60"}`}
                        />
                      )}
                      <span className="font-semibold text-sm">{vt.label}</span>
                      <span
                        className={`text-[10px] leading-tight text-center ${isActive ? "text-white/80" : "text-white/40"}`}
                      >
                        {vt.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Post button */}
            <Button
              data-ocid="admin.upload_submit_button"
              onClick={handleAdminPost}
              disabled={
                adminPosting || !adminVideoUrl.trim() || !adminCaption.trim()
              }
              className="w-full h-12 font-bold text-base"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.18 260), oklch(0.5 0.22 290))",
              }}
            >
              {adminPosting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Post Video
                </span>
              )}
            </Button>
          </div>
        )}

        {/* Ads tab */}
        {activeTab === "ads" && (
          <div className="space-y-5" data-ocid="admin.ads.panel">
            <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">
              Advertisement Management
            </h2>

            {/* AdMob Ad Settings Card */}
            <motion.div
              data-ocid="admin.ad_settings.panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-card p-5 space-y-5"
            >
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-white font-semibold">
                    AdMob Ad Settings
                  </h3>
                  <p className="text-white/40 text-xs">
                    जाहिरात Unit IDs अपडेट करा
                  </p>
                </div>
              </div>

              {/* Google AdMob Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔍</span>
                  <span className="text-white font-medium text-sm">
                    Google AdMob
                  </span>
                  <span className="ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Android SDK
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="ad-google-banner"
                      className="text-xs font-medium text-white/60"
                    >
                      Banner Ad{" "}
                      <span className="text-white/30">/ बॅनर जाहिरात</span>
                    </label>
                    <input
                      id="ad-google-banner"
                      data-ocid="admin.ad_settings.google_banner_input"
                      type="text"
                      value={adIdsDraft.googleBanner}
                      onChange={(e) =>
                        setAdIdsDraft((prev) => ({
                          ...prev,
                          googleBanner: e.target.value,
                        }))
                      }
                      placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/xxxxxxxxxx"
                      className="w-full h-9 px-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/20 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="ad-google-interstitial"
                      className="text-xs font-medium text-white/60"
                    >
                      Interstitial Ad{" "}
                      <span className="text-white/30">/ इंटरस्टिशियल</span>
                    </label>
                    <input
                      id="ad-google-interstitial"
                      data-ocid="admin.ad_settings.google_interstitial_input"
                      type="text"
                      value={adIdsDraft.googleInterstitial}
                      onChange={(e) =>
                        setAdIdsDraft((prev) => ({
                          ...prev,
                          googleInterstitial: e.target.value,
                        }))
                      }
                      placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/xxxxxxxxxx"
                      className="w-full h-9 px-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/20 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="ad-google-rewarded"
                      className="text-xs font-medium text-white/60"
                    >
                      Rewarded Ad{" "}
                      <span className="text-white/30">/ Rewarded जाहिरात</span>
                    </label>
                    <input
                      id="ad-google-rewarded"
                      data-ocid="admin.ad_settings.google_rewarded_input"
                      type="text"
                      value={adIdsDraft.googleRewarded}
                      onChange={(e) =>
                        setAdIdsDraft((prev) => ({
                          ...prev,
                          googleRewarded: e.target.value,
                        }))
                      }
                      placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/xxxxxxxxxx"
                      className="w-full h-9 px-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/20 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="ad-google-preroll"
                      className="text-xs font-medium text-white/60"
                    >
                      Pre-roll Video{" "}
                      <span className="text-white/30">/ Pre-roll व्हिडिओ</span>
                    </label>
                    <input
                      id="ad-google-preroll"
                      data-ocid="admin.ad_settings.google_preroll_input"
                      type="text"
                      value={adIdsDraft.googlePreRoll}
                      onChange={(e) =>
                        setAdIdsDraft((prev) => ({
                          ...prev,
                          googlePreRoll: e.target.value,
                        }))
                      }
                      placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/xxxxxxxxxx"
                      className="w-full h-9 px-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/20 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10" />

              {/* Meta Audience Network Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">📘</span>
                  <span className="text-white font-medium text-sm">
                    Meta Audience Network
                  </span>
                  <span className="ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Android SDK
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="ad-meta-banner"
                      className="text-xs font-medium text-white/60"
                    >
                      Banner Placement ID
                    </label>
                    <input
                      id="ad-meta-banner"
                      data-ocid="admin.ad_settings.meta_banner_input"
                      type="text"
                      value={adIdsDraft.metaBanner}
                      onChange={(e) =>
                        setAdIdsDraft((prev) => ({
                          ...prev,
                          metaBanner: e.target.value,
                        }))
                      }
                      placeholder="YOUR_META_APP_ID_BANNER"
                      className="w-full h-9 px-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/20 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="ad-meta-interstitial"
                      className="text-xs font-medium text-white/60"
                    >
                      Interstitial Placement ID
                    </label>
                    <input
                      id="ad-meta-interstitial"
                      data-ocid="admin.ad_settings.meta_interstitial_input"
                      type="text"
                      value={adIdsDraft.metaInterstitial}
                      onChange={(e) =>
                        setAdIdsDraft((prev) => ({
                          ...prev,
                          metaInterstitial: e.target.value,
                        }))
                      }
                      placeholder="YOUR_META_APP_ID_INTERSTITIAL"
                      className="w-full h-9 px-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/20 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label
                      htmlFor="ad-meta-preroll"
                      className="text-xs font-medium text-white/60"
                    >
                      Pre-roll Placement ID
                    </label>
                    <input
                      id="ad-meta-preroll"
                      data-ocid="admin.ad_settings.meta_preroll_input"
                      type="text"
                      value={adIdsDraft.metaPreRoll}
                      onChange={(e) =>
                        setAdIdsDraft((prev) => ({
                          ...prev,
                          metaPreRoll: e.target.value,
                        }))
                      }
                      placeholder="YOUR_META_APP_ID_PRE_ROLL"
                      className="w-full h-9 px-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/20 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <Button
                data-ocid="admin.ad_settings.save_button"
                onClick={() => {
                  const newIds: AdUnitIds = {
                    google: {
                      BANNER: adIdsDraft.googleBanner.trim(),
                      INTERSTITIAL: adIdsDraft.googleInterstitial.trim(),
                      REWARDED: adIdsDraft.googleRewarded.trim(),
                      PRE_ROLL: adIdsDraft.googlePreRoll.trim(),
                    },
                    meta: {
                      BANNER: adIdsDraft.metaBanner.trim(),
                      INTERSTITIAL: adIdsDraft.metaInterstitial.trim(),
                      PRE_ROLL: adIdsDraft.metaPreRoll.trim(),
                    },
                  };
                  dispatch({ type: "SET_AD_UNIT_IDS", ids: newIds });
                  toast.success("Ad Unit IDs saved! / जाहिरात IDs सेव्ह झाले!");
                }}
                className="w-full font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.5 0.2 250), oklch(0.45 0.22 270))",
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Save Ad IDs / जाहिरात IDs सेव्ह करा
              </Button>

              {/* Note */}
              <p className="text-white/30 text-[11px] text-center leading-relaxed">
                हे IDs Android app मध्ये AdMob SDK साठी वापरले जातात. Web preview
                मध्ये simulate होतात.
              </p>
            </motion.div>

            {/* Revenue summary card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-orange-500/20 p-5 space-y-4"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.14 0.04 50 / 0.8), oklch(0.1 0.02 40 / 0.9))",
              }}
            >
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-orange-400" />
                <h3 className="text-white font-semibold">Local Ad Revenue</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-orange-400 font-bold text-2xl font-display">
                    ₹{totalLocalAdRevenue.toLocaleString()}
                  </p>
                  <p className="text-white/50 text-xs mt-0.5">
                    All-time Revenue
                  </p>
                </div>
                <div className="text-center border-x border-white/10">
                  <p className="text-emerald-400 font-bold text-2xl font-display">
                    {activeLocalAds.length}
                  </p>
                  <p className="text-white/50 text-xs mt-0.5">Active Ads</p>
                </div>
                <div className="text-center">
                  <p className="text-blue-400 font-bold text-2xl font-display">
                    ₹{currentDailyAdRevenue}
                  </p>
                  <p className="text-white/50 text-xs mt-0.5">Daily Rate</p>
                </div>
              </div>
              <div className="rounded-xl bg-white/5 px-3 py-2">
                <p className="text-white/30 text-[10px] text-center">
                  Rate: ₹{LOCAL_AD_RATE_PER_DAY}/day per ad ·{" "}
                  {activeLocalAds.length} active × {localAds.length} total ads
                </p>
              </div>
            </motion.div>

            {/* Create new ad form */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl border border-white/10 bg-card p-5 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-400" />
                <h3 className="text-white font-semibold">
                  Create New Local Ad
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="ad-business"
                    className="text-xs font-medium text-white/60"
                  >
                    Business Name
                  </label>
                  <Input
                    id="ad-business"
                    data-ocid="admin.ads.business_input"
                    placeholder="e.g. Nashik Fresh Fruits"
                    value={adForm.businessName}
                    onChange={(e) =>
                      setAdForm((prev) => ({
                        ...prev,
                        businessName: e.target.value,
                      }))
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="ad-tagline"
                    className="text-xs font-medium text-white/60"
                  >
                    Tagline
                  </label>
                  <Input
                    id="ad-tagline"
                    data-ocid="admin.ads.tagline_input"
                    placeholder="e.g. Farm-fresh fruits delivered! 🍎"
                    value={adForm.tagline}
                    onChange={(e) =>
                      setAdForm((prev) => ({
                        ...prev,
                        tagline: e.target.value,
                      }))
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="ad-link"
                    className="text-xs font-medium text-white/60"
                  >
                    Link URL
                  </label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                    <Input
                      id="ad-link"
                      data-ocid="admin.ads.link_input"
                      placeholder="https://example.com"
                      value={adForm.linkUrl}
                      onChange={(e) =>
                        setAdForm((prev) => ({
                          ...prev,
                          linkUrl: e.target.value,
                        }))
                      }
                      className="pl-8 bg-white/10 border-white/20 text-white placeholder:text-white/30 h-10 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="ad-days"
                    className="text-xs font-medium text-white/60"
                  >
                    Duration (Days)
                  </label>
                  <Input
                    id="ad-days"
                    data-ocid="admin.ads.duration_input"
                    type="number"
                    min={1}
                    placeholder="7"
                    value={adForm.durationDays}
                    onChange={(e) =>
                      setAdForm((prev) => ({
                        ...prev,
                        durationDays: Math.max(
                          1,
                          Number.parseInt(e.target.value) || 1,
                        ),
                      }))
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label
                    htmlFor="ad-image"
                    className="text-xs font-medium text-white/60"
                  >
                    Image URL
                  </label>
                  <Input
                    id="ad-image"
                    data-ocid="admin.ads.image_input"
                    placeholder="https://images.unsplash.com/..."
                    value={adForm.imageUrl}
                    onChange={(e) =>
                      setAdForm((prev) => ({
                        ...prev,
                        imageUrl: e.target.value,
                      }))
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-10 text-sm"
                  />
                </div>
              </div>

              <Button
                data-ocid="admin.ads.submit_button"
                onClick={() => {
                  if (
                    !adForm.businessName.trim() ||
                    !adForm.tagline.trim() ||
                    !adForm.imageUrl.trim()
                  ) {
                    toast.error(
                      "Please fill in Business Name, Tagline, and Image URL",
                    );
                    return;
                  }
                  const newAd: LocalAd = {
                    id: `ad${Date.now()}`,
                    businessName: adForm.businessName.trim(),
                    imageUrl: adForm.imageUrl.trim(),
                    linkUrl: adForm.linkUrl.trim() || "#",
                    tagline: adForm.tagline.trim(),
                    durationDays: adForm.durationDays,
                    startDate: Date.now(),
                    isActive: true,
                  };
                  dispatch({ type: "ADD_LOCAL_AD", ad: newAd });
                  setAdForm({
                    businessName: "",
                    tagline: "",
                    linkUrl: "",
                    durationDays: 1,
                    imageUrl: "",
                  });
                  toast.success("Local ad created!");
                }}
                className="w-full font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.6 0.2 50), oklch(0.55 0.22 30))",
                }}
              >
                <Megaphone className="w-4 h-4 mr-2" />
                Post Ad (₹{adForm.durationDays * LOCAL_AD_RATE_PER_DAY})
              </Button>
            </motion.div>

            {/* All local ads table */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-white/60 text-sm font-medium">
                All Local Ads ({localAds.length})
              </h3>

              {localAds.length === 0 ? (
                <div
                  data-ocid="admin.ads.empty_state"
                  className="rounded-2xl border border-white/10 bg-card py-12 text-center"
                >
                  <p className="text-3xl mb-3">📢</p>
                  <p className="text-white/40 text-sm">No local ads yet</p>
                  <p className="text-white/30 text-xs mt-1">
                    Create your first ad above
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-white/60">
                          Business
                        </TableHead>
                        <TableHead className="text-white/60">Tagline</TableHead>
                        <TableHead className="text-white/60">
                          Duration
                        </TableHead>
                        <TableHead className="text-white/60">Revenue</TableHead>
                        <TableHead className="text-white/60">Status</TableHead>
                        <TableHead className="text-white/60 text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {localAds.map((ad, i) => {
                        const ocidIndex = i + 1;
                        return (
                          <TableRow
                            key={ad.id}
                            data-ocid={`admin.ads.item.${ocidIndex}`}
                            className="border-white/5 hover:bg-white/5"
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {ad.imageUrl && (
                                  <img
                                    src={ad.imageUrl}
                                    alt=""
                                    className="w-10 h-7 rounded object-cover shrink-0"
                                  />
                                )}
                                <p className="text-white text-xs font-medium truncate max-w-[100px]">
                                  {ad.businessName}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-white/50 text-xs max-w-[140px]">
                              <p className="truncate">{ad.tagline}</p>
                            </TableCell>
                            <TableCell className="text-white/70 text-xs">
                              {ad.durationDays}d
                            </TableCell>
                            <TableCell>
                              <span className="text-orange-400 font-semibold text-sm">
                                ₹{ad.durationDays * LOCAL_AD_RATE_PER_DAY}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={
                                  ad.isActive
                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]"
                                    : "bg-white/10 text-white/40 border-white/10 text-[10px]"
                                }
                              >
                                {ad.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  data-ocid={`admin.ads.toggle_button.${ocidIndex}`}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    dispatch({
                                      type: "TOGGLE_LOCAL_AD",
                                      adId: ad.id,
                                    });
                                    toast.success(
                                      `Ad ${ad.isActive ? "paused" : "activated"}`,
                                    );
                                  }}
                                  className={`text-xs h-7 px-2 ${
                                    ad.isActive
                                      ? "text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                                      : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                                  }`}
                                >
                                  {ad.isActive ? (
                                    <>
                                      <Pause className="w-3 h-3 mr-1" />
                                      Pause
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-3 h-3 mr-1" />
                                      Activate
                                    </>
                                  )}
                                </Button>
                                <Button
                                  data-ocid={`admin.ads.delete_button.${ocidIndex}`}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    dispatch({
                                      type: "DELETE_LOCAL_AD",
                                      adId: ad.id,
                                    });
                                    toast.success("Ad deleted");
                                  }}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs h-7 px-2"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </motion.div>

            {/* Reports tab */}
            {/* (rendered outside ads section) */}

            {/* Google & Meta Ad Slots info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-white/10 bg-card p-5 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-semibold">
                  3rd-Party Ad Networks
                </h3>
                <span className="text-white/30 text-xs ml-auto">
                  Placeholder slots
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className="rounded-xl p-4 space-y-2 border border-blue-500/15"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.12 0.03 240 / 0.8), oklch(0.08 0.01 240 / 0.9))",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔍</span>
                    <p className="text-white font-semibold text-sm">
                      Google Ads
                    </p>
                  </div>
                  <p className="text-white/40 text-xs">
                    Edit{" "}
                    <span className="text-amber-400/80 font-mono">
                      ads-config.ts
                    </span>{" "}
                    to add real AdMob unit IDs.
                  </p>
                  <div className="space-y-1">
                    {["Banner", "Interstitial", "Pre-Roll", "Rewarded"].map(
                      (slot) => (
                        <div
                          key={slot}
                          className="flex items-center justify-between"
                        >
                          <span className="text-white/50 text-[10px]">
                            {slot}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[9px] bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          >
                            Placeholder
                          </Badge>
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <div
                  className="rounded-xl p-4 space-y-2 border border-blue-800/30"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.12 0.02 260 / 0.8), oklch(0.08 0.01 250 / 0.9))",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📘</span>
                    <p className="text-white font-semibold text-sm">
                      Meta Audience Network
                    </p>
                  </div>
                  <p className="text-white/40 text-xs">
                    Edit{" "}
                    <span className="text-amber-400/80 font-mono">
                      ads-config.ts
                    </span>{" "}
                    to add real placement IDs.
                  </p>
                  <div className="space-y-1">
                    {["Banner", "Interstitial", "Pre-Roll"].map((slot) => (
                      <div
                        key={slot}
                        className="flex items-center justify-between"
                      >
                        <span className="text-white/50 text-[10px]">
                          {slot}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[9px] bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        >
                          Placeholder
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Security tab */}
        {activeTab === "security" && (
          <div className="space-y-5" data-ocid="admin.security.panel">
            <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">
              Fraud Protection &amp; Security
            </h2>

            {/* Fraud Protection Rules */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                Fraud Protection Rules
              </h3>
              <div className="space-y-3">
                {[
                  {
                    title: "One Device = One Account",
                    desc: "Device ID tracking prevents multiple accounts from the same device. Duplicate registrations are blocked automatically.",
                    icon: "🔒",
                    color: "border-blue-500/20",
                    bg: "from-blue-600/10 to-blue-600/5",
                  },
                  {
                    title: "Duplicate Referral Block",
                    desc: "Same referrer+referred pair can only register once. Self-referrals are blocked at the registration level.",
                    icon: "🚫",
                    color: "border-amber-500/20",
                    bg: "from-amber-600/10 to-amber-600/5",
                  },
                  {
                    title: "Bot Detection",
                    desc: "Unusual activity patterns are flagged automatically. Accounts with suspicious behavior are reviewed and may be blocked.",
                    icon: "🤖",
                    color: "border-red-500/20",
                    bg: "from-red-600/10 to-red-600/5",
                  },
                ].map((rule) => (
                  <motion.div
                    key={rule.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl bg-gradient-to-br ${rule.bg} border ${rule.color} p-4`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl shrink-0">{rule.icon}</span>
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {rule.title}
                        </p>
                        <p className="text-white/50 text-xs mt-0.5 leading-relaxed">
                          {rule.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Suspicious Activity */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" />
                Suspicious Activity
              </h3>

              {/* Blocked users */}
              <div className="rounded-2xl border border-white/10 bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                  <UserX className="w-4 h-4 text-red-400" />
                  <p className="text-white font-medium text-sm">
                    Blocked Users
                  </p>
                  <span className="ml-auto text-white/40 text-xs">
                    {state.users.filter((u) => u.isBlocked).length} user(s)
                  </span>
                </div>
                {state.users.filter((u) => u.isBlocked).length === 0 ? (
                  <div
                    data-ocid="admin.security.blocked_users.empty_state"
                    className="py-8 text-center"
                  >
                    <p className="text-white/30 text-sm">
                      No blocked users — platform looks clean ✓
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {state.users
                      .filter((u) => u.isBlocked)
                      .map((u, i) => (
                        <div
                          key={u.id}
                          data-ocid={`admin.security.blocked_user.item.${i + 1}`}
                          className="px-4 py-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7">
                              <AvatarImage src={u.avatar} />
                              <AvatarFallback className="bg-white/10 text-white text-xs">
                                {u.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">
                                @{u.username}
                              </p>
                              <RoleBadge role={u.role ?? "viewer"} />
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]"
                          >
                            Blocked
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* High referral activity */}
              {(() => {
                const referralCounts: Record<string, number> = {};
                for (const r of state.referrals) {
                  referralCounts[r.referrerId] =
                    (referralCounts[r.referrerId] ?? 0) + 1;
                }
                const highActivityUsers = state.users.filter(
                  (u) => (referralCounts[u.id] ?? 0) > 5,
                );
                return (
                  <div className="rounded-2xl border border-white/10 bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <p className="text-white font-medium text-sm">
                        High Referral Activity
                      </p>
                      <span className="ml-auto text-white/40 text-xs">
                        &gt;5 referrals
                      </span>
                    </div>
                    {highActivityUsers.length === 0 ? (
                      <div
                        data-ocid="admin.security.high_referral.empty_state"
                        className="py-8 text-center"
                      >
                        <p className="text-white/30 text-sm">
                          No suspicious referral activity detected ✓
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {highActivityUsers.map((u, i) => (
                          <div
                            key={u.id}
                            data-ocid={`admin.security.high_referral.item.${i + 1}`}
                            className="px-4 py-3 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="w-7 h-7">
                                <AvatarImage src={u.avatar} />
                                <AvatarFallback className="bg-white/10 text-white text-xs">
                                  {u.username[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <p className="text-white text-sm font-medium">
                                @{u.username}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]"
                            >
                              {referralCounts[u.id]} referrals — review
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Reports tab */}
        {activeTab === "reports" && (
          <div className="space-y-4" data-ocid="admin.reports.panel">
            <div className="flex items-center justify-between">
              <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">
                Reported Videos ({pendingReports.length})
              </h2>
            </div>

            {pendingReports.length === 0 ? (
              <div
                data-ocid="admin.reports.empty_state"
                className="rounded-2xl border border-white/10 bg-card py-16 text-center"
              >
                <p className="text-4xl mb-3">🛡️</p>
                <p className="text-white/40 text-sm">No reports yet</p>
                <p className="text-white/30 text-xs mt-1">
                  Reported videos from users will appear here
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-white/60">Video</TableHead>
                      <TableHead className="text-white/60">Reporter</TableHead>
                      <TableHead className="text-white/60">Reason</TableHead>
                      <TableHead className="text-white/60">Date</TableHead>
                      <TableHead className="text-white/60 text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingReports.map((report, i) => {
                      const video = state.videos.find(
                        (v) => v.id === report.videoId,
                      );
                      const reporter = state.users.find(
                        (u) => u.id === report.reporterId,
                      );
                      const ocidIndex = i + 1;
                      return (
                        <TableRow
                          key={report.id}
                          data-ocid={`admin.report.item.${ocidIndex}`}
                          className="border-white/5 hover:bg-white/5"
                        >
                          <TableCell>
                            <p className="text-white text-xs font-medium line-clamp-2 max-w-[140px]">
                              {video
                                ? video.caption.length > 40
                                  ? `${video.caption.slice(0, 40)}…`
                                  : video.caption
                                : `Video ${report.videoId}`}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-white/70 text-xs">
                              @{reporter?.username ?? "unknown"}
                            </p>
                          </TableCell>
                          <TableCell>
                            <ReasonBadge reason={report.reason} />
                          </TableCell>
                          <TableCell className="text-white/40 text-xs whitespace-nowrap">
                            {formatTime(report.createdAt)} ago
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {video && !video.isDeleted && (
                                <Button
                                  data-ocid={`admin.report.delete_button.${ocidIndex}`}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    dispatch({
                                      type: "DELETE_VIDEO",
                                      videoId: report.videoId,
                                    });
                                    dispatch({
                                      type: "DISMISS_REPORT",
                                      reportId: report.id,
                                    });
                                    toast.success(
                                      "Video deleted and report dismissed",
                                    );
                                  }}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs h-7 px-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                                  Delete
                                </Button>
                              )}
                              <Button
                                data-ocid={`admin.report.dismiss_button.${ocidIndex}`}
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  dispatch({
                                    type: "DISMISS_REPORT",
                                    reportId: report.id,
                                  });
                                  toast.success("Report dismissed");
                                }}
                                className="text-white/50 hover:text-white hover:bg-white/10 text-xs h-7 px-2"
                              >
                                Dismiss
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
        {/* Music Library tab */}
        {activeTab === "music" && (
          <div className="space-y-5" data-ocid="admin.music.panel">
            <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider flex items-center gap-2">
              <Library className="w-4 h-4" />
              Music Library Management
            </h2>

            {/* Add New Track */}
            <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                <Music
                  className="w-4 h-4 text-[oklch(0.65_0.28_15)]"
                  style={{ color: "oklch(0.65 0.28 15)" }}
                />
                <h3 className="text-white font-semibold text-sm">
                  Add New Track
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-white/50 text-xs font-medium">
                      Song Title
                    </span>
                    <Input
                      data-ocid="admin.music_title.input"
                      value={musicForm.title}
                      onChange={(e) =>
                        setMusicForm((f) => ({ ...f, title: e.target.value }))
                      }
                      placeholder="e.g. मातीची गाणी"
                      className="bg-white/8 border-white/15 text-white text-sm placeholder:text-white/30 h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-white/50 text-xs font-medium">
                      Artist Name
                    </span>
                    <Input
                      data-ocid="admin.music_artist.input"
                      value={musicForm.artist}
                      onChange={(e) =>
                        setMusicForm((f) => ({ ...f, artist: e.target.value }))
                      }
                      placeholder="e.g. रामदास माळी"
                      className="bg-white/8 border-white/15 text-white text-sm placeholder:text-white/30 h-9"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-white/50 text-xs font-medium">
                      Genre
                    </span>
                    <select
                      data-ocid="admin.music_genre.select"
                      value={musicForm.genre}
                      onChange={(e) =>
                        setMusicForm((f) => ({
                          ...f,
                          genre: e.target.value as MusicGenre,
                        }))
                      }
                      className="w-full h-9 rounded-md bg-white/8 border border-white/15 text-white text-sm px-3 outline-none focus:border-white/30"
                    >
                      <option value="folk">Folk</option>
                      <option value="dance">Dance</option>
                      <option value="devotional">Devotional</option>
                      <option value="romance">Romance</option>
                      <option value="comedy">Comedy</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-white/50 text-xs font-medium">
                      Duration (seconds)
                    </span>
                    <Input
                      data-ocid="admin.music_duration.input"
                      type="number"
                      value={musicForm.duration}
                      onChange={(e) =>
                        setMusicForm((f) => ({
                          ...f,
                          duration: Number(e.target.value),
                        }))
                      }
                      min={10}
                      max={600}
                      className="bg-white/8 border-white/15 text-white text-sm h-9"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-white/50 text-xs font-medium">
                    Audio URL
                  </span>
                  <Input
                    data-ocid="admin.music_url.input"
                    value={musicForm.audioUrl}
                    onChange={(e) =>
                      setMusicForm((f) => ({ ...f, audioUrl: e.target.value }))
                    }
                    placeholder="https://example.com/audio.mp3"
                    className="bg-white/8 border-white/15 text-white text-sm placeholder:text-white/30 h-9"
                  />
                </div>
                <Button
                  data-ocid="admin.music_add.button"
                  onClick={() => {
                    if (
                      !musicForm.title.trim() ||
                      !musicForm.artist.trim() ||
                      !musicForm.audioUrl.trim()
                    ) {
                      toast.error("Fill in title, artist, and audio URL");
                      return;
                    }
                    const newTrack: MusicTrack = {
                      id: `mt_${Date.now()}`,
                      title: musicForm.title.trim(),
                      artist: musicForm.artist.trim(),
                      genre: musicForm.genre,
                      audioUrl: musicForm.audioUrl.trim(),
                      duration: musicForm.duration,
                      status: "approved",
                      uploadedBy: "admin",
                      uploadedAt: Date.now(),
                      playCount: 0,
                    };
                    dispatch({ type: "ADD_MUSIC_TRACK", track: newTrack });
                    setMusicForm({
                      title: "",
                      artist: "",
                      genre: "folk",
                      audioUrl: "",
                      duration: 180,
                    });
                    toast.success(`"${newTrack.title}" added to library!`);
                  }}
                  className="w-full h-10 font-semibold text-white"
                  style={{ background: "oklch(0.65 0.28 15)" }}
                >
                  + Add Track to Library
                </Button>
              </div>
            </div>

            {/* Pending Approval */}
            {(() => {
              const pendingTracks = state.musicTracks.filter(
                (t) => t.status === "pending",
              );
              return pendingTracks.length > 0 ? (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-amber-500/20 flex items-center justify-between">
                    <h3 className="text-amber-400 font-semibold text-sm">
                      Pending Approval
                    </h3>
                    <span className="bg-amber-500 text-black text-[10px] font-bold rounded-full px-2 py-0.5">
                      {pendingTracks.length}
                    </span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {pendingTracks.map((track, i) => {
                      const idx = i + 1;
                      return (
                        <div
                          key={track.id}
                          data-ocid={`admin.music.item.${idx}`}
                          className="px-4 py-3 flex items-center gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">
                              {track.title}
                            </p>
                            <p className="text-white/40 text-xs">
                              {track.artist} · {track.genre} · by @
                              {track.uploadedBy}
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              data-ocid={`admin.music_approve.button.${idx}`}
                              size="sm"
                              onClick={() => {
                                dispatch({
                                  type: "APPROVE_MUSIC_TRACK",
                                  trackId: track.id,
                                });
                                toast.success(`"${track.title}" approved!`);
                              }}
                              className="h-7 px-3 text-xs bg-green-600/30 hover:bg-green-600/50 text-green-300 border border-green-500/30"
                            >
                              ✓ Approve
                            </Button>
                            <Button
                              data-ocid={`admin.music_reject.button.${idx}`}
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                dispatch({
                                  type: "REJECT_MUSIC_TRACK",
                                  trackId: track.id,
                                });
                                toast.success(`"${track.title}" rejected`);
                              }}
                              className="h-7 px-3 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 border border-red-500/20"
                            >
                              ✕ Reject
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Approved Tracks */}
            {(() => {
              const approvedTracks = state.musicTracks.filter(
                (t) => t.status === "approved",
              );
              return (
                <div className="rounded-2xl border border-white/10 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-white font-semibold text-sm">
                      Approved Tracks
                    </h3>
                    <span className="text-white/40 text-xs">
                      {approvedTracks.length} tracks
                    </span>
                  </div>
                  {approvedTracks.length === 0 ? (
                    <div
                      data-ocid="admin.music.empty_state"
                      className="text-center py-8 text-white/30 text-sm"
                    >
                      No approved tracks yet.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                          <TableHead className="text-white/60 text-xs">
                            Title
                          </TableHead>
                          <TableHead className="text-white/60 text-xs">
                            Artist
                          </TableHead>
                          <TableHead className="text-white/60 text-xs">
                            Genre
                          </TableHead>
                          <TableHead className="text-white/60 text-xs">
                            Plays
                          </TableHead>
                          <TableHead className="text-white/60 text-right text-xs">
                            Delete
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {approvedTracks.map((track, i) => {
                          const idx = i + 1;
                          return (
                            <TableRow
                              key={track.id}
                              data-ocid={`admin.music.approved.item.${idx}`}
                              className="border-white/5 hover:bg-white/5"
                            >
                              <TableCell>
                                <p className="text-white text-xs font-medium truncate max-w-[100px]">
                                  {track.title}
                                </p>
                              </TableCell>
                              <TableCell className="text-white/60 text-xs truncate max-w-[80px]">
                                {track.artist}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] bg-white/8 text-white/50 border-white/10 capitalize"
                                >
                                  {track.genre}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-white/50 text-xs">
                                {track.playCount.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  data-ocid={`admin.music_delete.button.${idx}`}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    dispatch({
                                      type: "DELETE_MUSIC_TRACK",
                                      trackId: track.id,
                                    });
                                    toast.success(`"${track.title}" deleted`);
                                  }}
                                  className="h-7 w-7 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              );
            })()}

            {/* Rejected Tracks */}
            {(() => {
              const rejectedTracks = state.musicTracks.filter(
                (t) => t.status === "rejected",
              );
              return rejectedTracks.length > 0 ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/3 overflow-hidden">
                  <div className="px-4 py-3 border-b border-red-500/15 flex items-center justify-between">
                    <h3 className="text-red-400/80 font-semibold text-sm">
                      Rejected Tracks
                    </h3>
                    <span className="text-red-400/50 text-xs">
                      {rejectedTracks.length} tracks
                    </span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {rejectedTracks.map((track, i) => {
                      const idx = i + 1;
                      return (
                        <div
                          key={track.id}
                          className="px-4 py-2.5 flex items-center gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-white/50 text-sm truncate">
                              {track.title}
                            </p>
                            <p className="text-white/25 text-xs">
                              {track.artist}
                            </p>
                          </div>
                          <Button
                            data-ocid={`admin.music_rejected_delete.button.${idx}`}
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              dispatch({
                                type: "DELETE_MUSIC_TRACK",
                                trackId: track.id,
                              });
                              toast.success("Track removed");
                            }}
                            className="h-7 w-7 p-0 text-white/20 hover:text-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Live Streams tab */}
        {activeTab === "live" && (
          <div className="space-y-4" data-ocid="admin.live.panel">
            <div className="flex items-center justify-between">
              <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">
                Live Streams
              </h2>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-red-400 text-xs font-semibold">
                  {state.liveStreams.filter((s) => s.isActive).length} active
                </span>
              </div>
            </div>

            {state.liveStreams.length === 0 ? (
              <div
                data-ocid="admin.live.empty_state"
                className="text-center py-12 text-white/30 text-sm"
              >
                No live streams yet.
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-white/60">Artist</TableHead>
                      <TableHead className="text-white/60">Title</TableHead>
                      <TableHead className="text-white/60">Started</TableHead>
                      <TableHead className="text-white/60">Status</TableHead>
                      <TableHead className="text-white/60">Viewers</TableHead>
                      <TableHead className="text-white/60 text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.liveStreams.map((stream, i) => {
                      const artist = state.users.find(
                        (u) => u.id === stream.artistId,
                      );
                      const ocidIndex = i + 1;
                      const startedMinsAgo = Math.floor(
                        (Date.now() - stream.startedAt) / 60000,
                      );
                      return (
                        <TableRow
                          key={stream.id}
                          data-ocid={`admin.live.item.${ocidIndex}`}
                          className="border-white/5 hover:bg-white/5"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-7 h-7">
                                <AvatarImage src={artist?.avatar} />
                                <AvatarFallback className="bg-white/10 text-white text-[10px]">
                                  {artist?.username?.[0]?.toUpperCase() ?? "A"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-white/80 text-xs font-medium">
                                @{artist?.username ?? "unknown"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-white text-xs line-clamp-1 max-w-[140px]">
                              {stream.title}
                            </p>
                          </TableCell>
                          <TableCell className="text-white/40 text-xs">
                            {startedMinsAgo < 60
                              ? `${startedMinsAgo}m ago`
                              : `${Math.floor(startedMinsAgo / 60)}h ago`}
                          </TableCell>
                          <TableCell>
                            {stream.isActive ? (
                              <Badge className="bg-red-500 text-white border-0 text-[10px] font-bold">
                                🔴 LIVE
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="text-[10px] bg-white/10 text-white/40 border-white/10"
                              >
                                Ended
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-white/70 text-xs">
                            👁 {stream.viewerCount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {stream.isActive ? (
                              <Button
                                data-ocid={`admin.live.end_button.${ocidIndex}`}
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  dispatch({
                                    type: "END_LIVE",
                                    streamId: stream.id,
                                  });
                                  toast.success(
                                    `Stream by @${artist?.username ?? "artist"} ended`,
                                  );
                                }}
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs h-7 px-2"
                              >
                                <Pause className="w-3.5 h-3.5 mr-1" />
                                End Stream
                              </Button>
                            ) : (
                              <span className="text-white/20 text-xs">
                                {stream.endedAt
                                  ? `Ended ${Math.floor((Date.now() - (stream.endedAt ?? 0)) / 60000)}m ago`
                                  : "Ended"}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
        {/* Artists tab */}
        {activeTab === "artists" && (
          <div className="space-y-4">
            <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">
              Artist Management (
              {state.users.filter((u) => u.role === "artist").length} artists)
            </h2>
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white/60">Artist</TableHead>
                    <TableHead className="text-white/60">
                      Subscription
                    </TableHead>
                    <TableHead className="text-white/60">Approval</TableHead>
                    <TableHead className="text-white/60">Stats</TableHead>
                    <TableHead className="text-white/60 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.users
                    .filter((u) => u.role === "artist")
                    .map((artist, i) => {
                      const ocidIndex = i + 1;
                      const approvalStatus =
                        artist.artistApprovalStatus ?? "approved";
                      const artistVideoCount = state.videos.filter(
                        (v) => v.uploaderId === artist.id && !v.isDeleted,
                      ).length;
                      return (
                        <TableRow
                          key={artist.id}
                          data-ocid={`admin.artists.item.${ocidIndex}`}
                          className="border-white/5 hover:bg-white/5"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-7 h-7">
                                <AvatarImage src={artist.avatar} />
                                <AvatarFallback className="bg-white/10 text-white text-xs">
                                  {artist.username[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-white text-sm font-medium">
                                  @{artist.username}
                                </p>
                                <p className="text-white/30 text-[10px] truncate max-w-[100px]">
                                  {artist.bio || "No bio"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1.5">
                              <AdminSubBadge
                                status={artist.subscriptionStatus ?? "none"}
                              />
                              <Button
                                data-ocid={`admin.artists.grant_sub_button.${ocidIndex}`}
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  dispatch({
                                    type: "SET_SUBSCRIPTION",
                                    userId: artist.id,
                                    status: "active",
                                    expiry: Date.now() + 86400000 * 30,
                                  });
                                  toast.success(
                                    `30-day subscription granted to @${artist.username}`,
                                  );
                                }}
                                className="text-green-400 hover:text-green-300 hover:bg-green-400/10 text-[10px] h-6 px-2"
                              >
                                Grant 30d
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-1.5 py-0 ${
                                approvalStatus === "approved"
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : approvalStatus === "rejected"
                                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                                    : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              }`}
                            >
                              {approvalStatus === "approved"
                                ? "Approved"
                                : approvalStatus === "rejected"
                                  ? "Rejected"
                                  : "Pending Approval"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-white/50 text-xs">
                                👥 {formatCount(artist.followers)}
                              </span>
                              <span className="text-white/40 text-xs">
                                🎬 {artistVideoCount} videos
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {approvalStatus !== "approved" && (
                                <Button
                                  data-ocid={`admin.artists.approve_button.${ocidIndex}`}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    dispatch({
                                      type: "APPROVE_ARTIST",
                                      userId: artist.id,
                                    });
                                    toast.success(
                                      `@${artist.username} approved`,
                                    );
                                  }}
                                  className="text-green-400 hover:text-green-300 hover:bg-green-400/10 text-xs h-7 px-2"
                                >
                                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                                  Approve
                                </Button>
                              )}
                              {approvalStatus !== "rejected" && (
                                <Button
                                  data-ocid={`admin.artists.reject_button.${ocidIndex}`}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    dispatch({
                                      type: "REJECT_ARTIST",
                                      userId: artist.id,
                                    });
                                    toast.success(
                                      `@${artist.username} rejected`,
                                    );
                                  }}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs h-7 px-2"
                                >
                                  <UserX className="w-3.5 h-3.5 mr-1" />
                                  Reject
                                </Button>
                              )}
                              {artist.isBlocked ? (
                                <Button
                                  data-ocid={`admin.artists.unblock_button.${ocidIndex}`}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    dispatch({
                                      type: "UNBLOCK_USER",
                                      userId: artist.id,
                                    });
                                    toast.success(
                                      `@${artist.username} unblocked`,
                                    );
                                  }}
                                  className="text-green-400 hover:text-green-300 hover:bg-green-400/10 text-xs h-7 px-2"
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <Button
                                  data-ocid={`admin.artists.block_button.${ocidIndex}`}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    dispatch({
                                      type: "BLOCK_USER",
                                      userId: artist.id,
                                    });
                                    toast.success(
                                      `@${artist.username} blocked`,
                                    );
                                  }}
                                  className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 text-xs h-7 px-2"
                                >
                                  Block
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  {state.users.filter((u) => u.role === "artist").length ===
                    0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        data-ocid="admin.artists.empty_state"
                        className="text-center py-8 text-white/30 text-sm"
                      >
                        No artists yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Settings tab */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-lg">
            <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">
              Admin Settings
            </h2>

            {/* Subscription Price Card */}
            <div className="rounded-2xl border border-white/10 bg-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-400" />
                <h3 className="text-white font-semibold">Subscription Price</h3>
              </div>
              <p className="text-white/50 text-sm">
                Artist annual subscription price. Changes reflect on
                registration and subscription pages instantly.
              </p>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm font-bold">
                    ₹
                  </span>
                  <input
                    data-ocid="admin.settings.price_input"
                    type="number"
                    min={100}
                    step={50}
                    value={subPriceDraft}
                    onChange={(e) =>
                      setSubPriceDraft(Number(e.target.value) || 600)
                    }
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white h-11 text-sm outline-none focus:border-emerald-500/60 transition-colors"
                  />
                </div>
                <span className="text-white/40 text-sm">/ year</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-xs">
                  Current: ₹{state.subscriptionPrice ?? 600}
                </span>
                <Button
                  data-ocid="admin.settings.save_price_button"
                  size="sm"
                  onClick={() => {
                    if (subPriceDraft < 100) {
                      toast.error("Minimum price is ₹100");
                      return;
                    }
                    dispatch({
                      type: "SET_SUBSCRIPTION_PRICE",
                      price: subPriceDraft,
                    });
                    toast.success(
                      `Subscription price updated to ₹${subPriceDraft}`,
                    );
                  }}
                  className="ml-auto font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.5 0.18 160), oklch(0.45 0.2 140))",
                  }}
                >
                  Save Price
                </Button>
              </div>
            </div>

            {/* Broadcast Notification Card */}
            <div className="rounded-2xl border border-white/10 bg-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-semibold">
                  Broadcast Notification
                </h3>
              </div>
              <p className="text-white/50 text-sm">
                Send a notification to ALL users on the platform. It will appear
                in their notification bell.
              </p>
              <textarea
                data-ocid="admin.settings.broadcast_textarea"
                placeholder="Type your broadcast message..."
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                rows={3}
                className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 p-3 text-sm outline-none focus:border-blue-500/60 transition-colors resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-white/30 text-xs">
                  Will be sent to {state.users.length} users
                </span>
                <Button
                  data-ocid="admin.settings.broadcast_button"
                  size="sm"
                  onClick={() => {
                    if (!broadcastMsg.trim()) {
                      toast.error("Please enter a message");
                      return;
                    }
                    dispatch({
                      type: "BROADCAST_NOTIFICATION",
                      message: broadcastMsg.trim(),
                    });
                    setBroadcastMsg("");
                    toast.success(
                      `Broadcast sent to ${state.users.length} users!`,
                    );
                  }}
                  className="font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.5 0.2 260), oklch(0.45 0.22 280))",
                  }}
                >
                  <Megaphone className="w-3.5 h-3.5 mr-1.5" />
                  Send Broadcast
                </Button>
              </div>
            </div>

            {/* Extra stat cards for overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-pink-600/20 to-pink-600/5 border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clapperboard className="w-5 h-5 text-reels-pink" />
                </div>
                <p className="font-bold text-2xl font-display text-reels-pink">
                  {state.users.filter((u) => u.role === "artist").length}
                </p>
                <p className="text-white/50 text-xs mt-1">Total Artists</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-amber-600/20 to-amber-600/5 border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <p className="font-bold text-2xl font-display text-amber-400">
                  {
                    state.users.filter(
                      (u) =>
                        u.role === "artist" &&
                        u.artistApprovalStatus === "pending",
                    ).length
                  }
                </p>
                <p className="text-white/50 text-xs mt-1">Pending Approvals</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionStorage.getItem("adminAuthed")) {
      navigate({ to: "/admin-login" });
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthed");
    navigate({ to: "/admin-login" });
  };

  if (!sessionStorage.getItem("adminAuthed")) return null;

  return <AdminDashboard onLogout={handleLogout} />;
}
