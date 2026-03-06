import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Clapperboard,
  Eye,
  Film,
  Heart,
  Shield,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useApp, useIsFollowing, useUserById } from "../context/AppContext";
import { formatCount } from "../utils/trending";
import CreatorBadge from "./CreatorBadge";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ArtistProfileSheetProps {
  artistId: string;
  open: boolean;
  onClose: () => void;
}

// ─── Stats Cell ───────────────────────────────────────────────────────────────

function StatCell({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-white font-bold text-lg leading-tight">
        {value}
      </span>
      <span className="text-white/40 text-xs font-medium">{label}</span>
    </div>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const config =
    role === "admin"
      ? {
          icon: <Shield className="w-2.5 h-2.5" />,
          label: "Admin",
          className:
            "bg-amber-500/20 text-amber-300 border border-amber-500/30",
        }
      : role === "artist"
        ? {
            icon: <Clapperboard className="w-2.5 h-2.5" />,
            label: "Artist",
            className:
              "bg-reels-pink/20 text-reels-pink border border-reels-pink/30",
          }
        : {
            icon: <Eye className="w-2.5 h-2.5" />,
            label: "Viewer",
            className: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
          };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

// ─── ArtistProfileSheet ───────────────────────────────────────────────────────

export function ArtistProfileSheet({
  artistId,
  open,
  onClose,
}: ArtistProfileSheetProps) {
  const { state, dispatch } = useApp();
  const artist = useUserById(artistId);
  const isFollowing = useIsFollowing(artistId);
  const isOwnProfile = state.currentUser?.id === artistId;

  // Get this artist's active videos
  const artistVideos = state.videos.filter(
    (v) => v.uploaderId === artistId && !v.isDeleted,
  );

  const handleFollowToggle = () => {
    if (!state.currentUser || isOwnProfile) return;
    dispatch({
      type: isFollowing ? "UNFOLLOW" : "FOLLOW",
      targetUserId: artistId,
    });
  };

  if (!artist) return null;

  // Get live follower count from state.users (to reflect FOLLOW/UNFOLLOW actions)
  const liveArtist = state.users.find((u) => u.id === artistId) ?? artist;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        data-ocid="artist_profile.sheet"
        side="bottom"
        className="border-t border-white/8 rounded-t-3xl p-0 flex flex-col overflow-hidden"
        style={{
          maxHeight: "90dvh",
          background: "oklch(0.09 0.01 240 / 0.98)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* ── Header ── */}
        <SheetHeader className="px-4 pt-3 pb-0 flex-shrink-0 relative">
          <SheetTitle className="sr-only">
            @{artist.username} profile
          </SheetTitle>
          {/* Close button */}
          <button
            type="button"
            data-ocid="artist_profile.close_button"
            onClick={onClose}
            className="absolute top-3 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10"
            style={{ background: "rgba(255,255,255,0.08)" }}
            aria-label="Close profile"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>

          {/* Drag handle */}
          <div className="mx-auto w-10 h-1 rounded-full bg-white/15 mb-4" />
        </SheetHeader>

        {/* ── Scrollable content ── */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
          }}
        >
          {/* ── Profile section ── */}
          <div className="px-5 pb-5">
            {/* Avatar + name row */}
            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
              >
                <Avatar className="w-20 h-20 border-2 border-reels-pink shadow-lg">
                  <AvatarImage src={artist.avatar} />
                  <AvatarFallback
                    className="text-white font-bold text-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.55 0.25 15), oklch(0.6 0.28 350))",
                    }}
                  >
                    {artist.username?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <p className="text-white font-bold text-lg leading-tight">
                  @{artist.username}
                </p>

                {/* Badges row */}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <RoleBadge role={artist.role} />
                  <CreatorBadge
                    user={artist}
                    userVideos={artistVideos}
                    allUsers={state.users}
                    allVideos={state.videos}
                    size="sm"
                  />
                </div>

                {/* Bio */}
                {artist.bio && (
                  <p className="text-white/55 text-sm leading-relaxed max-w-xs">
                    {artist.bio}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Stats row: Followers | Following | Likes */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="flex items-center justify-around rounded-2xl px-4 py-3 mb-4"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.14 0.02 240 / 0.8), oklch(0.10 0.01 240 / 0.9))",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <StatCell
                value={formatCount(liveArtist.followers ?? 0)}
                label="Followers"
              />
              <div className="w-px h-8 bg-white/10" />
              <StatCell
                value={formatCount(liveArtist.following ?? 0)}
                label="Following"
              />
              <div className="w-px h-8 bg-white/10" />
              <StatCell
                value={formatCount(liveArtist.totalLikes ?? 0)}
                label="Likes"
              />
            </motion.div>

            {/* Follow / Following button */}
            {!isOwnProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Button
                  type="button"
                  data-ocid="artist_profile.follow_button"
                  onClick={handleFollowToggle}
                  className="w-full h-11 font-bold text-sm rounded-xl transition-all duration-200"
                  style={
                    isFollowing
                      ? {
                          background: "transparent",
                          border: "1.5px solid rgba(255,255,255,0.2)",
                          color: "rgba(255,255,255,0.7)",
                        }
                      : {
                          background:
                            "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
                          border: "none",
                          color: "#fff",
                        }
                  }
                >
                  {isFollowing ? (
                    <span className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Following ✓
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Follow
                    </span>
                  )}
                </Button>
              </motion.div>
            )}
          </div>

          {/* ── Videos grid ── */}
          <div className="px-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                Videos ({artistVideos.length})
              </p>
            </div>

            {artistVideos.length === 0 ? (
              <div
                data-ocid="artist_profile.empty_state"
                className="flex flex-col items-center justify-center gap-3 py-12 text-center"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Film className="w-6 h-6 text-white/25" />
                </div>
                <p className="text-white/30 text-sm">No videos yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {artistVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    data-ocid={`artist_profile.video.item.${index + 1}`}
                    initial={{ opacity: 0, scale: 0.93 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className="relative rounded-xl overflow-hidden"
                    style={{ aspectRatio: "9/16" }}
                  >
                    <video
                      src={video.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    >
                      <track kind="captions" />
                    </video>

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* Like count */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-white/80 fill-white/80" />
                      <span className="text-white text-[10px] font-semibold">
                        {formatCount(video.likesCount)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
