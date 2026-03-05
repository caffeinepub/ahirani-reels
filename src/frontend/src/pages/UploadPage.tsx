import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Crown,
  Film,
  Hash,
  Loader2,
  Lock,
  Type,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { VideoType } from "../context/AppContext";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";
import { generateId } from "../utils/trending";

// ─── Video type chip config ───────────────────────────────────────────────────

const VIDEO_TYPES: Array<{
  type: VideoType;
  label: string;
  description: string;
  rpm: number;
  ocid: string;
}> = [
  {
    type: "reel",
    label: "Reel",
    description: "Up to 60s · RPM $2",
    rpm: 2,
    ocid: "upload.type_reel_button",
  },
  {
    type: "long",
    label: "Long",
    description: "1–10 min · RPM $4",
    rpm: 4,
    ocid: "upload.type_long_button",
  },
  {
    type: "premium",
    label: "Premium",
    description: "Exclusive · RPM $8",
    rpm: 8,
    ocid: "upload.type_premium_button",
  },
];

export default function UploadPage() {
  const { state, dispatch } = useApp();
  const { actor } = useActor();
  const user = state.currentUser;
  const canUpload =
    user?.role === "artist" && user?.subscriptionStatus === "active";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [selectedType, setSelectedType] = useState<VideoType>("reel");

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
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
    if (!videoUrl && !videoFile) {
      toast.error("Please select a video first");
      return;
    }
    if (!caption.trim()) {
      toast.error("Add a caption for your reel");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    let finalUrl = videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4";

    // Attempt on-chain blob upload if actor is available and a local file was selected
    if (actor && videoFile) {
      try {
        const arrayBuffer = await videoFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(Math.round(pct)),
        );
        await actor.addContent(BigInt(0), caption.trim(), caption.trim(), blob);
        finalUrl = blob.getDirectURL();
        toast.success("📡 Uploaded to ICP chain!");
      } catch (err) {
        console.error(
          "On-chain upload failed, falling back to local URL:",
          err,
        );
        toast.error("On-chain upload failed — saving locally instead");
        // Fall back to local object URL already set in videoUrl
        finalUrl = videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4";
      }
    } else if (!actor && videoFile) {
      // No actor — simulate upload delay
      await new Promise((r) => setTimeout(r, 1200));
    }

    dispatch({
      type: "UPLOAD_VIDEO",
      video: {
        id: generateId(),
        uploaderId: state.currentUser.id,
        url: finalUrl,
        caption: caption.trim(),
        hashtags: hashtags.length > 0 ? hashtags : [selectedType],
        likesCount: 0,
        commentsCount: 0,
        createdAt: Date.now(),
        isDeleted: false,
        videoType: selectedType,
        viewsCount: 0,
      },
    });

    setUploading(false);
    setUploadProgress(0);
    setVideoFile(null);
    setVideoUrl("");
    setCaption("");
    setHashtags([]);
    setSelectedType("reel");
    toast.success("🎉 Your reel is live!");
  };

  const handleClear = () => {
    setVideoFile(null);
    setVideoUrl("");
  };

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
            <div
              className="rounded-2xl border border-white/10 p-8 flex flex-col items-center text-center gap-4"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              {user?.role !== "artist" ? (
                <>
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
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <Crown className="w-8 h-8 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg mb-2">
                      Subscription Required
                    </h2>
                    <p className="text-white/50 text-sm leading-relaxed">
                      Your subscription has expired or is inactive. Contact
                      admin to renew.
                    </p>
                  </div>
                </>
              )}
            </div>
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
        {/* Video upload zone */}
        {!videoUrl ? (
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
                MP4, MOV, AVI · Max 60 seconds recommended
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
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
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
              src={videoUrl}
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
                          background:
                            "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
                        }
                      : {}
                  }
                >
                  <span className="font-semibold text-sm">{vt.label}</span>
                  <span
                    className={`text-[10px] leading-tight ${isActive ? "text-white/80" : "text-white/40"}`}
                  >
                    {vt.description}
                  </span>
                </button>
              );
            })}
          </div>
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
          disabled={uploading || !caption.trim()}
          className="w-full h-12 font-bold text-base relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
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
