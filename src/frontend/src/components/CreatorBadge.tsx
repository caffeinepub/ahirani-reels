import { BadgeCheck, Flame, Leaf, Star, Trophy } from "lucide-react";
import type { User, Video } from "../context/AppContext";

// ─── Badge Types ──────────────────────────────────────────────────────────────

type BadgeType = "verified" | "top" | "rising" | "new" | null;

interface BadgeConfig {
  label: string;
  icon: React.ReactNode;
  className: string;
}

// ─── Determine badge for a creator ───────────────────────────────────────────

export function getCreatorBadge(
  user: User,
  userVideos: Video[],
  allUsers: User[],
  _allVideos: Video[],
): BadgeType {
  // Only artists or verified users get badges
  if (user.role !== "artist" && !user.isVerifiedCreator) return null;

  // Priority 1: Verified Creator
  if (user.isVerifiedCreator) return "verified";

  // Priority 2: Top Creator — top 5 by totalLikes among artists
  const artists = allUsers.filter((u) => u.role === "artist");
  const sorted = [...artists].sort((a, b) => b.totalLikes - a.totalLikes);
  const topFive = sorted.slice(0, 5);
  if (topFive.some((u) => u.id === user.id)) return "top";

  // Priority 3: Rising Creator — 5+ videos and 500+ totalLikes
  const videoCount = userVideos.filter((v) => !v.isDeleted).length;
  if (videoCount >= 5 && user.totalLikes >= 500) return "rising";

  // Priority 4: New Creator — artist with < 5 uploaded videos
  if (videoCount < 5) return "new";

  return null;
}

// ─── Badge config ─────────────────────────────────────────────────────────────

function getBadgeConfig(
  badge: BadgeType,
  size: "sm" | "md",
): BadgeConfig | null {
  const iconSize = size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5";

  switch (badge) {
    case "verified":
      return {
        label: "Verified",
        icon: <BadgeCheck className={iconSize} />,
        className: "bg-blue-500/25 text-blue-300 border border-blue-500/40",
      };
    case "top":
      return {
        label: "Top Creator",
        icon: <Trophy className={iconSize} />,
        className: "bg-amber-500/25 text-amber-300 border border-amber-500/40",
      };
    case "rising":
      return {
        label: "Rising",
        icon: <Flame className={iconSize} />,
        className:
          "bg-violet-500/25 text-violet-300 border border-violet-500/40",
      };
    case "new":
      return {
        label: "New Creator",
        icon: <Leaf className={iconSize} />,
        className:
          "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40",
      };
    default:
      return null;
  }
}

// ─── CreatorBadge component ───────────────────────────────────────────────────

interface CreatorBadgeProps {
  user: User;
  userVideos: Video[];
  allUsers: User[];
  allVideos: Video[];
  size?: "sm" | "md";
}

export default function CreatorBadge({
  user,
  userVideos,
  allUsers,
  allVideos,
  size = "md",
}: CreatorBadgeProps) {
  const badge = getCreatorBadge(user, userVideos, allUsers, allVideos);
  const config = getBadgeConfig(badge, size);

  if (!config) return null;

  const textSize = size === "sm" ? "text-[9px]" : "text-[10px]";
  const padding = size === "sm" ? "px-1 py-0" : "px-1.5 py-0.5";
  const gap = size === "sm" ? "gap-0.5" : "gap-1";

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${gap} ${padding} ${textSize} ${config.className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

// Re-export for convenience
export { Star };
