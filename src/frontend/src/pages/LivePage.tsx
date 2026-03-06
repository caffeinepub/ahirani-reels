import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { Send, Video, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import GiftPanel from "../components/GiftPanel";
import type { LiveStream } from "../context/AppContext";
import { useApp } from "../context/AppContext";
import { generateId } from "../utils/trending";

// ─── Live timer ───────────────────────────────────────────────────────────────

function useLiveTimer(startedAt: number) {
  const [elapsed, setElapsed] = useState(Date.now() - startedAt);
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startedAt);
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const totalSecs = Math.floor(elapsed / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// ─── Chat message row ─────────────────────────────────────────────────────────

function ChatMessageRow({
  msg,
  index,
}: {
  msg: {
    id: string;
    userId: string;
    username: string;
    text: string;
    createdAt: number;
  };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index < 5 ? 0 : 0 }}
      className="flex items-start gap-2"
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
        style={{ background: "oklch(0.4 0.2 15 / 0.7)" }}
      >
        {msg.username[0]?.toUpperCase() ?? "U"}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-white/70 mr-1.5">
          @{msg.username}
        </span>
        <span className="text-white/90 text-sm break-words">{msg.text}</span>
      </div>
    </motion.div>
  );
}

// ─── Artist view ──────────────────────────────────────────────────────────────

