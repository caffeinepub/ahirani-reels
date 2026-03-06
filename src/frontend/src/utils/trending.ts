import type { Video } from "../context/AppContext";

/**
 * Trending algorithm:
 * - Videos never seen get higher scores
 * - Recency + engagement (likes * 1.5 + comments * 2)
 * - New creator boost (random boost for uploaders with < 10 videos)
 * - Following boost: +30 if uploader is in followingIds
 * - Affinity boost: +15 per liked video from same uploader (capped at +60)
 * - Share boost: shareCount * 5
 * - Seen videos go to end
 */
export function trendScore(
  video: Video,
  seenIds: string[],
  uploaderVideoCount: number,
  likedVideoIds: string[] = [],
  followingIds: string[] = [],
  allVideos: Video[] = [],
): number {
  if (seenIds.includes(video.id)) return -1; // Seen → goes to end

  const hoursSince = (Date.now() - video.createdAt) / 3600000;
  const recency = Math.max(0, 1000 - hoursSince);
  const engagement = video.likesCount * 1.5 + video.commentsCount * 2.0;
  const newCreatorBoost = uploaderVideoCount < 10 ? Math.random() * 20 : 0;

  // Following boost
  const followBoost = followingIds.includes(video.uploaderId) ? 30 : 0;

  // Affinity boost: liked videos from same uploader
  const likedFromSameUploader = allVideos.filter(
    (v) => v.uploaderId === video.uploaderId && likedVideoIds.includes(v.id),
  ).length;
  const affinityBoost = Math.min(likedFromSameUploader * 15, 60);

  // Share boost
  const shareBoost = (video.shareCount ?? 0) * 5;

  return (
    recency +
    engagement +
    newCreatorBoost +
    followBoost +
    affinityBoost +
    shareBoost
  );
}

export function getTrendingFeed(
  videos: Video[],
  seenIds: string[],
  likedVideoIds: string[] = [],
  followingIds: string[] = [],
): Video[] {
  const activeVideos = videos.filter((v) => !v.isDeleted);

  // Count videos per uploader
  const uploaderCount: Record<string, number> = {};
  for (const v of activeVideos) {
    uploaderCount[v.uploaderId] = (uploaderCount[v.uploaderId] ?? 0) + 1;
  }

  // Score each video
  const scored = activeVideos.map((v) => ({
    video: v,
    score: trendScore(
      v,
      seenIds,
      uploaderCount[v.uploaderId] ?? 0,
      likedVideoIds,
      followingIds,
      activeVideos,
    ),
  }));

  // Sort: unseen by score desc, then seen appended at end
  const unseen = scored
    .filter((s) => s.score >= 0)
    .sort((a, b) => b.score - a.score);

  const seen = scored
    .filter((s) => s.score < 0)
    .sort((a, b) => b.video.createdAt - a.video.createdAt);

  return [...unseen, ...seen].map((s) => s.video);
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatTime(ms: number): string {
  const diff = Date.now() - ms;
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  const mins = Math.floor(diff / 60000);
  return `${mins}m`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function generateReferralCode(username: string): string {
  return (
    username.slice(0, 5).toUpperCase() + Math.floor(1000 + Math.random() * 9000)
  );
}
