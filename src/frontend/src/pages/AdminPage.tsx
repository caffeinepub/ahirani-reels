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
import {
  Banknote,
  CheckCircle,
  Clapperboard,
  Crown,
  Eye,
  Film,
  Hash,
  Heart,
  IndianRupee,
  Link,
  LogOut,
  Megaphone,
  Pause,
  Play,
  Settings,
  Shield,
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
import { useState } from "react";
import { toast } from "sonner";
import CreatorBadge from "../components/CreatorBadge";
import { LOCAL_AD_RATE_PER_DAY } from "../components/ads/ads-config";
import type {
  AdRpmConfig,
  LocalAd,
  SubscriptionStatus,
  UserRole,
  VideoType,
  WithdrawalRequest,
} from "../context/AppContext";
import { useApp } from "../context/AppContext";
import { formatCount, formatTime, generateId } from "../utils/trending";

const ADMIN_EMAIL = "admin@ahiranireels.com";
const ADMIN_PASSWORD = "ssm";
const ADMIN_NAME = "Samadhan Mali";

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

// ─── Admin Login ──────────────────────────────────────────────────────────────

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    if (email.trim().toLowerCase() === ADMIN_EMAIL && pass === ADMIN_PASSWORD) {
      onLogin();
      toast.success(`Welcome, ${ADMIN_NAME}!`);
    } else {
      setError("Invalid email or password");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{
        background:
          "radial-gradient(ellipse at top, oklch(0.1 0.02 260) 0%, oklch(0 0 0) 60%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            Admin Panel
          </h1>
          <p className="text-white/50 text-sm mt-1">Restricted Access</p>
        </div>

        <div className="space-y-4">
          <Input
            data-ocid="admin.email_input"
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12"
          />
          <Input
            data-ocid="admin.password_input"
            type="password"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12"
          />

          {error && (
            <p
              data-ocid="admin.login_error"
              className="text-red-400 text-sm text-center"
            >
              {error}
            </p>
          )}

          <Button
            data-ocid="admin.login_button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 font-semibold text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Logging in...
              </span>
            ) : (
              "Login to Dashboard"
            )}
          </Button>
        </div>
      </motion.div>
    </div>
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
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "users"
    | "videos"
    | "comments"
    | "withdrawals"
    | "upload"
    | "ads"
    | "reports"
    | "security"
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

  const activeVideos = state.videos.filter((v) => !v.isDeleted);

  // Platform earnings calculation
  const totalGross = activeVideos.reduce((sum, v) => {
    const rate = state.rpmConfig[v.videoType as VideoType] ?? 2;
    return sum + (v.viewsCount * rate) / 1000;
  }, 0);
  const adminShare = totalGross * 0.4;
  const artistPayouts = totalGross * 0.6;

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

  const tabs = [
    "overview",
    "users",
    "videos",
    "comments",
    "withdrawals",
    "upload",
    "ads",
    "reports",
    "security",
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
                          <VideoTypeBadge
                            type={(video.videoType as VideoType) ?? "reel"}
                          />
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
                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-red-500/20 text-red-400 border-red-500/30"
                            >
                              {report.reason}
                            </Badge>
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
      </div>
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(() => {
    return sessionStorage.getItem("ahirani_admin") === "1";
  });

  const handleLogin = () => {
    sessionStorage.setItem("ahirani_admin", "1");
    setLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("ahirani_admin");
    setLoggedIn(false);
  };

  return loggedIn ? (
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <AdminLogin onLogin={handleLogin} />
  );
}
