import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Heart, IndianRupee, Medal, Trophy, Users } from "lucide-react";
import { motion } from "motion/react";
import CreatorBadge from "../components/CreatorBadge";
import { useApp } from "../context/AppContext";
import { formatCount } from "../utils/trending";

// ─── Medal config ─────────────────────────────────────────────────────────────

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="text-amber-400 font-black text-lg w-7 text-center flex-shrink-0">
        🥇
      </span>
    );
  if (rank === 2)
    return (
      <span className="text-slate-300 font-black text-lg w-7 text-center flex-shrink-0">
        🥈
      </span>
    );
  if (rank === 3)
    return (
      <span className="text-orange-400 font-black text-lg w-7 text-center flex-shrink-0">
        🥉
      </span>
    );
  return (
    <span className="text-white/30 font-semibold text-sm w-7 text-center flex-shrink-0">
      {rank}
    </span>
  );
}

// ─── Row glow for top 3 ───────────────────────────────────────────────────────

function rowStyle(rank: number): React.CSSProperties {
  if (rank === 1)
    return {
      background:
        "linear-gradient(90deg, oklch(0.22 0.06 70 / 0.5), oklch(0.12 0.02 70 / 0.1))",
      borderLeft: "2px solid oklch(0.75 0.18 80 / 0.6)",
    };
  if (rank === 2)
    return {
      background:
        "linear-gradient(90deg, oklch(0.2 0.02 220 / 0.4), oklch(0.12 0.01 220 / 0.1))",
      borderLeft: "2px solid oklch(0.6 0.06 220 / 0.5)",
    };
  if (rank === 3)
    return {
      background:
        "linear-gradient(90deg, oklch(0.22 0.05 35 / 0.4), oklch(0.12 0.02 35 / 0.1))",
      borderLeft: "2px solid oklch(0.65 0.14 40 / 0.5)",
    };
  return {};
}