function ArtistLiveView({
  stream,
  onEnd,
}: {
  stream: LiveStream;
  onEnd: () => void;
}) {
  const { state, dispatch } = useApp();
  const [chatText, setChatText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const liveTime = useLiveTimer(stream.startedAt);

  const liveStream =
    state.liveStreams.find((s) => s.id === stream.id) ?? stream;
  const chatLength = liveStream.chatMessages.length;

  // biome-ignore lint/correctness/useExhaustiveDependencies: chatLength drives auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLength]);

  const handleSendChat = () => {
    if (!chatText.trim() || !state.currentUser) return;
    dispatch({
      type: "SEND_LIVE_CHAT",
      streamId: stream.id,
      message: {
        id: generateId(),
        userId: state.currentUser.id,
        username: state.currentUser.username,
        text: chatText.trim(),
        createdAt: Date.now(),
      },
    });
    setChatText("");
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.08 0.04 15) 0%, oklch(0.04 0.02 0) 100%)",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          {/* Pulsing LIVE badge */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <Badge className="bg-red-500 text-white border-0 text-xs font-bold px-2 py-0.5">
              LIVE
            </Badge>
          </div>
          <span className="text-white/60 text-sm font-mono">{liveTime}</span>
        </div>

        {/* Viewer count */}
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <span className="text-sm">👁</span>
          <span className="text-white font-semibold text-sm">
            {liveStream.viewerCount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 pb-4">
        <p className="text-white font-bold text-lg">{stream.title}</p>
        <p className="text-white/50 text-sm">You are broadcasting live</p>
      </div>

      {/* Video placeholder (dark gradient) */}
      <div
        className="mx-4 rounded-2xl flex items-center justify-center"
        style={{
          height: 180,
          background:
            "linear-gradient(135deg, oklch(0.12 0.04 0 / 0.8), oklch(0.06 0.02 0))",
          border: "1px solid oklch(0.3 0.1 15 / 0.3)",
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <Video className="w-10 h-10 text-red-400/50" />
          <span className="text-white/30 text-xs">Camera preview</span>
        </div>
      </div>

      {/* Chat feed */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
        <AnimatePresence initial={false}>
          {liveStream.chatMessages.map((msg, i) => (
            <ChatMessageRow key={msg.id} msg={msg} index={i} />
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Chat input + end live */}
      <div className="px-4 pb-6 pt-3 space-y-3">
        <div className="flex gap-2">
          <Input
            data-ocid="live.chat.input"
            placeholder="Say something to your viewers..."
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/30 text-sm rounded-full"
          />
          <Button
            data-ocid="live.chat.submit_button"
            type="button"
            size="icon"
            onClick={handleSendChat}
            disabled={!chatText.trim()}
            className="shrink-0 rounded-full"
            style={{
              background: chatText.trim() ? "oklch(0.65 0.28 15)" : undefined,
            }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <Button
          data-ocid="live.end_button"
          onClick={onEnd}
          className="w-full h-11 font-bold rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.45 0.22 25), oklch(0.5 0.25 15))",
            color: "white",
          }}
        >
          <X className="w-4 h-4 mr-2" />
          End Live Stream
        </Button>
      </div>
    </div>
  );
}

// ─── Viewer view ──────────────────────────────────────────────────────────────

function ViewerLiveView({ stream }: { stream: LiveStream }) {
  const { state, dispatch } = useApp();
  const [chatText, setChatText] = useState("");
  const [giftOpen, setGiftOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const liveStream =
    state.liveStreams.find((s) => s.id === stream.id) ?? stream;
  const artist = state.users.find((u) => u.id === stream.artistId);
  const liveTime = useLiveTimer(stream.startedAt);

  useEffect(() => {
    // Join the live stream when component mounts
    dispatch({ type: "JOIN_LIVE", streamId: stream.id });
    return () => {
      dispatch({ type: "LEAVE_LIVE", streamId: stream.id });
    };
  }, [dispatch, stream.id]);

  const viewerChatLength = liveStream.chatMessages.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: viewerChatLength drives auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [viewerChatLength]);

  const handleSendChat = () => {
    if (!chatText.trim() || !state.currentUser) return;
    dispatch({
      type: "SEND_LIVE_CHAT",
      streamId: stream.id,
      message: {
        id: generateId(),
        userId: state.currentUser.id,
        username: state.currentUser.username,
        text: chatText.trim(),
        createdAt: Date.now(),
      },
    });
    setChatText("");
  };

  return (
    <div
      className="flex flex-col h-full relative"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.06 0.03 260) 0%, oklch(0.03 0.01 0) 100%)",
      }}
    >
      {/* Artist video placeholder */}
      <div className="relative flex-shrink-0" style={{ height: "45dvh" }}>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.1 0.04 260 / 0.8), oklch(0.05 0.02 260))",
          }}
        >
          <Avatar className="w-20 h-20 border-4 border-red-500/50">
            <AvatarImage src={artist?.avatar} />
            <AvatarFallback className="bg-white/10 text-white text-2xl font-bold">
              {artist?.username?.[0]?.toUpperCase() ?? "A"}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-white font-bold text-base">
              @{artist?.username ?? "artist"}
            </p>
            <p className="text-white/50 text-sm">{stream.title}</p>
          </div>
        </div>

        {/* Top overlay: LIVE badge + viewer count */}
        <div className="absolute top-12 left-0 right-0 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <Badge className="bg-red-500 text-white border-0 text-xs font-bold">
              LIVE
            </Badge>
            <span className="text-white/50 text-xs font-mono">{liveTime}</span>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <span className="text-sm">👁</span>
            <span className="text-white text-sm font-semibold">
              {liveStream.viewerCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Gift button (floating) */}
        <button
          type="button"
          data-ocid="live.gift.open_modal_button"
          onClick={() => setGiftOpen(true)}
          className="absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-xl transition-transform active:scale-90"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.18 60), oklch(0.6 0.22 40))",
          }}
          aria-label="Send a gift"
        >
          🎁
        </button>
      </div>

      {/* Chat feed */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
        <AnimatePresence initial={false}>
          {liveStream.chatMessages.map((msg, i) => (
            <ChatMessageRow key={msg.id} msg={msg} index={i} />
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Chat input */}
      <div className="px-4 pb-6 pt-3">
        <div className="flex gap-2">
          <Input
            data-ocid="live.chat.input"
            placeholder="Say something..."
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/30 text-sm rounded-full"
          />
          <Button
            data-ocid="live.chat.submit_button"
            type="button"
            size="icon"
            onClick={handleSendChat}
            disabled={!chatText.trim()}
            className="shrink-0 rounded-full"
            style={{
              background: chatText.trim() ? "oklch(0.65 0.28 15)" : undefined,
            }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Gift panel */}
      <GiftPanel
        artistId={stream.artistId}
        liveStreamId={stream.id}
        open={giftOpen}
        onClose={() => setGiftOpen(false)}
      />
    </div>
  );
}

// ─── Start Live Form ──────────────────────────────────────────────────────────

function StartLiveForm() {
  const { state, dispatch } = useApp();
  const [title, setTitle] = useState("");
  const [started, setStarted] = useState(false);
  const [streamId, setStreamId] = useState<string | null>(null);
  const navigate = useNavigate();

  const currentUser = state.currentUser;

  const handleGoLive = () => {
    if (!currentUser || !title.trim()) return;
    const id = generateId();
    const stream: LiveStream = {
      id,
      artistId: currentUser.id,
      title: title.trim(),
      viewerCount: 0,
      chatMessages: [],
      startedAt: Date.now(),
      isActive: true,
    };
    dispatch({ type: "START_LIVE", stream });
    setStreamId(id);
    setStarted(true);
    toast.success("You are now LIVE! 🔴", {
      description: "Your followers have been notified",
    });
  };

  if (started && streamId) {
    const stream = state.liveStreams.find((s) => s.id === streamId);
    if (stream) {
      return (
        <ArtistLiveView
          stream={stream}
          onEnd={() => {
            dispatch({ type: "END_LIVE", streamId });
            toast.success("Live stream ended");
            navigate({ to: "/" });
          }}
        />
      );
    }
  }

  return (
    <div
      className="flex flex-col h-full items-center justify-center px-6"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.08 0.04 15) 0%, oklch(0.04 0.02 0) 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        {/* Live icon */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.45 0.22 15 / 0.3), oklch(0.3 0.15 15 / 0.2))",
              border: "1px solid oklch(0.5 0.22 15 / 0.4)",
            }}
          >
            <span className="text-4xl">📡</span>
          </div>
          <div className="text-center">
            <h2 className="text-white font-bold text-xl">Go Live</h2>
            <p className="text-white/50 text-sm mt-1">
              Start a live stream for your followers
            </p>
          </div>
        </div>

        {/* Title input */}
        <div className="space-y-2">
          <label
            className="text-white/60 text-sm font-medium"
            htmlFor="live-title"
          >
            Stream Title
          </label>
          <Input
            id="live-title"
            data-ocid="live.title.input"
            placeholder="What are you going to do today?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && title.trim() && handleGoLive()
            }
            className="bg-white/8 border-white/15 text-white placeholder:text-white/30 rounded-xl h-12"
          />
        </div>

        {/* Go Live button */}
        <Button
          data-ocid="live.go_live.primary_button"
          onClick={handleGoLive}
          disabled={!title.trim()}
          className="w-full h-13 font-bold text-base rounded-xl"
          style={{
            height: 52,
            background: title.trim()
              ? "linear-gradient(135deg, oklch(0.5 0.25 15), oklch(0.55 0.28 5))"
              : undefined,
            color: "white",
          }}
        >
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          Go Live
        </Button>

        <p className="text-center text-white/30 text-xs">
          Your followers will receive a notification when you go live
        </p>
      </motion.div>
    </div>
  );
}

