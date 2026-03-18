import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Clock,
  Crown,
  Eye,
  Film,
  Flag,
  Flame,
  Heart,
  Lock,
  MessageCircle,
  MoreVertical,
  Music,
  Radio,
  Search,
  Send,
  Share2,
  UserCheck,
  UserPlus,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ArtistProfileSheet } from "../components/ArtistProfileSheet";
import { ArtistSearchSheet } from "../components/ArtistSearchSheet";
import CreatorBadge from "../components/CreatorBadge";
import { GiftButton } from "../components/GiftPanel";
import PromoteSheet from "../components/PromoteSheet";
import { ReportSheet } from "../components/ReportSheet";
import { ShareSheet } from "../components/ShareSheet";
import { BannerAd } from "../components/ads/BannerAd";
import { InterstitialAd } from "../components/ads/InterstitialAd";
import { LocalAdBanner } from "../components/ads/LocalAdBanner";
import { PreRollAd } from "../components/ads/PreRollAd";
import {
  useApp,
  useIsFollowing,
  useUserById,
  useVideoComments,
} from "../context/AppContext";
import type { LocalAd, Video, VideoType } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";
import { sanitizeText } from "../lib/sanitize";
import {
  formatCount,
  formatTime,
  generateId,
  getTrendingFeed,
  getTrendingTabFeed,
} from "../utils/trending";

// ─── Video Type Badge ─────────────────────────────────────────────────────────