// ─── Leaderboard Page ─────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const { state } = useApp();

  // Top Creators — rank by totalLikes
  const topCreators = [...state.users]
    .filter((u) => u.role === "artist")
    .sort((a, b) => b.totalLikes - a.totalLikes)
    .slice(0, 10);

  // Top Referrers — rank by referral count
  const referralCountMap: Record<string, number> = {};
  const referralEarningsMap: Record<string, number> = {};
  for (const r of state.referrals) {
    referralCountMap[r.referrerId] = (referralCountMap[r.referrerId] ?? 0) + 1;
    referralEarningsMap[r.referrerId] =
      (referralEarningsMap[r.referrerId] ?? 0) + r.commissionEarned;
  }
  const topReferrers = [...state.users]
    .filter((u) => (referralCountMap[u.id] ?? 0) > 0)
    .sort(
      (a, b) => (referralCountMap[b.id] ?? 0) - (referralCountMap[a.id] ?? 0),
    )
    .slice(0, 10);

  // Top Earners — rank by pendingEarnings + totalEarnings
  const topEarners = [...state.users]
    .sort(
      (a, b) =>
        (b.pendingEarnings ?? 0) +
        (b.totalEarnings ?? 0) -
        ((a.pendingEarnings ?? 0) + (a.totalEarnings ?? 0)),
    )
    .slice(0, 10);

  const getUserVideos = (userId: string) =>
    state.videos.filter((v) => v.uploaderId === userId && !v.isDeleted);

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">
              Leaderboard
            </h1>
            <p className="text-white/40 text-xs">Top creators &amp; earners</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 pb-28">
        <Tabs defaultValue="creators">
          <TabsList className="w-full bg-white/5 border border-white/10 mb-5 h-10">
            <TabsTrigger
              value="creators"
              data-ocid="leaderboard.creators.tab"
              className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs"
            >
              🎬 Creators
            </TabsTrigger>
            <TabsTrigger
              value="referrers"
              data-ocid="leaderboard.referrers.tab"
              className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs"
            >
              👥 Referrers
            </TabsTrigger>
            <TabsTrigger
              value="earners"
              data-ocid="leaderboard.earners.tab"
              className="flex-1 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs"
            >
              💰 Earners
            </TabsTrigger>
          </TabsList>

          {/* ── Top Creators ── */}
          <TabsContent value="creators" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 overflow-hidden"
              style={{ background: "oklch(0.1 0.01 240 / 0.9)" }}
            >
              {/* Table header */}
              <div className="px-4 py-3 border-b border-white/8 grid grid-cols-[28px_1fr_auto_auto] gap-2 items-center">
                <span className="text-white/30 text-[10px] font-semibold uppercase tracking-wider">
                  #
                </span>
                <span className="text-white/30 text-[10px] font-semibold uppercase tracking-wider">
                  Creator
                </span>
                <span className="text-white/30 text-[10px] font-semibold uppercase tracking-wider w-14 text-right">
                  Likes
                </span>
                <span className="text-white/30 text-[10px] font-semibold uppercase tracking-wider w-14 text-right">
                  Views
                </span>
              </div>

              {topCreators.length === 0 ? (
                <div
                  data-ocid="leaderboard.creators.empty_state"
                  className="py-12 text-center"
                >
                  <p className="text-4xl mb-3">🎬</p>
                  <p className="text-white/40 text-sm">No creators yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {topCreators.map((user, i) => {
                    const rank = i + 1;
                    const totalViews = getUserVideos(user.id).reduce(
                      (s, v) => s + (v.viewsCount ?? 0),
                      0,
                    );
                    return (
                      <motion.div
                        key={user.id}
                        data-ocid={`leaderboard.creators.item.${rank}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="px-4 py-3 grid grid-cols-[28px_1fr_auto_auto] gap-2 items-center"
                        style={rowStyle(rank)}
                      >
                        <RankMedal rank={rank} />

                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar className="w-9 h-9 shrink-0">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-white/10 text-white text-xs font-bold">
                              {user.username[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-semibold truncate leading-tight">
                              @{user.username}
                            </p>
                            <div className="mt-0.5">
                              <CreatorBadge
                                user={user}
                                userVideos={getUserVideos(user.id)}
                                allUsers={state.users}
                                allVideos={state.videos}
                                size="sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 w-14 justify-end">
                          <Heart className="w-3 h-3 text-reels-pink fill-reels-pink" />
                          <span className="text-white/70 text-xs tabular-nums">
                            {formatCount(user.totalLikes)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 w-14 justify-end">
                          <Eye className="w-3 h-3 text-blue-400" />
                          <span className="text-white/70 text-xs tabular-nums">
                            {formatCount(totalViews)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* ── Top Referrers ── */}
          <TabsContent value="referrers" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 overflow-hidden"
              style={{ background: "oklch(0.1 0.01 240 / 0.9)" }}
            >
              <div className="px-4 py-3 border-b border-white/8 grid grid-cols-[28px_1fr_auto_auto] gap-2 items-center">
                <span className="text-white/30 text-[10px] font-semibold uppercase tracking-wider">
                  #
                </span>
                <span className="text-white/30 text-[10px] font-semibold uppercase tracking-wider">
                  User
                </span>
                <span className="text-white/30 text-[10px] font-semibold uppercase tracking-wider w-14 text-right">
                  Refs
                </span>
                <span className="text-white/30 text-[10px] font-semibold uppercase tracking-wider w-16 text-right">
                  Earned
                </span>
              </div>

              {topReferrers.length === 0 ? (
                <div
                  data-ocid="leaderboard.referrers.empty_state"
                  className="py-12 text-center"
                >
                  <p className="text-4xl mb-3">👥</p>
                  <p className="text-white/40 text-sm">No referrals yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {topReferrers.map((user, i) => {
                    const rank = i + 1;
                    return (
                      <motion.div
                        key={user.id}
                        data-ocid={`leaderboard.referrers.item.${rank}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="px-4 py-3 grid grid-cols-[28px_1fr_auto_auto] gap-2 items-center"
                        style={rowStyle(rank)}
                      >
                        <RankMedal rank={rank} />

                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar className="w-9 h-9 shrink-0">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-white/10 text-white text-xs font-bold">
                              {user.username[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-semibold truncate leading-tight">
                              @{user.username}
                            </p>
                            <div className="mt-0.5">
                              <CreatorBadge
                                user={user}
                                userVideos={getUserVideos(user.id)}
                                allUsers={state.users}
                                allVideos={state.videos}
                                size="sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 w-14 justify-end">
                          <Users className="w-3 h-3 text-emerald-400" />
                          <span className="text-white/70 text-xs tabular-nums">
                            {referralCountMap[user.id] ?? 0}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 w-16 justify-end">
                          <IndianRupee className="w-3 h-3 text-amber-400" />
                          <span className="text-amber-300 text-xs tabular-nums font-semibold">
                            {(referralEarningsMap[user.id] ?? 0).toFixed(0)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* ── Top Earners ── */}
          <TabsContent value="earners" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 overflow-hidden"
              style={{ background: "oklch(0.1 0.01 240 / 0.9)" }}
            >
              <div className="px-4 py-3 border-b border-white/8 grid grid-cols-[28px_1fr_auto] gap-2 items-center">
                <span className="text-white/30 text-[10px] font-semibold uppercase tracking-wider">
                  #
                </span>
                <span className="text-white/30 text-[10px] font-semibold uppercase tracking-wider">
                  User
                </span>
                <span className="text-white/30 text-[10px] font-semibold uppercase tracking-wider w-20 text-right">
                  Earnings ₹
                </span>
              </div>

              {topEarners.length === 0 ? (
                <div
                  data-ocid="leaderboard.earners.empty_state"
                  className="py-12 text-center"
                >
                  <p className="text-4xl mb-3">💰</p>
                  <p className="text-white/40 text-sm">No earnings yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {topEarners.map((user, i) => {
                    const rank = i + 1;
                    const totalEarned =
                      (user.pendingEarnings ?? 0) + (user.totalEarnings ?? 0);
                    return (
                      <motion.div
                        key={user.id}
                        data-ocid={`leaderboard.earners.item.${rank}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="px-4 py-3 grid grid-cols-[28px_1fr_auto] gap-2 items-center"
                        style={rowStyle(rank)}
                      >
                        <RankMedal rank={rank} />

                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar className="w-9 h-9 shrink-0">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-white/10 text-white text-xs font-bold">
                              {user.username[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-semibold truncate leading-tight">
                              @{user.username}
                            </p>
                            <div className="mt-0.5">
                              <CreatorBadge
                                user={user}
                                userVideos={getUserVideos(user.id)}
                                allUsers={state.users}
                                allVideos={state.videos}
                                size="sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 w-20 justify-end">
                          <IndianRupee className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 text-xs tabular-nums font-bold">
                            {totalEarned.toFixed(2)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Monthly reset note */}
        <div className="mt-4 rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-center">
          <p className="text-white/30 text-xs">
            🔄 Leaderboard resets on the 1st of each month
          </p>
        </div>
      </div>
    </div>
  );
}
