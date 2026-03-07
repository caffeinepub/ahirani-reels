import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  Camera,
  CameraOff,
  ChevronLeft,
  FlipHorizontal,
  Gauge,
  ImageIcon,
  Library,
  Mic,
  MicOff,
  Music,
  Timer,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import MusicPickerSheet from "../components/MusicPickerSheet";
import type { MusicTrack } from "../context/AppContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type AudioMode = "mic" | "upload" | "voice" | "ahirani";
type FilterName = "normal" | "warm" | "cool" | "vivid" | "fade" | "bw";
type TimerOption = 0 | 3 | 10;
type CameraMode = "video" | "photo";

// ─── Filter definitions ───────────────────────────────────────────────────────

const FILTERS: Array<{ name: FilterName; label: string; css: string }> = [
  { name: "normal", label: "Normal", css: "" },
  { name: "warm", label: "Warm", css: "sepia(0.3) saturate(1.2)" },
  { name: "cool", label: "Cool", css: "hue-rotate(200deg) saturate(0.8)" },
  { name: "vivid", label: "Vivid", css: "saturate(1.8) contrast(1.1)" },
  {
    name: "fade",
    label: "Fade",
    css: "brightness(1.1) contrast(0.8) saturate(0.8)",
  },
  { name: "bw", label: "B&W", css: "grayscale(1)" },
];

const MAX_DURATION = 60; // seconds

// ─── Get supported mimeType — Android Chrome priority ────────────────────────
// Strategy: prefer the simplest type that isTypeSupported returns true for.
// On Android Chrome, complex codec strings can be accepted by isTypeSupported
// but still throw on MediaRecorder constructor. We use progressively simpler
// types and also try constructing a MediaRecorder directly to verify support.

function getSupportedMimeType(): string {
  const types = [
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4;codecs=h264,aac",
    "video/mp4",
  ];

  // Try to actually construct a MediaRecorder with a dummy stream to verify
  // (just check isTypeSupported — construction requires a live stream)
  for (const type of types) {
    try {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    } catch {
      // ignore
    }
  }
  // Return empty string — MediaRecorder will use browser default
  return "";
}

// ─── Try creating MediaRecorder with fallback chain ──────────────────────────

function createMediaRecorder(stream: MediaStream): MediaRecorder {
  const mimeType = getSupportedMimeType();

  // Try with mimeType first
  if (mimeType) {
    try {
      return new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2_000_000,
        audioBitsPerSecond: 128_000,
      });
    } catch {
      // fall through
    }
  }

  // Try without options (browser default)
  try {
    return new MediaRecorder(stream);
  } catch {
    throw new Error("MediaRecorder not supported");
  }
}

// ─── Format seconds as MM:SS ─────────────────────────────────────────────────

