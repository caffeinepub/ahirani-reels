import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Clapperboard,
  Eye,
  Hash,
  Search,
  Shield,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { User, UserRole } from "../context/AppContext";
import { useApp, useIsFollowing } from "../context/AppContext";
import { formatCount } from "../utils/trending";

// ─── Role Badge ────────────────────────────────────────────────────────────────

function RoleBadgeSmall({ role }: { role: UserRole }) {
  const config: Record<
    UserRole,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    viewer: {
      label: "Viewer",
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      icon: <Eye className="w-2.5 h-2.5" />,
    },
    artist: {
      label: "Artist",
      className: "bg-reels-pink/20 text-reels-pink border-reels-pink/30",
      icon: <Clapperboard className="w-2.5 h-2.5" />,
    },
    admin: {
      label: "Admin",
      className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      icon: <Shield className="w-2.5 h-2.5" />,
    },
  };
  const { label, className, icon } = config[role] ?? config.viewer;
  return (
    <Badge
      variant="secondary"
      className={`text-[10px] px-1.5 py-0 ${className}`}
    >
      <span className="flex items-center gap-1">
        {icon}
        {label}
      </span>
    </Badge>
  );
}

// ─── Follow Button ─────────────────────────────────────────────────────────────

function FollowButton({
  targetUser,
  index,
}: { targetUser: User; index: number }) {
  const { state, dispatch } = useApp();
  const isFollowing = useIsFollowing(targetUser.id);
  const isCurrentUser = state.currentUser?.id === targetUser.id;

  if (isCurrentUser) return null;

  return (
    <Button
      data-ocid={`search.follow_button.${index}`}
      size="sm"
      variant="ghost"
      onClick={() => {
        if (!state.currentUser) return;
        dispatch({
          type: isFollowing ? "UNFOLLOW" : "FOLLOW",
          targetUserId: targetUser.id,
        });
      }}
      className={`h-8 px-3 text-xs font-semibold rounded-full transition-all shrink-0 ${
        isFollowing
          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
          : "bg-reels-pink/20 text-reels-pink border border-reels-pink/30 hover:bg-reels-pink/30"
      }`}
    >
      {isFollowing ? (
        <span className="flex items-center gap-1">
          <UserCheck className="w-3 h-3" />
          Following
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <UserPlus className="w-3 h-3" />
          Follow
        </span>
      )}
    </Button>
  );
}

// ─── Creator Card ──────────────────────────────────────────────────────────────

