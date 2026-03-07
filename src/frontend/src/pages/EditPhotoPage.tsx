import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Hash, ImageIcon, Loader2, Type, X } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { generateId } from "../utils/trending";

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

// ─── Route state type ─────────────────────────────────────────────────────────

interface EditPhotoRouteState {
  photoBlob?: Blob;
  photoFile?: File;
  fromAdmin?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditPhotoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state ?? {}) as EditPhotoRouteState;

  const { state: appState, dispatch } = useApp();
  const fromAdmin = Boolean(routeState.fromAdmin);

  // Derive photo URL
  const photoObjectUrl = useMemo(() => {
    if (routeState.photoBlob) {
      return URL.createObjectURL(routeState.photoBlob);
    }
    if (routeState.photoFile) {
      return URL.createObjectURL(routeState.photoFile);
    }
    return "";
  }, [routeState.photoBlob, routeState.photoFile]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (photoObjectUrl) URL.revokeObjectURL(photoObjectUrl);
    };
  }, [photoObjectUrl]);

  // Editing state
  const [selectedFilter, setSelectedFilter] = useState<FilterName>("normal");
  const [caption, setCaption] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);

  const filterCss = FILTERS.find((f) => f.name === selectedFilter)?.css ?? "";

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

  const handlePost = async () => {
    if (!fromAdmin && !appState.currentUser) return;
    if (!caption.trim()) {
      toast.error("Add a caption for your photo");
      return;
    }
    if (!photoObjectUrl) {
      toast.error("No photo selected");
      return;
    }

    setPosting(true);

    // Simulate brief upload delay
    await new Promise((r) => setTimeout(r, 600));

    const uploaderId = fromAdmin
      ? "admin"
      : (appState.currentUser?.id ?? "admin");

    dispatch({
      type: "UPLOAD_VIDEO",
      video: {
        id: generateId(),
        uploaderId,
        url: photoObjectUrl,
        caption: caption.trim(),
        hashtags: hashtags.length > 0 ? hashtags : ["photo"],
        likesCount: 0,
        commentsCount: 0,
        createdAt: Date.now(),
        isDeleted: false,
        videoType: "reel",
        viewsCount: 0,
        adImpressions: 0,
        shareCount: 0,
        mediaType: "photo",
      },
    });

    setPosting(false);
    toast.success("📷 Photo posted!");
    navigate({ to: fromAdmin ? "/admin" : "/" });
  };

  // ─── No photo fallback ───────────────────────────────────────────────────────

  if (!photoObjectUrl) {
    return (
      <div className="h-full overflow-y-auto bg-background flex flex-col items-center justify-center px-6 text-center gap-4">
        <ImageIcon className="w-12 h-12 text-white/20" />
        <h2 className="text-white font-bold text-lg">No photo to edit</h2>
        <p className="text-white/50 text-sm">
          Capture a photo or select one from your gallery first.
        </p>
        <Button
          onClick={() =>
            navigate({
              to: "/camera",
              search: fromAdmin
                ? { from: "admin", mode: "photo" }
                : { mode: "photo" },
            })
          }
          style={{ background: "oklch(0.55 0.22 150)" }}
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
              search: fromAdmin
                ? { from: "admin", mode: "photo" }
                : { mode: "photo" },
            })
          }
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-base font-bold text-white leading-tight">
            Edit &amp; Post Photo
          </h1>
          <p className="text-white/40 text-xs">
            Finalize your photo before posting
          </p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-28">
        {/* ── Photo preview ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-black rounded-2xl overflow-hidden"
        >
          <img
            src={photoObjectUrl}
            alt={caption || "Photo preview"}
            className="w-full rounded-2xl"
            style={{
              maxHeight: 340,
              objectFit: "contain",
              filter: filterCss || "none",
              display: "block",
            }}
          />

          {/* Photo badge */}
          <div className="absolute top-2 left-2">
            <Badge className="bg-emerald-500/80 text-white border-transparent text-[9px] px-1.5 py-0 font-semibold">
              📷 Photo
            </Badge>
          </div>
        </motion.div>

        {/* ── Filter selector ── */}
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-white/80">Filter</h3>
          <div
            data-ocid="edit_photo.filter.tab"
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
                  className={`w-14 h-14 rounded-xl overflow-hidden ring-2 transition-all ${
                    selectedFilter === f.name
                      ? "ring-emerald-400 scale-105"
                      : "ring-transparent"
                  }`}
                >
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #6ee7b7 0%, #3b82f6 50%, #9333ea 100%)",
                      filter: f.css || "none",
                    }}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    selectedFilter === f.name
                      ? "text-emerald-400"
                      : "text-white/50"
                  }`}
                >
                  {f.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Caption ── */}
        <section className="space-y-2">
          <label
            htmlFor="photo-caption"
            className="flex items-center gap-2 text-sm font-medium text-white/70"
          >
            <Type className="w-4 h-4" />
            Caption
          </label>
          <Textarea
            id="photo-caption"
            data-ocid="edit_photo.caption.textarea"
            placeholder="Write a caption for your photo..."
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
            htmlFor="photo-hashtag"
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
                  className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 cursor-pointer"
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
              id="photo-hashtag"
              data-ocid="edit_photo.hashtag.input"
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
      </div>

      {/* ── Sticky post button ── */}
      <div className="fixed bottom-0 inset-x-0 z-30 px-4 pb-safe pb-4 pt-3 bg-gradient-to-t from-background via-background/95 to-transparent">
        <Button
          data-ocid="edit_photo.submit_button"
          onClick={handlePost}
          disabled={posting || !caption.trim()}
          className="w-full h-12 font-bold text-base"
          style={{
            background: posting
              ? "oklch(0.3 0.04 150)"
              : "linear-gradient(135deg, oklch(0.55 0.22 150), oklch(0.5 0.2 165))",
          }}
        >
          {posting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Posting...
            </span>
          ) : (
            "📷 Post Photo"
          )}
        </Button>
      </div>
    </div>
  );
}
