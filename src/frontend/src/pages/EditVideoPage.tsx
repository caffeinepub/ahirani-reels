import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  Crown,
  Hash,
  Loader2,
  Music,
  Pause,
  Play,
  Type,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { MusicTrack, VideoType } from "../context/AppContext";
import { useApp } from "../context/AppContext";
import { sanitizeText } from "../lib/sanitize";
import { generateId } from "../utils/trending";
import { saveVideoFileToDB } from "../utils/videoDB";

// ─── Filter definitions ───────────────────────────────────────────────────────

type FilterName = "normal" | "warm" | "cool" | "vivid" | "fade" | "bw";

const FILTERS: Array<{ name: FilterName; label: string; css: string }> = [
  { name: "normal", label: "Normal", css: "" },
  { name: "warm", label: "Warm", css: "sepia(0.3) saturate(1.2)" },
  { name: "cool", label: "Cool", css: "hue-rotate(200deg) saturate(0.8)" },
  { name: "vivid", label: "Vivid", css: "saturate(1.8) contrast(1.1)" },
  {
    name: "fade",
    label: "Fade",
    css: "brightness(1.1) contrast(0.8) saturate(0.8)",
  },
  { name: "bw", label: "B&W", css: "grayscale(1)" },
];

const VIDEO_TYPES: Array<{
  type: VideoType;
  label: string;
  hint: string;
  ocid: string;
}> = [
  {
    type: "reel",
    label: "Reel",
    hint: "Max 60s · RPM $2",
    ocid: "edit.type_reel_button",
  },
  {
    type: "long",
    label: "Long",
    hint: "Up to 10 min · RPM $4",
    ocid: "edit.type_long_button",
  },
  {
    type: "premium",
    label: "Premium",
    hint: "Exclusive · Subscribers only",
    ocid: "edit.type_premium_button",
  },
];

type EditTab = "trim" | "filters" | "text" | "speed" | "volume";

const EDIT_TABS: Array<{ id: EditTab; label: string; icon: string }> = [
  { id: "trim", label: "Trim", icon: "✂️" },
  { id: "filters", label: "Filters", icon: "🎨" },
  { id: "text", label: "Text", icon: "💬" },
  { id: "speed", label: "Speed", icon: "⚡" },
  { id: "volume", label: "Volume", icon: "🔊" },
];

// ─── Route state type ─────────────────────────────────────────────────────────

