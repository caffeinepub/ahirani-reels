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
import { Heart, MessageCircle, Music, Send, Share2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BannerAd } from "../components/ads/BannerAd";
import { InterstitialAd } from "../components/ads/InterstitialAd";
import { useApp, useUserById, useVideoComments } from "../context/AppContext";
import type { Video, VideoType } from "../context/AppContext";
import {
  formatCount,
  formatTime,
  generateId,
  getTrendingFeed,
} from "../utils/trending";

// ─── Video Type Badge ─────────────────────────────────────────────────────────

function VideoTypeBadge({ type }: { type: VideoType }) {
  const config = {
    reel: {
      label: "Reel",
      className: "bg-reels-pink/80 text-white border-transparent",
    },
    long: {
      label: "Long",
      className: "bg-blue-500/80 text-white border-transparent",
    },
    premium: {
      label: "Premium",
      className: "bg-amber-500/80 text-white border-transparent",
    },
  };
  const { label, className } = config[type] ?? config.reel;
  return (
    <Badge
      variant="secondary"
      className={`text-[9px] px-1.5 py-0 font-semibold tracking-wide ${className}`}
    >
      {label}
    </Badge>
  );
}

// ─── Comment Sheet ────────────────────────────────────────────────────────────

function CommentSheet({
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

// ─── Reel Card ────────────────────────────────────────────────────────────────

function ReelCard({
  video,
  index,
  isActive,
  onSeen,
}: {
  video: Video;
  index: number;
  isActive: boolean;
  onSeen: (id: string) => void;
}) {
  const { state, dispatch } = useApp();
  const uploader = useUserById(video.uploaderId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const seenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [likePulse, setLikePulse] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const ocidIndex = index + 1;

  // Autoplay control
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isActive) {
      vid.play().catch(() => {});
      seenTimerRef.current = setTimeout(() => onSeen(video.id), 2000);
    } else {
      vid.pause();
      vid.currentTime = 0;
      if (seenTimerRef.current) clearTimeout(seenTimerRef.current);
    }
    return () => {
      if (seenTimerRef.current) clearTimeout(seenTimerRef.current);
    };
  }, [isActive, video.id, onSeen]);

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

  const handleShare = async () => {
    const url = `${window.location.origin}?v=${video.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.success(`Link: ${url}`);
    }
  };

  const currentLikes =
    state.videos.find((v) => v.id === video.id)?.likesCount ?? video.likesCount;
  const currentComments =
    state.videos.find((v) => v.id === video.id)?.commentsCount ??
    video.commentsCount;
  const isLiked = state.likedVideoIds.includes(video.id);

  return (
    <div
      data-ocid={`feed.reel.item.${ocidIndex}`}
      className="reel-card relative w-full flex-shrink-0"
      style={{ height: "100dvh" }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={video.url}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        loop
        playsInline
      >
        <track kind="captions" />
      </video>

      {/* Gradient overlay */}
      <div className="absolute inset-0 gradient-overlay" />

      {/* Video type badge */}
      <div className="absolute top-4 left-3 z-10">
        <VideoTypeBadge type={video.videoType ?? "reel"} />
      </div>

      {/* Right action column */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-10">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="w-12 h-12 border-2 border-white">
            <AvatarImage src={uploader?.avatar} />
            <AvatarFallback className="bg-white/20 text-white font-bold">
              {uploader?.username?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-reels-pink border-2 border-black flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">+</span>
          </div>
        </div>

        {/* Like */}
        <button
          type="button"
          data-ocid={`feed.like_button.${ocidIndex}`}
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
          data-ocid={`feed.comment_button.${ocidIndex}`}
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
          data-ocid={`feed.share_button.${ocidIndex}`}
          onClick={handleShare}
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <Share2 className="w-8 h-8 text-white drop-shadow-lg" />
          <span className="text-white text-xs font-semibold drop-shadow">
            Share
          </span>
        </button>
      </div>

      {/* Bottom overlay */}
      <div className="absolute bottom-20 left-3 right-16 z-10">
        <p className="text-white font-bold text-sm mb-1">
          @{uploader?.username ?? "user"}
        </p>
        <p className="text-white/90 text-sm leading-snug line-clamp-2 mb-1">
          {video.caption}
        </p>
        <div className="flex flex-wrap gap-1 mb-3">
          {video.hashtags.map((tag) => (
            <span key={tag} className="text-reels-pink text-xs font-medium">
              #{tag}
            </span>
          ))}
        </div>
        {/* Music */}
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
      <CommentSheet
        videoId={video.id}
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
      />
    </div>
  );
}

// ─── Feed Page ────────────────────────────────────────────────────────────────

export default function FeedPage() {
  const { state, dispatch } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const videosScrolledRef = useRef(0);
  const feedRef = useRef<HTMLDivElement>(null);

  const feed = getTrendingFeed(state.videos, state.seenVideoIds);

  const handleSeen = useCallback(
    (id: string) => {
      dispatch({ type: "TRACK_SEEN", videoId: id });
    },
    [dispatch],
  );

  // Intersection observer for active video tracking
  // biome-ignore lint/correctness/useExhaustiveDependencies: feed.length intentionally re-runs observer when feed changes
  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;

    const cards = container.querySelectorAll(".reel-card");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const index = Array.from(cards).indexOf(entry.target as Element);
            if (index !== -1 && index !== activeIndex) {
              setActiveIndex(index);
              videosScrolledRef.current++;
              if (videosScrolledRef.current % 5 === 0) {
                setTimeout(() => setShowAd(true), 400);
              }
            }
          }
        }
      },
      { threshold: 0.5, root: container },
    );

    for (const card of cards) {
      observer.observe(card);
    }
    return () => observer.disconnect();
  }, [feed.length, activeIndex]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Feed scroll container */}
      <div ref={feedRef} className="feed-container h-full">
        {feed.map((video, index) => (
          <ReelCard
            key={video.id}
            video={video}
            index={index}
            isActive={index === activeIndex}
            onSeen={handleSeen}
          />
        ))}
        {feed.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <span className="text-5xl">🎬</span>
            <p className="text-white/60 text-sm">No videos yet</p>
          </div>
        )}
      </div>

      {/* Banner ad strip */}
      <BannerAd className="absolute bottom-16 left-0 right-0 z-20 pointer-events-none mx-3 mb-1" />

      {/* Interstitial ad */}
      <AnimatePresence>
        {showAd && (
          <InterstitialAd open={showAd} onClose={() => setShowAd(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
