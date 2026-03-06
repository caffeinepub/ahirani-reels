import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Clapperboard, Eye, Search, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import type { User, Video } from "../context/AppContext";
import { formatCount } from "../utils/trending";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ArtistSearchSheetProps {
  open: boolean;
  onClose: () => void;
}

// ─── Artist Card ──────────────────────────────────────────────────────────────

function ArtistCard({
  user,
  videos,
  index,
}: {
  user: User;
  videos: Video[];
  index: number;
}) {
  const userVideos = videos.filter(
    (v) => v.uploaderId === user.id && !v.isDeleted,
  );
  const previewVideos = userVideos.slice(0, 3);
  const isArtist = user.role === "artist";

  return (
    <motion.div
      data-ocid={`search.artist_card.item.${index + 1}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="rounded-2xl overflow-hidden border border-white/8"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.12 0.02 240 / 0.9), oklch(0.08 0.01 240 / 0.95))",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Top row: avatar + info */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <Avatar className="w-12 h-12 shrink-0 border-2 border-white/10">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="bg-white/10 text-white font-bold text-sm">
            {user.username?.[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Username + role badge */}
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-white font-bold text-sm truncate">
              @{user.username}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                isArtist
                  ? "bg-reels-pink/20 text-reels-pink border border-reels-pink/30"
                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              }`}
            >
              {isArtist ? (
                <Clapperboard className="w-2.5 h-2.5" />
              ) : (
                <Eye className="w-2.5 h-2.5" />
              )}
              {isArtist ? "Artist" : "Viewer"}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-1">
            {/* Followers */}
            <div className="flex items-center gap-1 text-white/50">
              <Users className="w-3 h-3" />
              <span className="text-[11px] font-medium">
                {formatCount(user.followers ?? 0)}{" "}
                <span className="text-white/30">followers</span>
              </span>
            </div>
            {/* Video count */}
            <div className="flex items-center gap-1 text-white/50">
              <Clapperboard className="w-3 h-3" />
              <span className="text-[11px] font-medium">
                {userVideos.length}{" "}
                <span className="text-white/30">videos</span>
              </span>
            </div>
          </div>

          {/* Referral code */}
          <div className="mt-1.5">
            <span
              className="font-mono text-[10px] px-2 py-0.5 rounded-md text-white/60"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {user.referralCode ?? "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Video thumbnails row */}
      {previewVideos.length > 0 && (
        <div className="px-4 pb-4 flex gap-2">
          {previewVideos.map((v) => (
            <div
              key={v.id}
              className="relative rounded-lg overflow-hidden flex-shrink-0"
              style={{ width: 60, height: 80 }}
            >
              <video
                src={v.url}
                className="w-full h-full object-cover"
                preload="metadata"
                muted
                playsInline
              >
                <track kind="captions" />
              </video>
              {/* subtle overlay */}
              <div className="absolute inset-0 bg-black/20 rounded-lg" />
            </div>
          ))}
          {userVideos.length > 3 && (
            <div
              className="flex-shrink-0 rounded-lg flex items-center justify-center"
              style={{
                width: 60,
                height: 80,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span className="text-white/50 text-[11px] font-semibold">
                +{userVideos.length - 3}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── Artist Search Sheet ──────────────────────────────────────────────────────

export function ArtistSearchSheet({ open, onClose }: ArtistSearchSheetProps) {
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

  // Clear on close
  useEffect(() => {
    if (!open) {
      setRawQuery("");
      setDebouncedQuery("");
    }
  }, [open]);

  // Filter users (exclude admin)
  const results =
    debouncedQuery.length === 0
      ? []
      : state.users.filter((u) => {
          if (u.role === "admin") return false;
          const q = debouncedQuery;
          return (
            u.username.toLowerCase().includes(q) ||
            u.id.toLowerCase().includes(q)
          );
        });

  const isEmpty = debouncedQuery.length > 0 && results.length === 0;
  const isPrompt = debouncedQuery.length === 0;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="border-t border-white/10 rounded-t-2xl p-0 flex flex-col"
        style={{
          maxHeight: "90dvh",
          background: "oklch(0.08 0.01 240)",
        }}
      >
        {/* Header */}
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white font-bold text-base">
              Search Creators
            </SheetTitle>
            <button
              type="button"
              data-ocid="search.close_button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.08)" }}
              aria-label="Close search"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* Search input */}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            <Input
              data-ocid="search.input"
              type="search"
              autoFocus
              value={rawQuery}
              onChange={(e) => setRawQuery(e.target.value)}
              placeholder="Search by name or ID..."
              className="pl-9 h-11 rounded-xl text-sm border-white/20 placeholder:text-white/30 text-white"
              style={{ background: "rgba(255,255,255,0.1)" }}
            />
          </div>
        </SheetHeader>

        {/* Results */}
        <div
          data-ocid="search.results.list"
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
        >
          <AnimatePresence mode="wait">
            {/* Prompt state */}
            {isPrompt && (
              <motion.div
                key="prompt"
                data-ocid="search.empty_state"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center gap-3 py-16 px-8 text-center"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <Search className="w-6 h-6 text-white/30" />
                </div>
                <p className="text-white/40 text-sm leading-relaxed">
                  Type a name or ID to find creators
                </p>
              </motion.div>
            )}

            {/* No results state */}
            {isEmpty && (
              <motion.div
                key="empty"
                data-ocid="search.empty_state"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center gap-3 py-16 px-8 text-center"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <Users className="w-6 h-6 text-white/30" />
                </div>
                <p className="text-white/40 text-sm">No creators found</p>
                <p className="text-white/25 text-xs">
                  Try searching a different name or ID
                </p>
              </motion.div>
            )}

            {/* Results list */}
            {!isPrompt && !isEmpty && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="px-4 py-3 space-y-3"
              >
                <p className="text-white/30 text-xs font-medium mb-1">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
                {results.map((user, index) => (
                  <ArtistCard
                    key={user.id}
                    user={user}
                    videos={state.videos}
                    index={index}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
