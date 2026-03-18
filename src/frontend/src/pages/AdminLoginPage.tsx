import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Lock, Mail, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ADMIN_EMAIL = "admin@faktahirani.app";
const ADMIN_PASSWORD = "ssm";
const ADMIN_NAME = "समाधान माळी";
const SECRET_TOKEN = "fa2024sm";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/admin-login" }) as { access?: string };
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // Check secret token
    if (search?.access === SECRET_TOKEN) {
      setAllowed(true);
    } else {
      // No token or wrong token — redirect to home silently
      navigate({ to: "/" });
    }
  }, [search, navigate]);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !pass) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);

    if (email.trim().toLowerCase() === ADMIN_EMAIL && pass === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminAuthed", "1");
      toast.success(`Welcome, ${ADMIN_NAME}!`);
      navigate({ to: "/admin" });
    } else {
      setError("Invalid email or password");
    }
  };

  if (!allowed) return null;

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{
        background:
          "radial-gradient(ellipse at top, oklch(0.1 0.02 260) 0%, oklch(0 0 0) 65%)",
      }}
    >
      {/* Subtle grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.3 0 0) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.3 0 0) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo area */}
        <div className="flex flex-col items-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-18 h-18 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.45 0.2 260), oklch(0.4 0.25 290))",
              boxShadow:
                "0 8px 32px oklch(0.45 0.2 260 / 0.4), 0 0 0 1px oklch(0.5 0.2 260 / 0.3)",
              width: "72px",
              height: "72px",
            }}
          >
            <Shield className="w-9 h-9 text-white" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Admin Panel
          </h1>
          <p className="text-white/40 text-sm mt-1.5 text-center">
            फक्त अहिराणी · Restricted Access
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: "oklch(0.1 0.015 260 / 0.8)",
            border: "1px solid oklch(0.3 0.05 260 / 0.5)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-email"
              className="text-white/60 text-xs font-medium"
            >
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                id="admin-email"
                data-ocid="adminlogin.email_input"
                type="email"
                placeholder="admin@faktahirani.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="pl-10 bg-white/8 border-white/15 text-white placeholder:text-white/20 h-12 focus:border-blue-500/60 focus:ring-blue-500/20"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="text-white/60 text-xs font-medium"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                id="admin-password"
                data-ocid="adminlogin.password_input"
                type="password"
                placeholder="Enter password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="pl-10 bg-white/8 border-white/15 text-white placeholder:text-white/20 h-12 focus:border-blue-500/60 focus:ring-blue-500/20"
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p
              data-ocid="adminlogin.error_state"
              className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <Button
            data-ocid="adminlogin.submit_button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 font-semibold text-base text-white border-0"
            style={{
              background: loading
                ? "oklch(0.3 0.05 260)"
                : "linear-gradient(135deg, oklch(0.5 0.2 260), oklch(0.45 0.25 290))",
              boxShadow: loading
                ? "none"
                : "0 4px 20px oklch(0.5 0.2 260 / 0.3)",
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Login to Dashboard
              </span>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