interface EditVideoRouteState {
  videoBlob?: Blob;
  videoFile?: File;
  audioFile?: File | null;
  selectedMusic?: MusicTrack | null;
  fromCamera?: boolean;
  fromAdmin?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditVideoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state ?? {}) as EditVideoRouteState;

  const { state: appState, dispatch } = useApp();
  const fromAdmin = Boolean(routeState.fromAdmin);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Derive video source
  const videoObjectUrl = useMemo(() => {
    if (routeState.videoBlob) {
      return URL.createObjectURL(routeState.videoBlob);
    }
    if (routeState.videoFile) {
      return URL.createObjectURL(routeState.videoFile);
    }
    return "";
  }, [routeState.videoBlob, routeState.videoFile]);

  // Video player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  // Active editing tab
  const [activeTab, setActiveTab] = useState<EditTab>("trim");

  // Editing state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(60);
  const [selectedFilter, setSelectedFilter] = useState<FilterName>("normal");
  const [caption, setCaption] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<VideoType>("reel");
  const [posting, setPosting] = useState(false);

  // New editing state
  const [overlayText, setOverlayText] = useState("");
  const [textSize, setTextSize] = useState<"small" | "medium" | "large">(
    "medium",
  );
  const [textPosition, setTextPosition] = useState<"top" | "center" | "bottom">(
    "center",
  );
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(100);

  // Apply filter to video
  const filterCss = FILTERS.find((f) => f.name === selectedFilter)?.css ?? "";

  // Handle video metadata
  // biome-ignore lint/correctness/useExhaustiveDependencies: videoObjectUrl triggers re-attach
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      const rawDur = video.duration;
      const dur =
        Number.isFinite(rawDur) && rawDur > 0 ? Math.min(rawDur, 60) : 60;
      setDuration(dur);
      setTrimEnd(dur);
    };

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("loadeddata", onLoaded);
    video.load();

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("loadeddata", onLoaded);
    };
  }, [videoObjectUrl]);

  // Apply speed to video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Apply volume to video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.currentTime = trimStart;
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleHashtagAdd = useCallback(() => {
    const tag = hashtagInput.trim().replace(/^#/, "").toLowerCase();
    if (tag && !hashtags.includes(tag)) {
      setHashtags((prev) => [...prev, tag]);
    }
    setHashtagInput("");
  }, [hashtagInput, hashtags]);

  const handleHashtagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleHashtagAdd();
    }
    if (e.key === "Backspace" && !hashtagInput && hashtags.length > 0) {
      setHashtags((prev) => prev.slice(0, -1));
    }
  };

  const captureThumbnail = (): string => {
    const video = videoRef.current;
    if (!video) return "";
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 568;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.7);
    }
    return "";
  };

  const handlePost = async () => {
    if (!fromAdmin && !appState.currentUser) return;
    if (!caption.trim()) {
      toast.error("Add a caption for your reel");
      return;
    }
    if (!videoObjectUrl) {
      toast.error("No video selected");
      return;
    }

    setPosting(true);
    setUploadProgress(5);

    try {
      const thumbnail = captureThumbnail();
      setUploadProgress(20);

      const videoId = generateId();

      let finalVideoUrl: string;
      try {
        const response = await fetch(videoObjectUrl);
        if (!response.ok)
          throw new Error(`Failed to read video: HTTP ${response.status}`);
        const blob = await response.blob();
        setUploadProgress(50);
        const videoFile = new File([blob], "reel.mp4", {
          type: blob.type || "video/mp4",
        });
        await saveVideoFileToDB(videoId, videoFile);
        setUploadProgress(90);
        finalVideoUrl = URL.createObjectURL(blob);
      } catch (readErr) {
        const msg =
          readErr instanceof Error ? readErr.message : String(readErr);
        toast.error(`Upload failed: ${msg}`);
        setPosting(false);
        setUploadProgress(0);
        return;
      }

      setUploadProgress(100);

      const uploaderId = fromAdmin
        ? "admin"
        : (appState.currentUser?.id ?? "admin");

      dispatch({
        type: "UPLOAD_VIDEO",
        video: {
          id: videoId,
          uploaderId,
          url: finalVideoUrl,
          thumbnail,
          caption: sanitizeText(caption),
          hashtags:
            hashtags.length > 0 ? hashtags.map(sanitizeText) : [selectedType],
          likesCount: 0,
          commentsCount: 0,
          createdAt: Date.now(),
          isDeleted: false,
          videoType: selectedType,
          viewsCount: 0,
          adImpressions: 0,
          shareCount: 0,
          // New editing metadata
          speed: speed !== 1 ? speed : undefined,
          volume: volume !== 100 ? volume / 100 : undefined,
          trimStart: trimStart > 0 ? trimStart : undefined,
          trimEnd: trimEnd < duration ? trimEnd : undefined,
          overlayText: overlayText.trim() || undefined,
          textSize: overlayText.trim() ? textSize : undefined,
          textPosition: overlayText.trim() ? textPosition : undefined,
          category: selectedFilter !== "normal" ? selectedFilter : undefined,
        },
      });

      setPosting(false);
      setUploadProgress(0);
      toast.success("Video posted!");
      navigate({ to: fromAdmin ? "/admin" : "/" });
    } catch (unexpectedErr) {
      const msg =
        unexpectedErr instanceof Error
          ? unexpectedErr.message
          : String(unexpectedErr);
      toast.error(`Upload failed: ${msg}`);
      setPosting(false);
      setUploadProgress(0);
    }
  };

  const formatSecs = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const textSizeClass = {
    small: "text-sm",
    medium: "text-xl",
    large: "text-3xl",
  }[textSize];

  const textPositionClass = {
    top: "top-4",
    center: "top-1/2 -translate-y-1/2",
    bottom: "bottom-4",
  }[textPosition];

  // ─── No video fallback ───────────────────────────────────────────────────────

  if (!videoObjectUrl) {
    return (
      <div className="h-full overflow-y-auto bg-background flex flex-col items-center justify-center px-6 text-center gap-4">
        <span className="text-5xl">✂️</span>
        <h2 className="text-white font-bold text-lg">No video to edit</h2>
        <p className="text-white/50 text-sm">
          Record a video or select one from your gallery first.
        </p>
        <Button
          onClick={() =>
            navigate({
              to: "/camera",
              search: fromAdmin ? { from: "admin" } : {},
            })
          }
          style={{ background: "oklch(0.65 0.28 15)" }}
        >
          Open Camera
        </Button>
      </div>
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────────────

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate({
              to: "/camera",
              search: fromAdmin ? { from: "admin" } : {},
            })
          }
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-base font-bold text-white leading-tight">
            Edit & Post
          </h1>
          <p className="text-white/40 text-xs">
            Finalize your reel before posting
          </p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-28">
        {/* ── Video preview ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-black rounded-2xl overflow-hidden"
        >
          <video
            ref={videoRef}
            src={videoObjectUrl}
            className="w-full rounded-2xl"
            style={{
              maxHeight: 280,
              objectFit: "contain",
              filter: filterCss || "none",
            }}
            playsInline
            loop
            preload="metadata"
            onEnded={() => setIsPlaying(false)}
          >
            <source src={videoObjectUrl} type="video/mp4" />
            <source src={videoObjectUrl} type="video/webm" />
            <track kind="captions" />
          </video>

          {/* Text overlay */}
          {overlayText && (
            <div
              className={`absolute left-0 right-0 px-4 text-center pointer-events-none ${textPositionClass}`}
            >
              <span
                className={`text-white font-bold drop-shadow-lg ${textSizeClass}`}
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
              >
                {overlayText}
              </span>
            </div>
          )}

          {/* Play/Pause overlay */}
          <button
            type="button"
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className={`w-12 h-12 rounded-full bg-black/50 backdrop-blur flex items-center justify-center transition-opacity ${
                isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
              }`}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </div>
          </button>

          {/* Speed badge */}
          {speed !== 1 && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-purple-600/80 text-white text-xs border-0">
                {speed}× Speed
              </Badge>
            </div>
          )}

          {/* Filter badge */}
          {selectedFilter !== "normal" && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-black/60 text-white text-xs border-0">
                {FILTERS.find((f) => f.name === selectedFilter)?.label}
              </Badge>
            </div>
          )}
        </motion.div>

        {/* ── Edit Tabs ── */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
          {EDIT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-ocid={`edit.${tab.id}.tab`}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "text-white"
                  : "bg-white/5 border border-white/10 text-white/50"
              }`}
              style={
                activeTab === tab.id
                  ? { background: "oklch(0.65 0.28 15)" }
                  : {}
              }
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          {/* TRIM TAB */}
          {activeTab === "trim" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  ✂️ Trim Video
                </h3>
                <span className="text-xs text-white/50 tabular-nums font-mono">
                  {formatSecs(trimStart)} – {formatSecs(trimEnd)}
                  {duration > 0 && (
                    <span className="text-white/30">
                      {" "}
                      / {formatSecs(duration)}
                    </span>
                  )}
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-white/60">Start</span>
                    <span className="text-xs text-white/40 font-mono">
                      {formatSecs(trimStart)}
                    </span>
                  </div>
                  <input
                    type="range"
                    data-ocid="edit.trim_start.input"
                    min={0}
                    max={duration || 60}
                    step={0.1}
                    value={trimStart}
                    onChange={(e) => {
                      const v = Number.parseFloat(e.target.value);
                      setTrimStart(Math.min(v, trimEnd - 0.5));
                      if (videoRef.current) videoRef.current.currentTime = v;
                    }}
                    className="w-full accent-white h-1.5 rounded-full bg-white/20 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-white/60">End</span>
                    <span className="text-xs text-white/40 font-mono">
                      {formatSecs(trimEnd)}
                    </span>
                  </div>
                  <input
                    type="range"
                    data-ocid="edit.trim_end.input"
                    min={0}
                    max={duration || 60}
                    step={0.1}
                    value={trimEnd}
                    onChange={(e) => {
                      const v = Number.parseFloat(e.target.value);
                      setTrimEnd(Math.max(v, trimStart + 0.5));
                    }}
                    className="w-full accent-white h-1.5 rounded-full bg-white/20 cursor-pointer"
                  />
                </div>
              </div>

              {/* Trim duration display */}
              <div className="bg-white/5 rounded-xl px-3 py-2 text-center">
                <p className="text-white/40 text-xs">Duration after trim</p>
                <p className="text-white font-bold font-mono">
                  {formatSecs(Math.max(0, trimEnd - trimStart))}
                </p>
              </div>
            </div>
          )}

          {/* FILTERS TAB */}
          {activeTab === "filters" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">🎨 Filters</h3>
              <div
                data-ocid="edit.filter.tab"
                className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
              >
                {FILTERS.map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => setSelectedFilter(f.name)}
                    className="shrink-0 flex flex-col items-center gap-1 active:scale-95 transition-transform"
                  >
                    <div
                      className={`w-16 h-16 rounded-xl overflow-hidden ring-2 transition-all ${
                        selectedFilter === f.name
                          ? "ring-white scale-105"
                          : "ring-transparent"
                      }`}
                    >
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage:
                            "linear-gradient(135deg, #ff6b6b 0%, #ffd93d 50%, #6c5ce7 100%)",
                          filter: f.css || "none",
                        }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-medium ${
                        selectedFilter === f.name
                          ? "text-white"
                          : "text-white/50"
                      }`}
                    >
                      {f.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TEXT TAB */}
          {activeTab === "text" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">
                💬 Text Overlay
              </h3>

              <div>
                <Input
                  data-ocid="edit.overlay_text.input"
                  placeholder="Add text overlay..."
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 text-sm"
                />
              </div>

              {/* Font size */}
              <div className="space-y-2">
                <p className="text-xs text-white/60">Font Size</p>
                <div className="flex gap-2">
                  {(["small", "medium", "large"] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      data-ocid={`edit.text_size_${sz}.button`}
                      onClick={() => setTextSize(sz)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                        textSize === sz
                          ? "text-white"
                          : "bg-white/5 border border-white/10 text-white/50"
                      }`}
                      style={
                        textSize === sz
                          ? { background: "oklch(0.65 0.28 15)" }
                          : {}
                      }
                    >
                      {sz === "small" ? "A" : sz === "medium" ? "AA" : "AAA"}
                      <span className="block text-[9px] mt-0.5 opacity-70">
                        {sz}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text position */}
              <div className="space-y-2">
                <p className="text-xs text-white/60">Position</p>
                <div className="flex gap-2">
                  {(["top", "center", "bottom"] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      data-ocid={`edit.text_pos_${pos}.button`}
                      onClick={() => setTextPosition(pos)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                        textPosition === pos
                          ? "text-white"
                          : "bg-white/5 border border-white/10 text-white/50"
                      }`}
                      style={
                        textPosition === pos
                          ? { background: "oklch(0.65 0.28 15)" }
                          : {}
                      }
                    >
                      {pos === "top" ? "⬆️" : pos === "center" ? "⬛" : "⬇️"}
                      <span className="block text-[9px] mt-0.5 opacity-70">
                        {pos}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {overlayText && (
                <p className="text-xs text-white/40 text-center">
                  Preview visible on the video above
                </p>
              )}
            </div>
          )}

          {/* SPEED TAB */}
          {activeTab === "speed" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">
                ⚡ Playback Speed
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    type="button"
                    data-ocid={`edit.speed_${String(s).replace(".", "_")}.button`}
                    onClick={() => setSpeed(s)}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${
                      speed === s
                        ? "text-white"
                        : "bg-white/5 border border-white/10 text-white/50"
                    }`}
                    style={
                      speed === s ? { background: "oklch(0.65 0.28 15)" } : {}
                    }
                  >
                    {s}×
                  </button>
                ))}
              </div>
              <div className="bg-white/5 rounded-xl px-3 py-2 text-center">
                <p className="text-white/40 text-xs">Current speed</p>
                <p className="text-white font-bold text-2xl">{speed}×</p>
                {speed === 0.5 && (
                  <p className="text-purple-300 text-xs mt-1">Slow Motion</p>
                )}
                {speed === 2 && (
                  <p className="text-amber-300 text-xs mt-1">Fast Forward</p>
                )}
              </div>
            </div>
          )}

          {/* VOLUME TAB */}
          {activeTab === "volume" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">🔊 Volume</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60">🔇 Mute</span>
                  <span className="text-sm font-bold text-white tabular-nums">
                    {volume}%
                  </span>
                  <span className="text-xs text-white/60">🔊 Max</span>
                </div>
                <input
                  type="range"
                  data-ocid="edit.volume.input"
                  min={0}
                  max={100}
                  step={1}
                  value={volume}
                  onChange={(e) => {
                    const v = Number.parseInt(e.target.value);
                    setVolume(v);
                    if (videoRef.current) videoRef.current.volume = v / 100;
                  }}
                  className="w-full accent-white h-2 rounded-full bg-white/20 cursor-pointer"
                />
              </div>
              <div className="bg-white/5 rounded-xl px-3 py-2 text-center">
                <p className="text-white/40 text-xs">Volume level</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className="flex gap-0.5 items-end h-6">
                    {[20, 40, 60, 80, 100].map((level) => (
                      <div
                        key={level}
                        className="w-1.5 rounded-sm transition-all"
                        style={{
                          height: `${(level / 100) * 24}px`,
                          background:
                            volume >= level
                              ? "oklch(0.65 0.28 15)"
                              : "oklch(0.3 0 0)",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-white font-bold text-lg">
                    {volume}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Audio track ── */}
        {routeState.audioFile && (
          <section className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <Music className="w-5 h-5 text-purple-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {routeState.audioFile.name}
              </p>
              <p className="text-white/40 text-xs">Custom audio track</p>
            </div>
            <Badge className="bg-green-600/30 border-green-500/40 text-green-300 text-xs">
              Added
            </Badge>
          </section>
        )}

        {/* ── Ahirani Music track ── */}
        {routeState.selectedMusic && (
          <section
            className="flex items-center gap-3 rounded-xl px-4 py-3 border"
            style={{
              background: "oklch(0.65 0.28 15 / 0.1)",
              borderColor: "oklch(0.65 0.28 15 / 0.3)",
            }}
          >
            <div
              className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
              style={{
                background: routeState.selectedMusic.coverColor
                  ? `radial-gradient(circle at 30% 30%, ${routeState.selectedMusic.coverColor}, oklch(0.15 0.05 0))`
                  : "oklch(0.65 0.28 15 / 0.4)",
              }}
            >
              <Music className="w-4 h-4 text-white/80" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {routeState.selectedMusic.title}
              </p>
              <p className="text-white/50 text-xs truncate">
                {routeState.selectedMusic.artist} · अहिराणी Library
              </p>
            </div>
            <Badge
              className="text-white text-xs border-0 shrink-0"
              style={{ background: "oklch(0.65 0.28 15)" }}
            >
              अहिराणी
            </Badge>
          </section>
        )}

        {/* ── Caption ── */}
        <section className="space-y-2">
          <label
            htmlFor="edit-caption"
            className="flex items-center gap-2 text-sm font-medium text-white/70"
          >
            <Type className="w-4 h-4" />
            Caption
          </label>
          <Textarea
            id="edit-caption"
            data-ocid="edit.caption.textarea"
            placeholder="Write a caption for your reel..."
            value={caption}
            onChange={(e) => {
              if (e.target.value.length <= 150) setCaption(e.target.value);
            }}
            rows={3}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/30 resize-none text-sm"
          />
          <p className="text-right text-xs text-white/30">
            {caption.length}/150
          </p>
        </section>

        {/* ── Hashtags ── */}
        <section className="space-y-2">
          <label
            htmlFor="edit-hashtag"
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
                  onClick={() =>
                    setHashtags((prev) => prev.filter((t) => t !== tag))
                  }
                >
                  #{tag} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              id="edit-hashtag"
              data-ocid="edit.hashtag.input"
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
        </section>

        {/* ── Video type ── */}
        <section className="space-y-2">
          <p className="text-sm font-medium text-white/70">Video Type</p>
          <div className="grid grid-cols-3 gap-2">
            {VIDEO_TYPES.map((vt) => {
              const isActive = selectedType === vt.type;
              const isPremium = vt.type === "premium";
              return (
                <button
                  key={vt.type}
                  type="button"
                  data-ocid={vt.ocid}
                  onClick={() => setSelectedType(vt.type)}
                  className={`flex flex-col items-center gap-1 rounded-xl px-3 py-3 border text-center transition-all ${
                    isActive
                      ? "border-transparent text-white"
                      : "border-white/10 text-white/60 hover:border-white/20 bg-white/5"
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
                      className={`w-3 h-3 ${isActive ? "text-amber-200" : "text-amber-500/60"}`}
                    />
                  )}
                  <span className="font-semibold text-sm">{vt.label}</span>
                  <span
                    className={`text-[10px] leading-tight ${isActive ? "text-white/80" : "text-white/40"}`}
                  >
                    {vt.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── Sticky post button ── */}
      <div className="fixed bottom-0 inset-x-0 z-30 px-4 pb-safe pb-4 pt-3 bg-gradient-to-t from-background via-background/95 to-transparent">
        <Button
          data-ocid="edit.submit_button"
          onClick={handlePost}
          disabled={posting || !caption.trim()}
          className="w-full h-12 font-bold text-base relative overflow-hidden"
          style={{
            background: posting
              ? "oklch(0.3 0.04 15)"
              : "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
          }}
        >
          {/* Progress bar overlay */}
          {posting && uploadProgress > 0 && (
            <motion.div
              className="absolute inset-y-0 left-0 bg-white/20 rounded-lg"
              initial={{ width: "0%" }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ ease: "linear" }}
            />
          )}
          {posting ? (
            <span className="relative flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploadProgress > 0
                ? `Uploading ${uploadProgress}%`
                : "Processing..."}
            </span>
          ) : (
            "🚀 Post Reel"
          )}
        </Button>
      </div>
    </div>
  );
}
