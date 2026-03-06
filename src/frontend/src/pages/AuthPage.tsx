import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Clapperboard,
  Eye,
  Gift,
  Loader2,
  Lock,
  Mail,
  Phone,
  RotateCcw,
  Sparkles,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Transaction } from "../context/AppContext";
import { useApp } from "../context/AppContext";
import type { UserRole, User as UserType } from "../context/AppContext";
import { getReferralCodeFromUrl } from "../hooks/useReferralShare";
import { generateId, generateReferralCode } from "../utils/trending";

type Step =
  | "method"
  | "phone"
  | "otp"
  | "email_auth"
  | "username_login"
  | "social_loading"
  | "username"
  | "role";

type SocialProvider = "google" | "facebook";

export default function AuthPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("method");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("viewer");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Email/password auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailAuthMode, setEmailAuthMode] = useState<"register" | "login">(
    "register",
  );

  // Username login
  const [usernameLoginInput, setUsernameLoginInput] = useState("");
  const [passwordLoginInput, setPasswordLoginInput] = useState("");

  // Social provider tracking
  const [socialProvider, setSocialProvider] =
    useState<SocialProvider>("google");

  // Auth method for new user creation
  const [pendingAuthProvider, setPendingAuthProvider] =
    useState<UserType["authProvider"]>("phone");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPassword, setPendingPassword] = useState("");

  // Auto-fill referral code from URL ?ref= param (e.g. /join?ref=SAMAD2902)
  useEffect(() => {
    const refCode = getReferralCodeFromUrl();
    if (refCode) {
      setReferralCode(refCode.toUpperCase());
    }
  }, []);

  // Secret long-press on logo: hold 5 seconds to open hidden admin panel
  const [logoPressProgress, setLogoPressProgress] = useState(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const handleLogoPointerDown = () => {
    let elapsed = 0;
    longPressIntervalRef.current = setInterval(() => {
      elapsed += 100;
      setLogoPressProgress(Math.min((elapsed / 5000) * 100, 100));
    }, 100);
    longPressTimerRef.current = setTimeout(() => {
      clearInterval(longPressIntervalRef.current!);
      setLogoPressProgress(0);
      navigate({ to: "/admin" });
    }, 5000);
  };

  const handleLogoPointerUp = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    if (longPressIntervalRef.current)
      clearInterval(longPressIntervalRef.current);
    setLogoPressProgress(0);
  };

  const startCountdown = () => {
    setCountdown(30);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  // ── Shared account creation (reused by multiple auth paths) ──────────────

  const createAccount = async (opts: {
    usernameVal: string;
    phoneVal: string;
    emailVal?: string;
    passwordVal?: string;
    roleVal: UserRole;
    referralVal: string;
    authProviderVal: UserType["authProvider"];
  }) => {
    const newUser: UserType = {
      id: generateId(),
      username: opts.usernameVal.trim(),
      phone: opts.phoneVal,
      bio: "",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${opts.usernameVal}&backgroundColor=b6e3f4`,
      followers: 0,
      following: 0,
      coins: 0,
      referralCode: generateReferralCode(opts.usernameVal),
      isBlocked: false,
      createdAt: Date.now(),
      totalLikes: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      role: opts.roleVal,
      subscriptionStatus: "none",
      subscriptionExpiry: 0,
      loginStreak: 0,
      lastLoginDate: 0,
      lastSpinDate: 0,
      isVerifiedCreator: false,
      points: 0,
      watchedVideosToday: 0,
      lastWatchRewardDate: "",
      email: opts.emailVal,
      password: opts.passwordVal,
      authProvider: opts.authProviderVal,
    };

    dispatch({ type: "ADD_USER", user: newUser });

    if (opts.referralVal.trim()) {
      const referrer = state.users.find(
        (u) =>
          u.referralCode.toUpperCase() === opts.referralVal.toUpperCase() &&
          u.id !== newUser.id,
      );
      if (referrer) {
        if (opts.roleVal === "artist") {
          dispatch({ type: "ADD_EARNINGS", userId: referrer.id, amount: 10 });
          const referralTx: Transaction = {
            id: `tx${Date.now()}ref`,
            userId: referrer.id,
            txType: "referral_credit",
            amount: 10,
            description: `Referral reward for @${newUser.username}`,
            createdAt: Date.now(),
          };
          dispatch({ type: "ADD_TRANSACTION", transaction: referralTx });
        }
        dispatch({
          type: "ADD_REFERRAL",
          referral: {
            referrerId: referrer.id,
            referredUserId: newUser.id,
            referredUsername: newUser.username,
            commissionEarned: opts.roleVal === "artist" ? 10 : 0,
            createdAt: Date.now(),
            subscriptionReferralEarned: false,
          },
        });
        if (opts.roleVal === "viewer") {
          dispatch({
            type: "INIT_VIEWER_REFERRAL",
            referredUserId: newUser.id,
            referrerId: referrer.id,
          });
          dispatch({ type: "VIEWER_OTP_VERIFIED", referredUserId: newUser.id });
          toast.success(
            `Referral code applied! @${referrer.username} earns ₹10 after you watch 3 videos.`,
          );
        } else {
          toast.success(`Referral applied! @${referrer.username} earned ₹10.`);
        }
      }
    }

    dispatch({ type: "LOGIN", user: newUser });
    toast.success(`फक्त अहिराणीमध्ये स्वागत आहे, @${opts.usernameVal}! 🎉`);
    return newUser;
  };

  // ── Phone OTP flow ────────────────────────────────────────────────────────

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      toast.error("Enter a valid phone number");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setStep("otp");
    startCountdown();
    toast.success("OTP sent! Use any 6-digit code.");
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Enter all 6 digits");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    const existingUser = state.users.find((u) => u.phone === phone);
    if (existingUser) {
      dispatch({ type: "LOGIN", user: existingUser });
      toast.success(`Welcome back, @${existingUser.username}!`);
    } else {
      setPendingAuthProvider("phone");
      setStep("username");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // ── Email auth (register + login in one screen) ───────────────────────────

  const handleEmailAuth = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const existingByEmail = state.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );

    if (existingByEmail) {
      // Login flow
      if (existingByEmail.password !== password) {
        toast.error("Incorrect password");
        return;
      }
      setLoading(true);
      await new Promise((r) => setTimeout(r, 800));
      setLoading(false);
      dispatch({ type: "LOGIN", user: existingByEmail });
      toast.success(`Welcome back, @${existingByEmail.username}!`);
      return;
    }

    // Register flow
    if (emailAuthMode === "register") {
      if (confirmPassword !== password) {
        toast.error("Passwords do not match");
        return;
      }
      setLoading(true);
      await new Promise((r) => setTimeout(r, 800));
      setLoading(false);
      setPendingAuthProvider("email");
      setPendingEmail(email);
      setPendingPassword(password);
      setStep("username");
    } else {
      toast.error("No account found with this email");
    }
  };

  // ── Username + password login ─────────────────────────────────────────────

  const handleUsernameLogin = async () => {
    if (!usernameLoginInput.trim()) {
      toast.error("Enter your username");
      return;
    }
    if (!passwordLoginInput) {
      toast.error("Enter your password");
      return;
    }
    const found = state.users.find(
      (u) => u.username.toLowerCase() === usernameLoginInput.toLowerCase(),
    );
    if (!found) {
      toast.error("User not found");
      return;
    }
    if (!found.password || found.password !== passwordLoginInput) {
      toast.error("Incorrect password");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    dispatch({ type: "LOGIN", user: found });
    toast.success(`Welcome back, @${found.username}!`);
  };

  // ── Social (Google / Facebook) simulation ─────────────────────────────────

  const handleSocialLogin = async (provider: SocialProvider) => {
    setSocialProvider(provider);
    setStep("social_loading");

    await new Promise((r) => setTimeout(r, 1500));

    // Check if a user already signed in with this provider
    const existing = state.users.find((u) => u.authProvider === provider);
    if (existing) {
      dispatch({ type: "LOGIN", user: existing });
      toast.success(`Welcome back, @${existing.username}!`);
      return;
    }

    // Create new social user → skip to username + role
    const randomSuffix = Math.random().toString(36).slice(2, 7);
    const defaultUsername = `${provider}_${randomSuffix}`;
    setUsername(defaultUsername);
    setPendingAuthProvider(provider);
    setStep("username");
  };

  // ── Username / role (shared new-user steps) ───────────────────────────────

  const handleContinueToRole = () => {
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    const taken = state.users.some(
      (u) => u.username.toLowerCase() === username.toLowerCase(),
    );
    if (taken) {
      toast.error("Username already taken");
      return;
    }
    setStep("role");
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    await createAccount({
      usernameVal: username,
      phoneVal: phone,
      emailVal: pendingEmail || undefined,
      passwordVal: pendingPassword || undefined,
      roleVal: selectedRole,
      referralVal: referralCode,
      authProviderVal: pendingAuthProvider,
    });

    setLoading(false);
  };

  // ── Slide direction ───────────────────────────────────────────────────────

  const slideVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  // ── Gradient style shared ─────────────────────────────────────────────────

  const gradientStyle = {
    background:
      "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
  };

  const backToMethod = () => setStep("method");

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-8"
      style={{
        background:
          "radial-gradient(ellipse at top, oklch(0.12 0.05 15) 0%, oklch(0 0 0) 60%)",
      }}
    >
      {/* Logo (long-press 5s = hidden admin entry) */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-10"
      >
        <div
          data-ocid="auth.logo_longpress"
          onPointerDown={handleLogoPointerDown}
          onPointerUp={handleLogoPointerUp}
          onPointerLeave={handleLogoPointerUp}
          onContextMenu={(e) => e.preventDefault()}
          className="relative w-20 h-20 rounded-2xl flex items-center justify-center mb-4 select-none cursor-pointer"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
            WebkitUserSelect: "none",
          }}
        >
          <span className="text-3xl">🎬</span>
          {logoPressProgress > 0 && (
            <svg
              className="absolute inset-0 w-full h-full rounded-2xl pointer-events-none"
              viewBox="0 0 80 80"
              aria-label="Loading admin panel"
              role="img"
            >
              <circle
                cx="40"
                cy="40"
                r="37"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="3"
              />
              <circle
                cx="40"
                cy="40"
                r="37"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 37}`}
                strokeDashoffset={`${2 * Math.PI * 37 * (1 - logoPressProgress / 100)}`}
                transform="rotate(-90 40 40)"
                style={{ transition: "stroke-dashoffset 0.1s linear" }}
              />
            </svg>
          )}
        </div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">
          फक्त अहिराणी
        </h1>
        <p className="text-sm text-white/50 mt-1">
          अहिराणी कलाकार आणि प्रेक्षकांसाठी खास रील प्लॅटफॉर्म
        </p>
      </motion.div>

      {/* Form Card */}
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {/* ── METHOD SELECTION ─────────────────────────────────────────── */}
          {step === "method" && (
            <motion.div
              key="method"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-3"
            >
              <div className="space-y-1.5 mb-5">
                <h2 className="text-xl font-semibold text-white">Sign in</h2>
                <p className="text-sm text-white/50">
                  Choose how you'd like to continue
                </p>
              </div>

              {/* Mobile OTP */}
              <button
                type="button"
                data-ocid="auth.method_otp_button"
                onClick={() => setStep("phone")}
                className="w-full flex items-center gap-3.5 h-13 px-4 rounded-xl border border-white/15 bg-white/8 hover:bg-white/15 transition-all text-left"
                style={{ minHeight: "52px" }}
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-lg shrink-0">
                  📱
                </span>
                <span className="text-white font-medium text-sm">
                  Continue with Mobile OTP
                </span>
                <ArrowRight className="w-4 h-4 text-white/40 ml-auto" />
              </button>

              {/* Email */}
              <button
                type="button"
                data-ocid="auth.method_email_button"
                onClick={() => {
                  setEmailAuthMode("register");
                  setStep("email_auth");
                }}
                className="w-full flex items-center gap-3.5 h-13 px-4 rounded-xl border border-white/15 bg-white/8 hover:bg-white/15 transition-all text-left"
                style={{ minHeight: "52px" }}
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-lg shrink-0">
                  ✉️
                </span>
                <span className="text-white font-medium text-sm">
                  Login with Email
                </span>
                <ArrowRight className="w-4 h-4 text-white/40 ml-auto" />
              </button>

              {/* Username */}
              <button
                type="button"
                data-ocid="auth.method_username_button"
                onClick={() => setStep("username_login")}
                className="w-full flex items-center gap-3.5 h-13 px-4 rounded-xl border border-white/15 bg-white/8 hover:bg-white/15 transition-all text-left"
                style={{ minHeight: "52px" }}
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-lg shrink-0">
                  👤
                </span>
                <span className="text-white font-medium text-sm">
                  Login with Username
                </span>
                <ArrowRight className="w-4 h-4 text-white/40 ml-auto" />
              </button>

              {/* Divider */}
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-xs text-white/30 bg-transparent">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Google */}
              <button
                type="button"
                data-ocid="auth.method_google_button"
                onClick={() => handleSocialLogin("google")}
                className="w-full flex items-center gap-3.5 h-13 px-4 rounded-xl border border-white/15 bg-white hover:bg-white/90 transition-all text-left"
                style={{ minHeight: "52px" }}
              >
                {/* Google G icon */}
                <svg
                  className="w-5 h-5 shrink-0"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Google"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-gray-800 font-medium text-sm">
                  Continue with Google
                </span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                data-ocid="auth.method_facebook_button"
                onClick={() => handleSocialLogin("facebook")}
                className="w-full flex items-center gap-3.5 h-13 px-4 rounded-xl border-0 transition-all text-left"
                style={{ minHeight: "52px", backgroundColor: "#1877F2" }}
              >
                <svg
                  className="w-5 h-5 text-white shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  role="img"
                  aria-label="Facebook"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-white font-medium text-sm">
                  Continue with Facebook
                </span>
              </button>
            </motion.div>
          )}

          {/* ── SOCIAL LOADING ────────────────────────────────────────────── */}
          {step === "social_loading" && (
            <motion.div
              key="social_loading"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col items-center gap-5 py-10"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={
                  socialProvider === "facebook"
                    ? { backgroundColor: "#1877F2" }
                    : { background: "white" }
                }
              >
                {socialProvider === "google" ? (
                  <svg
                    className="w-8 h-8"
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label="Google"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-8 h-8 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    role="img"
                    aria-label="Facebook"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-white/60" />
                <p className="text-white/70 text-sm">
                  Connecting with{" "}
                  {socialProvider === "google" ? "Google" : "Facebook"}...
                </p>
              </div>
            </motion.div>
          )}

          {/* ── PHONE ────────────────────────────────────────────────────── */}
          {step === "phone" && (
            <motion.div
              key="phone"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">
                  Enter your phone
                </h2>
                <p className="text-sm text-white/50">
                  We'll send you a verification code
                </p>
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  data-ocid="auth.phone_input"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12 text-base focus:border-reels-pink focus:ring-reels-pink/30"
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                />
              </div>

              <Button
                data-ocid="auth.send_otp_button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full h-12 font-semibold text-base"
                style={gradientStyle}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending OTP...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send OTP <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              <button
                type="button"
                onClick={backToMethod}
                className="text-sm text-white/40 w-full text-center"
              >
                ← Back to login options
              </button>
            </motion.div>
          )}

          {/* ── OTP ──────────────────────────────────────────────────────── */}
          {step === "otp" && (
            <motion.div
              key="otp"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">Verify OTP</h2>
                <p className="text-sm text-white/50">
                  Sent to {phone}. Enter any 6 digits.
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <input
                    // biome-ignore lint/suspicious/noArrayIndexKey: OTP slots are positionally fixed
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    data-ocid="auth.otp_input"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-14 text-center text-xl font-bold rounded-lg border bg-white/10 border-white/20 text-white focus:border-reels-pink focus:outline-none focus:ring-2 focus:ring-reels-pink/30 transition-all"
                  />
                ))}
              </div>

              <Button
                data-ocid="auth.verify_button"
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full h-12 font-semibold text-base"
                style={gradientStyle}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-white/40">
                    Resend in {countdown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      startCountdown();
                      toast.success("OTP resent!");
                    }}
                    className="text-sm text-reels-pink flex items-center gap-1 mx-auto"
                  >
                    <RotateCcw className="w-3 h-3" /> Resend OTP
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep("phone")}
                className="text-sm text-white/40 w-full text-center"
              >
                ← Change number
              </button>
            </motion.div>
          )}

          {/* ── EMAIL AUTH ───────────────────────────────────────────────── */}
          {step === "email_auth" && (
            <motion.div
              key="email_auth"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-reels-pink" />
                  <h2 className="text-xl font-semibold text-white">
                    {emailAuthMode === "register"
                      ? "Create account"
                      : "Sign in with Email"}
                  </h2>
                </div>
                <p className="text-sm text-white/50">
                  {emailAuthMode === "register"
                    ? "Enter your email and set a password"
                    : "Enter your credentials to sign in"}
                </p>
              </div>

              {/* Toggle login / register */}
              <div className="flex rounded-xl overflow-hidden border border-white/15">
                <button
                  type="button"
                  onClick={() => setEmailAuthMode("register")}
                  className={`flex-1 py-2.5 text-sm font-medium transition-all ${emailAuthMode === "register" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"}`}
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => setEmailAuthMode("login")}
                  className={`flex-1 py-2.5 text-sm font-medium transition-all ${emailAuthMode === "login" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"}`}
                >
                  Sign In
                </button>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  data-ocid="auth.email_input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12 text-base"
                  autoComplete="email"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  data-ocid="auth.password_input"
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12 text-base"
                  autoComplete={
                    emailAuthMode === "register"
                      ? "new-password"
                      : "current-password"
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (emailAuthMode === "login" || confirmPassword)
                        handleEmailAuth();
                    }
                  }}
                />
              </div>

              {emailAuthMode === "register" && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    data-ocid="auth.confirm_password_input"
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12 text-base"
                    autoComplete="new-password"
                    onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                  />
                </div>
              )}

              <Button
                data-ocid="auth.email_submit_button"
                onClick={handleEmailAuth}
                disabled={loading}
                className="w-full h-12 font-semibold text-base"
                style={gradientStyle}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {emailAuthMode === "register"
                      ? "Creating..."
                      : "Signing in..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {emailAuthMode === "register" ? "Continue" : "Sign In"}{" "}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              <button
                type="button"
                onClick={backToMethod}
                className="text-sm text-white/40 w-full text-center"
              >
                ← Back to login options
              </button>
            </motion.div>
          )}

          {/* ── USERNAME LOGIN ───────────────────────────────────────────── */}
          {step === "username_login" && (
            <motion.div
              key="username_login"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-reels-pink" />
                  <h2 className="text-xl font-semibold text-white">
                    Username Login
                  </h2>
                </div>
                <p className="text-sm text-white/50">
                  Sign in with your username and password
                </p>
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  data-ocid="auth.username_login_input"
                  placeholder="Your username"
                  value={usernameLoginInput}
                  onChange={(e) =>
                    setUsernameLoginInput(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                    )
                  }
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12 text-base"
                  autoComplete="username"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  data-ocid="auth.password_login_input"
                  type="password"
                  placeholder="Password"
                  value={passwordLoginInput}
                  onChange={(e) => setPasswordLoginInput(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12 text-base"
                  autoComplete="current-password"
                  onKeyDown={(e) => e.key === "Enter" && handleUsernameLogin()}
                />
              </div>

              <Button
                data-ocid="auth.username_login_button"
                onClick={handleUsernameLogin}
                disabled={loading}
                className="w-full h-12 font-semibold text-base"
                style={gradientStyle}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              <p className="text-xs text-white/30 text-center">
                Username login only works if you registered with a password.
              </p>

              <button
                type="button"
                onClick={backToMethod}
                className="text-sm text-white/40 w-full text-center"
              >
                ← Back to login options
              </button>
            </motion.div>
          )}

          {/* ── USERNAME (new user profile setup) ────────────────────────── */}
          {step === "username" && (
            <motion.div
              key="username"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-reels-pink" />
                  <h2 className="text-xl font-semibold text-white">
                    Create your profile
                  </h2>
                </div>
                <p className="text-sm text-white/50">
                  Choose a unique username
                </p>
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  data-ocid="auth.username_input"
                  placeholder="username"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                    )
                  }
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12 text-base"
                />
              </div>

              <div className="space-y-1.5">
                <div className="relative">
                  <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    data-ocid="auth.referral_code_input"
                    placeholder="Referral code (optional)"
                    value={referralCode}
                    onChange={(e) =>
                      setReferralCode(e.target.value.toUpperCase())
                    }
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12 text-base uppercase tracking-widest"
                  />
                </div>
                <p className="text-white/30 text-[11px] px-1">
                  Viewers: referrer earns ₹10 after you watch 3 videos. Artists:
                  ₹10 now + ₹60 on subscription.
                </p>
              </div>

              <Button
                data-ocid="auth.continue_to_role_button"
                onClick={handleContinueToRole}
                className="w-full h-12 font-semibold text-base"
                style={gradientStyle}
              >
                <span className="flex items-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </span>
              </Button>
            </motion.div>
          )}

          {/* ── ROLE SELECTION ───────────────────────────────────────────── */}
          {step === "role" && (
            <motion.div
              key="role"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-reels-pink" />
                  <h2 className="text-xl font-semibold text-white">
                    Choose your role
                  </h2>
                </div>
                <p className="text-sm text-white/50">
                  तुम्ही फक्त अहिराणी कसे वापरणार?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Viewer card */}
                <button
                  type="button"
                  data-ocid="auth.role_viewer_button"
                  onClick={() => setSelectedRole("viewer")}
                  className={`relative flex flex-col items-center gap-3 rounded-2xl p-5 border-2 transition-all ${
                    selectedRole === "viewer"
                      ? "border-transparent"
                      : "border-white/15 bg-white/5 hover:border-white/30"
                  }`}
                  style={
                    selectedRole === "viewer"
                      ? {
                          background:
                            "linear-gradient(135deg, oklch(0.65 0.28 15)/15%, oklch(0.65 0.28 350)/15%)",
                          borderImage:
                            "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350)) 1",
                          border: "2px solid transparent",
                          backgroundClip: "padding-box",
                          outline: "2px solid oklch(0.65 0.28 15)",
                          outlineOffset: "-2px",
                        }
                      : {}
                  }
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedRole === "viewer"
                        ? "bg-reels-pink/20"
                        : "bg-white/10"
                    }`}
                  >
                    <Eye
                      className={`w-6 h-6 ${selectedRole === "viewer" ? "text-reels-pink" : "text-white/50"}`}
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className={`font-semibold text-sm ${selectedRole === "viewer" ? "text-white" : "text-white/70"}`}
                    >
                      Viewer
                    </p>
                    <p className="text-[11px] text-white/40 mt-0.5 leading-tight">
                      Browse &amp; discover videos
                    </p>
                  </div>
                </button>

                {/* Artist card */}
                <button
                  type="button"
                  data-ocid="auth.role_artist_button"
                  onClick={() => setSelectedRole("artist")}
                  className={`relative flex flex-col items-center gap-3 rounded-2xl p-5 border-2 transition-all ${
                    selectedRole === "artist"
                      ? "border-transparent"
                      : "border-white/15 bg-white/5 hover:border-white/30"
                  }`}
                  style={
                    selectedRole === "artist"
                      ? {
                          background:
                            "linear-gradient(135deg, oklch(0.65 0.28 15)/15%, oklch(0.65 0.28 350)/15%)",
                          outline: "2px solid oklch(0.65 0.28 15)",
                          outlineOffset: "-2px",
                        }
                      : {}
                  }
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedRole === "artist"
                        ? "bg-reels-pink/20"
                        : "bg-white/10"
                    }`}
                  >
                    <Clapperboard
                      className={`w-6 h-6 ${selectedRole === "artist" ? "text-reels-pink" : "text-white/50"}`}
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className={`font-semibold text-sm ${selectedRole === "artist" ? "text-white" : "text-white/70"}`}
                    >
                      Artist
                    </p>
                    <p className="text-[11px] text-white/40 mt-0.5 leading-tight">
                      Upload, earn &amp; grow
                    </p>
                  </div>
                </button>
              </div>

              <Button
                data-ocid="auth.role_continue_button"
                onClick={handleCreateAccount}
                disabled={loading}
                className="w-full h-12 font-semibold text-base"
                style={gradientStyle}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Continue <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              <button
                type="button"
                onClick={() => setStep("username")}
                className="text-sm text-white/40 w-full text-center"
              >
                ← Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <p className="text-xs text-white/20 text-center mt-12">
        By continuing, you agree to our Terms &amp; Privacy Policy
      </p>
    </div>
  );
}
