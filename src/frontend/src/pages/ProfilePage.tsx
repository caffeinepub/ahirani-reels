import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clapperboard,
  Clock,
  Copy,
  Crown,
  Edit2,
  Eye,
  FileText,
  Gift,
  Grid2X2,
  Headphones,
  Heart,
  Info,
  Settings,
  Share2,
  Shield,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import CreatorBadge from "../components/CreatorBadge";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useApp } from "../context/AppContext";
import type { SubscriptionStatus, User, UserRole } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";
import { getReferralLink, shareReferralLink } from "../hooks/useReferralShare";
import { formatCount } from "../utils/trending";

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: UserRole }) {
  const config = {
    viewer: {
      className: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      icon: <Eye className="w-3 h-3" />,
      label: "Viewer",
    },
    artist: {
      className: "bg-reels-pink/20 text-reels-pink border border-reels-pink/30",
      icon: <Clapperboard className="w-3 h-3" />,
      label: "Artist",
    },
    admin: {
      className: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
      icon: <Shield className="w-3 h-3" />,
      label: "Admin",
    },
  };
  const { className, icon, label } = config[role] ?? config.viewer;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}

// ─── Subscription Badge ───────────────────────────────────────────────────────

function SubscriptionBadge({ status }: { status: SubscriptionStatus }) {
  const config = {
    active: {
      className: "bg-green-500/20 text-green-400 border border-green-500/30",
      label: "Active",
    },
    expired: {
      className: "bg-red-500/20 text-red-400 border border-red-500/30",
      label: "Expired",
    },
    none: {
      className: "bg-white/10 text-white/40 border border-white/10",
      label: "No Sub",
    },
  };
  const { className, label } = config[status] ?? config.none;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

// ─── Subscription helpers ─────────────────────────────────────────────────────

function formatExpiryDate(ts: number): string {
  if (!ts || ts <= 0) return "";
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getDaysRemaining(ts: number): number {
  if (!ts || ts <= 0) return 0;
  return Math.ceil((ts - Date.now()) / 86400000);
}

// ─── Subscription Card ────────────────────────────────────────────────────────

function SubscriptionCard({ user }: { user: User }) {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);

  const { subscriptionStatus: status, subscriptionExpiry: expiry } = user;
  const daysRemaining = getDaysRemaining(expiry);
  const isExpired =
    status === "expired" || (status === "active" && daysRemaining <= 0);
  const isActive = status === "active" && daysRemaining > 0;
  const isNone = status === "none";
  const isNearingExpiry = isActive && daysRemaining <= 30;

  const showRenew = isExpired || isNearingExpiry;
  const showSubscribe = isNone;

  const handleSubscribe = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    dispatch({ type: "SUBSCRIBE_ARTIST", userId: user.id });
    setLoading(false);
    toast.success("Subscribed! Valid for 1 year.", {
      description: "You can now upload videos.",
    });
  };

  // Card color scheme based on status
  const cardStyle =
    isActive && !isNearingExpiry
      ? {
          background:
            "linear-gradient(135deg, oklch(0.18 0.06 150 / 0.8), oklch(0.14 0.04 150 / 0.6))",
          border: "1px solid oklch(0.55 0.15 150 / 0.4)",
        }
      : isNearingExpiry
        ? {
            background:
              "linear-gradient(135deg, oklch(0.2 0.08 80 / 0.8), oklch(0.16 0.06 60 / 0.6))",
            border: "1px solid oklch(0.7 0.18 80 / 0.4)",
          }
        : isExpired
          ? {
              background:
                "linear-gradient(135deg, oklch(0.18 0.06 25 / 0.8), oklch(0.14 0.04 15 / 0.6))",
              border: "1px solid oklch(0.55 0.18 25 / 0.4)",
            }
          : {
              background:
                "linear-gradient(135deg, oklch(0.16 0.04 60 / 0.6), oklch(0.12 0.03 60 / 0.4))",
              border: "1px solid oklch(0.5 0.08 60 / 0.3)",
            };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      data-ocid="profile.subscription.card"
      className="rounded-2xl p-4 space-y-3"
      style={cardStyle}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown
            className={`w-4 h-4 ${
              isActive && !isNearingExpiry
                ? "text-emerald-400"
                : isNearingExpiry
                  ? "text-amber-400"
                  : isExpired
                    ? "text-red-400"
                    : "text-white/40"
            }`}
          />
          <span className="text-white font-semibold text-sm">
            Artist Subscription
          </span>
        </div>
        {/* Status pill */}
        {isActive && !isNearingExpiry && (
          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Active
          </span>
        )}
        {isNearingExpiry && (
          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Expiring Soon
          </span>
        )}
        {isExpired && (
          <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" /> Expired
          </span>
        )}
        {isNone && (
          <span className="inline-flex items-center gap-1 bg-white/10 text-white/40 border border-white/10 text-[10px] font-bold px-2 py-0.5 rounded-full">
            No Subscription
          </span>
        )}
      </div>

      {/* Expiry info */}
      {expiry > 0 && (
        <div className="space-y-1">
          <p className="text-white/50 text-xs">
            {isExpired ? "Expired on" : "Valid until"}{" "}
            <span className="text-white/80 font-semibold">
              {formatExpiryDate(expiry)}
            </span>
          </p>
          {isActive && daysRemaining > 0 && (
            <p
              className={`text-xs font-medium ${
                isNearingExpiry ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {daysRemaining} day{daysRemaining === 1 ? "" : "s"} remaining
            </p>
          )}
          {isExpired && daysRemaining <= 0 && expiry > 0 && (
            <p className="text-xs font-medium text-red-400">
              Expired {Math.abs(daysRemaining)} day
              {Math.abs(daysRemaining) === 1 ? "" : "s"} ago
            </p>
          )}
        </div>
      )}

      {/* Plan info */}
      <div className="rounded-xl bg-white/5 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-white/60 text-xs">Annual Plan</span>
        </div>
        <span className="text-white font-bold text-sm">₹600 / year</span>
      </div>

      {/* CTA button */}
      {(showRenew || showSubscribe) && (
        <Button
          data-ocid={
            showSubscribe
              ? "profile.subscription.subscribe_button"
              : "profile.subscription.renew_button"
          }
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full h-10 font-semibold text-sm"
          style={{
            background: loading
              ? "oklch(0.3 0.04 60)"
              : "linear-gradient(135deg, oklch(0.55 0.18 60), oklch(0.6 0.22 40))",
          }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              {showSubscribe ? "Subscribe ₹600 / year" : "Renew ₹600 / year"}
            </span>
          )}
        </Button>
      )}
    </motion.div>
  );
}

// ─── Referral Code Card ───────────────────────────────────────────────────────

function ReferralCodeCard({ user }: { user: User }) {
  const [copied, setCopied] = useState(false);
  const referralLink = getReferralLink(user.referralCode);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("रेफरल लिंक कॉपी झाली!");
    } catch {
      toast.error("कॉपी होऊ शकली नाही, manually try करा");
    }
  };

  const handleShare = async () => {
    await shareReferralLink(user.referralCode);
  };

  const isArtist = user.role === "artist";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      data-ocid="profile.referral.card"
      className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Gift className="w-4 h-4 text-reels-pink" />
        <h3 className="text-white font-semibold text-sm">Your Referral Code</h3>
      </div>

      {/* Code display */}
      <div className="rounded-xl bg-white/8 px-4 py-3 text-center border border-white/10 space-y-1">
        <p className="font-display text-2xl font-bold text-white tracking-widest">
          {user.referralCode}
        </p>
        <p className="text-white/30 text-[10px] font-mono break-all">
          {referralLink}
        </p>
        <p className="text-white/40 text-[11px]">
          {isArtist
            ? "Earn ₹60 when a referred artist subscribes"
            : "Earn ₹10 when a friend joins"}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          data-ocid="profile.referral.copy_button"
          onClick={handleCopy}
          variant="secondary"
          size="sm"
          className="flex-1 h-9 bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-green-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy Link
            </>
          )}
        </Button>
        <Button
          data-ocid="profile.referral.share_button"
          onClick={handleShare}
          size="sm"
          className="flex-1 h-9 text-xs font-semibold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
          }}
        >
          <Share2 className="w-3.5 h-3.5 mr-1.5" />
          Share
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Edit Profile Sheet ───────────────────────────────────────────────────────

function EditProfileSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state, dispatch } = useApp();
  const user = state.currentUser;
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleAvatarChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setAvatar(url);
  };

  const handleSave = async () => {
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (username !== user.username) {
      const taken = state.users.some(
        (u) =>
          u.id !== user.id &&
          u.username.toLowerCase() === username.toLowerCase(),
      );
      if (taken) {
        toast.error("Username already taken");
        return;
      }
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    dispatch({
      type: "UPDATE_PROFILE",
      userId: user.id,
      updates: { username: username.trim(), bio: bio.trim(), avatar },
    });
    setSaving(false);
    toast.success("Profile updated!");
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        data-ocid="profile.edit.sheet"
        className="bg-card border-t border-white/10 rounded-t-2xl"
        style={{ maxHeight: "80dvh" }}
      >
        <SheetHeader className="pb-4 border-b border-white/10">
          <SheetTitle className="text-white text-center">
            Edit Profile
          </SheetTitle>
        </SheetHeader>

        <div
          className="overflow-y-auto py-5 space-y-5"
          style={{ maxHeight: "calc(80dvh - 140px)" }}
        >
          {/* Avatar picker */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatar} />
                <AvatarFallback className="bg-white/10 text-white text-2xl font-bold">
                  {username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-reels-pink rounded-full flex items-center justify-center border-2 border-background"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleAvatarChange(f);
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-reels-pink text-sm font-medium"
            >
              Change photo
            </button>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="edit-username"
              className="text-white/60 text-sm font-medium"
            >
              Username
            </label>
            <Input
              id="edit-username"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                )
              }
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="edit-bio"
              className="text-white/60 text-sm font-medium"
            >
              Bio
            </label>
            <Textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the world about yourself..."
              rows={3}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30 resize-none"
            />
          </div>
        </div>

        <SheetFooter className="pt-3 border-t border-white/10">
          <Button
            data-ocid="profile.edit.save_button"
            onClick={handleSave}
            disabled={saving}
            className="w-full h-11 font-semibold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
            }}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { state, dispatch } = useApp();
  const { t } = useLang();
  const user = state.currentUser;
  const [editOpen, setEditOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  if (!user) return null;

  const myVideos = state.videos.filter(
    (v) => v.uploaderId === user.id && !v.isDeleted,
  );

  const currentUserData = state.users.find((u) => u.id === user.id) ?? user;

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out");
  };

  // Subscription reminder banner logic
  const isArtist = currentUserData.role === "artist";
  const subStatus = currentUserData.subscriptionStatus ?? "none";
  const subExpiry = currentUserData.subscriptionExpiry ?? 0;
  const daysLeft = getDaysRemaining(subExpiry);
  const showReminderBanner =
    isArtist && subStatus === "active" && daysLeft > 0 && daysLeft <= 30;

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between gap-2">
        <h1 className="font-display text-xl font-bold text-white shrink-0">
          {t("profile.title")}
        </h1>
        <LanguageSwitcher className="flex-1 justify-center" />
        <button
          type="button"
          onClick={handleLogout}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors shrink-0"
          title={t("profile.logout")}
        >
          <Settings className="w-4 h-4 text-white/70" />
        </button>
      </div>

      <div className="pb-24">
        {/* Profile hero */}
        <div className="px-4 pt-6 pb-4 space-y-4">
          {/* Subscription expiry reminder banner */}
          {showReminderBanner && !bannerDismissed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              data-ocid="profile.subscription.reminder_banner"
              className="rounded-xl border border-amber-500/40 px-3 py-2.5 flex items-start gap-2"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.2 0.08 80 / 0.5), oklch(0.16 0.05 60 / 0.4))",
              }}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-300 text-xs leading-relaxed flex-1">
                Your subscription expires in{" "}
                <span className="font-bold">
                  {daysLeft} day{daysLeft === 1 ? "" : "s"}
                </span>
                . Renew to keep uploading.
              </p>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                className="text-amber-400/60 hover:text-amber-400 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20 border-2 border-reels-pink">
                <AvatarImage src={currentUserData.avatar} />
                <AvatarFallback className="bg-white/10 text-white text-2xl font-bold">
                  {currentUserData.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-xl truncate">
                @{currentUserData.username}
              </h2>
              {/* Role + Subscription badges */}
              <div
                data-ocid="profile.role.panel"
                className="flex items-center gap-1.5 mt-1.5 flex-wrap"
              >
                <RoleBadge role={currentUserData.role ?? "viewer"} />
                <span data-ocid="profile.subscription.panel">
                  <SubscriptionBadge
                    status={currentUserData.subscriptionStatus ?? "none"}
                  />
                </span>
                <CreatorBadge
                  user={currentUserData}
                  userVideos={myVideos}
                  allUsers={state.users}
                  allVideos={state.videos}
                  size="md"
                />
              </div>
              {currentUserData.bio ? (
                <p className="text-white/60 text-sm mt-1.5 leading-relaxed">
                  {currentUserData.bio}
                </p>
              ) : (
                <p className="text-white/30 text-sm mt-1.5 italic">
                  No bio yet
                </p>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: "Followers",
                value: formatCount(currentUserData.followers),
              },
              {
                label: "Following",
                value: formatCount(currentUserData.following),
              },
              {
                label: "Likes",
                value: formatCount(currentUserData.totalLikes),
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 rounded-xl py-3 text-center"
              >
                <p className="text-white font-bold text-lg">{stat.value}</p>
                <p className="text-white/50 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Subscription card — artists only */}
          {isArtist && <SubscriptionCard user={currentUserData} />}

          {/* Referral code card — all users */}
          <ReferralCodeCard user={currentUserData} />

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              data-ocid="profile.edit_button"
              onClick={() => setEditOpen(true)}
              variant="secondary"
              className="flex-1 h-10 bg-white/10 hover:bg-white/20 text-white border-white/20 font-medium"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <div className="flex items-center gap-1 bg-white/5 rounded-lg px-3 h-10">
              <span className="text-gold text-sm font-bold">
                {currentUserData.coins}
              </span>
              <span className="text-gold text-sm">🪙</span>
            </div>
          </div>
        </div>

        {/* Videos grid */}
        <div className="px-1">
          <div className="flex items-center gap-2 px-3 py-3 border-b border-white/10">
            <Grid2X2 className="w-4 h-4 text-white/60" />
            <span className="text-white/80 text-sm font-medium">
              Reels ({myVideos.length})
            </span>
          </div>

          {myVideos.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <span className="text-5xl">🎬</span>
              <p className="text-white/50 text-sm font-medium">No reels yet</p>
              <p className="text-white/30 text-xs">Start creating!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-0.5 px-0.5">
              {myVideos.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative aspect-[9/16] bg-card overflow-hidden cursor-pointer group"
                >
                  <video
                    src={video.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-white fill-white" />
                    <span className="text-white text-xs font-semibold">
                      {formatCount(video.likesCount)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Terms, Privacy & Contact links */}
      <div className="px-5 py-4 border-t border-white/8 flex items-center justify-center gap-3 flex-wrap">
        <Link
          to="/terms"
          data-ocid="profile.terms_link"
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          <FileText className="w-3 h-3" />
          Terms / नियम व अटी
        </Link>
        <span className="text-white/15 text-xs">·</span>
        <Link
          to="/privacy"
          data-ocid="profile.privacy_policy_link"
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          <Shield className="w-3 h-3" />
          Privacy / गोपनीयता
        </Link>
        <span className="text-white/15 text-xs">·</span>
        <Link
          to="/contact"
          data-ocid="profile.contact_link"
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          <Headphones className="w-3 h-3" />
          Contact / संपर्क
        </Link>
        <span className="text-white/15 text-xs">·</span>
        <Link
          to="/about"
          data-ocid="profile.about_link"
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          <Info className="w-3 h-3" />
          About / आमच्याबद्दल
        </Link>
      </div>

      {/* Edit Profile Sheet */}
      <EditProfileSheet open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
}