function CreatorCard({ user, index }: { user: User; index: number }) {
  const { state } = useApp();
  const userVideos = state.videos.filter(
    (v) => v.uploaderId === user.id && !v.isDeleted,
  );

  return (
    <motion.div
      data-ocid={`search.creator.item.${index + 1}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="flex items-center gap-3 rounded-2xl p-4 border border-white/8"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.12 0.02 240 / 0.9), oklch(0.08 0.01 240 / 0.95))",
      }}
    >
      <Avatar className="w-12 h-12 shrink-0 border-2 border-white/10">
        <AvatarImage src={user.avatar} />
        <AvatarFallback className="bg-white/10 text-white font-bold text-sm">
          {user.username?.[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-white font-semibold text-sm truncate">
            @{user.username}
          </span>
          <RoleBadgeSmall role={user.role ?? "viewer"} />
        </div>
        <div className="flex items-center gap-3 text-white/50">
          <span className="flex items-center gap-1 text-[11px]">
            <Users className="w-3 h-3" />
            {formatCount(user.followers ?? 0)} followers
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <Clapperboard className="w-3 h-3" />
            {userVideos.length} videos
          </span>
        </div>
      </div>

      <FollowButton targetUser={user} index={index + 1} />
    </motion.div>
  );
}

// ─── Hashtag Accordion Item ────────────────────────────────────────────────────

function HashtagItem({
  hashtag,
  count,
  index,
}: {
  hashtag: string;
  count: number;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { state } = useApp();
  const matchingVideos = state.videos.filter(
    (v) => !v.isDeleted && v.hashtags.includes(hashtag),
  );

  return (
    <motion.div
      data-ocid={`search.hashtag.item.${index + 1}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="rounded-2xl border border-white/8 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.12 0.02 240 / 0.9), oklch(0.08 0.01 240 / 0.95))",
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-reels-pink/15 border border-reels-pink/25 flex items-center justify-center shrink-0">
          <Hash className="w-4 h-4 text-reels-pink" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">#{hashtag}</p>
          <p className="text-white/40 text-xs">
            {count} video{count !== 1 ? "s" : ""}
          </p>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 90 : 0 }}
          className="text-white/30 text-xs"
        >
          ▶
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-white/8 pt-3">
              {matchingVideos.map((v) => {
                const uploader = state.users.find((u) => u.id === v.uploaderId);
                return (
                  <div
                    key={v.id}
                    className="flex items-center gap-2 text-sm text-white/70"
                  >
                    <div className="w-8 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5">
                      <video
                        src={v.url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      >
                        <track kind="captions" />
                      </video>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs text-white font-medium">
                        {v.caption.length > 40
                          ? `${v.caption.slice(0, 40)}…`
                          : v.caption}
                      </p>
                      <p className="text-white/40 text-[10px]">
                        @{uploader?.username ?? "user"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Search Page ───────────────────────────────────────────────────────────────

export default function SearchPage() {
  const { state } = useApp();
  const [rawQuery, setRawQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce 200ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(rawQuery.trim().toLowerCase());
    }, 200);
    return () => clearTimeout(timer);
  }, [rawQuery]);

  const isPrompt = debouncedQuery.length === 0;

  // Search creators (by username, bio — exclude admin)
  const creatorResults = isPrompt
    ? []
    : state.users.filter((u) => {
        if (u.role === "admin") return false;
        const q = debouncedQuery;
        return (
          u.username.toLowerCase().includes(q) ||
          u.bio?.toLowerCase().includes(q)
        );
      });

  // Search hashtags across all active videos
  const hashtagCounts: Record<string, number> = {};
  for (const video of state.videos.filter((v) => !v.isDeleted)) {
    for (const tag of video.hashtags) {
      if (!isPrompt && tag.toLowerCase().includes(debouncedQuery)) {
        hashtagCounts[tag] = (hashtagCounts[tag] ?? 0) + 1;
      }
    }
  }
  const hashtagResults = Object.entries(hashtagCounts).sort(
    ([, a], [, b]) => b - a,
  );

  const hasResults = creatorResults.length > 0 || hashtagResults.length > 0;

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Sticky header */}
      <div
        className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-white/8"
        style={{ background: "oklch(0.08 0.01 240)" }}
      >
        <h1 className="font-display text-xl font-bold text-white mb-3">
          Search
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          <Input
            data-ocid="search.input"
            type="search"
            autoFocus
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Search creators, hashtags..."
            className="pl-9 h-11 rounded-xl text-sm border-white/20 placeholder:text-white/30 text-white"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />
        </div>
      </div>

      {/* Scrollable results */}
      <div className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {isPrompt ? (
            <motion.div
              key="prompt"
              data-ocid="search.empty_state"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-4 py-20 px-8 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Search className="w-7 h-7 text-white/20" />
              </div>
              <div>
                <p className="text-white/50 text-sm font-medium">
                  Search for creators, videos, or hashtags
                </p>
                <p className="text-white/25 text-xs mt-1">
                  Type a username, name, or #hashtag
                </p>
              </div>
            </motion.div>
          ) : !hasResults ? (
            <motion.div
              key="no-results"
              data-ocid="search.empty_state"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-4 py-20 px-8 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Users className="w-7 h-7 text-white/20" />
              </div>
              <div>
                <p className="text-white/50 text-sm font-medium">
                  No results found
                </p>
                <p className="text-white/25 text-xs mt-1">
                  Try searching a different name or hashtag
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-4 space-y-6"
            >
              {/* Creators section */}
              {creatorResults.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white/40" />
                    <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                      Creators ({creatorResults.length})
                    </h2>
                  </div>
                  {creatorResults.map((user, i) => (
                    <CreatorCard key={user.id} user={user} index={i} />
                  ))}
                </div>
              )}

              {/* Hashtags section */}
              {hashtagResults.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-white/40" />
                    <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                      Videos by Hashtag ({hashtagResults.length})
                    </h2>
                  </div>
                  {hashtagResults.map(([tag, count], i) => (
                    <HashtagItem
                      key={tag}
                      hashtag={tag}
                      count={count}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