function VideoTypeBadge({
  type,
  mediaType,
}: {
  type: VideoType;
  mediaType?: "video" | "photo";
}) {
  if (mediaType === "photo") {
    return (
      <Badge
        variant="secondary"
        className="text-[9px] px-1.5 py-0 font-semibold tracking-wide bg-emerald-500/80 text-white border-transparent"
      >
        📷 Photo
      </Badge>
    );
  }
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
        text: sanitizeText(text),
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
  const [shareOpen, setShareOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const isFollowing = useIsFollowing(video.uploaderId);
  const isCurrentUserVideo = state.currentUser?.id === video.uploaderId;
  const ocidIndex = index + 1;
  const isPhoto = video.mediaType === "photo";

  // Sync muted state to video element
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || isPhoto) return;
    vid.muted = isMuted;
  }, [isMuted, isPhoto]);

  // Tap-to-play toggle
  const handleVideoTap = () => {
    const vid = videoRef.current;
    if (!vid || isPhoto || isPremiumLocked) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setIsPaused(false);
    } else {
      vid.pause();
      setIsPaused(true);
    }
  };

  // Check if promotion is active
  const isActivePromotion =
    video.isPromoted &&
    video.promotionExpiry &&
    video.promotionExpiry > Date.now();

  // Autoplay control (video only)
  useEffect(() => {
    if (isPhoto) {
      // For photos: trigger seen after 1s of being active
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
      // If URL is a placeholder, wait up to 8s for IndexedDB restore before marking unavailable
      if (!video.url || video.url === "__local__") {
        setVideoLoading(true);
        setVideoUnavailable(false);
        const waitTimer = setTimeout(() => {
          // Still __local__ after 8 seconds — IndexedDB restore didn't happen
          setVideoLoading(false);
          setVideoUnavailable(true);
        }, 8000);
        return () => clearTimeout(waitTimer);
      }
      // Reset loading/unavailable state when card becomes active
      setVideoUnavailable(false);
      setVideoLoading(true);

      const isBlobOrData =
        video.url.startsWith("data:") || video.url.startsWith("blob:");

      // Always set src directly for local/data/blob URLs
      // This ensures the video element picks up the correct source
      if (isBlobOrData) {
        if (vid.src !== video.url) {
          vid.src = video.url;
          vid.load();
        }
      }

      const tryPlay = () => {
        if (vid.readyState >= 3) {
          vid
            .play()
            .then(() => {
              setVideoLoading(false);
              setIsPaused(false);
            })
            .catch(() => {
              setVideoLoading(false);
              setIsPaused(true);
            });
          return;
        }
        vid
          .play()
          .then(() => {
            setVideoLoading(false);
            setIsPaused(false);
          })
          .catch((playErr) => {
            console.warn("Video play failed, retrying:", playErr?.message);
            setTimeout(() => {
              vid
                .play()
                .then(() => {
                  setVideoLoading(false);
                  setIsPaused(false);
                })
                .catch(() => {
                  setVideoLoading(false);
                  setIsPaused(true);
                });
            }, 800);
          });
      };

      if (vid.readyState < 3) {
        const onReady = () => {
          tryPlay();
          setVideoLoading(false);
          vid.removeEventListener("canplay", onReady);
          vid.removeEventListener("canplaythrough", onReady);
        };
        vid.addEventListener("canplay", onReady);
        vid.addEventListener("canplaythrough", onReady);
        if (!isBlobOrData) vid.load();
        // Fallback: try playing after 2500ms
        seenTimerRef.current = setTimeout(() => {
          vid.removeEventListener("canplay", onReady);
          vid.removeEventListener("canplaythrough", onReady);
          tryPlay();
        }, 2500);
      } else {
        tryPlay();
        seenTimerRef.current = setTimeout(() => onSeen(video.id), 2000);
      }
    } else {
      // Card is no longer active — pause and reset
      vid.pause();
      vid.currentTime = 0;
      setVideoLoading(true);
      if (seenTimerRef.current) clearTimeout(seenTimerRef.current);
    }
    return () => {
      if (seenTimerRef.current) clearTimeout(seenTimerRef.current);
    };
  }, [isActive, video.id, video.url, onSeen, isPhoto]);

  const handleLike = () => {
    if (!state.currentUser) return;
    const isCurrentlyLiked = state.likedVideoIds.includes(video.id);
    // Read pre-dispatch task state for toast check
    const liveUser = state.users.find((u) => u.id === state.currentUser!.id);
    const todayStr = new Date().toDateString();
    const isToday = (liveUser?.dailyTasksDate ?? "") === todayStr;
    const preLikeCount = isToday ? (liveUser?.dailyLikeCount ?? 0) : 0;
    const taskAlreadyDone = isToday && (liveUser?.taskLikeDone ?? false);
    dispatch({
      type: "LIKE_VIDEO",
      videoId: video.id,
      userId: state.currentUser.id,
    });
    if (!isCurrentlyLiked) {
      setLikePulse(true);
      setTimeout(() => setLikePulse(false), 300);
      // Check if this like completes the task
      if (!taskAlreadyDone && preLikeCount + 1 >= 3) {
        toast.success("✅ Task complete! +1 coin", {
          description: "Daily task: Liked 3 videos",
        });
      }
    }
  };

  const handleFollow = () => {
    if (!state.currentUser) return;
    // Read pre-dispatch task state for toast check
    const liveUserFollow = state.users.find(
      (u) => u.id === state.currentUser!.id,
    );
    const todayStrFollow = new Date().toDateString();
    const isTodayFollow =
      (liveUserFollow?.dailyTasksDate ?? "") === todayStrFollow;
    const taskFollowAlreadyDone =
      isTodayFollow && (liveUserFollow?.taskFollowDone ?? false);
    dispatch({
      type: isFollowing ? "UNFOLLOW" : "FOLLOW",
      targetUserId: video.uploaderId,
    });
    if (!isFollowing && !taskFollowAlreadyDone) {
      toast.success("✅ Task complete! +1 coin", {
        description: "Daily task: Followed an artist",
      });
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

  const isPremiumLocked =
    video.videoType === "premium" &&
    state.currentUser?.subscriptionStatus !== "active";

  return (
    <div
      data-ocid={`feed.reel.item.${ocidIndex}`}
      className="reel-card relative w-full flex-shrink-0"
      style={{ height: "100dvh" }}
    >
      {/* Video or Photo */}
      {isPhoto ? (
        video.url && video.url !== "__local__" ? (
          <img
            src={video.url}
            alt={video.caption}
            className="absolute inset-0 w-full h-full object-cover"
            style={isPremiumLocked ? { filter: "blur(4px)" } : {}}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <span className="text-3xl">📷</span>
            <p className="text-white/40 text-sm mt-2">Photo unavailable</p>
          </div>
        )
      ) : (
        <>
          <video
            ref={videoRef}
            poster={video.thumbnail || undefined}
            className={`absolute inset-0 w-full h-full object-cover ${isPremiumLocked ? "blur" : ""}`}
            style={isPremiumLocked ? { filter: "blur(4px)" } : {}}
            muted={isMuted}
            loop
            playsInline
            preload="auto"
            x-webkit-airplay="allow"
            onCanPlay={() => setVideoLoading(false)}
            onCanPlayThrough={() => setVideoLoading(false)}
            onLoadedData={() => setVideoLoading(false)}
            onLoadedMetadata={(e) => {
              setVideoLoading(false);
              const vid = e.currentTarget;
              // Apply editing metadata
              if (video.speed && video.speed !== 1)
                vid.playbackRate = video.speed;
              if (video.volume !== undefined) vid.volume = video.volume;
              if (video.trimStart && video.trimStart > 0)
                vid.currentTime = video.trimStart;
              // Auto-play once metadata is available if this reel is active
              if (isActive) {
                vid.play().catch(() => {});
              }
            }}
            onError={(e) => {
              const vid = e.currentTarget;
              const errCode = vid.error?.code;
              const errMsg = vid.error?.message;
              console.warn(
                `Video error code=${errCode} msg=${errMsg} url=${video.url?.slice(0, 60)}`,
              );
              setVideoLoading(false);
              setVideoUnavailable(true);
            }}
            onPlay={() => {
              setIsPaused(false);
              setVideoLoading(false);
            }}
            onPause={() => setIsPaused(true)}
          >
            {/* For data: or blob: URLs, src is set directly — no <source> tags needed */}
            {video.url &&
              !video.url.startsWith("data:") &&
              !video.url.startsWith("blob:") && (
                <>
                  <source src={video.url} type="video/mp4" />
                  <source src={video.url} type="video/webm" />
                </>
              )}
            <track kind="captions" />
          </video>

          {/* Text overlay from editor */}
          {video.overlayText && (
            <div
              className={`absolute left-0 right-0 px-4 text-center pointer-events-none z-10 ${
                video.textPosition === "top"
                  ? "top-16"
                  : video.textPosition === "bottom"
                    ? "bottom-32"
                    : "top-1/2 -translate-y-1/2"
              }`}
            >
              <span
                className={`text-white font-bold drop-shadow-lg ${
                  video.textSize === "small"
                    ? "text-sm"
                    : video.textSize === "large"
                      ? "text-3xl"
                      : "text-xl"
                }`}
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
              >
                {video.overlayText}
              </span>
            </div>
          )}

          {/* Thumbnail overlay — shown until video starts playing */}
          {video.thumbnail &&
            videoLoading &&
            !videoUnavailable &&
            !isPremiumLocked && (
              <img
                src={video.thumbnail}
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={{ zIndex: 2 }}
              />
            )}

          {/* Loading spinner overlay — shown until video can play */}
          {videoLoading && !isPremiumLocked && !videoUnavailable && (
            <div className="absolute inset-0 z-[4] flex items-center justify-center bg-black/40 pointer-events-none">
              <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            </div>
          )}

          {/* Video unavailable overlay (dead blob URL) */}
          {videoUnavailable && (
            <div className="absolute inset-0 z-[4] flex flex-col items-center justify-center gap-2 bg-black/70 pointer-events-none">
              <span className="text-3xl">🎬</span>
              <p className="text-white/60 text-sm font-medium">
                Video unavailable
              </p>
              <p className="text-white/30 text-xs">Try uploading again</p>
            </div>
          )}

          {/* Tap-to-play overlay */}
          <button
            type="button"
            aria-label={isPaused ? "Play video" : "Pause video"}
            onClick={handleVideoTap}
            className="absolute inset-0 z-[5] w-full h-full"
            style={{ background: "transparent" }}
          />
          {/* Paused indicator */}
          {isPaused && !videoLoading && !videoUnavailable && (
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
      <div className="absolute inset-0 gradient-overlay pointer-events-none" />

      {/* Premium locked overlay */}
      {isPremiumLocked && (
        <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
          <div className="text-center">
            <p className="text-amber-400 font-bold text-base tracking-wide uppercase text-xs mb-1">
              Premium
            </p>
            <p className="text-white font-semibold text-sm">
              Subscribe to watch
            </p>
          </div>
        </div>
      )}

      {/* Featured badge (top-left, above sponsored) */}
      {video.isFeatured && (
        <div className="absolute top-4 left-3 z-10">
          <Badge
            variant="secondary"
            className="text-[9px] px-2 py-0.5 font-bold tracking-wide"
            style={{
              background: "oklch(0.6 0.2 80 / 0.92)",
              color: "white",
              borderColor: "transparent",
            }}
          >
            ⭐ Featured
          </Badge>
        </div>
      )}

      {/* Sponsored badge (top-left) */}
      {isActivePromotion && (
        <div
          className="absolute left-3 z-10 flex items-center gap-2"
          style={{ top: video.isFeatured ? "2.5rem" : "1rem" }}
        >
          <Badge
            variant="secondary"
            className="text-[9px] px-2 py-0.5 font-bold tracking-wide"
            style={{
              background: "oklch(0.55 0.18 60 / 0.9)",
              color: "white",
              borderColor: "transparent",
            }}
          >
            ✦ Sponsored
          </Badge>
        </div>
      )}

      {/* Video type badge + report dropdown */}
      <div
        className="absolute z-10 flex items-center gap-2"
        style={{
          top:
            video.isFeatured && isActivePromotion
              ? "4rem"
              : video.isFeatured || isActivePromotion
                ? "2.5rem"
                : "1rem",
          left: "0.75rem",
        }}
      >
        <VideoTypeBadge
          type={video.videoType ?? "reel"}
          mediaType={video.mediaType}
        />
      </div>

      {/* Speaker / Sound toggle button (visible on video) */}
      {!isPhoto && (
        <button
          type="button"
          aria-label={isMuted ? "Sound On" : "Mute"}
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted((prev) => {
              const next = !prev;
              if (videoRef.current) videoRef.current.muted = next;
              return next;
            });
          }}
          className="absolute top-14 right-3 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm border border-white/10"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-white/80" />
          ) : (
            <Volume2 className="w-4 h-4 text-white" />
          )}
        </button>
      )}

      {/* Report "..." button */}
      <div className="absolute top-3 right-3 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4 text-white/80" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-[oklch(0.12_0_0)] border-white/10 text-white"
          >
            <DropdownMenuItem
              onClick={() => setReportSheetOpen(true)}
              className="flex items-center gap-2 text-red-400 focus:text-red-300 focus:bg-red-400/10 cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              Report video
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right action column */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-10">
        {/* Avatar + Follow button */}
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

        {/* Gift button (not on own video) */}
        {!isCurrentUserVideo && (
          <GiftButton
            artistId={video.uploaderId}
            videoId={video.id}
            size="md"
          />
        )}

        {/* Promote button (only for own videos) */}
        {isCurrentUserVideo && (
          <button
            type="button"
            data-ocid={`feed.promote_button.${ocidIndex}`}
            onClick={() => setPromoteOpen(true)}
            className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
          >
            <span className="text-2xl">🚀</span>
            <span className="text-white text-xs font-semibold drop-shadow">
              {isActivePromotion ? "Boosted" : "Promote"}
            </span>
          </button>
        )}
      </div>

      {/* Bottom overlay */}
      <div className="absolute bottom-20 left-3 right-16 z-10">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <button
            type="button"
            data-ocid={`feed.reel.username_button.${ocidIndex}`}
            onClick={() => setProfileSheetOpen(true)}
            className="text-white font-bold text-sm hover:underline focus:outline-none active:opacity-70 transition-opacity"
          >
            @{uploader?.username ?? "user"}
          </button>
          {uploader && (
            <CreatorBadge
              user={uploader}
              userVideos={state.videos.filter(
                (v) => v.uploaderId === uploader.id && !v.isDeleted,
              )}
              allUsers={state.users}
              allVideos={state.videos}
              size="sm"
            />
          )}
        </div>
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

      {/* Share sheet */}
      <ShareSheet
        videoId={video.id}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        onShare={() => {
          if (state.currentUser) {
            // Check task state before dispatch
            const liveUserShare = state.users.find(
              (u) => u.id === state.currentUser!.id,
            );
            const todayStrShare = new Date().toDateString();
            const isTodayShare =
              (liveUserShare?.dailyTasksDate ?? "") === todayStrShare;
            const taskShareAlreadyDone =
              isTodayShare && (liveUserShare?.taskShareDone ?? false);
            dispatch({
              type: "SHARE_VIDEO_BOOST",
              videoId: video.id,
              userId: state.currentUser.id,
            });
            if (!taskShareAlreadyDone) {
              toast.success("✅ Task complete! +1 coin", {
                description: "Daily task: Shared a video",
              });
            }
          }
        }}
      />

      {/* Artist profile sheet */}
      <ArtistProfileSheet
        artistId={video.uploaderId}
        open={profileSheetOpen}
        onClose={() => setProfileSheetOpen(false)}
      />

      {/* Promote sheet (own videos only) */}
      {isCurrentUserVideo && (
        <PromoteSheet
          videoId={video.id}
          open={promoteOpen}
          onClose={() => setPromoteOpen(false)}
        />
      )}

      {/* Report sheet */}
      <ReportSheet
        open={reportSheetOpen}
        onOpenChange={setReportSheetOpen}
        videoId={video.id}
      />
    </div>
  );
}

// ─── Long / Premium Video Card ────────────────────────────────────────────────

function VideoCard({
  video,
  index,
  isPremiumTab,
}: {
  video: Video;
  index: number;
  isPremiumTab: boolean;
}) {
  const { state, dispatch } = useApp();
  const uploader = useUserById(video.uploaderId);
  const [commentOpen, setCommentOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [likePulse, setLikePulse] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const ocidIndex = index + 1;
  const isCurrentUserVideo = state.currentUser?.id === video.uploaderId;
  const isActivePromotion =
    video.isPromoted &&
    video.promotionExpiry &&
    video.promotionExpiry > Date.now();

  const isLocked =
    isPremiumTab && state.currentUser?.subscriptionStatus !== "active";
  const isLiked = state.likedVideoIds.includes(video.id);
  const currentLikes =
    state.videos.find((v) => v.id === video.id)?.likesCount ?? video.likesCount;
  const currentViews =
    state.videos.find((v) => v.id === video.id)?.viewsCount ?? video.viewsCount;

  const handleLike = () => {
    if (!state.currentUser || isLocked) return;
    const isCurrentlyLiked = state.likedVideoIds.includes(video.id);
    // Read pre-dispatch task state for toast check
    const liveUserVc = state.users.find((u) => u.id === state.currentUser!.id);
    const todayStrVc = new Date().toDateString();
    const isTodayVc = (liveUserVc?.dailyTasksDate ?? "") === todayStrVc;
    const preLikeCountVc = isTodayVc ? (liveUserVc?.dailyLikeCount ?? 0) : 0;
    const taskLikeAlreadyDoneVc =
      isTodayVc && (liveUserVc?.taskLikeDone ?? false);
    dispatch({
      type: "LIKE_VIDEO",
      videoId: video.id,
      userId: state.currentUser.id,
    });
    if (!isCurrentlyLiked) {
      setLikePulse(true);
      setTimeout(() => setLikePulse(false), 300);
      if (!taskLikeAlreadyDoneVc && preLikeCountVc + 1 >= 3) {
        toast.success("✅ Task complete! +1 coin", {
          description: "Daily task: Liked 3 videos",
        });
      }
    }
  };

  const durationLabel = isPremiumTab ? "Exclusive" : "10 min";

  return (
    <motion.div
      data-ocid={`feed.${isPremiumTab ? "premium" : "long"}.item.${ocidIndex}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="relative rounded-2xl overflow-hidden border border-white/8 group"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.12 0.02 240 / 0.9), oklch(0.08 0.01 240 / 0.95))",
        backdropFilter: "blur(12px)",
        minHeight: 180,
        borderColor: isActivePromotion
          ? "oklch(0.55 0.18 60 / 0.4)"
          : undefined,
      }}
    >
      {/* Featured badge */}
      {video.isFeatured && (
        <div className="absolute top-2 left-2 z-10">
          <Badge
            variant="secondary"
            className="text-[9px] px-1.5 py-0.5 font-bold"
            style={{
              background: "oklch(0.6 0.2 80 / 0.92)",
              color: "white",
              borderColor: "transparent",
            }}
          >
            ⭐ Featured
          </Badge>
        </div>
      )}
      {/* Sponsored badge */}
      {isActivePromotion && (
        <div
          className="absolute left-2 z-10"
          style={{ top: video.isFeatured ? "1.6rem" : "0.5rem" }}
        >
          <Badge
            variant="secondary"
            className="text-[9px] px-1.5 py-0.5 font-bold"
            style={{
              background: "oklch(0.55 0.18 60 / 0.9)",
              color: "white",
              borderColor: "transparent",
            }}
          >
            ✦ Sponsored
          </Badge>
        </div>
      )}
      <div className="flex gap-0">
        {/* Thumbnail / video preview column */}
        <div
          className="relative flex-shrink-0 rounded-l-2xl overflow-hidden"
          style={{ width: 130, minHeight: 180 }}
        >
          {video.mediaType === "photo" ? (
            <img
              src={video.url}
              alt={video.caption}
              className="w-full h-full object-cover"
              style={{
                height: "100%",
                filter: isLocked ? "blur(6px) brightness(0.5)" : undefined,
              }}
            />
          ) : (
            <video
              src={video.url}
              className="w-full h-full object-cover"
              style={{
                height: "100%",
                filter: isLocked
                  ? "blur(6px) brightness(0.5)"
                  : "brightness(0.85)",
              }}
              muted
              playsInline
              preload="metadata"
            >
              <track kind="captions" />
            </video>
          )}

          {/* Duration badge */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 rounded-full px-2 py-0.5">
            <Clock className="w-2.5 h-2.5 text-white/70" />
            <span className="text-white/90 text-[10px] font-medium">
              {durationLabel}
            </span>
          </div>

          {/* Premium lock overlay on thumbnail */}
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-9 h-9 rounded-xl bg-amber-500/25 border border-amber-500/40 flex items-center justify-center">
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          )}
        </div>

        {/* Content column */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          {/* Top: uploader + type badge + report menu */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="w-7 h-7 shrink-0 border border-white/20">
                <AvatarImage src={uploader?.avatar} />
                <AvatarFallback className="bg-white/10 text-white text-[10px]">
                  {uploader?.username?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                data-ocid={`feed.long.username_button.${ocidIndex}`}
                onClick={() => setProfileSheetOpen(true)}
                className="text-white/70 text-xs font-medium truncate hover:text-white/90 focus:outline-none transition-colors"
              >
                @{uploader?.username ?? "user"}
              </button>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <VideoTypeBadge
                type={video.videoType ?? "reel"}
                mediaType={video.mediaType}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-3.5 h-3.5 text-white/40" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-[oklch(0.12_0_0)] border-white/10 text-white"
                >
                  <DropdownMenuItem
                    onClick={() => setReportSheetOpen(true)}
                    className="flex items-center gap-2 text-red-400 focus:text-red-300 focus:bg-red-400/10 cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    Report video
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Caption */}
          <p
            className={`text-sm font-medium leading-snug line-clamp-2 mb-2 flex-1 ${
              isLocked ? "text-white/40" : "text-white"
            }`}
          >
            {isLocked
              ? "Subscribe to unlock this premium content"
              : video.caption}
          </p>

          {/* Hashtags */}
          {!isLocked && video.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {video.hashtags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-reels-pink text-[10px] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3">
              {/* Views */}
              <div className="flex items-center gap-1 text-white/40">
                <Eye className="w-3 h-3" />
                <span className="text-[11px]">{formatCount(currentViews)}</span>
              </div>

              {/* Like button */}
              <button
                type="button"
                data-ocid={`feed.like_button.${ocidIndex}`}
                onClick={handleLike}
                disabled={isLocked}
                className="flex items-center gap-1 transition-opacity disabled:opacity-40"
              >
                <motion.div
                  animate={likePulse ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-colors ${
                      isLiked
                        ? "fill-reels-pink text-reels-pink"
                        : "text-white/50"
                    }`}
                  />
                </motion.div>
                <span className="text-[11px] text-white/50">
                  {formatCount(currentLikes)}
                </span>
              </button>

              {/* Comment button */}
              <button
                type="button"
                data-ocid={`feed.comment_button.${ocidIndex}`}
                onClick={() => !isLocked && setCommentOpen(true)}
                disabled={isLocked}
                className="flex items-center gap-1 text-white/50 disabled:opacity-40"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="text-[11px]">
                  {formatCount(video.commentsCount)}
                </span>
              </button>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Share */}
              <button
                type="button"
                data-ocid={`feed.share_button.${ocidIndex}`}
                onClick={() => setShareOpen(true)}
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              {/* Gift button (not on own video) */}
              {!isCurrentUserVideo && (
                <GiftButton
                  artistId={video.uploaderId}
                  videoId={video.id}
                  size="sm"
                />
              )}

              {/* Promote button (own videos) */}
              {isCurrentUserVideo && (
                <button
                  type="button"
                  data-ocid={`feed.promote_button.${ocidIndex}`}
                  onClick={() => setPromoteOpen(true)}
                  className="text-[11px] font-semibold transition-colors"
                  style={{
                    color: isActivePromotion
                      ? "oklch(0.7 0.15 60)"
                      : "rgba(255,255,255,0.4)",
                  }}
                >
                  {isActivePromotion ? "✦ Boosted" : "🚀 Promote"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Premium subscribe CTA overlay for locked state */}
      {isLocked && (
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between bg-gradient-to-t from-amber-950/60 to-transparent">
          <div className="flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 text-xs font-semibold">
              Premium Content
            </span>
          </div>
          <span className="text-amber-400/80 text-[10px] font-medium">
            Subscribe to watch
          </span>
        </div>
      )}

      {/* Comment sheet */}
      <CommentSheet
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
            const liveUserVcShare = state.users.find(
              (u) => u.id === state.currentUser!.id,
            );
            const todayStrVcShare = new Date().toDateString();
            const isTodayVcShare =
              (liveUserVcShare?.dailyTasksDate ?? "") === todayStrVcShare;
            const taskShareAlreadyDoneVc =
              isTodayVcShare && (liveUserVcShare?.taskShareDone ?? false);
            dispatch({
              type: "SHARE_VIDEO_BOOST",
              videoId: video.id,
              userId: state.currentUser.id,
            });
            if (!taskShareAlreadyDoneVc) {
              toast.success("✅ Task complete! +1 coin", {
                description: "Daily task: Shared a video",
              });
            }
          }
        }}
      />

      {/* Artist profile sheet */}
      <ArtistProfileSheet
        artistId={video.uploaderId}
        open={profileSheetOpen}
        onClose={() => setProfileSheetOpen(false)}
      />

      {/* Promote sheet (own videos only) */}
      {isCurrentUserVideo && (
        <PromoteSheet
          videoId={video.id}
          open={promoteOpen}
          onClose={() => setPromoteOpen(false)}
        />
      )}

      {/* Report sheet */}
      <ReportSheet
        open={reportSheetOpen}
        onOpenChange={setReportSheetOpen}
        videoId={video.id}
      />
    </motion.div>
  );
}

