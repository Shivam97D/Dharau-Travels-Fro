import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Plane, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { TravelDots } from "@/components/ui/TravelLoader";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

function pingServer() {
  fetch("/api/health").catch(() => {});
}

type Mode = "login" | "register" | "forgot" | "otp";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [registerOtpSent, setRegisterOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [wakingUp, setWakingUp] = useState(false);
  const coldStartRef = useRef(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login, register, refreshUser } = useAuth();

  // Warm up server when modal opens so it's ready before the user submits
  useEffect(() => {
    if (open) pingServer();
  }, [open]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const reset = () => {
    setError("");
    setSent(false);
    setDevResetLink(null);
    setOtp(["", "", "", "", "", ""]);
    setRegisterOtpSent(false);
  };

  const switchMode = (m: Mode) => { setMode(m); reset(); };

  const handleOtpKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await api.resendLoginOtp(otpEmail);
      setResendCooldown(60);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setWakingUp(false);
    coldStartRef.current = false;
    api.onWakingUp = () => { setWakingUp(true); coldStartRef.current = true; };

    try {
      if (mode === "login") {
        await login(email, password);
        onClose();
      } else if (mode === "register") {
        if (registerOtpSent) {
          // Verify inline OTP
          const code = otp.join("");
          if (code.length < 6) { setError("Enter all 6 digits"); setLoading(false); return; }
          await api.verifyLoginOtp(otpEmail, code);
          await refreshUser();
          onClose();
        } else {
          const result = await register(name, email, password);
          if ((result as any).requiresOtp) {
            setOtpEmail(email);
            setRegisterOtpSent(true);
            setTimeout(() => otpRefs.current[0]?.focus(), 80);
            return;
          }
          onClose();
        }
      } else if (mode === "otp") {
        const code = otp.join("");
        if (code.length < 6) { setError("Enter all 6 digits"); setLoading(false); return; }
        await api.verifyLoginOtp(otpEmail, code);
        await refreshUser();
        onClose();
      } else {
        const res = await api.forgotPassword(email);
        setSent(true);
        const token = (res as { resetToken?: string }).resetToken;
        if (token) setDevResetLink(`/reset-password/${token}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      // Cold-start timeout during registration: the account was likely created in the
      // background by the server after it woke up. Take the user straight to OTP entry
      // so they can verify with the code from their email (or resend it).
      if (mode === "register" && (coldStartRef.current || msg.includes("504"))) {
        setOtpEmail(email);
        setRegisterOtpSent(true);
        setTimeout(() => otpRefs.current[0]?.focus(), 80);
        setError("Server was starting up — your account was created. Check your email for a 6-digit code, or tap Resend OTP below.");
      } else {
        setError(msg || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
      setWakingUp(false);
      coldStartRef.current = false;
      api.onWakingUp = undefined;
    }
  };

  const title =
    mode === "login" ? "Welcome back"
    : mode === "register" ? "Join the journey"
    : mode === "otp" ? "Verify your email"
    : "Reset your password";

  const subtitle =
    mode === "login" ? "Sign in to continue your adventure."
    : mode === "register" ? "Create an account to start planning."
    : mode === "otp" ? `Enter the 6-digit code sent to ${otpEmail}`
    : "Enter your email and we'll send you a reset link.";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] grid place-items-center p-4"
        >
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.92, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 22 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-card shadow-float"
          >
            <div className="relative h-32 gradient-aurora">
              <div className="absolute inset-0 bg-grain opacity-40" />
              <div className="absolute -bottom-8 left-6 grid h-16 w-16 place-items-center rounded-2xl bg-card shadow-glow">
                <span className="grid h-12 w-12 place-items-center rounded-xl gradient-sunset text-primary-foreground">
                  <Plane className="h-5 w-5 -rotate-45" />
                </span>
              </div>
              <button
                onClick={onClose}
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 pb-6 pt-12">
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>

              {error && !error.startsWith("Dev:") && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${
                    error.startsWith("Server was starting up")
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* Server cold-start notice */}
              {wakingUp && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-blue-500/10 px-3 py-2 text-sm text-blue-400"
                >
                  <TravelDots />
                  Server is starting up, please wait a moment…
                </motion.div>
              )}

              {/* Dev OTP hint */}
              {error.startsWith("Dev:") && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-400"
                >
                  {error}
                </motion.div>
              )}

              {/* Forgot password success */}
              {mode === "forgot" && sent ? (
                <div className="mt-6">
                  <div className="flex items-start gap-2 rounded-xl bg-emerald-500/10 px-3 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>If that email is registered, a password reset link has been sent.</span>
                  </div>
                  {devResetLink && (
                    <a
                      href={devResetLink}
                      className="mt-3 block break-all rounded-xl bg-muted/60 px-3 py-2 text-xs text-primary underline"
                    >
                      Dev only — open reset link: {devResetLink}
                    </a>
                  )}
                  <button
                    onClick={() => switchMode("login")}
                    className="mt-5 w-full rounded-2xl gradient-sunset py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02]"
                  >
                    Back to sign in
                  </button>
                </div>

              /* OTP step */
              ) : mode === "otp" ? (
                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKey(idx, e)}
                        className="h-12 w-10 rounded-xl border border-border bg-muted/40 text-center text-lg font-bold outline-none transition focus:border-primary focus:bg-card"
                      />
                    ))}
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    Didn't receive it? Check your <span className="font-semibold">spam / junk folder</span> — it may land there.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-sunset py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading && <TravelDots />}
                    Verify & Sign in
                  </button>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <button type="button" onClick={() => switchMode("login")} className="hover:text-foreground">
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || loading}
                      className="flex items-center gap-1 font-semibold text-primary hover:underline disabled:opacity-50"
                    >
                      <RefreshCw className="h-3 w-3" />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                    </button>
                  </div>
                </form>

              ) : (
                <>
                  <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                    {mode === "register" && (
                      <Field
                        icon={<User className="h-4 w-4" />}
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    )}
                    <Field
                      icon={<Mail className="h-4 w-4" />}
                      placeholder="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {mode !== "forgot" && (
                      <Field
                        icon={<Lock className="h-4 w-4" />}
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={!registerOtpSent}
                        disabled={registerOtpSent}
                      />
                    )}

                    {/* Inline OTP for registration — appears below password */}
                    <AnimatePresence>
                      {mode === "register" && registerOtpSent && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                            <p className="mb-3 text-center text-xs text-muted-foreground">
                              Code sent to <span className="font-semibold text-foreground">{otpEmail}</span>
                            </p>
                            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                              {otp.map((digit, idx) => (
                                <input
                                  key={idx}
                                  ref={(el) => { otpRefs.current[idx] = el; }}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                                  onKeyDown={(e) => handleOtpKey(idx, e)}
                                  className="h-12 w-10 rounded-xl border border-border bg-muted/40 text-center text-lg font-bold outline-none transition focus:border-primary focus:bg-card"
                                />
                              ))}
                            </div>
                            <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
                              Check your <span className="font-semibold">spam / junk</span> if it doesn't arrive
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => { setRegisterOtpSent(false); setOtp(["","","","","",""]); setError(""); }}
                                className="text-[11px] text-muted-foreground hover:text-foreground"
                              >
                                ← Change details
                              </button>
                              <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendCooldown > 0 || loading}
                                className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline disabled:opacity-50"
                              >
                                <RefreshCw className="h-3 w-3" />
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {mode === "login" && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => switchMode("forgot")}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl gradient-sunset py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading && <TravelDots />}
                      {mode === "login"
                        ? "Sign in"
                        : mode === "register"
                          ? registerOtpSent ? "Verify & Join" : "Create account"
                          : "Send reset link"}
                    </button>
                  </form>

                  {mode === "login" ? (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs text-muted-foreground">or</span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <button
                        type="button"
                        onClick={() => switchMode("register")}
                        className="w-full rounded-2xl border border-primary/40 py-3 text-sm font-semibold text-primary transition hover:bg-primary/8 active:scale-[0.98]"
                      >
                        Create new account
                      </button>
                    </div>
                  ) : mode === "forgot" ? (
                    <div className="mt-5 text-center text-xs text-muted-foreground">
                      <button onClick={() => switchMode("login")} className="font-semibold text-primary hover:underline">
                        Back to sign in
                      </button>
                    </div>
                  ) : (
                    <p className="mt-5 text-center text-xs text-muted-foreground">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="font-semibold text-primary hover:underline"
                      >
                        Sign in
                      </button>
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  icon,
  ...props
}: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3 transition focus-within:border-primary focus-within:bg-card">
      <span className="text-muted-foreground">{icon}</span>
      <input
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        {...props}
      />
    </label>
  );
}
