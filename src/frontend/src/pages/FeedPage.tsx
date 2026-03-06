import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  Heart,
  Lock,
  MessageCircle,
  MoreVertical,
  Music,
  Search,
  Send,
  Share2,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArtistSearchSheet } from "../components/ArtistSearchSheet";
import CreatorBadge from "../components/CreatorBadge";
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
  const [shareOpen, setShareOpen] = useState(false);
  const isFollowing = useIsFollowing(video.uploaderId);
  const isCurrentUserVideo = state.currentUser?.id === video.uploaderId;
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

  const handleReport = () => {
    if (!state.currentUser) return;
    dispatch({
      type: "FLAG_VIDEO",
      report: {
        id: `report_${Date.now()}`,
        videoId: video.id,
        reporterId: state.currentUser.id,
        reason: "Inappropriate content",
        createdAt: Date.now(),
      },
    });
    toast.success("Video reported", {
      description: "Our team will review this content",
    });
  };

  const handleFollow = () => {
    if (!state.currentUser) return;
    dispatch({
      type: isFollowing ? "UNFOLLOW" : "FOLLOW",
      targetUserId: video.uploaderId,
    });
  };

  const currentLikes =
    state.videos.find((v) => v.id === video.id)?.likesCount ?? video.likesCount;
  const currentComments =
    state.videos.find((v) => v.id === video.id)?.commentsCount ??
    video.commentsCount;
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
      {/* Video */}
      <video
        ref={videoRef}
        src={video.url}
        className={`absolute inset-0 w-full h-full object-cover ${isPremiumLocked ? "blur" : ""}`}
        style={isPremiumLocked ? { filter: "blur(4px)" } : {}}
        muted
        loop
        playsInline
      >
        <track kind="captions" />
      </video>

      {/* Gradient overlay */}
      <div className="absolute inset-0 gradient-overlay" />

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

      {/* Video type badge + report dropdown */}
      <div className="absolute top-4 left-3 z-10 flex items-center gap-2">
        <VideoTypeBadge type={video.videoType ?? "reel"} />
      </div>

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
              onClick={handleReport}
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
      </div>

      {/* Bottom overlay */}
      <div className="absolute bottom-20 left-3 right-16 z-10">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="text-white font-bold text-sm">
            @{uploader?.username ?? "user"}
          </p>
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
            dispatch({
              type: "SHARE_VIDEO_BOOST",
              videoId: video.id,
              userId: state.currentUser.id,
            });
          }
        }}
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
  const ocidIndex = index + 1;

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

  const handleReport = () => {
    if (!state.currentUser) return;
    dispatch({
      type: "FLAG_VIDEO",
      report: {
        id: `report_${Date.now()}`,
        videoId: video.id,
        reporterId: state.currentUser.id,
        reason: "Inappropriate content",
        createdAt: Date.now(),
      },
    });
    toast.success("Video reported");
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
      }}
    >
      <div className="flex gap-0">
        {/* Thumbnail / video preview column */}
        <div
          className="relative flex-shrink-0 rounded-l-2xl overflow-hidden"
          style={{ width: 130, minHeight: 180 }}
        >
          <video
            src={video.url}
            className={`w-full h-full object-cover ${isLocked ? "" : ""}`}
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
              <span className="text-white/70 text-xs font-medium truncate">
                @{uploader?.username ?? "user"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <VideoTypeBadge type={video.videoType ?? "reel"} />
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
                    onClick={handleReport}
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

            {/* Share */}
            <button
              type="button"
              data-ocid={`feed.share_button.${ocidIndex}`}
              onClick={() => setShareOpen(true)}
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
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
            dispatch({
              type: "SHARE_VIDEO_BOOST",
              videoId: video.id,
              userId: state.currentUser.id,
            });
          }
        }}
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

type FeedTab = "foryou" | "long" | "premium";

// ─── Feed Page ────────────────────────────────────────────────────────────────

export default function FeedPage() {
  const { state, dispatch } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTab>("foryou");
  const [searchOpen, setSearchOpen] = useState(false);
  const [preRollVideoId, setPreRollVideoId] = useState<string | null>(null);
  const preRolledVideosRef = useRef<Set<string>>(new Set());
  const videosScrolledRef = useRef(0);
  const feedRef = useRef<HTMLDivElement>(null);

  const feed = getTrendingFeed(
    state.videos,
    state.seenVideoIds,
    state.likedVideoIds,
    state.followingIds,
  );
  const longVideos = state.videos.filter(
    (v) => !v.isDeleted && v.videoType === "long",
  );
  const premiumVideos = state.videos.filter(
    (v) => !v.isDeleted && v.videoType === "premium",
  );
  const localAds: LocalAd[] = state.localAds ?? [];

  const handleSeen = useCallback(
    (id: string) => {
      // Show pre-roll ad the first time a video is seen (if not already pre-rolled)
      if (!preRolledVideosRef.current.has(id)) {
        preRolledVideosRef.current.add(id);
        setPreRollVideoId(id);
        // Track ad impression when a pre-roll fires for this video
        dispatch({ type: "TRACK_AD_IMPRESSION", videoId: id });
        // The actual TRACK_SEEN dispatch happens after pre-roll completes
        return;
      }
      dispatch({ type: "TRACK_SEEN", videoId: id });
      // Track ad impression every time a video is seen (banner ad is always shown)
      dispatch({ type: "TRACK_AD_IMPRESSION", videoId: id });
      // Track viewer referral progress (counts toward 3-video condition)
      if (state.currentUser) {
        dispatch({
          type: "VIEWER_VIDEO_WATCHED",
          watcherUserId: state.currentUser.id,
        });
      }
    },
    [dispatch, state.currentUser],
  );

  const handlePreRollComplete = useCallback(() => {
    const id = preRollVideoId;
    setPreRollVideoId(null);
    if (id) {
      dispatch({ type: "TRACK_SEEN", videoId: id });
      // Track viewer referral progress after pre-roll completes too
      if (state.currentUser) {
        dispatch({
          type: "VIEWER_VIDEO_WATCHED",
          watcherUserId: state.currentUser.id,
        });
      }
    }
  }, [preRollVideoId, dispatch, state.currentUser]);

  // Intersection observer for active video tracking (For You tab only)
  // biome-ignore lint/correctness/useExhaustiveDependencies: feed.length intentionally re-runs observer when feed changes
  useEffect(() => {
    if (activeTab !== "foryou") return;
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
    { id: "foryou", label: "For You", ocid: "feed.foryou.tab" },
    { id: "long", label: "Long", ocid: "feed.long.tab" },
    { id: "premium", label: "Premium ✦", ocid: "feed.premium.tab" },
  ];

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* ── Tab Bar ── */}
      <div
        className="absolute top-0 left-0 right-0 z-30 flex items-center gap-1 px-3 pt-3 pb-2"
        style={{
          background:
            activeTab === "foryou"
              ? "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)"
              : "oklch(0.08 0.01 240 / 0.96)",
          backdropFilter: activeTab !== "foryou" ? "blur(12px)" : undefined,
          borderBottom:
            activeTab !== "foryou"
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
            {/* Local ad banner below tab bar, above feed */}
            <div className="absolute top-12 left-0 right-0 z-20 px-4 pt-2 pb-1 pointer-events-auto">
              <LocalAdBanner ads={localAds} />
            </div>

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
