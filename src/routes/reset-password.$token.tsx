import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Lock,  Eye, EyeOff, Plane } from "lucide-react";
import { TravelLoader, TravelDots } from "@/components/ui/TravelLoader";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/reset-password/$token")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      // resetPassword logs the user in; sign back out so they re-authenticate cleanly.
      await logout();
      toast.success("Password reset! Please sign in with your new password. 🔐");
      navigate({ to: "/" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Reset link is invalid or has expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-card shadow-float">
        <div className="relative h-28 gradient-aurora">
          <div className="absolute inset-0 bg-grain opacity-40" />
          <div className="absolute -bottom-7 left-6 grid h-14 w-14 place-items-center rounded-2xl bg-card shadow-glow">
            <span className="grid h-10 w-10 place-items-center rounded-xl gradient-sunset text-primary-foreground">
              <Plane className="h-4 w-4 -rotate-45" />
            </span>
          </div>
        </div>
        <div className="px-6 pb-6 pt-10">
          <h1 className="text-2xl font-bold">Set a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose a strong password for your account.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3 transition focus-within:border-primary focus-within:bg-card">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type={show ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="text-muted-foreground hover:text-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3 transition focus-within:border-primary focus-within:bg-card">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type={show ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl gradient-sunset py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02] disabled:opacity-50"
            >
              {loading && <TravelDots />}
              Reset password
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-muted-foreground">
            <Link to="/" className="font-semibold text-primary hover:underline">Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
