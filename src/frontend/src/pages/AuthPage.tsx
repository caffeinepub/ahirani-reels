import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Gift,
  Phone,
  RotateCcw,
  Sparkles,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import type { User as UserType } from "../context/AppContext";
import { generateId, generateReferralCode } from "../utils/trending";

type Step = "phone" | "otp" | "username";

export default function AuthPage() {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    // Check if existing user
    const existingUser = state.users.find((u) => u.phone === phone);
    if (existingUser) {
      dispatch({ type: "LOGIN", user: existingUser });
      toast.success(`Welcome back, @${existingUser.username}!`);
    } else {
      setStep("username");
    }
  };

  const handleCreateAccount = async () => {
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

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    const newUser: UserType = {
      id: generateId(),
      username: username.trim(),
      phone,
      bio: "",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&backgroundColor=b6e3f4`,
      followers: 0,
      following: 0,
      coins: 0,
      referralCode: generateReferralCode(username),
      isBlocked: false,
      createdAt: Date.now(),
      totalLikes: 0,
      totalEarnings: 0,
    };

    dispatch({ type: "ADD_USER", user: newUser });

    // Process referral
    if (referralCode.trim()) {
      const referrer = state.users.find(
        (u) => u.referralCode.toUpperCase() === referralCode.toUpperCase(),
      );
      if (referrer) {
        dispatch({ type: "ADD_COINS", userId: referrer.id, amount: 10 });
        dispatch({
          type: "ADD_REFERRAL",
          referral: {
            referrerId: referrer.id,
            referredUserId: newUser.id,
            referredUsername: newUser.username,
            coinsEarned: 10,
            createdAt: Date.now(),
          },
        });
        toast.success(
          `Referral applied! @${referrer.username} earned 10 coins.`,
        );
      }
    }

    dispatch({ type: "LOGIN", user: newUser });
    setLoading(false);
    toast.success(`Welcome to Ahirani Reels, @${username}! 🎉`);
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

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-8"
      style={{
        background:
          "radial-gradient(ellipse at top, oklch(0.12 0.05 15) 0%, oklch(0 0 0) 60%)",
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-10"
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
          }}
        >
          <span className="text-3xl">🎬</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">
          Ahirani Reels
        </h1>
        <p className="text-sm text-white/50 mt-1">Short videos. Big moments.</p>
      </motion.div>

      {/* Form Card */}
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {step === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
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
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
                }}
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
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
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
                    // OTP digits are always exactly 6 and positional
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
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
                }}
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

          {step === "username" && (
            <motion.div
              key="username"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
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

              <div className="relative">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="Referral code (optional)"
                  value={referralCode}
                  onChange={(e) =>
                    setReferralCode(e.target.value.toUpperCase())
                  }
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12 text-base uppercase tracking-widest"
                />
              </div>

              <Button
                data-ocid="auth.create_account_button"
                onClick={handleCreateAccount}
                disabled={loading}
                className="w-full h-12 font-semibold text-base"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.65 0.28 350))",
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  "Create Account 🎉"
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <p className="text-xs text-white/20 text-center mt-12">
        By continuing, you agree to our Terms & Privacy Policy
      </p>
    </div>
  );
}
