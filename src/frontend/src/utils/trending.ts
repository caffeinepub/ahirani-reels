import type { Video } from "../context/AppContext";

/** Upgraded trending score with recency decay, better weights */
export function trendScore(
  video: Video,
  seenIds: string[],
  uploaderVideoCount: number,
  likedVideoIds: string[] = [],
  followingIds: string[] = [],
  allVideos: Video[] = [],
): number {
  if (seenIds.includes(video.id)) return -1;

  const hoursSince = (Date.now() - video.createdAt) / 3600000;
  // Recency decay: max 200 for brand new, decays over 48h
  const recency = Math.max(0, 200 - (hoursSince / 48) * 200);
  // Better engagement weights
  const engagement =
    video.likesCount * 2.0 +
    video.commentsCount * 3.0 +
    video.viewsCount * 0.2 +
    (video.shareCount ?? 0) * 8;
  // New creator boost (< 5 videos: strong random boost for visibility)
  const newCreatorBoost =
    uploaderVideoCount < 5
      ? Math.random() * 40
      : uploaderVideoCount < 10
        ? Math.random() * 20
        : 0;
  const followBoost = followingIds.includes(video.uploaderId) ? 30 : 0;
  const likedFromSameUploader = allVideos.filter(
    (v) => v.uploaderId === video.uploaderId && likedVideoIds.includes(v.id),
  ).length;
  const affinityBoost = Math.min(likedFromSameUploader * 15, 60);
  const promotionBoost =
    video.isPromoted &&
    video.promotionExpiry &&
    video.promotionExpiry > Date.now()
      ? 500
      : 0;

  return (
    recency +
    engagement +
    newCreatorBoost +
    followBoost +
    affinityBoost +
    promotionBoost
  );
}

export function getTrendingFeed(
  videos: Video[],
  seenIds: string[],
  likedVideoIds: string[] = [],
  followingIds: string[] = [],
): Video[] {
  const activeVideos = videos.filter((v) => !v.isDeleted);
  const uploaderCount: Record<string, number> = {};
  for (const v of activeVideos) {
    uploaderCount[v.uploaderId] = (uploaderCount[v.uploaderId] ?? 0) + 1;
  }
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
  const unseen = scored
    .filter((s) => s.score >= 0)
    .sort((a, b) => b.score - a.score);
  const seen = scored
    .filter((s) => s.score < 0)
    .sort((a, b) => b.video.createdAt - a.video.createdAt);

  // Inject new-creator videos every 5th slot
  const mainFeed = unseen.map((s) => s.video);
  const newCreatorVideos = activeVideos.filter(
    (v) => (uploaderCount[v.uploaderId] ?? 0) < 5 && !seenIds.includes(v.id),
  );
  if (newCreatorVideos.length > 0) {
    let ncIdx = 0;
    for (let i = 4; i < mainFeed.length; i += 5) {
      const nc = newCreatorVideos[ncIdx % newCreatorVideos.length];
      // Only inject if not already in that position
      if (mainFeed[i]?.id !== nc.id) {
        mainFeed.splice(i, 0, nc);
        // Remove duplicate if exists elsewhere
        const dupIdx = mainFeed.findIndex(
          (v, idx) => v.id === nc.id && idx !== i,
        );
        if (dupIdx !== -1) mainFeed.splice(dupIdx, 1);
      }
      ncIdx++;
    }
  }

  return [...mainFeed, ...seen.map((s) => s.video)];
}

/**
 * Get trending feed (pure engagement score, no seen-filter), used for Trending tab.
 * Injects new-creator every 5th slot.
 */
