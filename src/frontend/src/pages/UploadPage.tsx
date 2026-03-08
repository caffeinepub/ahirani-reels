import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Camera,
  Crown,
  Film,
  Hash,
  ImageIcon,
  Loader2,
  Lock,
  Type,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { VideoType } from "../context/AppContext";
import { useApp } from "../context/AppContext";
import { generateId } from "../utils/trending";
import { saveVideoFileToDB } from "../utils/videoDB";

const MAX_VIDEO_SIZE_MB = 100;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

// ─── Thumbnail generator ─────────────────────────────────────────────────────

async function generateThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    const url = URL.createObjectURL(file);
    video.src = url;
    video.addEventListener("loadeddata", () => {
      video.currentTime = 0.5;
    });
    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 568;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } else {
        resolve("");
      }
      URL.revokeObjectURL(url);
    });
    video.addEventListener("error", () => {
      resolve("");
      URL.revokeObjectURL(url);
    });
    // Timeout fallback
    setTimeout(() => resolve(""), 5000);
  });
}

// ─── Video type chip config ───────────────────────────────────────────────────

const VIDEO_TYPES: Array<{
  type: VideoType;
  label: string;
  description: string;
  hint: string;
  rpm: number;
  ocid: string;
}> = [
  {
    type: "reel",
    label: "Reel",
    description: "Max 60s · RPM $2",
    hint: "Max 60s · RPM $2",
    rpm: 2,
    ocid: "upload.type_reel_button",
  },
  {
    type: "long",
    label: "Long",
    description: "Up to 10 min · RPM $4",
    hint: "Up to 10 min · RPM $4",
    rpm: 4,
    ocid: "upload.type_long_button",
  },
  {
    type: "premium",
    label: "Premium",
    description: "Exclusive · Subscribers only · RPM $8",
    hint: "Exclusive · Subscribers only · RPM $8",
    rpm: 8,
    ocid: "upload.type_premium_button",
  },
];

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

