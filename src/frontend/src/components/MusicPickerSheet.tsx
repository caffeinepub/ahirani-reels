import { Music, Pause, Play, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { MusicGenre, MusicTrack } from "../context/AppContext";
import { useApp } from "../context/AppContext";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MusicPickerSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (track: MusicTrack) => void;
  selectedTrackId?: string;
}

// ─── Genre Tabs ───────────────────────────────────────────────────────────────

const GENRE_TABS: Array<{ value: MusicGenre | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "folk", label: "Folk" },
  { value: "dance", label: "Dance" },
  { value: "devotional", label: "Devotional" },
  { value: "romance", label: "Romance" },
  { value: "comedy", label: "Comedy" },
  { value: "other", label: "Other" },
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
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full"
          style={{ background: "oklch(0.65 0.28 15)" }}
          animate={{ height: ["4px", "14px", "6px", "12px", "4px"] }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Track Row ────────────────────────────────────────────────────────────────

function TrackRow({
  track,
  isSelected,
  isPlaying,
  onPlayPause,
  onSelect,
}: {
  track: MusicTrack;
  isSelected: boolean;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSelect: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
        isSelected
          ? "ring-1 ring-[oklch(0.65_0.28_15)] bg-[oklch(0.65_0.28_15/0.1)]"
          : "hover:bg-white/5"
      }`}
    >
      {/* Cover avatar */}
      <div
        className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
        style={{
          background: track.coverColor
            ? `radial-gradient(circle at 30% 30%, ${track.coverColor}, oklch(0.15 0.05 0))`
            : "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.45 0.2 340))",
        }}
      >
        {isPlaying ? <WaveBars /> : <Music className="w-4 h-4 text-white/70" />}
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate leading-tight ${isSelected ? "text-white" : "text-white/90"}`}
        >
          {track.title}
        </p>
        <p className="text-white/40 text-xs truncate">
          {track.artist} · {formatDuration(track.duration)} ·{" "}
          {formatPlayCount(track.playCount)} plays
        </p>
      </div>

      {/* Play/Pause button */}
      <button
        type="button"
        data-ocid="music_picker.play_button"
        onClick={(e) => {
          e.stopPropagation();
          onPlayPause();
        }}
        className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 transition-all active:scale-90"
      >
        {isPlaying ? (
          <Pause className="w-3 h-3 text-white" />
        ) : (
          <Play className="w-3 h-3 text-white ml-0.5" />
        )}
      </button>

      {/* Select button */}
      <button
        type="button"
        data-ocid="music_picker.select_button"
        onClick={onSelect}
        className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all active:scale-90 ${
          isSelected
            ? "text-white"
            : "bg-white/10 text-white/70 hover:bg-white/20"
        }`}
        style={isSelected ? { background: "oklch(0.65 0.28 15)" } : {}}
      >
        {isSelected ? "✓" : "Select"}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MusicPickerSheet({
  open,
  onClose,
  onSelect,
  selectedTrackId,
}: MusicPickerSheetProps) {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState<MusicGenre | "all">("all");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Only show approved tracks
  const approvedTracks = state.musicTracks.filter(
    (t) => t.status === "approved",
  );

  const filtered = approvedTracks.filter((t) => {
    const matchSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.artist.toLowerCase().includes(search.toLowerCase());
    const matchGenre = activeGenre === "all" || t.genre === activeGenre;
    return matchSearch && matchGenre;
  });

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Stop audio when sheet closes
  useEffect(() => {
    if (!open) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
  }, [open]);

  const handlePlayPause = (track: MusicTrack) => {
    if (playingId === track.id) {
      // Pause current
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      // Stop previous if any
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      // Play new track
      const audio = new Audio(track.audioUrl);
      audio.volume = 0.8;
      audio.play().catch(() => {});
      audio.onended = () => setPlayingId(null);
      audioRef.current = audio;
      setPlayingId(track.id);
      dispatch({ type: "INCREMENT_MUSIC_PLAY", trackId: track.id });
    }
  };

  const handleSelect = (track: MusicTrack) => {
    onSelect(track);
    // stop any playing preview
    audioRef.current?.pause();
    setPlayingId(null);
  };

  const selectedTrack = approvedTracks.find((t) => t.id === selectedTrackId);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            data-ocid="music_picker.sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, oklch(0.1 0.01 0) 0%, oklch(0.06 0.005 0) 100%)",
              maxHeight: "85dvh",
              border: "1px solid oklch(0.2 0.02 0)",
              borderBottom: "none",
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "oklch(0.65 0.28 15 / 0.25)" }}
                >
                  <Music
                    className="w-4 h-4"
                    style={{ color: "oklch(0.65 0.28 15)" }}
                  />
                </div>
                <h2 className="text-white font-bold text-base">
                  अहिराणी Music Library
                </h2>
              </div>
              <button
                type="button"
                data-ocid="music_picker.close_button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-white/40 shrink-0" />
                <input
                  type="text"
                  data-ocid="music_picker.search_input"
                  placeholder="Search by title or artist..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="text-white/40 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Genre tabs */}
            <div
              data-ocid="music_picker.genre.tab"
              className="flex gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-hide"
            >
              {GENRE_TABS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setActiveGenre(g.value)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    activeGenre === g.value
                      ? "text-white"
                      : "bg-white/8 text-white/50 hover:bg-white/12 hover:text-white/80"
                  }`}
                  style={
                    activeGenre === g.value
                      ? { background: "oklch(0.65 0.28 15)" }
                      : {}
                  }
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Track list */}
            <div className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-2">
              {filtered.length === 0 ? (
                <div
                  data-ocid="music_picker.empty_state"
                  className="py-10 flex flex-col items-center gap-3 text-center"
                >
                  <Music className="w-10 h-10 text-white/15" />
                  <p className="text-white/40 text-sm">No tracks found</p>
                  {search && (
                    <p className="text-white/25 text-xs">
                      Try a different search term
                    </p>
                  )}
                </div>
              ) : (
                filtered.map((track) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    isSelected={track.id === selectedTrackId}
                    isPlaying={playingId === track.id}
                    onPlayPause={() => handlePlayPause(track)}
                    onSelect={() => handleSelect(track)}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 pb-safe pb-5 pt-3 border-t border-white/8 space-y-2">
              {selectedTrack ? (
                <button
                  type="button"
                  data-ocid="music_picker.confirm_button"
                  onClick={() => handleSelect(selectedTrack)}
                  className="w-full h-11 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.98]"
                  style={{ background: "oklch(0.65 0.28 15)" }}
                >
                  Use "{selectedTrack.title}"
                </button>
              ) : (
                <button
                  type="button"
                  data-ocid="music_picker.device_audio_button"
                  onClick={onClose}
                  className="w-full h-11 rounded-xl bg-white/8 border border-white/10 text-white/60 font-medium text-sm transition-all hover:bg-white/12 active:scale-[0.98]"
                >
                  Use Device Audio Instead
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
