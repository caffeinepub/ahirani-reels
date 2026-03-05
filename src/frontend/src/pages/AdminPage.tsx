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
import {
  Banknote,
  CheckCircle,
  Clapperboard,
  Eye,
  Film,
  Heart,
  IndianRupee,
  LogOut,
  Settings,
  Shield,
  Trash2,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  AdRpmConfig,
  SubscriptionStatus,
  UserRole,
  VideoType,
  WithdrawalRequest,
} from "../context/AppContext";
import { useApp } from "../context/AppContext";
import { formatCount, formatTime } from "../utils/trending";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin1234";

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
  const [uname, setUname] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    if (uname === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
      onLogin();
      toast.success("Welcome, Admin!");
    } else {
      setError("Invalid credentials");
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
          <p className="text-white/50 text-sm mt-1">Ahirani Reels Dashboard</p>
        </div>

        <div className="space-y-4">
          <Input
            data-ocid="admin.username_input"
            placeholder="Username"
            value={uname}
            onChange={(e) => setUname(e.target.value)}
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

          <p className="text-white/30 text-center text-xs">
            Hint: admin / admin1234
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "videos" | "withdrawals"
  >("overview");

  // RPM config local state (pre-filled from global state)
  const [rpmDraft, setRpmDraft] = useState<AdRpmConfig>({ ...state.rpmConfig });

  const activeVideos = state.videos.filter((v) => !v.isDeleted);
  const totalLikes = state.videos.reduce((sum, v) => sum + v.likesCount, 0);

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

  const tabs = ["overview", "users", "videos", "withdrawals"] as const;

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-display text-lg font-bold text-white">
            Admin Dashboard
          </h1>
        </div>
        <button
          type="button"
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: <Users className="w-6 h-6 text-blue-400" />,
                  label: "Total Users",
                  value: state.users.length,
                  sub: `${state.users.filter((u) => u.isBlocked).length} blocked`,
                  color: "from-blue-600/20 to-blue-600/5",
                },
                {
                  icon: <Film className="w-6 h-6 text-green-400" />,
                  label: "Total Videos",
                  value: activeVideos.length,
                  sub: `${state.videos.filter((v) => v.isDeleted).length} deleted`,
                  color: "from-green-600/20 to-green-600/5",
                },
                {
                  icon: <Heart className="w-6 h-6 text-reels-pink" />,
                  label: "Total Likes",
                  value: formatCount(totalLikes),
                  sub: "Across all videos",
                  color: "from-pink-600/20 to-pink-600/5",
                },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl bg-gradient-to-br ${stat.color} border border-white/10 p-5`}
                >
                  <div className="flex items-center justify-between mb-3">
                    {stat.icon}
                    <span className="text-white/40 text-xs">{stat.sub}</span>
                  </div>
                  <p className="text-white font-bold text-3xl font-display">
                    {stat.value}
                  </p>
                  <p className="text-white/60 text-sm mt-1">{stat.label}</p>
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
                        <TableCell className="text-right">
                          {video.isDeleted ? (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-red-500/20 text-red-400"
                            >
                              Deleted
                            </Badge>
                          ) : (
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
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Delete
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
                              <p className="text-white text-xs font-medium">
                                @{reqUser?.username ?? "unknown"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-white/50 text-xs max-w-[120px] truncate">
                            {req.upiId}
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
