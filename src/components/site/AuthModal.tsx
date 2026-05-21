import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Plane, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              <h2 className="text-2xl font-bold">
                {mode === "login" ? "Welcome back" : "Join the journey"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "login"
                  ? "Sign in to continue your adventure."
                  : "Create an account to start planning."}
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </motion.div>
              )}

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
                <Field
                  icon={<Lock className="h-4 w-4" />}
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-2xl gradient-sunset py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === "login" ? "Sign in" : "Create account"}
                </button>
              </form>

              <div className="mt-5 text-center text-xs text-muted-foreground">
                {mode === "login" ? "New here? " : "Have an account? "}
                <button
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setError("");
                  }}
                  className="font-semibold text-primary hover:underline"
                >
                  {mode === "login" ? "Create account" : "Sign in"}
                </button>
              </div>
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