export default function UploadPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser;
  const subPrice = state.subscriptionPrice ?? 600;
  const canUpload =
    user?.role === "artist" &&
    user?.subscriptionStatus === "active" &&
    (user?.subscriptionExpiry ?? 0) > Date.now();
  const [subscribing, setSubscribing] = useState(false);
  const [uploadReminderDismissed, setUploadReminderDismissed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoDragOver, setPhotoDragOver] = useState(false);

  // Subscription expiry reminder for active upload form
  const subExpiry = user?.subscriptionExpiry ?? 0;
  const daysLeft =
    subExpiry > 0 ? Math.ceil((subExpiry - Date.now()) / 86400000) : 0;
  const showUploadReminder =
    canUpload && daysLeft > 0 && daysLeft <= 30 && !uploadReminderDismissed;
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [selectedType, setSelectedType] = useState<VideoType>("reel");

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file (MP4, MOV, AVI, WebM)");
      return;
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      toast.error(
        `Video is too large. Maximum size is ${MAX_VIDEO_SIZE_MB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
      );
      return;
    }
    setVideoFile(file);
    // Use object URL only for preview — NOT for storage
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const handlePhotoSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    navigate({
      to: "/edit-photo",
      state: { photoFile: file } as never,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleHashtagAdd = () => {
    const tag = hashtagInput.trim().replace(/^#/, "").toLowerCase();
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
    }
    setHashtagInput("");
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleHashtagAdd();
    }
    if (e.key === "Backspace" && !hashtagInput && hashtags.length > 0) {
      setHashtags(hashtags.slice(0, -1));
    }
  };

  const handlePost = async () => {
    if (!state.currentUser) return;
    if (!videoFile) {
      toast.error("Please select a video first");
      return;
    }
    if (!caption.trim()) {
      toast.error("Add a caption for your reel");
      return;
    }

    setUploading(true);
    setUploadProgress(5);

    try {
      // Generate thumbnail from first frame
      const thumbnail = await generateThumbnail(videoFile);
      setUploadProgress(20);

      // Generate a stable video ID
      const videoId = generateId();

      // Save video file directly to IndexedDB (avoids base64 memory explosion)
      // We use "__local__" as the state URL placeholder; IndexedDB holds the actual Blob
      try {
        setUploadProgress(40);
        await saveVideoFileToDB(videoId, videoFile);
        setUploadProgress(80);
      } catch (dbErr) {
        const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
        toast.error(`Upload failed: ${msg}`);
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      // Create a temporary Blob URL for immediate in-session playback
      const blobUrl = URL.createObjectURL(videoFile);
      const finalUrl = blobUrl;

      setUploadProgress(100);

      dispatch({
        type: "UPLOAD_VIDEO",
        video: {
          id: videoId,
          uploaderId: state.currentUser.id,
          url: finalUrl, // Blob URL — valid for this session
          thumbnail,
          caption: caption.trim(),
          hashtags: hashtags.length > 0 ? hashtags : [selectedType],
          likesCount: 0,
          commentsCount: 0,
          createdAt: Date.now(),
          isDeleted: false,
          videoType: selectedType,
          viewsCount: 0,
          adImpressions: 0,
          shareCount: 0,
        },
      });

      // Keep the preview URL alive — it's the same Blob URL used in the feed.
      // We only revoke the preview URL (different from finalUrl if applicable)
      if (videoPreviewUrl && videoPreviewUrl !== finalUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }

      setUploading(false);
      setUploadProgress(0);
      setVideoFile(null);
      setVideoPreviewUrl("");
      setCaption("");
      setHashtags([]);
      setSelectedType("reel");
      toast.success("🎉 Your reel is live!");
    } catch (unexpectedErr) {
      const msg =
        unexpectedErr instanceof Error
          ? unexpectedErr.message
          : String(unexpectedErr);
      toast.error(`Upload failed: ${msg}`);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;
    setSubscribing(true);
    await new Promise((r) => setTimeout(r, 1000));
    dispatch({ type: "SUBSCRIBE_ARTIST", userId: user.id });
    setSubscribing(false);
    toast.success("Subscription activated! You can now upload videos.");
  };

  const handleClear = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl("");
  };

  // Derived subscription state
  const isArtist = user?.role === "artist";
  const subStatus = user?.subscriptionStatus; // "active" | "expired" | "none"
  const isExpired = isArtist && subStatus === "expired";

  // Locked state for non-artists or artists without active subscription
  if (!canUpload) {
    return (
      <div className="h-full overflow-y-auto bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-white/10 px-4 py-4">
          <h1 className="font-display text-xl font-bold text-white">
            Upload Reel
          </h1>
          <p className="text-white/40 text-xs mt-0.5">
            Share your moment with the world
          </p>
        </div>
        <div
          data-ocid="upload.locked.panel"
          className="flex flex-col items-center justify-center px-6 py-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            {/* Non-artist locked card */}
            {!isArtist ? (
              <div
                className="rounded-2xl border border-white/10 p-8 flex flex-col items-center text-center gap-4"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-white/50" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg mb-2">
                    Artist Account Required
                  </h2>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Only artist accounts can upload videos. Contact admin to
                    upgrade your account.
                  </p>
                </div>
              </div>
            ) : (
              /* Artist with expired or no subscription — renewal card */
              <div
                className="rounded-2xl border border-amber-500/20 p-8 flex flex-col items-center text-center gap-5"
                style={{
                  background:
                    "linear-gradient(160deg, oklch(0.14 0.04 60 / 0.7) 0%, oklch(0.11 0.02 40 / 0.85) 100%)",
                  boxShadow:
                    "0 0 40px oklch(0.55 0.18 75 / 0.08), inset 0 1px 0 oklch(0.55 0.18 75 / 0.12)",
                }}
              >
                {/* Crown icon */}
                <div
                  className="w-18 h-18 rounded-2xl flex items-center justify-center"
                  style={{
                    width: "4.5rem",
                    height: "4.5rem",
                    background:
                      "linear-gradient(135deg, oklch(0.25 0.1 75 / 0.6), oklch(0.2 0.08 55 / 0.5))",
                    border: "1px solid oklch(0.55 0.18 75 / 0.3)",
                    boxShadow: "0 4px 16px oklch(0.55 0.18 75 / 0.15)",
                  }}
                >
                  <Crown className="w-8 h-8 text-amber-400" />
                </div>

                {/* Title & status */}
                <div className="space-y-2">
                  <h2 className="text-white font-bold text-xl leading-tight">
                    {isExpired
                      ? "Your Upload Access is Paused"
                      : "Start Uploading Today"}
                  </h2>

                  {/* Expired date line */}
                  {isExpired && (user?.subscriptionExpiry ?? 0) > 0 && (
                    <p className="text-red-400 text-xs font-semibold tracking-wide">
                      Expired on{" "}
                      {formatExpiryDate(user?.subscriptionExpiry ?? 0)}
                    </p>
                  )}

                  <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
                    Please renew your ₹{subPrice} yearly artist subscription to
                    upload videos.
                  </p>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-amber-500/15" />

                {/* Renewal button */}
                <Button
                  data-ocid="upload.renew_subscription_button"
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className="w-full h-12 font-bold text-base text-white border-0 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: subscribing
                      ? "linear-gradient(135deg, oklch(0.35 0.06 75), oklch(0.3 0.05 55))"
                      : "linear-gradient(135deg, oklch(0.72 0.18 75), oklch(0.65 0.22 55))",
                    boxShadow: subscribing
                      ? "none"
                      : "0 4px 20px oklch(0.65 0.22 55 / 0.35)",
                  }}
                >
                  {subscribing ? (
                    <span className="flex items-center gap-2.5">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                      Activating subscription...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2.5">
                      <Crown className="w-4 h-4 shrink-0" />
                      Renew Artist Subscription ₹{subPrice} / Year
                    </span>
                  )}
                </Button>

                {/* Fine print */}
                {!subscribing && (
                  <p className="text-white/30 text-xs">
                    Valid for 365 days · Instant activation
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-white/10 px-4 py-4">
        <h1 className="font-display text-xl font-bold text-white">
          Upload Reel
        </h1>
        <p className="text-white/40 text-xs mt-0.5">
          Share your moment with the world
        </p>
      </div>

      <div className="px-4 py-5 space-y-5 pb-24">
        {/* Subscription expiry reminder banner */}
        {showUploadReminder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            data-ocid="upload.subscription.reminder_banner"
            className="rounded-xl border border-amber-500/40 px-3 py-2 flex items-center gap-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.2 0.08 80 / 0.5), oklch(0.16 0.05 60 / 0.4))",
            }}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-amber-300 text-xs leading-relaxed flex-1">
              Subscription expires in{" "}
              <span className="font-bold">
                {daysLeft} day{daysLeft === 1 ? "" : "s"}
              </span>
              . Renew on your Profile to keep uploading.
            </p>
            <button
              type="button"
              onClick={() => setUploadReminderDismissed(true)}
              className="text-amber-400/60 hover:text-amber-400 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Record with Camera CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.12 0.04 15 / 0.8) 0%, oklch(0.1 0.03 350 / 0.6) 100%)",
          }}
        >
          <div className="flex items-center gap-4 px-4 py-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
              }}
            >
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">
                Record with Camera
              </p>
              <p className="text-white/50 text-xs leading-tight mt-0.5">
                Shoot directly in-app with effects &amp; filters
              </p>
            </div>
            <Button
              data-ocid="upload.record_camera_button"
              onClick={() => navigate({ to: "/camera", search: {} })}
              size="sm"
              className="shrink-0 font-semibold text-white border-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
              }}
            >
              Record Now
            </Button>
          </div>
        </motion.div>

        {/* Take Photo CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-white/10 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.1 0.04 150 / 0.8) 0%, oklch(0.09 0.03 165 / 0.6) 100%)",
          }}
        >
          <div className="flex items-center gap-4 px-4 py-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.22 150), oklch(0.5 0.2 165))",
              }}
            >
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Take a Photo</p>
              <p className="text-white/50 text-xs leading-tight mt-0.5">
                Capture moments with filters &amp; post
              </p>
            </div>
            <Button
              data-ocid="upload.take_photo_button"
              onClick={() =>
                navigate({ to: "/camera", search: { mode: "photo" } })
              }
              size="sm"
              className="shrink-0 font-semibold text-white border-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.22 150), oklch(0.5 0.2 165))",
              }}
            >
              Take Photo →
            </Button>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs font-medium">
            or upload a file
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Video upload zone */}
        {!videoPreviewUrl ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            data-ocid="upload.dropzone"
            className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
              dragOver
                ? "border-reels-pink bg-reels-pink/10"
                : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/8"
            }`}
            style={{ minHeight: 220 }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
              <Film className="w-8 h-8 text-white/50" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">Tap to select video</p>
              <p className="text-white/40 text-sm mt-1">
                or drag and drop here
              </p>
              <p className="text-white/30 text-xs mt-2">
                MP4, MOV, WebM · Max {MAX_VIDEO_SIZE_MB}MB
              </p>
            </div>
            <div className="flex items-center gap-2 bg-reels-pink/20 border border-reels-pink/40 rounded-full px-4 py-2">
              <Upload className="w-4 h-4 text-reels-pink" />
              <span className="text-reels-pink text-sm font-semibold">
                Choose File
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                // Reset input so same file can be re-selected
                e.target.value = "";
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-2xl overflow-hidden bg-black"
          >
            <video
              src={videoPreviewUrl}
              className="w-full rounded-2xl"
              style={{ maxHeight: 280, objectFit: "contain" }}
              controls
              playsInline
            >
              <track kind="captions" />
            </video>
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-3 right-3 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {videoFile && (
              <div className="absolute bottom-3 left-3 glass-card px-3 py-1 rounded-full">
                <p className="text-white text-xs">{videoFile.name}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Photo upload section */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs font-medium">
            or upload a photo
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          data-ocid="upload.photo_dropzone"
          className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
            photoDragOver
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/8"
          }`}
          style={{ minHeight: 140 }}
          onClick={() => photoInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setPhotoDragOver(true);
          }}
          onDragLeave={() => setPhotoDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setPhotoDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handlePhotoSelect(file);
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm">
              Tap to select photo
            </p>
            <p className="text-white/30 text-xs mt-0.5">JPG, PNG, WEBP</p>
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoSelect(file);
            }}
          />
        </motion.div>

        {/* Video type selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-2"
        >
          <p className="text-sm font-medium text-white/70">Video Type</p>
          <div className="grid grid-cols-3 gap-2">
            {VIDEO_TYPES.map((vt) => {
              const isActive = selectedType === vt.type;
              const isPremiumType = vt.type === "premium";
              return (
                <button
                  key={vt.type}
                  type="button"
                  data-ocid={vt.ocid}
                  onClick={() => setSelectedType(vt.type)}
                  className={`relative flex flex-col items-center gap-1 rounded-xl px-3 py-3 border text-center transition-all ${
                    isActive
                      ? "border-transparent text-white"
                      : "border-white/10 text-white/60 hover:border-white/20 hover:text-white/80 bg-white/5"
                  }`}
                  style={
                    isActive
                      ? {
                          background: isPremiumType
                            ? "linear-gradient(135deg, oklch(0.55 0.18 60), oklch(0.6 0.22 40))"
                            : "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
                        }
                      : {}
                  }
                >
                  {isPremiumType && (
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

          {/* Premium subscription warning */}
          {selectedType === "premium" &&
            user?.subscriptionStatus !== "active" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                data-ocid="upload.error_state"
                className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 px-3 py-2.5 mt-2"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.18 0.06 60 / 0.4), oklch(0.12 0.04 40 / 0.5))",
                }}
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-amber-300 text-xs leading-relaxed">
                  Active subscription required to upload Premium content.
                  Contact admin to activate your subscription.
                </p>
              </motion.div>
            )}
        </motion.div>

        {/* Caption */}
        <div className="space-y-2">
          <label
            htmlFor="caption-input"
            className="flex items-center gap-2 text-sm font-medium text-white/70"
          >
            <Type className="w-4 h-4" />
            Caption
          </label>
          <Textarea
            id="caption-input"
            data-ocid="upload.textarea"
            placeholder="Write a caption for your reel..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/30 resize-none text-sm"
          />
          <p className="text-right text-xs text-white/30">
            {caption.length}/150
          </p>
        </div>

        {/* Hashtags */}
        <div className="space-y-2">
          <label
            htmlFor="hashtag-input"
            className="flex items-center gap-2 text-sm font-medium text-white/70"
          >
            <Hash className="w-4 h-4" />
            Hashtags
          </label>

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-reels-pink/20 text-reels-pink border-reels-pink/30 cursor-pointer"
                  onClick={() => setHashtags(hashtags.filter((t) => t !== tag))}
                >
                  #{tag} ×
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              id="hashtag-input"
              data-ocid="upload.search_input"
              placeholder="Add hashtag (press Enter)"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={handleHashtagKeyDown}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30 text-sm flex-1"
            />
            <Button
              onClick={handleHashtagAdd}
              variant="secondary"
              size="sm"
              disabled={!hashtagInput.trim()}
              className="shrink-0 bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Add
            </Button>
          </div>
          <p className="text-xs text-white/30">Press Enter or comma to add</p>
        </div>

        {/* Post button */}
        <Button
          data-ocid="upload.submit_button"
          onClick={handlePost}
          disabled={
            uploading ||
            !videoFile ||
            !caption.trim() ||
            (selectedType === "premium" &&
              user?.subscriptionStatus !== "active")
          }
          className="w-full h-12 font-bold text-base relative overflow-hidden"
          style={{
            background:
              selectedType === "premium" &&
              user?.subscriptionStatus !== "active"
                ? "oklch(0.3 0.04 60)"
                : "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
          }}
        >
          {/* Progress bar overlay */}
          {uploading && uploadProgress > 0 && (
            <motion.div
              className="absolute inset-y-0 left-0 bg-white/20 rounded-lg"
              initial={{ width: "0%" }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ ease: "linear" }}
            />
          )}
          {uploading ? (
            <span className="relative flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploadProgress > 0
                ? `Uploading ${uploadProgress}%`
                : "Uploading..."}
            </span>
          ) : (
            "🚀 Post Reel"
          )}
        </Button>

        <p className="text-center text-xs text-white/30">
          By posting, you agree to our Community Guidelines
        </p>
      </div>
    </div>
  );
}
