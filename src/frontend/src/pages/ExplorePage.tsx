import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ChevronLeft,
  Compass,
  Eye,
  Flag,
  Heart,
  MessageCircle,
  Music,
  Send,
  Share2,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArtistProfileSheet } from "../components/ArtistProfileSheet";
import { ReportSheet } from "../components/ReportSheet";
import { ShareSheet } from "../components/ShareSheet";
import {
  useApp,
  useIsFollowing,
  useUserById,
  useVideoComments,
} from "../context/AppContext";
import type { Video } from "../context/AppContext";
import {
  type ExploreCategory,
  type SortMode,
  formatCount,
  formatTime,
  generateId,
  getExploreFeed,
} from "../utils/trending";

// ─── Types ────────────────────────────────────────────────────────────────────

const CATEGORIES: { id: ExploreCategory; label: string; emoji: string }[] = [
  { id: "all", label: "All", emoji: "🌐" },
  { id: "Comedy", label: "Comedy", emoji: "😂" },
  { id: "Music", label: "Music", emoji: "🎵" },
  { id: "Dance", label: "Dance", emoji: "💃" },
  { id: "Short Films", label: "Short Films", emoji: "🎬" },
  { id: "Ahirani Culture", label: "Ahirani Culture", emoji: "🏮" },
];

const FILTERS: { id: SortMode; label: string }[] = [
  { id: "trending", label: "🔥 Trending" },
  { id: "latest", label: "🕐 Latest" },
  { id: "most_viewed", label: "👁 Most Viewed" },
  { id: "most_liked", label: "❤️ Most Liked" },
];

// ─── Explore Comment Sheet ────────────────────────────────────────────────────