function formatTimer(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CameraRecordPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as {
    from?: string;
    mode?: string;
  };
  const fromAdmin = search?.from === "admin";
  const initialMode: CameraMode = search?.mode === "photo" ? "photo" : "video";

  // Camera mode
  const [cameraMode, setCameraMode] = useState<CameraMode>(initialMode);

  // Camera state
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string>("");
  // isCameraReady: video element has data and can be played
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSeconds, setRecordedSeconds] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Settings
  const [timerOption, setTimerOption] = useState<TimerOption>(0);
  const [audioMode, setAudioMode] = useState<AudioMode>("mic");
  const [selectedFilter, setSelectedFilter] = useState<FilterName>("normal");
  const [beautyOn, setBeautyOn] = useState(false);
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast] = useState(1.0);
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [uploadedAudioFile, setUploadedAudioFile] = useState<File | null>(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<MusicTrack | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const audioInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  // Native camera fallback (capture="camcorder") for when MediaRecorder fails
  const nativeCameraRef = useRef<HTMLInputElement>(null);
  const uploadedAudioRef = useRef<File | null>(null);
  const selectedMusicRef = useRef<MusicTrack | null>(null);
  // Keep stable ref for isRecording so event handlers see current value
  const isRecordingRef = useRef(false);
  // Track stream start attempts to prevent concurrent calls
  const streamStartingRef = useRef(false);
  // Whether stream is actually active (separate from isCameraReady for button gating)
  const [hasStream, setHasStream] = useState(false);

  useEffect(() => {
    uploadedAudioRef.current = uploadedAudioFile;
  }, [uploadedAudioFile]);
  useEffect(() => {
    selectedMusicRef.current = selectedMusic;
  }, [selectedMusic]);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Compute CSS filter string
  const filterCss = useCallback((): string => {
    const base = FILTERS.find((f) => f.name === selectedFilter)?.css ?? "";
    const adjustments = [
      brightness !== 1.0 ? `brightness(${brightness.toFixed(2)})` : "",
      contrast !== 1.0 ? `contrast(${contrast.toFixed(2)})` : "",
      beautyOn ? "blur(0.4px) brightness(1.05) saturate(1.1)" : "",
    ]
      .filter(Boolean)
      .join(" ");
    return [base, adjustments].filter(Boolean).join(" ") || "none";
  }, [selectedFilter, brightness, contrast, beautyOn]);

  // ── Attach stream to video element ──────────────────────────────────────────

  const attachStreamToVideo = useCallback((stream: MediaStream) => {
    const video = videoRef.current;
    if (!video) return;

    // Detach any previous stream
    video.pause();
    video.srcObject = null;

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    // Mark stream as active immediately — allows record button to become enabled
    // even before video element fires events (critical for Android Chrome)
    setHasStream(true);

    let readyMarked = false;
    const markReady = () => {
      if (readyMarked) return;
      readyMarked = true;
      setIsCameraReady(true);
      setHasStream(true);
      video.play().catch(() => {
        // Autoplay blocked — attempt on user interaction or retry
        setTimeout(() => video.play().catch(() => {}), 500);
      });
    };

    video.onloadedmetadata = markReady;
    video.oncanplay = markReady;
    video.onloadeddata = markReady;

    // If stream is already flowing (e.g. mode switch)
    if (video.readyState >= 2) {
      markReady();
    }

    // Fallback: force ready after 600ms regardless of events
    const t1 = setTimeout(() => {
      if (!readyMarked) {
        readyMarked = true;
        setIsCameraReady(true);
        setHasStream(true);
        video.play().catch(() => {});
      }
    }, 600);

    // Final fallback at 1.5s
    const t2 = setTimeout(() => {
      setIsCameraReady(true);
      setHasStream(true);
      video.play().catch(() => {});
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // ── Start camera stream ──────────────────────────────────────────────────────

  const startStream = useCallback(
    async (facing: "user" | "environment") => {
      if (streamStartingRef.current) return;
      streamStartingRef.current = true;

      // Stop existing tracks first
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
        streamRef.current = null;
      }

      setIsCameraReady(false);
      setHasStream(false);
      setCameraError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Camera not supported in this browser. Please use Chrome on Android.",
        );
        setHasPermission(false);
        streamStartingRef.current = false;
        return;
      }

      // Build constraints — request audio for video mode (microphone)
      const wantAudio = audioMode !== "upload";

      // For Android Chrome: use simpler constraints without ideal facingMode
      // as complex constraints can fail silently on some devices
      const videoConstraints: MediaTrackConstraints = {
        facingMode: { ideal: facing },
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
      };

      let stream: MediaStream | null = null;

      // Attempt 1: video + audio (mic)
      if (wantAudio) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100,
            },
          });
        } catch {
          // Mic denied or unavailable — try video only
          stream = null;
        }
      }

      // Attempt 2: video only (if audio failed or not needed)
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: false,
          });
        } catch {
          stream = null;
        }
      }

      // Attempt 3: minimal constraints (last resort for old devices)
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facing },
            audio: false,
          });
        } catch (err: unknown) {
          const error = err as { name?: string; message?: string };
          setHasPermission(false);
          streamStartingRef.current = false;
          if (
            error.name === "NotAllowedError" ||
            error.name === "PermissionDeniedError"
          ) {
            setCameraError(
              "Camera permission denied. Open browser Settings > Site Settings > Camera and allow access, then reload.",
            );
          } else if (
            error.name === "NotFoundError" ||
            error.name === "DevicesNotFoundError"
          ) {
            setCameraError("No camera found on this device.");
          } else if (
            error.name === "NotReadableError" ||
            error.name === "TrackStartError"
          ) {
            setCameraError(
              "Camera is in use by another app. Close it and try again.",
            );
          } else {
            setCameraError(
              `Could not start camera: ${error.name ?? error.message ?? "unknown error"}. Try reloading the page.`,
            );
          }
          return;
        }
      }

      streamRef.current = stream;
      setHasPermission(true);
      attachStreamToVideo(stream);

      streamStartingRef.current = false;
    },
    [audioMode, attachStreamToVideo],
  );

  // ── Mount: start camera ──────────────────────────────────────────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only
  useEffect(() => {
    startStream("environment");
    return () => {
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) track.stop();
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // ── Flip camera ──────────────────────────────────────────────────────────────

  const handleFlip = () => {
    if (isRecording) return;
    const newFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacing);
    streamStartingRef.current = false; // allow restart
    startStream(newFacing);
  };

  // ── Navigate to edit after recording ────────────────────────────────────────

  const navigateToEdit = useCallback(
    (blob: Blob) => {
      navigate({
        to: "/edit-video",
        state: {
          videoBlob: blob,
          audioFile: uploadedAudioRef.current,
          selectedMusic: selectedMusicRef.current,
          fromCamera: true,
          fromAdmin,
        } as never,
      });
    },
    [navigate, fromAdmin],
  );

  // ── Stop recording timer ─────────────────────────────────────────────────────

  const stopTimers = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // ── Open native camera as fallback ──────────────────────────────────────────

  const openNativeCamera = useCallback(() => {
    nativeCameraRef.current?.click();
  }, []);

  // ── Actual recording start ───────────────────────────────────────────────────

  // biome-ignore lint/correctness/useExhaustiveDependencies: uses stable refs
  const beginRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) {
      // No stream — fall back to native camera
      openNativeCamera();
      return;
    }

    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0 || videoTracks[0].readyState === "ended") {
      // Stream died — try native camera fallback
      streamStartingRef.current = false;
      startStream(facingMode);
      openNativeCamera();
      return;
    }

    chunksRef.current = [];

    let recorder: MediaRecorder;
    try {
      recorder = createMediaRecorder(stream);
    } catch {
      // MediaRecorder completely unsupported — open native camera
      openNativeCamera();
      return;
    }

    const effectiveMime = recorder.mimeType || "video/webm";

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      stopTimers();
      setIsRecording(false);
      isRecordingRef.current = false;
      const chunks = chunksRef.current;
      if (chunks.length === 0) {
        setCameraError("No video captured. Try again or use gallery.");
        return;
      }
      const blob = new Blob(chunks, { type: effectiveMime });
      navigateToEdit(blob);
    };

    recorder.onerror = () => {
      stopTimers();
      setIsRecording(false);
      isRecordingRef.current = false;
      // On error, automatically fall back to native camera
      openNativeCamera();
    };

    mediaRecorderRef.current = recorder;

    try {
      // timeslice of 250ms — reliable chunk collection on Android Chrome
      recorder.start(250);
    } catch {
      // start() threw (e.g. wrong state or unsupported) — use native camera
      openNativeCamera();
      return;
    }

    setIsRecording(true);
    isRecordingRef.current = true;
    setRecordedSeconds(0);

    timerIntervalRef.current = setInterval(() => {
      setRecordedSeconds((prev) => {
        const next = prev + 1;
        if (next >= MAX_DURATION) {
          // Auto-stop at max duration
          const rec = mediaRecorderRef.current;
          if (rec && rec.state === "recording") {
            rec.stop();
          }
          stopTimers();
          return MAX_DURATION;
        }
        return next;
      });
    }, 1000);
  }, [navigateToEdit, stopTimers, facingMode, startStream, openNativeCamera]);

  // ── Stop recording ───────────────────────────────────────────────────────────

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop(); // onstop handles navigation
    }
    stopTimers();
    setIsRecording(false);
  }, [stopTimers]);

  // ── Record button press ──────────────────────────────────────────────────────

  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    // Clear previous errors
    setCameraError("");

    if (timerOption > 0) {
      setCountdown(timerOption);
      let remaining = timerOption;
      countdownIntervalRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setCountdown(null);
          beginRecording();
        }
      }, 1000);
    } else {
      beginRecording();
    }
  };

  // ── Gallery / file selection ─────────────────────────────────────────────────

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    e.target.value = "";
    if (cameraMode === "photo") {
      navigate({
        to: "/edit-photo",
        state: { photoFile: file, fromAdmin } as never,
      });
    } else {
      navigate({
        to: "/edit-video",
        state: {
          videoFile: file,
          audioFile: uploadedAudioFile,
          selectedMusic,
          fromCamera: false,
          fromAdmin,
        } as never,
      });
    }
  };

  // ── Photo capture ────────────────────────────────────────────────────────────

  const handleCapturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (facingMode === "user") {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    const f = filterCss();
    if (f && f !== "none") ctx.filter = f;
    ctx.drawImage(video, 0, 0, w, h);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        navigate({
          to: "/edit-photo",
          state: { photoBlob: blob, fromAdmin } as never,
        });
      },
      "image/jpeg",
      0.92,
    );
  };

  // ── Audio upload ─────────────────────────────────────────────────────────────

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedAudioFile(file);
    e.target.value = "";
  };

  // ── Switch camera mode (photo / video) ───────────────────────────────────────

  const switchCameraMode = (mode: CameraMode) => {
    if (isRecording || countdown !== null) return;
    setCameraMode(mode);
    setIsCameraReady(false);
    streamStartingRef.current = false;
    startStream(facingMode);
  };

  const backTarget = fromAdmin ? "/admin" : "/upload";
  const progressPct = (recordedSeconds / MAX_DURATION) * 100;
  // canRecord: allow recording as soon as stream is active (hasStream), even if
  // video element events haven't fired yet — critical for Android Chrome
  const canRecord = hasStream && !isRecording && countdown === null;
  const canPhoto = isCameraReady;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col">
      {/* ── Live camera feed ── */}
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: filterCss(),
          transform: facingMode === "user" ? "scaleX(-1)" : "none",
          // Ensure video is always visible behind overlays
          zIndex: 0,
        }}
      />

      {/* Dark gradient overlays */}
      <div className="absolute inset-x-0 top-0 h-36 pointer-events-none bg-gradient-to-b from-black/70 to-transparent z-10" />
      <div className="absolute inset-x-0 bottom-0 h-64 pointer-events-none bg-gradient-to-t from-black/80 to-transparent z-10" />

      {/* ── Permission / Error state ── */}
      {hasPermission === false && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 px-6 text-center gap-5">
          <CameraOff className="w-16 h-16 text-white/30" />
          <h2 className="text-white font-bold text-xl">Camera Unavailable</h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">
            {cameraError}
          </p>
          <Button
            onClick={() => {
              streamStartingRef.current = false;
              setHasPermission(null);
              startStream(facingMode);
            }}
            style={{ background: "oklch(0.65 0.28 15)" }}
          >
            Try Again
          </Button>
          {/* Fallback: select from gallery */}
          <button
            type="button"
            className="flex items-center gap-2 text-white/60 text-sm underline underline-offset-2"
            onClick={() => galleryInputRef.current?.click()}
          >
            <ImageIcon className="w-4 h-4" />
            Select from Gallery instead
          </button>
        </div>
      )}

      {/* ── Loading state ── */}
      {hasPermission === null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-3">
            <Camera className="w-10 h-10 text-white/40 animate-pulse" />
            <p className="text-white/50 text-sm">Starting camera...</p>
          </div>
        </div>
      )}

      {/* ── Non-fatal camera error toast (during use) ── */}
      {hasPermission === true && cameraError && (
        <div className="absolute top-20 inset-x-4 z-40 bg-red-900/90 backdrop-blur border border-red-500/40 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-red-400 text-base mt-0.5">⚠</span>
          <p className="text-white text-xs leading-relaxed flex-1">
            {cameraError}
          </p>
          <button
            type="button"
            onClick={() => setCameraError("")}
            className="text-white/60 hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Countdown overlay ── */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            key={countdown}
            initial={{ scale: 1.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <span
              className="text-white font-black"
              style={{
                fontSize: "clamp(6rem, 30vw, 10rem)",
                textShadow: "0 4px 30px rgba(0,0,0,0.8)",
              }}
            >
              {countdown}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP BAR ── */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-safe pt-4 pb-3">
        {/* Back */}
        <button
          type="button"
          data-ocid="camera.back_button"
          onClick={() => navigate({ to: backTarget })}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Photo / Video toggle (hidden while recording) */}
        {!isRecording && countdown === null && (
          <div className="flex items-center bg-black/50 backdrop-blur-sm rounded-full p-0.5 gap-0.5">
            <button
              type="button"
              data-ocid="camera.mode_photo_button"
              onClick={() => switchCameraMode("photo")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                cameraMode === "photo"
                  ? "bg-white text-black shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              📷 Photo
            </button>
            <button
              type="button"
              data-ocid="camera.mode_video_button"
              onClick={() => switchCameraMode("video")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                cameraMode === "video"
                  ? "bg-white text-black shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              🎬 Video
            </button>
          </div>
        )}

        {/* Recording indicator + timer */}
        {isRecording && (
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-sm font-bold tabular-nums tracking-wide">
              {formatTimer(recordedSeconds)}
            </span>
            <span className="text-white/40 text-xs">
              / {formatTimer(MAX_DURATION)}
            </span>
          </div>
        )}

        {/* Flip camera */}
        <button
          type="button"
          data-ocid="camera.flip_button"
          onClick={handleFlip}
          disabled={isRecording}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white active:scale-95 transition-transform disabled:opacity-40"
        >
          <FlipHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* ── SIDE CONTROLS ── */}
      {!isRecording && countdown === null && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
          <button
            type="button"
            data-ocid="camera.effects_toggle"
            onClick={() => setShowEffectsPanel((p) => !p)}
            className={`w-10 h-10 rounded-full backdrop-blur flex items-center justify-center text-white active:scale-95 transition-all ${
              showEffectsPanel
                ? "bg-white/20 ring-1 ring-white/40"
                : "bg-black/40"
            }`}
          >
            <Gauge className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setBeautyOn((b) => !b)}
            className={`w-10 h-10 rounded-full backdrop-blur flex items-center justify-center text-white text-xs font-bold active:scale-95 transition-all ${
              beautyOn
                ? "bg-pink-500/70 ring-1 ring-pink-300/50"
                : "bg-black/40"
            }`}
          >
            ✨
          </button>
        </div>
      )}

      {/* ── EFFECTS PANEL ── */}
      <AnimatePresence>
        {showEffectsPanel && !isRecording && (
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute right-16 top-1/2 -translate-y-1/2 z-20 bg-black/80 backdrop-blur-md rounded-2xl p-3 w-48 space-y-3 border border-white/10"
          >
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">
              Effects
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-xs">Brightness</span>
                <span className="text-white/50 text-xs tabular-nums">
                  {brightness.toFixed(1)}
                </span>
              </div>
              <Slider
                data-ocid="camera.brightness.input"
                min={0.5}
                max={1.5}
                step={0.05}
                value={[brightness]}
                onValueChange={([v]) => setBrightness(v)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-xs">Contrast</span>
                <span className="text-white/50 text-xs tabular-nums">
                  {contrast.toFixed(1)}
                </span>
              </div>
              <Slider
                data-ocid="camera.contrast.input"
                min={0.5}
                max={1.5}
                step={0.05}
                value={[contrast]}
                onValueChange={([v]) => setContrast(v)}
                className="w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM AREA ── */}
      <div className="absolute inset-x-0 bottom-0 z-20 pb-safe pb-6 px-4 flex flex-col gap-3">
        {/* Recording progress bar */}
        {cameraMode === "video" && isRecording && (
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-red-500 rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "linear" }}
            />
          </div>
        )}

        {/* Filter strip (hidden while recording) */}
        {!isRecording && (
          <div
            data-ocid="camera.filter.tab"
            className="flex gap-2 overflow-x-auto scrollbar-hide py-1"
          >
            {FILTERS.map((f) => (
              <button
                key={f.name}
                type="button"
                onClick={() => setSelectedFilter(f.name)}
                className="shrink-0 flex flex-col items-center gap-1 transition-all active:scale-95"
              >
                <div
                  className={`w-12 h-12 rounded-xl overflow-hidden ring-2 transition-all ${
                    selectedFilter === f.name
                      ? "ring-white scale-105"
                      : "ring-transparent"
                  }`}
                >
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #ff6b6b 0%, #ffd93d 50%, #6c5ce7 100%)",
                      filter: f.css || "none",
                    }}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium ${selectedFilter === f.name ? "text-white" : "text-white/60"}`}
                >
                  {f.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Audio mode selector (video mode only, hidden while recording) */}
        {cameraMode === "video" && !isRecording && (
          <div
            data-ocid="camera.audio_mode.tab"
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5"
          >
            {(
              [
                { mode: "mic" as AudioMode, label: "Mic", icon: Mic },
                {
                  mode: "upload" as AudioMode,
                  label: "Upload Audio",
                  icon: Music,
                },
                {
                  mode: "voice" as AudioMode,
                  label: "Voice Only",
                  icon: MicOff,
                },
                {
                  mode: "ahirani" as AudioMode,
                  label: "Ahirani Music",
                  icon: Library,
                },
              ] as Array<{
                mode: AudioMode;
                label: string;
                icon: React.ElementType;
              }>
            ).map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setAudioMode(mode);
                  if (mode === "upload") audioInputRef.current?.click();
                  else if (mode === "ahirani") setShowMusicPicker(true);
                }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  audioMode === mode
                    ? "bg-white/20 border-white/50 text-white"
                    : "border-white/20 text-white/60 bg-black/30"
                }`}
                style={
                  audioMode === mode && mode === "ahirani"
                    ? {
                        borderColor: "oklch(0.65 0.28 15 / 0.7)",
                        background: "oklch(0.65 0.28 15 / 0.25)",
                      }
                    : {}
                }
              >
                <Icon className="w-3 h-3" />
                {mode === "upload" && uploadedAudioFile
                  ? `${uploadedAudioFile.name.slice(0, 10)}…`
                  : mode === "ahirani" && selectedMusic
                    ? `${selectedMusic.title.slice(0, 10)}…`
                    : label}
              </button>
            ))}
          </div>
        )}

        {/* Main row: gallery | capture/record | timer */}
        <div className="flex items-center justify-between">
          {/* Gallery / fallback */}
          <button
            type="button"
            data-ocid="camera.gallery_upload_button"
            onClick={() => galleryInputRef.current?.click()}
            className="w-12 h-12 rounded-xl border border-white/30 bg-black/40 backdrop-blur flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {cameraMode === "photo" ? (
            /* Photo capture button */
            <button
              type="button"
              data-ocid="camera.capture_photo_button"
              onClick={handleCapturePhoto}
              disabled={!canPhoto}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_32px_rgba(255,255,255,0.4)] active:scale-95 transition-all disabled:opacity-40"
            >
              <Camera className="w-8 h-8 text-black" />
            </button>
          ) : (
            /* Video record button */
            <div className="relative flex items-center justify-center">
              {/* Outer ring */}
              <div
                className={`absolute w-24 h-24 rounded-full border-4 transition-all ${
                  isRecording
                    ? "border-red-500/80 scale-110"
                    : "border-white/80"
                }`}
              />
              {isRecording && (
                <div className="absolute w-24 h-24 rounded-full border-4 border-red-500/30 animate-ping" />
              )}
              <button
                type="button"
                data-ocid="camera.record_button"
                onClick={handleRecordPress}
                disabled={countdown !== null && !isRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                  isRecording
                    ? "bg-red-500 shadow-[0_0_28px_rgba(239,68,68,0.7)]"
                    : canRecord
                      ? "bg-white shadow-[0_0_28px_rgba(255,255,255,0.4)] cursor-pointer"
                      : "bg-white/60 cursor-not-allowed"
                }`}
              >
                {isRecording ? (
                  <div className="w-6 h-6 rounded-sm bg-white" />
                ) : (
                  <Video className="w-7 h-7 text-black" />
                )}
              </button>
            </div>
          )}

          {/* Timer selector (video mode, not recording) */}
          {cameraMode === "video" && !isRecording && countdown === null ? (
            <div
              data-ocid="camera.timer_select"
              className="flex flex-col items-center gap-1 bg-black/40 backdrop-blur-sm rounded-xl px-2 py-1.5"
            >
              <Timer className="w-3.5 h-3.5 text-white/60" />
              {([0, 3, 10] as TimerOption[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimerOption(t)}
                  className={`w-7 h-7 rounded-full text-xs font-semibold transition-all ${
                    timerOption === t
                      ? "bg-white text-black"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {t === 0 ? "Off" : `${t}s`}
                </button>
              ))}
            </div>
          ) : (
            <div className="w-12 h-12" />
          )}
        </div>

        {/* Hint text when camera is not yet ready (video mode) */}
        {cameraMode === "video" &&
          !isRecording &&
          !hasStream &&
          hasPermission === true && (
            <p className="text-center text-white/50 text-xs animate-pulse">
              Starting camera...
            </p>
          )}

        {/* Fallback text */}
        {cameraMode === "video" && !isRecording && hasStream && (
          <p className="text-center text-white/30 text-xs">
            Tap the record button to start · Max 60s
          </p>
        )}

        {/* Native camera fallback button */}
        {cameraMode === "video" && !isRecording && hasStream && (
          <button
            type="button"
            data-ocid="camera.native_camera_button"
            onClick={openNativeCamera}
            className="text-center text-white/25 text-[10px] underline underline-offset-2 py-1"
          >
            Recording not working? Use phone camera
          </button>
        )}
      </div>

      {/* ── Hidden inputs ── */}
      <input
        ref={galleryInputRef}
        type="file"
        accept={
          cameraMode === "photo" ? "image/*" : "video/*,video/mp4,video/webm"
        }
        capture={undefined}
        className="hidden"
        onChange={handleGallerySelect}
      />
      {/* Native camera fallback — opens phone camera app directly when MediaRecorder fails */}
      <input
        ref={nativeCameraRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={handleGallerySelect}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleAudioSelect}
      />

      {/* ── Uploaded audio badge ── */}
      {uploadedAudioFile && !isRecording && (
        <div className="absolute top-24 left-4 z-20">
          <Badge className="bg-black/60 border-white/20 text-white text-xs flex items-center gap-1">
            <Music className="w-3 h-3" />
            {uploadedAudioFile.name.slice(0, 16)}…
            <button
              type="button"
              onClick={() => {
                setUploadedAudioFile(null);
                setAudioMode("mic");
              }}
              className="ml-1 text-white/60 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        </div>
      )}

      {/* ── Ahirani music badge ── */}
      {selectedMusic && !isRecording && (
        <div className="absolute top-24 right-4 z-20">
          <Badge
            className="text-white text-xs flex items-center gap-1 border-0"
            style={{ background: "oklch(0.65 0.28 15 / 0.85)" }}
          >
            <Library className="w-3 h-3" />
            {selectedMusic.title.slice(0, 14)}
            <button
              type="button"
              onClick={() => {
                setSelectedMusic(null);
                setAudioMode("mic");
              }}
              className="ml-1 text-white/70 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        </div>
      )}

      {/* ── Music Picker Sheet ── */}
      <MusicPickerSheet
        open={showMusicPicker}
        onClose={() => setShowMusicPicker(false)}
        onSelect={(track) => {
          setSelectedMusic(track);
          setShowMusicPicker(false);
        }}
        selectedTrackId={selectedMusic?.id}
      />
    </div>
  );
}
