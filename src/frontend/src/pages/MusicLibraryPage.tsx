import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Music, Pause, Play, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { MusicGenre } from "../context/AppContext";
import { useApp } from "../context/AppContext";

// ─── Genre filter tabs ────────────────────────────────────────────────────────

const GENRE_TABS: Array<{
  value: MusicGenre | "all";
  label: string;
  emoji: string;
}> = [
  { value: "all", label: "All", emoji: "🎵" },
  { value: "folk", label: "Folk", emoji: "🌾" },
  { value: "dance", label: "Dance", emoji: "💃" },
  { value: "devotional", label: "Devotional", emoji: "🙏" },
  { value: "romance", label: "Romance", emoji: "💕" },
  { value: "comedy", label: "Comedy", emoji: "😄" },
  { value: "other", label: "Other", emoji: "✨" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatPlayCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

// ─── Animated Wave Bars ───────────────────────────────────────────────────────

function WaveBars() {
  return (
    <div className="flex items-end gap-0.5 h-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ background: "oklch(0.65 0.28 15)" }}
          animate={{ height: ["4px", "18px", "6px", "14px", "4px"] }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MusicLibraryPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState<MusicGenre | "all">("all");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const approvedTracks = state.musicTracks.filter(
    (t) => t.status === "approved",
  );
  const totalPlays = approvedTracks.reduce((s, t) => s + t.playCount, 0);

  const filtered = approvedTracks.filter((t) => {
    const matchSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.artist.toLowerCase().includes(search.toLowerCase());
    const matchGenre = activeGenre === "all" || t.genre === activeGenre;
    return matchSearch && matchGenre;
  });

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayPause = (trackId: string, audioUrl: string) => {
    if (playingId === trackId) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      const audio = new Audio(audioUrl);
      audio.volume = 0.8;
      audio.play().catch(() => {});
      audio.onended = () => setPlayingId(null);
      audioRef.current = audio;
      setPlayingId(trackId);
      dispatch({ type: "INCREMENT_MUSIC_PLAY", trackId });
    }
  };

  const genreColors: Record<string, string> = {
    folk: "oklch(0.65 0.18 60)",
    dance: "oklch(0.65 0.22 340)",
    devotional: "oklch(0.65 0.2 80)",
    romance: "oklch(0.65 0.22 350)",
    comedy: "oklch(0.65 0.2 50)",
    other: "oklch(0.6 0.15 200)",
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Sticky header */}
      <div
        className="sticky top-0 z-10 backdrop-blur border-b border-white/8 px-4 py-4"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.07 0.01 0 / 0.97) 0%, oklch(0.05 0.008 0 / 0.95) 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-ocid="music_library.back_button"
            onClick={() => navigate({ to: "/" })}
            className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-white text-base leading-tight">
              अहिराणी Music Library
            </h1>
            <p className="text-white/40 text-[11px]">
              {approvedTracks.length} tracks · {formatPlayCount(totalPlays)}{" "}
              total plays
            </p>
          </div>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.65 0.28 15 / 0.2)" }}
          >
            <Music
              className="w-4 h-4"
              style={{ color: "oklch(0.65 0.28 15)" }}
            />
          </div>
        </div>
      </div>

      <div className="pb-24">
        {/* Stats bar */}
        <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-hide">
          {[
            {
              label: "Total Tracks",
              value: approvedTracks.length,
              color: "oklch(0.65 0.28 15)",
            },
            {
              label: "Total Plays",
              value: formatPlayCount(totalPlays),
              color: "oklch(0.6 0.22 200)",
            },
            {
              label: "Genres",
              value: new Set(approvedTracks.map((t) => t.genre)).size,
              color: "oklch(0.65 0.2 80)",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="shrink-0 px-4 py-2.5 rounded-xl border border-white/8 min-w-[100px] text-center"
              style={{ background: `${stat.color}18` }}
            >
              <p className="font-bold text-lg text-white">{stat.value}</p>
              <p className="text-white/40 text-[10px]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-white/6 border border-white/10 rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-white/35 shrink-0" />
            <input
              type="text"
              data-ocid="music_library.search_input"
              placeholder="Search songs, artists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-white/35 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Genre tabs */}
        <div
          data-ocid="music_library.genre.tab"
          className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide"
        >
          {GENRE_TABS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setActiveGenre(g.value)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                activeGenre === g.value
                  ? "text-white"
                  : "bg-white/6 text-white/45 hover:bg-white/10 hover:text-white/70"
              }`}
              style={
                activeGenre === g.value
                  ? { background: "oklch(0.65 0.28 15)" }
                  : {}
              }
            >
              <span>{g.emoji}</span>
              {g.label}
            </button>
          ))}
        </div>

        {/* Track list */}
        <div className="px-4 space-y-2">
          {filtered.length === 0 ? (
            <div
              data-ocid="music_library.empty_state"
              className="py-16 flex flex-col items-center gap-3 text-center"
            >
              <Music className="w-12 h-12 text-white/10" />
              <p className="text-white/35 text-sm font-medium">
                No tracks found
              </p>
              {search && (
                <p className="text-white/20 text-xs">
                  Try searching something else
                </p>
              )}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.map((track, i) => {
                const isPlaying = playingId === track.id;
                const coverColor =
                  track.coverColor ??
                  genreColors[track.genre] ??
                  "oklch(0.65 0.28 15)";

                return (
                  <motion.div
                    key={track.id}
                    data-ocid={`music_library.item.${i + 1}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      isPlaying
                        ? "border-[oklch(0.65_0.28_15/0.4)]"
                        : "border-white/6 hover:border-white/12"
                    }`}
                    style={
                      isPlaying
                        ? { background: "oklch(0.65 0.28 15 / 0.08)" }
                        : { background: "oklch(0.09 0.005 0)" }
                    }
                  >
                    {/* Cover */}
                    <div
                      className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${coverColor}, oklch(0.12 0.04 0))`,
                      }}
                    >
                      {isPlaying ? (
                        <WaveBars />
                      ) : (
                        <Music className="w-5 h-5 text-white/60" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">
                        {track.title}
                      </p>
                      <p className="text-white/45 text-xs truncate">
                        {track.artist}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full capitalize"
                          style={{
                            background: `${coverColor}25`,
                            color: coverColor,
                          }}
                        >
                          {track.genre}
                        </span>
                        <span className="text-white/25 text-[10px]">
                          {formatDuration(track.duration)}
                        </span>
                        <span className="text-white/25 text-[10px]">
                          {formatPlayCount(track.playCount)} plays
                        </span>
                      </div>
                    </div>

                    {/* Play button */}
                    <button
                      type="button"
                      data-ocid={`music_library.play_button.${i + 1}`}
                      onClick={() => handlePlayPause(track.id, track.audioUrl)}
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90"
                      style={
                        isPlaying
                          ? { background: "oklch(0.65 0.28 15)" }
                          : { background: "oklch(0.2 0.02 0)" }
                      }
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white/70 ml-0.5" />
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/6 text-center">
        <p className="text-white/20 text-[11px]">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 hover:text-white/50 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