function ExploreCommentSheet({
  videoId,
  open,
  onClose,
}: {
  videoId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { state, dispatch } = useApp();
  const comments = useVideoComments(videoId);
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim() || !state.currentUser) return;
    dispatch({
      type: "ADD_COMMENT",
      comment: {
        id: generateId(),
        videoId,
        userId: state.currentUser.id,
        text: text.trim(),
        createdAt: Date.now(),
      },
    });
    setText("");
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="bg-[oklch(0.1_0_0)] border-t border-white/10 rounded-t-2xl"
        style={{ maxHeight: "70dvh" }}
      >
        <SheetHeader className="pb-3 border-b border-white/10">
          <SheetTitle className="text-white text-center">
            {comments.length} Comments
          </SheetTitle>
        </SheetHeader>
        <div
          className="overflow-y-auto flex-1 py-3 space-y-4"
          style={{ maxHeight: "calc(70dvh - 140px)" }}
        >
          {comments.length === 0 ? (
            <p className="text-center text-white/40 py-8 text-sm">
              No comments yet. Be the first!
            </p>
          ) : (
            comments.map((comment) => {
              const user = state.users.find((u) => u.id === comment.userId);
              return (
                <div key={comment.id} className="flex gap-3 px-1">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-white/10 text-white text-xs">
                      {user?.username?.[0]?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-white/80 text-xs font-semibold mr-2">
                      @{user?.username ?? "user"}
                    </span>
                    <span className="text-white/50 text-xs">
                      {formatTime(comment.createdAt)}
                    </span>
                    <p className="text-white text-sm mt-0.5">{comment.text}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="flex gap-2 pt-3 border-t border-white/10">
          <Input
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/30 text-sm flex-1"
          />
          <Button
            type="button"
            size="icon"
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="shrink-0"
            style={{
              background: text.trim() ? "oklch(0.65 0.28 15)" : undefined,
            }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Explore Reel Card (full-screen player) ───────────────────────────────────

function ExploreReelCard({
  video,
  index,
  isActive,
  onSeen,
  uploaderVideoCount,
}: {
  video: Video;
  index: number;
  isActive: boolean;
  onSeen: (id: string) => void;
  uploaderVideoCount: number;
}) {
  const { state, dispatch } = useApp();
  const uploader = useUserById(video.uploaderId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const seenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [likePulse, setLikePulse] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isFollowing = useIsFollowing(video.uploaderId);
  const isCurrentUserVideo = state.currentUser?.id === video.uploaderId;
  const isPhoto = video.mediaType === "photo";
  const isNewCreator = uploaderVideoCount < 5;

  const handleVideoTap = () => {
    const vid = videoRef.current;
    if (!vid || isPhoto) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setIsPaused(false);
    } else {
      vid.pause();
      setIsPaused(true);
    }
  };

  // Autoplay control
  useEffect(() => {
    if (isPhoto) {
      if (isActive) {
        seenTimerRef.current = setTimeout(() => onSeen(video.id), 1000);
      } else {
        if (seenTimerRef.current) clearTimeout(seenTimerRef.current);
      }
      return () => {
        if (seenTimerRef.current) clearTimeout(seenTimerRef.current);
      };
    }
    const vid = videoRef.current;
    if (!vid) return;

    if (isActive) {
      const tryPlay = () => {
        vid.play().catch(() => {
          setTimeout(() => vid.play().catch(() => {}), 400);
        });
      };
      if (vid.readyState === 0) {
        vid.load();
        const onCanPlay = () => {
          tryPlay();
          vid.removeEventListener("canplay", onCanPlay);
        };
        vid.addEventListener("canplay", onCanPlay);
        seenTimerRef.current = setTimeout(() => {
          vid.removeEventListener("canplay", onCanPlay);
          tryPlay();
        }, 800);
      } else {
        tryPlay();
        seenTimerRef.current = setTimeout(() => onSeen(video.id), 2000);
      }
    } else {
      vid.pause();
      vid.currentTime = 0;
      if (seenTimerRef.current) clearTimeout(seenTimerRef.current);
    }
    return () => {
      if (seenTimerRef.current) clearTimeout(seenTimerRef.current);
    };
  }, [isActive, video.id, onSeen, isPhoto]);

  const handleLike = () => {
    if (!state.currentUser) return;
    const isCurrentlyLiked = state.likedVideoIds.includes(video.id);
    dispatch({
      type: "LIKE_VIDEO",
      videoId: video.id,
      userId: state.currentUser.id,
    });
    if (!isCurrentlyLiked) {
      setLikePulse(true);
      setTimeout(() => setLikePulse(false), 300);
    }
  };

  const handleFollow = () => {
    if (!state.currentUser) return;
    dispatch({
      type: isFollowing ? "UNFOLLOW" : "FOLLOW",
      targetUserId: video.uploaderId,
    });
    if (!isFollowing) {
      toast.success("Following!");
    }
  };

  const currentLikes =
    state.videos.find((v) => v.id === video.id)?.likesCount ?? video.likesCount;
  const currentComments =
    state.videos.find((v) => v.id === video.id)?.commentsCount ??
    video.commentsCount;
  const currentViews =
    state.videos.find((v) => v.id === video.id)?.viewsCount ?? video.viewsCount;
  const isLiked = state.likedVideoIds.includes(video.id);

  return (
    <div
      data-ocid={`explore.player.reel.item.${index + 1}`}
      className="explore-reel-card relative w-full flex-shrink-0"
      style={{ height: "100dvh" }}
    >
      {/* Video or Photo */}
      {isPhoto ? (
        <img
          src={video.url}
          alt={video.caption}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <>
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={video.url}
            muted
            loop
            playsInline
            preload="auto"
            onError={(e) => {
              const vid = e.currentTarget;
              setTimeout(() => {
                vid.load();
                if (isActive) vid.play().catch(() => {});
              }, 600);
            }}
            onLoadedMetadata={(e) => {
              if (isActive) e.currentTarget.play().catch(() => {});
            }}
            onPlay={() => setIsPaused(false)}
            onPause={() => setIsPaused(true)}
          >
            <track kind="captions" />
          </video>
          <button
            type="button"
            aria-label={isPaused ? "Play video" : "Pause video"}
            onClick={handleVideoTap}
            className="absolute inset-0 z-[5] w-full h-full"
            style={{ background: "transparent" }}
          />
          {isPaused && (
            <div className="absolute inset-0 z-[6] flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-8 h-8 ml-1"
                  role="img"
                  aria-label="Play"
                >
                  <title>Play</title>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </>
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)",
        }}
      />

      {/* New Creator badge */}
      {isNewCreator && (
        <div className="absolute top-4 left-3 z-10">
          <Badge
            variant="secondary"
            className="text-[9px] px-2 py-0.5 font-bold tracking-wide"
            style={{
              background: "oklch(0.55 0.18 185 / 0.9)",
              color: "white",
              borderColor: "transparent",
            }}
          >
            ✨ New Creator
          </Badge>
        </div>
      )}

      {/* Right action column */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-10">
        {/* Avatar + Follow */}
        <div className="relative">
          <Avatar className="w-12 h-12 border-2 border-white">
            <AvatarImage src={uploader?.avatar} />
            <AvatarFallback className="bg-white/20 text-white font-bold">
              {uploader?.username?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          {!isCurrentUserVideo && (
            <button
              type="button"
              onClick={handleFollow}
              className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-black flex items-center justify-center transition-colors ${
                isFollowing ? "bg-emerald-500" : "bg-reels-pink"
              }`}
              aria-label={isFollowing ? "Unfollow" : "Follow"}
            >
              {isFollowing ? (
                <UserCheck className="w-2.5 h-2.5 text-white" />
              ) : (
                <UserPlus className="w-2.5 h-2.5 text-white" />
              )}
            </button>
          )}
        </div>

        {/* Like */}
        <button
          type="button"
          data-ocid={`explore.player.like_button.${index + 1}`}
          onClick={handleLike}
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <motion.div
            animate={likePulse ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`w-8 h-8 transition-colors drop-shadow-lg ${
                isLiked
                  ? "fill-reels-pink text-reels-pink"
                  : "text-white fill-none"
              }`}
            />
          </motion.div>
          <span className="text-white text-xs font-semibold drop-shadow">
            {formatCount(currentLikes)}
          </span>
        </button>

        {/* Comment */}
        <button
          type="button"
          data-ocid={`explore.player.comment_button.${index + 1}`}
          onClick={() => setCommentOpen(true)}
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <MessageCircle className="w-8 h-8 text-white drop-shadow-lg" />
          <span className="text-white text-xs font-semibold drop-shadow">
            {formatCount(currentComments)}
          </span>
        </button>

        {/* Share */}
        <button
          type="button"
          data-ocid={`explore.player.share_button.${index + 1}`}
          onClick={() => setShareOpen(true)}
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <Share2 className="w-8 h-8 text-white drop-shadow-lg" />
          <span className="text-white text-xs font-semibold drop-shadow">
            Share
          </span>
        </button>

        {/* Views */}
        <div className="flex flex-col items-center gap-1">
          <Eye className="w-6 h-6 text-white/70 drop-shadow-lg" />
          <span className="text-white/70 text-xs font-semibold drop-shadow">
            {formatCount(currentViews)}
          </span>
        </div>
      </div>

      {/* Bottom overlay */}
      <div className="absolute bottom-20 left-3 right-16 z-10">
        <button
          type="button"
          onClick={() => setProfileSheetOpen(true)}
          className="text-white font-bold text-sm hover:underline focus:outline-none active:opacity-70 transition-opacity mb-1"
        >
          @{uploader?.username ?? "user"}
        </button>
        <p className="text-white/90 text-sm leading-snug line-clamp-2 mb-1">
          {video.caption}
        </p>
        <div className="flex flex-wrap gap-1 mb-2">
          {video.hashtags.map((tag) => (
            <span key={tag} className="text-reels-pink text-xs font-medium">
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={isActive ? { rotate: 360 } : {}}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <Music className="w-3.5 h-3.5 text-white/70" />
          </motion.div>
          <span className="text-white/70 text-xs">
            Original Sound · @{uploader?.username}
          </span>
        </div>
      </div>

      {/* Comment sheet */}
      <ExploreCommentSheet
        videoId={video.id}
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
      />

      {/* Share sheet */}
      <ShareSheet
        videoId={video.id}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        onShare={() => {
          if (state.currentUser) {
            dispatch({
              type: "SHARE_VIDEO_BOOST",
              videoId: video.id,
              userId: state.currentUser.id,
            });
          }
        }}
      />

      {/* Artist profile sheet */}
      <ArtistProfileSheet
        artistId={video.uploaderId}
        open={profileSheetOpen}
        onClose={() => setProfileSheetOpen(false)}
      />

      {/* Report sheet */}
      <ReportSheet
        open={reportSheetOpen}
        onOpenChange={setReportSheetOpen}
        videoId={video.id}
      />

      {/* Report trigger - via long press hint */}
      <button
        type="button"
        data-ocid={`explore.player.report_button.${index + 1}`}
        onClick={() => setReportSheetOpen(true)}
        className="absolute top-4 right-3 z-10 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm"
        aria-label="Report"
      >
        <Flag className="w-4 h-4 text-white/60" />
      </button>
    </div>
  );
}

// ─── Video Grid Card ──────────────────────────────────────────────────────────

function VideoGridCard({
  video,
  index,
  uploaderVideoCount,
  onTap,
}: {
  video: Video;
  index: number;
  uploaderVideoCount: number;
  onTap: () => void;
}) {
  const uploader = useUserById(video.uploaderId);
  const isNewCreator = uploaderVideoCount < 5;
  const isPhoto = video.mediaType === "photo";

  return (
    <motion.button
      type="button"
      data-ocid={`explore.grid.item.${index + 1}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, delay: (index % 6) * 0.04 }}
      onClick={onTap}
      className="relative w-full overflow-hidden rounded-xl focus:outline-none active:scale-95 transition-transform"
      style={{ aspectRatio: "9/16" }}
    >
      {/* Thumbnail */}
      {isPhoto ? (
        <img
          src={video.url}
          alt={video.caption}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <video
          src={video.url}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          playsInline
          preload="metadata"
        >
          <track kind="captions" />
        </video>
      )}

      {/* Bottom gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)",
        }}
      />

      {/* New Creator badge */}
      {isNewCreator && (
        <div className="absolute top-1.5 left-1.5 z-10">
          <span
            className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
            style={{
              background: "oklch(0.55 0.18 185 / 0.92)",
              color: "white",
            }}
          >
            ✨ New
          </span>
        </div>
      )}

      {/* Photo badge */}
      {isPhoto && (
        <div className="absolute top-1.5 right-1.5 z-10">
          <span
            className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
            style={{
              background: "oklch(0.55 0.18 150 / 0.92)",
              color: "white",
            }}
          >
            📷
          </span>
        </div>
      )}

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-2 pb-2">
        <p className="text-white text-[10px] font-medium truncate mb-1">
          @{uploader?.username ?? "user"}
        </p>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-0.5 text-white/80 text-[10px]">
            <Heart className="w-2.5 h-2.5 fill-reels-pink text-reels-pink" />
            {formatCount(video.likesCount)}
          </span>
          <span className="flex items-center gap-0.5 text-white/60 text-[10px]">
            <Eye className="w-2.5 h-2.5" />
            {formatCount(video.viewsCount)}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Full-Screen Player Overlay ───────────────────────────────────────────────

function FullScreenPlayer({
  feed,
  startIndex,
  uploaderCounts,
  onClose,
}: {
  feed: Video[];
  startIndex: number;
  uploaderCounts: Record<string, number>;
  onClose: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const feedRef = useRef<HTMLDivElement>(null);

  const handleSeen = useCallback((_id: string) => {
    // Just track in explore player — no complex seen tracking needed here
  }, []);

  // Intersection observer for active video tracking
  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;

    const cards = container.querySelectorAll(".explore-reel-card");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const idx = Array.from(cards).indexOf(entry.target as Element);
            if (idx !== -1) setActiveIndex(idx);
          }
        }
      },
      { threshold: 0.5, root: container },
    );
    for (const card of cards) observer.observe(card);
    return () => observer.disconnect();
  }, []);

  // Scroll to start index on mount
  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;
    // Small timeout to ensure DOM is rendered
    setTimeout(() => {
      const cards = container.querySelectorAll(".explore-reel-card");
      const targetCard = cards[startIndex] as HTMLElement | undefined;
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: "instant" });
      }
    }, 50);
  }, [startIndex]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Back button */}
      <button
        type="button"
        data-ocid="explore.player.close_button"
        onClick={onClose}
        className="absolute top-4 left-3 z-[60] flex items-center gap-1.5 px-3 py-2 rounded-full font-semibold text-sm text-white transition-all active:scale-95"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Scrollable reel container */}
      <div
        ref={feedRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {feed.map((video, index) => (
          <div key={video.id} className="snap-start snap-always">
            <ExploreReelCard
              video={video}
              index={index}
              isActive={index === activeIndex}
              onSeen={handleSeen}
              uploaderVideoCount={uploaderCounts[video.uploaderId] ?? 0}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Explore Page ─────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const { state } = useApp();
  const [activeCategory, setActiveCategory] = useState<ExploreCategory>("all");
  const [sortMode, setSortMode] = useState<SortMode>("trending");
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerStartIndex, setPlayerStartIndex] = useState(0);

  const exploreFeed = getExploreFeed(state.videos, activeCategory, sortMode);

  // Uploader video counts for new-creator detection
  const uploaderCounts: Record<string, number> = {};
  for (const v of state.videos.filter((v) => !v.isDeleted)) {
    uploaderCounts[v.uploaderId] = (uploaderCounts[v.uploaderId] ?? 0) + 1;
  }

  const handleGridTap = (index: number) => {
    setPlayerStartIndex(index);
    setPlayerOpen(true);
  };

  return (
    <div
      data-ocid="explore.page"
      className="relative w-full h-full bg-black flex flex-col overflow-hidden"
    >
      {/* ── Header ── */}
      <div
        className="flex-shrink-0 px-4 pt-4 pb-2 z-20"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 100%)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Title row */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.55 0.22 50))",
            }}
          >
            <Compass
              className="w-4.5 h-4.5 text-white"
              style={{ width: 18, height: 18 }}
            />
          </div>
          <div>
            <h1
              className="text-white font-bold text-lg leading-none"
              style={{ fontFamily: "var(--font-display, system-ui)" }}
            >
              Explore
            </h1>
            <p className="text-white/40 text-[10px]">
              Discover Ahirani Content
            </p>
          </div>
        </div>

        {/* Category tabs (scrollable) */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 mb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {CATEGORIES.map((cat, i) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                data-ocid={`explore.category.tab.${i + 1}`}
                onClick={() => setActiveCategory(cat.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.55 0.22 340))"
                    : "rgba(255,255,255,0.08)",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                  border: isActive ? "none" : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter chips */}
        <div
          className="flex gap-2 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {FILTERS.map((filter, i) => {
            const isActive = sortMode === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                data-ocid={`explore.filter.tab.${i + 1}`}
                onClick={() => setSortMode(filter.id)}
                className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                style={{
                  background: isActive
                    ? "oklch(0.55 0.22 50 / 0.85)"
                    : "rgba(255,255,255,0.06)",
                  color: isActive
                    ? "oklch(0.95 0.05 80)"
                    : "rgba(255,255,255,0.45)",
                  border: isActive
                    ? "1px solid oklch(0.6 0.22 60 / 0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Grid ── */}
      <div
        className="flex-1 overflow-y-auto pb-24"
        style={{ scrollbarWidth: "none" }}
      >
        {exploreFeed.length === 0 ? (
          <div
            data-ocid="explore.grid.empty_state"
            className="flex flex-col items-center justify-center gap-4 py-24 px-8 text-center"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Compass className="w-8 h-8 text-white/30" />
            </div>
            <div>
              <p className="text-white/60 font-semibold text-sm mb-1">
                No reels in this category yet.
              </p>
              <p className="text-white/30 text-xs">
                Be the first to upload{" "}
                {activeCategory !== "all" ? `in ${activeCategory}` : "here"}!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 p-2">
            {exploreFeed.map((video, index) => (
              <VideoGridCard
                key={video.id}
                video={video}
                index={index}
                uploaderVideoCount={uploaderCounts[video.uploaderId] ?? 0}
                onTap={() => handleGridTap(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Full-Screen Vertical Player ── */}
      <AnimatePresence>
        {playerOpen && (
          <FullScreenPlayer
            feed={exploreFeed}
            startIndex={playerStartIndex}
            uploaderCounts={uploaderCounts}
            onClose={() => setPlayerOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