// ─── Long / Premium Feed ──────────────────────────────────────────────────────

function VideoListFeed({
  videos,
  isPremiumTab,
  emptyMessage,
  emptyIcon,
}: {
  videos: Video[];
  isPremiumTab: boolean;
  emptyMessage: string;
  emptyIcon: React.ReactNode;
}) {
  if (videos.length === 0) {
    return (
      <div
        data-ocid={`feed.${isPremiumTab ? "premium" : "long"}.empty_state`}
        className="flex flex-col items-center justify-center gap-4 py-20 px-8 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          {emptyIcon}
        </div>
        <p className="text-white/40 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-3 pb-24">
      {videos.map((video, index) => (
        <VideoCard
          key={video.id}
          video={video}
          index={index}
          isPremiumTab={isPremiumTab}
        />
      ))}
    </div>
  );
}

// ─── Feed Tab Types ───────────────────────────────────────────────────────────

type FeedTab = "foryou" | "trending" | "long" | "premium" | "following";

// ─── Feed Page ────────────────────────────────────────────────────────────────

export default function FeedPage() {
  const { state, dispatch } = useApp();
  const { t } = useLang();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTab>("foryou");
  const [trendingRefreshKey, setTrendingRefreshKey] = useState(() =>
    Date.now(),
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [preRollVideoId, setPreRollVideoId] = useState<string | null>(null);
  const preRolledVideosRef = useRef<Set<string>>(new Set());
  const videosScrolledRef = useRef(0);
  const feedRef = useRef<HTMLDivElement>(null);

  // Auto-refresh trending every 3 hours
  useEffect(() => {
    const interval = setInterval(() => {
      setTrendingRefreshKey(Date.now());
      toast.success("🔥 Trending updated!");
    }, 10_800_000);
    return () => clearInterval(interval);
  }, []);

  const feedRaw = getTrendingFeed(
    state.videos,
    state.seenVideoIds,
    state.likedVideoIds,
    state.followingIds,
  );
  // Featured videos appear first in the For You feed
  const feed = [...feedRaw].sort(
    (a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0),
  );
  const longVideos = state.videos.filter(
    (v) => !v.isDeleted && v.videoType === "long",
  );
  const premiumVideos = state.videos.filter(
    (v) => !v.isDeleted && v.videoType === "premium",
  );
  const followingFeed = state.videos
    .filter((v) => !v.isDeleted && state.followingIds.includes(v.uploaderId))
    .sort((a, b) => b.createdAt - a.createdAt);

  // Trending feed: upgraded algorithm with recency decay + new-creator injection
  // trendingRefreshKey is used to force recompute every 3h via the auto-refresh interval
  const trendingFeed = useMemo(() => {
    // Reference trendingRefreshKey so useMemo recomputes on refresh
    void trendingRefreshKey;
    return getTrendingTabFeed(state.videos);
  }, [trendingRefreshKey, state.videos]);
  const localAds: LocalAd[] = state.localAds ?? [];

  const handleSeen = useCallback(
    (id: string) => {
      // Check pre-dispatch watch task state for toast
      const checkWatchTask = () => {
        if (!state.currentUser) return;
        const liveUser = state.users.find(
          (u) => u.id === state.currentUser!.id,
        );
        const todayStr = new Date().toDateString();
        const isToday = (liveUser?.dailyTasksDate ?? "") === todayStr;
        const preDailyWatchCount = isToday
          ? (liveUser?.dailyWatchCount ?? 0)
          : 0;
        const taskWatchAlreadyDone =
          isToday && (liveUser?.taskWatchDone ?? false);
        if (!taskWatchAlreadyDone && preDailyWatchCount + 1 >= 5) {
          toast.success("✅ Task complete! +2 coins", {
            description: "Daily task: Watched 5 videos",
          });
        }
      };

      // Show pre-roll ad the first time a video is seen (if not already pre-rolled)
      if (!preRolledVideosRef.current.has(id)) {
        preRolledVideosRef.current.add(id);
        setPreRollVideoId(id);
        // Track ad impression when a pre-roll fires for this video
        dispatch({ type: "TRACK_AD_IMPRESSION", videoId: id });
        dispatch({
          type: "RECORD_AD_REVENUE",
          videoId: id,
          viewerId: state.currentUser?.id ?? "anonymous",
          revenueAmount: 1,
        });
        // The actual TRACK_SEEN dispatch happens after pre-roll completes
        return;
      }
      checkWatchTask();
      dispatch({ type: "TRACK_SEEN", videoId: id });
      // Track ad impression every time a video is seen (banner ad is always shown)
      dispatch({ type: "TRACK_AD_IMPRESSION", videoId: id });
      dispatch({
        type: "RECORD_AD_REVENUE",
        videoId: id,
        viewerId: state.currentUser?.id ?? "anonymous",
        revenueAmount: 1,
      });
      // Track viewer referral progress (counts toward 3-video condition)
      if (state.currentUser) {
        dispatch({
          type: "VIEWER_VIDEO_WATCHED",
          watcherUserId: state.currentUser.id,
        });
      }
    },
    [dispatch, state.currentUser, state.users],
  );

  const handlePreRollComplete = useCallback(() => {
    const id = preRollVideoId;
    setPreRollVideoId(null);
    if (id) {
      // Check watch task before dispatch
      if (state.currentUser) {
        const liveUser = state.users.find(
          (u) => u.id === state.currentUser!.id,
        );
        const todayStr = new Date().toDateString();
        const isToday = (liveUser?.dailyTasksDate ?? "") === todayStr;
        const preDailyWatchCount = isToday
          ? (liveUser?.dailyWatchCount ?? 0)
          : 0;
        const taskWatchAlreadyDone =
          isToday && (liveUser?.taskWatchDone ?? false);
        if (!taskWatchAlreadyDone && preDailyWatchCount + 1 >= 5) {
          toast.success("✅ Task complete! +2 coins", {
            description: "Daily task: Watched 5 videos",
          });
        }
      }
      dispatch({ type: "TRACK_SEEN", videoId: id });
      // Track viewer referral progress after pre-roll completes too
      if (state.currentUser) {
        dispatch({
          type: "VIEWER_VIDEO_WATCHED",
          watcherUserId: state.currentUser.id,
        });
      }
    }
  }, [preRollVideoId, dispatch, state.currentUser, state.users]);

  // Intersection observer for active video tracking (For You tab only)
  // biome-ignore lint/correctness/useExhaustiveDependencies: feed.length intentionally re-runs observer when feed changes
  useEffect(() => {
    if (activeTab !== "foryou" && activeTab !== "trending") return;
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
  }, [feed.length, activeIndex, activeTab]);

  // Tab config
  const TABS: { id: FeedTab; label: string; ocid: string }[] = [
    { id: "foryou", label: t("feed.for_you"), ocid: "feed.foryou.tab" },
    {
      id: "trending",
      label: `🔥 ${t("feed.trending")}`,
      ocid: "feed.trending.tab",
    },
    { id: "following", label: t("feed.following"), ocid: "feed.following.tab" },
    { id: "long", label: t("feed.long"), ocid: "feed.long.tab" },
    {
      id: "premium",
      label: `${t("feed.premium")} ✦`,
      ocid: "feed.premium.tab",
    },
  ];

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* ── Tab Bar ── */}
      <div
        className="absolute top-0 left-0 right-0 z-30 flex items-center gap-1 px-3 pt-3 pb-2"
        style={{
          background:
            activeTab === "foryou" || activeTab === "trending"
              ? "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)"
              : "oklch(0.08 0.01 240 / 0.96)",
          backdropFilter:
            activeTab !== "foryou" && activeTab !== "trending"
              ? "blur(12px)"
              : undefined,
          borderBottom:
            activeTab !== "foryou" && activeTab !== "trending"
              ? "1px solid rgba(255,255,255,0.06)"
              : "none",
        }}
      >
        {/* Tabs (centered in available space) */}
        <div className="flex-1 flex items-center justify-center gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-ocid={tab.ocid}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200"
                style={{
                  color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                  background: isActive
                    ? tab.id === "premium"
                      ? "linear-gradient(135deg, oklch(0.55 0.18 60), oklch(0.6 0.22 40))"
                      : tab.id === "long"
                        ? "linear-gradient(135deg, oklch(0.5 0.2 220), oklch(0.55 0.18 200))"
                        : tab.id === "following"
                          ? "linear-gradient(135deg, oklch(0.5 0.18 185), oklch(0.55 0.16 195))"
                          : tab.id === "trending"
                            ? "linear-gradient(135deg, oklch(0.55 0.22 50), oklch(0.6 0.25 30))"
                            : "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))"
                    : "transparent",
                }}
              >
                {tab.label}
                {/* Active dot for For You on non-foryou tabs */}
                {!isActive && tab.id === "foryou" && activeTab !== "foryou" && (
                  <span className="sr-only">For You feed</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search button */}
        <button
          type="button"
          data-ocid="feed.search.open_modal_button"
          onClick={() => setSearchOpen(true)}
          aria-label="Search creators"
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
          style={{ background: "rgba(255,255,255,0.12)" }}
        >
          <Search className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* ── For You Tab: Vertical Reel Scroll ── */}
      <AnimatePresence mode="wait">
        {activeTab === "foryou" && (
          <motion.div
            key="foryou"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <div ref={feedRef} className="feed-container h-full">
              {feed.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <span className="text-5xl">🎬</span>
                  <p className="text-white/60 text-sm">No videos yet</p>
                </div>
              ) : (
                feed.map((video, index) => (
                  <ReelCard
                    key={video.id}
                    video={video}
                    index={index}
                    isActive={index === activeIndex}
                    onSeen={handleSeen}
                  />
                ))
              )}
            </div>

            {/* Banner ad strip at bottom */}
            <BannerAd className="absolute bottom-16 left-0 right-0 z-20 pointer-events-none mx-3 mb-1" />
            {/* Local ad banner at bottom */}
            <div className="absolute bottom-20 left-0 right-0 z-20 px-3">
              <LocalAdBanner ads={localAds} />
            </div>
          </motion.div>
        )}

        {/* ── Trending Tab: Vertical Reel Scroll sorted by engagement ── */}
        {activeTab === "trending" && (
          <motion.div
            key="trending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            {/* Trending header badge */}
            <div className="absolute top-12 left-0 right-0 z-20 px-4 pt-2 pb-1 pointer-events-none">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full w-fit"
                style={{
                  background: "oklch(0.55 0.22 50 / 0.85)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Flame className="w-3.5 h-3.5 text-orange-200" />
                <span className="text-orange-100 text-xs font-semibold">
                  Sorted by likes · views · comments · shares
                </span>
              </div>
            </div>

            <div ref={feedRef} className="feed-container h-full">
              {trendingFeed.length === 0 ? (
                <div
                  data-ocid="feed.trending.empty_state"
                  className="h-full flex flex-col items-center justify-center gap-3"
                >
                  <Flame className="w-10 h-10 text-orange-400/50" />
                  <p className="text-white/60 text-sm">
                    No trending videos yet
                  </p>
                </div>
              ) : (
                trendingFeed.map((video, index) => (
                  <ReelCard
                    key={video.id}
                    video={video}
                    index={index}
                    isActive={index === activeIndex}
                    onSeen={handleSeen}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* ── Long Tab: Vertical card list ── */}
        {activeTab === "long" && (
          <motion.div
            key="long"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full overflow-y-auto"
            style={{ paddingTop: 52 }}
          >
            {/* Local ad banner at top of Long tab */}
            <LocalAdBanner ads={localAds} className="px-4 pt-3 mb-4" />
            <VideoListFeed
              videos={longVideos}
              isPremiumTab={false}
              emptyMessage="No long-form videos yet. Upload one to get started!"
              emptyIcon={<Film className="w-7 h-7 text-blue-400" />}
            />
          </motion.div>
        )}

        {/* ── Premium Tab: Vertical card list (locked) ── */}
        {activeTab === "premium" && (
          <motion.div
            key="premium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full overflow-y-auto"
            style={{ paddingTop: 52 }}
          >
            {/* Local ad banner at top of Premium tab */}
            <LocalAdBanner ads={localAds} className="px-4 pt-3 mb-4" />

            {/* Subscription prompt banner for non-subscribers */}
            {state.currentUser?.subscriptionStatus !== "active" && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mx-4 mt-1 mb-1 rounded-2xl border border-amber-500/25 flex items-start gap-3 p-4"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.18 0.06 60 / 0.5), oklch(0.12 0.04 40 / 0.6))",
                }}
              >
                <Crown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-300 font-semibold text-sm mb-0.5">
                    Premium Subscription Required
                  </p>
                  <p className="text-amber-400/70 text-xs leading-relaxed">
                    Subscribe to unlock exclusive creator content with higher ad
                    revenue and premium-only videos.
                  </p>
                </div>
              </motion.div>
            )}

            <VideoListFeed
              videos={premiumVideos}
              isPremiumTab={true}
              emptyMessage="No premium videos yet. Artists can upload exclusive content!"
              emptyIcon={<Crown className="w-7 h-7 text-amber-400" />}
            />
          </motion.div>
        )}

        {/* ── Following Tab: Reels from followed artists ── */}
        {activeTab === "following" && (
          <motion.div
            key="following"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full overflow-y-auto"
            style={{ paddingTop: 52 }}
          >
            {followingFeed.length === 0 ? (
              <div
                data-ocid="feed.following.empty_state"
                className="flex flex-col items-center justify-center gap-4 py-24 px-8 text-center h-full"
              >
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.5 0.18 185 / 0.2), oklch(0.55 0.16 195 / 0.15))",
                    border: "1px solid oklch(0.5 0.18 185 / 0.3)",
                  }}
                >
                  <UserPlus className="w-7 h-7 text-teal-400" />
                </motion.div>
                <div>
                  <p className="text-white/70 font-semibold text-base mb-1">
                    No videos yet
                  </p>
                  <p className="text-white/35 text-sm leading-relaxed">
                    Follow artists to see their reels here
                  </p>
                </div>
              </div>
            ) : (
              <VideoListFeed
                videos={followingFeed}
                isPremiumTab={false}
                emptyMessage="Follow artists to see their reels here"
                emptyIcon={<UserPlus className="w-7 h-7 text-teal-400" />}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Interstitial ad ── */}
      <AnimatePresence>
        {showAd && (
          <InterstitialAd open={showAd} onClose={() => setShowAd(false)} />
        )}
      </AnimatePresence>

      {/* ── Pre-roll Ad ── */}
      <AnimatePresence>
        {preRollVideoId !== null && (
          <PreRollAd ads={localAds} onComplete={handlePreRollComplete} />
        )}
      </AnimatePresence>

      {/* ── Artist Search Sheet ── */}
      <ArtistSearchSheet
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}