// ─── Live Page ────────────────────────────────────────────────────────────────

export default function LivePage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  // Parse streamId from URL query params
  const searchParams = new URLSearchParams(window.location.search);
  const streamId = searchParams.get("streamId");

  const currentUser = state.currentUser;

  // If no streamId -> artist start live form or redirect
  if (!streamId) {
    // Viewers without a streamId get sent to the feed
    if (currentUser?.role === "viewer") {
      return (
        <div
          className="flex flex-col h-full items-center justify-center gap-4 px-6"
          style={{ background: "oklch(0.05 0.01 0)" }}
        >
          <span className="text-5xl">📡</span>
          <p className="text-white/60 text-sm text-center">
            No live stream specified. Browse the feed to find active streams.
          </p>
          <Button
            data-ocid="live.back.button"
            onClick={() => navigate({ to: "/" })}
            variant="outline"
            style={{
              borderColor: "rgba(255,255,255,0.2)",
              color: "white",
              background: "transparent",
            }}
          >
            Back to Feed
          </Button>
        </div>
      );
    }

    // Artist start live
    return <StartLiveForm />;
  }

  const stream = state.liveStreams.find((s) => s.id === streamId);

  // Stream not found or ended
  if (!stream || !stream.isActive) {
    return (
      <div
        className="flex flex-col h-full items-center justify-center gap-4 px-6"
        style={{ background: "oklch(0.05 0.01 0)" }}
      >
        <span className="text-5xl">📺</span>
        <div className="text-center">
          <p className="text-white font-bold text-lg">Stream has ended</p>
          <p className="text-white/50 text-sm mt-1">
            This live stream is no longer active.
          </p>
        </div>
        <Button
          data-ocid="live.back.button"
          onClick={() => navigate({ to: "/" })}
          variant="outline"
          style={{
            borderColor: "rgba(255,255,255,0.2)",
            color: "white",
            background: "transparent",
          }}
        >
          Back to Feed
        </Button>
      </div>
    );
  }

  // Artist is the stream owner
  if (currentUser?.id === stream.artistId) {
    return (
      <ArtistLiveView
        stream={stream}
        onEnd={() => {
          dispatch({ type: "END_LIVE", streamId });
          toast.success("Live stream ended");
          navigate({ to: "/" });
        }}
      />
    );
  }

  // Viewer watching the live stream
  return <ViewerLiveView stream={stream} />;
}
