import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Clock,
  Copy,
  Crown,
  Edit2,
  ExternalLink,
  Eye,
  Facebook,
  FileText,
  Film,
  Gift,
  Grid2X2,
  Headphones,
  Heart,
  Info,
  Instagram,
  Link2,
  Loader2,
  LogOut,
  MapPin,
  Music,
  Phone,
  PhoneCall,
  Plus,
  Settings,
  Share2,
  Shield,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  X,
  XCircle,
  Youtube,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import CreatorBadge from "../components/CreatorBadge";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useApp } from "../context/AppContext";
import type {
  MusicGenre,
  MusicTrack,
  SubscriptionStatus,
  User,
  UserRole,
} from "../context/AppContext";
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
  const { state, dispatch } = useApp();
  const subPrice = state.subscriptionPrice ?? 600;
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
        <span className="text-white font-bold text-sm">₹{subPrice} / year</span>
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
              {showSubscribe
                ? `Subscribe ₹${subPrice} / year`
                : `Renew ₹${subPrice} / year`}
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

// ─── Song Submit Card ─────────────────────────────────────────────────────────

function SongSubmitCard({
  userId,
  username,
}: { userId: string; username: string }) {
  const { state, dispatch } = useApp();
  const [form, setForm] = useState({
    title: "",
    artist: username,
    genre: "folk" as MusicGenre,
    audioUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const mySubmissions = state.musicTracks.filter(
    (t) => t.uploadedBy === userId,
  );

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.audioUrl.trim()) {
      toast.error("Song title and audio URL are required");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    const newTrack: MusicTrack = {
      id: `mt_${Date.now()}`,
      title: form.title.trim(),
      artist: form.artist.trim() || username,
      genre: form.genre,
      audioUrl: form.audioUrl.trim(),
      duration: 180,
      status: "pending",
      uploadedBy: userId,
      uploadedAt: Date.now(),
      playCount: 0,
    };
    dispatch({ type: "ADD_MUSIC_TRACK", track: newTrack });
    setForm({ title: "", artist: username, genre: "folk", audioUrl: "" });
    setSubmitting(false);
    toast.success("Song submitted for admin approval!");
  };

  const statusBadge = (status: string) => {
    if (status === "approved")
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
          ✓ Approved
        </span>
      );
    if (status === "rejected")
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
          ✕ Rejected
        </span>
      );
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
        ⏳ Pending
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 overflow-hidden mx-4 mb-4"
      style={{ background: "oklch(0.1 0.01 0)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b border-white/8 flex items-center gap-2"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.65 0.28 15 / 0.12), transparent)",
        }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "oklch(0.65 0.28 15 / 0.25)" }}
        >
          <Music className="w-4 h-4" style={{ color: "oklch(0.65 0.28 15)" }} />
        </div>
        <div>
          <p className="text-white text-sm font-bold leading-tight">
            अहिराणी Library ला Song Submit करा
          </p>
          <p className="text-white/40 text-[10px]">
            Admin approval नंतर library मध्ये दिसेल
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <span className="text-white/50 text-[11px] font-medium">
            Song Title *
          </span>
          <input
            data-ocid="profile.song_title.input"
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Song चे नाव..."
            className="w-full h-9 rounded-lg bg-white/8 border border-white/12 text-white text-sm px-3 placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-white/50 text-[11px] font-medium">
              Artist Name
            </span>
            <input
              data-ocid="profile.song_artist.input"
              type="text"
              value={form.artist}
              onChange={(e) =>
                setForm((f) => ({ ...f, artist: e.target.value }))
              }
              placeholder="Artist चे नाव"
              className="w-full h-9 rounded-lg bg-white/8 border border-white/12 text-white text-sm px-3 placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
            />
          </div>
          <div className="space-y-1">
            <span className="text-white/50 text-[11px] font-medium">Genre</span>
            <select
              data-ocid="profile.song_genre.select"
              value={form.genre}
              onChange={(e) =>
                setForm((f) => ({ ...f, genre: e.target.value as MusicGenre }))
              }
              className="w-full h-9 rounded-lg bg-white/8 border border-white/12 text-white text-sm px-3 outline-none focus:border-white/30 transition-colors"
            >
              <option value="folk">Folk</option>
              <option value="dance">Dance</option>
              <option value="devotional">Devotional</option>
              <option value="romance">Romance</option>
              <option value="comedy">Comedy</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-white/50 text-[11px] font-medium">
            Audio URL *
          </span>
          <input
            data-ocid="profile.song_url.input"
            type="text"
            value={form.audioUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, audioUrl: e.target.value }))
            }
            placeholder="https://... (audio file URL)"
            className="w-full h-9 rounded-lg bg-white/8 border border-white/12 text-white text-sm px-3 placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
          />
        </div>
        <button
          type="button"
          data-ocid="profile.submit_song.button"
          onClick={handleSubmit}
          disabled={submitting || !form.title.trim() || !form.audioUrl.trim()}
          className="w-full h-10 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
          style={{ background: "oklch(0.65 0.28 15)" }}
        >
          {submitting ? "Submitting..." : "🎵 Submit for Approval"}
        </button>
      </div>

      {/* My Submissions */}
      {mySubmissions.length > 0 && (
        <div className="border-t border-white/8 px-4 py-3 space-y-2">
          <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider">
            Your Submissions
          </p>
          <div className="space-y-1.5">
            {mySubmissions.map((track) => (
              <div key={track.id} className="flex items-center gap-2">
                <Music className="w-3.5 h-3.5 text-white/30 shrink-0" />
                <span className="text-white/70 text-xs truncate flex-1">
                  {track.title}
                </span>
                {statusBadge(track.status)}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Edit Profile Sheet ───────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-white/50 text-[11px] font-bold uppercase tracking-widest shrink-0">
        {children}
      </span>
      <Separator className="flex-1 bg-white/10" />
    </div>
  );
}

function FieldInput({
  label,
  id,
  "data-ocid": dataOcid,
  icon,
  ...props
}: {
  label: string;
  id: string;
  "data-ocid"?: string;
  icon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-white/60 text-xs font-medium">
        {label}
      </Label>
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-white/30 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={id}
          data-ocid={dataOcid}
          className={`w-full h-11 rounded-xl bg-white/8 border border-white/12 text-white text-sm outline-none focus:border-white/30 transition-colors placeholder:text-white/25 ${icon ? "pl-9 pr-3" : "px-3"}`}
          {...props}
        />
      </div>
    </div>
  );
}

function EditProfileSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state, dispatch } = useApp();
  const user = state.currentUser;

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [coverPhoto, setCoverPhoto] = useState(user?.coverPhoto ?? "");

  // Social links
  const [whatsapp, setWhatsapp] = useState(user?.socialLinks?.whatsapp ?? "");
  const [instagram, setInstagram] = useState(
    user?.socialLinks?.instagram ?? "",
  );
  const [youtube, setYoutube] = useState(user?.socialLinks?.youtube ?? "");
  const [facebook, setFacebook] = useState(user?.socialLinks?.facebook ?? "");
  const [customLink, setCustomLink] = useState(user?.socialLinks?.custom ?? "");

  // Artist fields
  const [artistCategory, setArtistCategory] = useState<string>(
    user?.artistCategory ?? "",
  );
  const [contactEmail, setContactEmail] = useState(user?.contactEmail ?? "");
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(
    user?.portfolioLinks ?? [],
  );
  const [newPortfolioLink, setNewPortfolioLink] = useState("");

  const avatarFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const isArtist = user.role === "artist";

  const handleAvatarChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setAvatar(url);
  };

  const handleCoverChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setCoverPhoto(url);
  };

  const addPortfolioLink = () => {
    const trimmed = newPortfolioLink.trim();
    if (!trimmed) return;
    setPortfolioLinks((prev) => [...prev, trimmed]);
    setNewPortfolioLink("");
  };

  const removePortfolioLink = (idx: number) => {
    setPortfolioLinks((prev) => prev.filter((_, i) => i !== idx));
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
        toast.error("Username already taken / हे username दुसऱ्याने घेतले आहे");
        return;
      }
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    const updates: Partial<User> = {
      username: username.trim(),
      bio: bio.trim(),
      avatar,
      fullName: fullName.trim() || undefined,
      coverPhoto: coverPhoto || undefined,
      location: location.trim() || undefined,
      socialLinks: {
        whatsapp: whatsapp.trim() || undefined,
        instagram: instagram.trim() || undefined,
        youtube: youtube.trim() || undefined,
        facebook: facebook.trim() || undefined,
        custom: customLink.trim() || undefined,
      },
    };

    if (isArtist) {
      if (artistCategory) {
        updates.artistCategory = artistCategory as User["artistCategory"];
      }
      updates.contactEmail = contactEmail.trim() || undefined;
      updates.portfolioLinks =
        portfolioLinks.length > 0 ? portfolioLinks : undefined;
    }

    dispatch({ type: "UPDATE_PROFILE", userId: user.id, updates });
    setSaving(false);
    toast.success("Profile updated! / प्रोफाईल अपडेट झाली!");
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        data-ocid="profile.edit.sheet"
        className="bg-card border-t border-white/10 rounded-t-3xl p-0 flex flex-col"
        style={{ maxHeight: "92dvh" }}
      >
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <button
              type="button"
              data-ocid="edit_profile.cancel_button"
              onClick={onClose}
              className="text-white/50 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
            <SheetTitle className="text-white text-base font-bold">
              Edit Profile
            </SheetTitle>
            <button
              type="button"
              data-ocid="edit_profile.save_button"
              onClick={handleSave}
              disabled={saving}
              className="text-sm font-semibold transition-colors disabled:opacity-50"
              style={{ color: "oklch(0.7 0.2 15)" }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </button>
          </div>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* ── Photos Section ───────────────────────────────────────────── */}
          <section>
            <SectionHeader>Photos</SectionHeader>

            {/* Cover photo */}
            <div className="mt-3 relative">
              <button
                type="button"
                data-ocid="edit_profile.cover_photo.upload_button"
                onClick={() => coverFileRef.current?.click()}
                className="w-full h-28 rounded-2xl overflow-hidden border border-white/15 relative group"
                style={{
                  background: coverPhoto
                    ? undefined
                    : "linear-gradient(135deg, oklch(0.15 0.04 250), oklch(0.12 0.03 200))",
                }}
              >
                {coverPhoto ? (
                  <img
                    src={coverPhoto}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/30 group-hover:bg-black/50 transition-colors">
                  <Camera className="w-5 h-5 text-white/80" />
                  <span className="text-white/70 text-xs font-medium">
                    {coverPhoto ? "Change Cover" : "Add Cover Photo"}
                  </span>
                </div>
              </button>
              <input
                ref={coverFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleCoverChange(f);
                }}
              />
            </div>

            {/* Profile photo — overlapping */}
            <div className="mt-4 flex items-center gap-4">
              <div className="relative shrink-0">
                <Avatar className="w-20 h-20 border-2 border-white/20">
                  <AvatarImage src={avatar} />
                  <AvatarFallback className="bg-white/10 text-white text-2xl font-bold">
                    {username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  data-ocid="edit_profile.profile_photo.upload_button"
                  onClick={() => avatarFileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 border-card flex items-center justify-center"
                  style={{ background: "oklch(0.65 0.28 15)" }}
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
                <input
                  ref={avatarFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleAvatarChange(f);
                  }}
                />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">
                  Profile Photo
                </p>
                <button
                  type="button"
                  onClick={() => avatarFileRef.current?.click()}
                  className="text-xs mt-0.5 transition-colors"
                  style={{ color: "oklch(0.7 0.2 15)" }}
                >
                  Change photo
                </button>
              </div>
            </div>
          </section>

          {/* ── Basic Info ───────────────────────────────────────────────── */}
          <section className="space-y-3">
            <SectionHeader>Basic Info</SectionHeader>

            <FieldInput
              label="Full Name"
              id="edit-fullname"
              data-ocid="edit_profile.fullname.input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="पूर्ण नाव / Full Name"
            />

            <FieldInput
              label="Username"
              id="edit-username"
              data-ocid="edit_profile.username.input"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                )
              }
              placeholder="username"
            />

            <div className="space-y-1.5">
              <Label
                htmlFor="edit-bio"
                className="text-white/60 text-xs font-medium"
              >
                Bio
              </Label>
              <textarea
                id="edit-bio"
                data-ocid="edit_profile.bio.textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 150))}
                placeholder="Tell the world about yourself..."
                rows={3}
                className="w-full rounded-xl bg-white/8 border border-white/12 text-white text-sm outline-none focus:border-white/30 transition-colors placeholder:text-white/25 px-3 py-2.5 resize-none"
              />
              <p className="text-white/30 text-[11px] text-right">
                {bio.length}/150
              </p>
            </div>

            <FieldInput
              label="Location"
              id="edit-location"
              data-ocid="edit_profile.location.input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              icon={<MapPin className="w-3.5 h-3.5" />}
            />
          </section>

          {/* ── Social Links ─────────────────────────────────────────────── */}
          <section className="space-y-3">
            <SectionHeader>Social Links</SectionHeader>

            <FieldInput
              label="WhatsApp"
              id="edit-whatsapp"
              data-ocid="edit_profile.whatsapp.input"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+91 9876543210"
              icon={<Phone className="w-3.5 h-3.5" />}
            />
            <FieldInput
              label="Instagram"
              id="edit-instagram"
              data-ocid="edit_profile.instagram.input"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@username or URL"
              icon={<Instagram className="w-3.5 h-3.5" />}
            />
            <FieldInput
              label="YouTube"
              id="edit-youtube"
              data-ocid="edit_profile.youtube.input"
              type="url"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="https://youtube.com/..."
              icon={<Youtube className="w-3.5 h-3.5" />}
            />
            <FieldInput
              label="Facebook"
              id="edit-facebook"
              data-ocid="edit_profile.facebook.input"
              type="url"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/..."
              icon={<Facebook className="w-3.5 h-3.5" />}
            />
            <FieldInput
              label="Other Link"
              id="edit-custom-link"
              data-ocid="edit_profile.custom.input"
              type="url"
              value={customLink}
              onChange={(e) => setCustomLink(e.target.value)}
              placeholder="Any other link"
              icon={<Link2 className="w-3.5 h-3.5" />}
            />
          </section>

          {/* ── Artist Only Section ──────────────────────────────────────── */}
          {isArtist && (
            <section className="space-y-3">
              <SectionHeader>Artist Details</SectionHeader>

              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs font-medium">
                  Category
                </Label>
                <Select
                  value={artistCategory}
                  onValueChange={setArtistCategory}
                >
                  <SelectTrigger
                    data-ocid="edit_profile.category.select"
                    className="h-11 rounded-xl bg-white/8 border-white/12 text-white"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/15">
                    {[
                      "Singer",
                      "Actor",
                      "Comedian",
                      "Creator",
                      "Dancer",
                      "Director",
                    ].map((cat) => (
                      <SelectItem
                        key={cat}
                        value={cat}
                        className="text-white hover:bg-white/10"
                      >
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <FieldInput
                label="Contact Email"
                id="edit-contact-email"
                data-ocid="edit_profile.email.input"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="your@email.com"
              />

              {/* Portfolio Links */}
              <div className="space-y-2">
                <Label className="text-white/60 text-xs font-medium">
                  Portfolio Links
                </Label>
                {portfolioLinks.map((link, idx) => (
                  <div
                    key={`portfolio-${
                      // biome-ignore lint/suspicious/noArrayIndexKey: index is stable for user edits
                      idx
                    }`}
                    className="flex items-center gap-2"
                  >
                    <div className="flex-1 h-10 rounded-xl bg-white/8 border border-white/12 px-3 flex items-center gap-2 min-w-0">
                      <Link2 className="w-3.5 h-3.5 text-white/30 shrink-0" />
                      <span className="text-white/70 text-sm truncate">
                        {link}
                      </span>
                    </div>
                    <button
                      type="button"
                      data-ocid={`edit_profile.portfolio.delete_button.${idx + 1}`}
                      onClick={() => removePortfolioLink(idx)}
                      className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0 hover:bg-red-500/25 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={newPortfolioLink}
                    data-ocid="edit_profile.portfolio.input"
                    onChange={(e) => setNewPortfolioLink(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="flex-1 h-10 rounded-xl bg-white/8 border border-white/12 text-white text-sm px-3 outline-none focus:border-white/30 transition-colors placeholder:text-white/25"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPortfolioLink();
                      }
                    }}
                  />
                  <button
                    type="button"
                    data-ocid="edit_profile.portfolio.button"
                    onClick={addPortfolioLink}
                    disabled={!newPortfolioLink.trim()}
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors disabled:opacity-40"
                    style={{ background: "oklch(0.65 0.28 15 / 0.3)" }}
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Bottom spacer */}
          <div className="h-4" />
        </div>

        {/* Sticky footer */}
        <SheetFooter className="px-5 pb-6 pt-3 border-t border-white/10 shrink-0">
          <Button
            data-ocid="edit_profile.save_button"
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 font-semibold text-sm rounded-xl"
            style={{
              background: saving
                ? "oklch(0.3 0.04 15)"
                : "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.6 0.25 350))",
            }}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Changes / बदल जतन करा"
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
  const [showSettings, setShowSettings] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(
    null,
  );
  const [playerMuted, setPlayerMuted] = useState(false);

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
          onClick={() => setShowSettings(true)}
          data-ocid="profile.settings.button"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors shrink-0"
          title="Settings"
        >
          <Settings className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* ── Settings Sheet ───────────────────────────────────────────────── */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent
          side="bottom"
          data-ocid="profile.settings.sheet"
          className="rounded-t-2xl border-t border-white/10 pb-8"
          style={{ background: "oklch(0.13 0.03 260)" }}
        >
          <SheetHeader className="px-5 py-4 border-b border-white/10">
            <SheetTitle className="text-white text-base font-bold">
              ⚙️ Settings
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 px-4 py-3">
            <button
              type="button"
              data-ocid="profile.settings.edit_button"
              onClick={() => {
                setShowSettings(false);
                setEditOpen(true);
              }}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-colors text-left"
            >
              <span className="text-lg">✏️</span>
              <span className="font-medium">Edit Profile</span>
            </button>
            <Link
              to="/about"
              data-ocid="profile.settings.about.link"
              onClick={() => setShowSettings(false)}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
            >
              <span className="text-lg">ℹ️</span>
              <span className="font-medium">About App</span>
            </Link>
            <Link
              to="/privacy"
              data-ocid="profile.settings.privacy.link"
              onClick={() => setShowSettings(false)}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
            >
              <span className="text-lg">🔒</span>
              <span className="font-medium">Privacy Policy</span>
            </Link>
            <Link
              to="/terms"
              data-ocid="profile.settings.terms.link"
              onClick={() => setShowSettings(false)}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
            >
              <span className="text-lg">📋</span>
              <span className="font-medium">Terms & Conditions</span>
            </Link>
            <Link
              to="/contact"
              data-ocid="profile.settings.contact.link"
              onClick={() => setShowSettings(false)}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
            >
              <span className="text-lg">📞</span>
              <span className="font-medium">Contact / Support</span>
            </Link>
            <div className="h-px bg-white/10 my-2" />
            <button
              type="button"
              data-ocid="profile.settings.logout.button"
              onClick={() => {
                setShowSettings(false);
                handleLogout();
              }}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-left"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="pb-24">
        {/* Profile hero */}
        <div className="pb-4 space-y-0">
          {/* Subscription expiry reminder banner */}
          {showReminderBanner && !bannerDismissed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              data-ocid="profile.subscription.reminder_banner"
              className="mx-4 mt-4 rounded-xl border border-amber-500/40 px-3 py-2.5 flex items-start gap-2"
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

          {/* Cover Photo */}
          <div
            data-ocid="profile.cover_photo.section"
            className="relative w-full"
            style={{ height: "130px" }}
          >
            {currentUserData.coverPhoto ? (
              <img
                src={currentUserData.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.15 0.06 250), oklch(0.12 0.04 200), oklch(0.14 0.05 340))",
                }}
              />
            )}
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </div>

          {/* Avatar overlapping cover */}
          <div className="px-4 -mt-10 relative z-10">
            <div className="flex items-end gap-3 mb-3">
              <Avatar className="w-20 h-20 border-3 border-background ring-2 ring-white/10 shrink-0">
                <AvatarImage src={currentUserData.avatar} />
                <AvatarFallback className="bg-white/10 text-white text-2xl font-bold">
                  {currentUserData.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="pb-1 min-w-0">
                {currentUserData.fullName ? (
                  <>
                    <h2 className="text-white font-bold text-xl leading-tight truncate">
                      {currentUserData.fullName}
                    </h2>
                    <p className="text-white/50 text-sm truncate">
                      @{currentUserData.username}
                    </p>
                  </>
                ) : (
                  <h2 className="text-white font-bold text-xl truncate">
                    @{currentUserData.username}
                  </h2>
                )}
              </div>
            </div>

            {/* Badges row */}
            <div
              data-ocid="profile.role.panel"
              className="flex items-center gap-1.5 flex-wrap"
            >
              <RoleBadge role={currentUserData.role ?? "viewer"} />
              {isArtist && currentUserData.artistCategory && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                  {currentUserData.artistCategory}
                </span>
              )}
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

            {/* Bio */}
            {currentUserData.bio ? (
              <p className="text-white/60 text-sm mt-2 leading-relaxed">
                {currentUserData.bio}
              </p>
            ) : (
              <p className="text-white/30 text-sm mt-2 italic">No bio yet</p>
            )}

            {/* Location */}
            {currentUserData.location && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <span className="text-white/50 text-xs">
                  {currentUserData.location}
                </span>
              </div>
            )}

            {/* Social Links */}
            {currentUserData.socialLinks &&
              Object.values(currentUserData.socialLinks).some(Boolean) && (
                <div
                  data-ocid="profile.social_links.section"
                  className="flex items-center gap-2 mt-3 flex-wrap"
                >
                  {currentUserData.socialLinks.whatsapp && (
                    <a
                      href={`https://wa.me/${currentUserData.socialLinks.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500/15 border border-green-500/25 hover:bg-green-500/25 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-green-400" />
                    </a>
                  )}
                  {currentUserData.socialLinks.instagram && (
                    <a
                      href={
                        currentUserData.socialLinks.instagram.startsWith("http")
                          ? currentUserData.socialLinks.instagram
                          : `https://instagram.com/${currentUserData.socialLinks.instagram.replace("@", "")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-pink-500/15 border border-pink-500/25 hover:bg-pink-500/25 transition-colors"
                    >
                      <Instagram className="w-3.5 h-3.5 text-pink-400" />
                    </a>
                  )}
                  {currentUserData.socialLinks.youtube && (
                    <a
                      href={currentUserData.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/15 border border-red-500/25 hover:bg-red-500/25 transition-colors"
                    >
                      <Youtube className="w-3.5 h-3.5 text-red-400" />
                    </a>
                  )}
                  {currentUserData.socialLinks.facebook && (
                    <a
                      href={currentUserData.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/15 border border-blue-500/25 hover:bg-blue-500/25 transition-colors"
                    >
                      <Facebook className="w-3.5 h-3.5 text-blue-400" />
                    </a>
                  )}
                  {currentUserData.socialLinks.custom && (
                    <a
                      href={currentUserData.socialLinks.custom}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5 text-white/60" />
                    </a>
                  )}
                </div>
              )}
          </div>

          {/* Stats + cards section */}
          <div className="px-4 pt-4 space-y-4">
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

            {/* Portfolio Links — artists only */}
            {isArtist &&
              currentUserData.portfolioLinks &&
              currentUserData.portfolioLinks.length > 0 && (
                <div
                  data-ocid="profile.portfolio.section"
                  className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2"
                >
                  <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider">
                    Portfolio
                  </p>
                  {currentUserData.portfolioLinks.map((link, idx) => (
                    <a
                      key={`pl-${
                        // biome-ignore lint/suspicious/noArrayIndexKey: static display list
                        idx
                      }`}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-white/40 shrink-0" />
                      <span
                        className="text-xs truncate"
                        style={{ color: "oklch(0.7 0.15 15)" }}
                      >
                        {link}
                      </span>
                    </a>
                  ))}
                </div>
              )}

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
          {/* end stats+cards px-4 div */}
        </div>
        {/* end profile hero */}

        {/* Song submission card — active artists only */}
        {isArtist && currentUserData.subscriptionStatus === "active" && (
          <SongSubmitCard
            userId={currentUserData.id}
            username={currentUserData.username}
          />
        )}

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
                  onClick={() => setSelectedVideoIndex(i)}
                >
                  {/* Show thumbnail if available, otherwise attempt video preview */}
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.caption}
                      className="w-full h-full object-cover"
                    />
                  ) : video.url && video.url !== "__local__" ? (
                    <video
                      src={video.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                      onLoadedData={(e) => {
                        e.currentTarget.currentTime = 0.5;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <Film className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                  {/* Play icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white ml-0.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-label="Play video"
                        role="img"
                      >
                        <title>Play video</title>
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
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

      {/* Full-screen Video Player Modal */}
      <AnimatePresence>
        {selectedVideoIndex !== null && myVideos[selectedVideoIndex] && (
          <motion.div
            key="video-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            {/* Close and mute buttons */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
              <button
                type="button"
                aria-label="Close"
                data-ocid="profile.player.close_button"
                onClick={() => setSelectedVideoIndex(null)}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
              >
                <XCircle className="w-5 h-5 text-white" />
              </button>
              <button
                type="button"
                aria-label={playerMuted ? "Unmute" : "Mute"}
                data-ocid="profile.player.mute_toggle"
                onClick={() => setPlayerMuted((m) => !m)}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
              >
                {playerMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            {/* Video */}
            <video
              key={myVideos[selectedVideoIndex].id}
              src={myVideos[selectedVideoIndex].url}
              autoPlay
              playsInline
              controls={false}
              muted={playerMuted}
              loop
              className="w-full h-full object-contain"
              data-ocid="profile.player.canvas_target"
            />

            {/* Caption and info at bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-5 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white font-medium text-sm mb-1 line-clamp-2">
                {myVideos[selectedVideoIndex].caption}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                  <span className="text-white/80 text-xs">
                    {formatCount(myVideos[selectedVideoIndex].likesCount)}
                  </span>
                </div>
                <span className="text-white/40 text-xs">
                  {selectedVideoIndex + 1} / {myVideos.length}
                </span>
              </div>
            </div>

            {/* Prev / Next navigation */}
            {selectedVideoIndex > 0 && (
              <button
                type="button"
                aria-label="Previous video"
                data-ocid="profile.player.pagination_prev"
                onClick={() =>
                  setSelectedVideoIndex((idx) =>
                    idx !== null ? idx - 1 : null,
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            )}
            {selectedVideoIndex < myVideos.length - 1 && (
              <button
                type="button"
                aria-label="Next video"
                data-ocid="profile.player.pagination_next"
                onClick={() =>
                  setSelectedVideoIndex((idx) =>
                    idx !== null ? idx + 1 : null,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