export function getTrendingTabFeed(videos: Video[]): Video[] {
  const activeVideos = videos.filter((v) => !v.isDeleted);
  const uploaderCount: Record<string, number> = {};
  for (const v of activeVideos) {
    uploaderCount[v.uploaderId] = (uploaderCount[v.uploaderId] ?? 0) + 1;
  }

  const scored = activeVideos
    .map((v) => {
      const hoursSince = (Date.now() - v.createdAt) / 3600000;
      const recency = Math.max(0, 200 - (hoursSince / 48) * 200);
      const engagement =
        v.likesCount * 2.0 +
        v.commentsCount * 3.0 +
        v.viewsCount * 0.2 +
        (v.shareCount ?? 0) * 8;
      const promotionBoost =
        v.isPromoted && v.promotionExpiry && v.promotionExpiry > Date.now()
          ? 500
          : 0;
      return { video: v, score: recency + engagement + promotionBoost };
    })
    .sort((a, b) => b.score - a.score)
    .map((s) => s.video);

  // Inject new-creator every 5th slot
  const newCreatorVideos = activeVideos.filter(
    (v) => (uploaderCount[v.uploaderId] ?? 0) < 5,
  );
  if (newCreatorVideos.length > 0) {
    let ncIdx = 0;
    const result = [...scored];
    for (let i = 4; i < result.length; i += 5) {
      const nc = newCreatorVideos[ncIdx % newCreatorVideos.length];
      if (result[i]?.id !== nc.id) {
        result.splice(i, 0, nc);
        const dupIdx = result.findIndex(
          (v, idx) => v.id === nc.id && idx !== i,
        );
        if (dupIdx !== -1) result.splice(dupIdx, 1);
      }
      ncIdx++;
    }
    return result;
  }
  return scored;
}

/** Get explore feed filtered by category and sort mode */
export type SortMode = "trending" | "latest" | "most_viewed" | "most_liked";
export type ExploreCategory =
  | "all"
  | "Comedy"
  | "Music"
  | "Dance"
  | "Short Films"
  | "Ahirani Culture";

export function getExploreFeed(
  videos: Video[],
  category: ExploreCategory,
  sortMode: SortMode,
): Video[] {
  const uploaderCount: Record<string, number> = {};
  for (const v of videos.filter((v) => !v.isDeleted)) {
    uploaderCount[v.uploaderId] = (uploaderCount[v.uploaderId] ?? 0) + 1;
  }

  let filtered = videos.filter((v) => {
    if (v.isDeleted) return false;
    if (category === "all") return true;
    // Match category field (case-insensitive)
    const cat = (v.category ?? "").toLowerCase();
    const target = category.toLowerCase();
    return cat === target || cat.includes(target.split(" ")[0]);
  });

  switch (sortMode) {
    case "latest":
      filtered = filtered.sort((a, b) => b.createdAt - a.createdAt);
      break;
    case "most_viewed":
      filtered = filtered.sort((a, b) => b.viewsCount - a.viewsCount);
      break;
    case "most_liked":
      filtered = filtered.sort((a, b) => b.likesCount - a.likesCount);
      break;
    default: {
      filtered = filtered.sort((a, b) => {
        const scoreA =
          a.likesCount * 2 +
          a.commentsCount * 3 +
          a.viewsCount * 0.2 +
          (a.shareCount ?? 0) * 8;
        const scoreB =
          b.likesCount * 2 +
          b.commentsCount * 3 +
          b.viewsCount * 0.2 +
          (b.shareCount ?? 0) * 8;
        return scoreB - scoreA;
      });
    }
  }

  // Inject new-creator every 5th slot
  const newCreatorVideos = filtered.filter(
    (v) => (uploaderCount[v.uploaderId] ?? 0) < 5,
  );
  if (newCreatorVideos.length > 0) {
    let ncIdx = 0;
    const result = [...filtered];
    for (let i = 4; i < result.length; i += 5) {
      const nc = newCreatorVideos[ncIdx % newCreatorVideos.length];
      if (result[i]?.id !== nc.id) {
        result.splice(i, 0, nc);
        const dupIdx = result.findIndex(
          (v, idx) => v.id === nc.id && idx !== i,
        );
        if (dupIdx !== -1) result.splice(dupIdx, 1);
      }
      ncIdx++;
    }
    return result;
  }
  return filtered;
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
