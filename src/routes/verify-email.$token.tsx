import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Loader2, Plane } from "lucide-react";
import api from "@/lib/api";

export const Route = createFileRoute("/verify-email/$token")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token } = Route.useParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.verifyEmail(token)
      .then((res: any) => { setStatus("success"); setMessage(res.message || "Email verified!"); })
      .catch((err: any) => { setStatus("error"); setMessage(err.message || "Link is invalid or expired."); });
  }, [token]);

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
        <div className="flex flex-col items-center px-6 pb-8 pt-12 text-center">
          {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
          {status === "success" && <CheckCircle2 className="h-12 w-12 text-green-500" />}
          {status === "error" && <XCircle className="h-12 w-12 text-destructive" />}

          <h1 className="mt-4 text-xl font-bold">
            {status === "loading" ? "Verifying…" : status === "success" ? "Email verified!" : "Verification failed"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>

          {status !== "loading" && (
            <Link
              to="/"
              className="mt-6 rounded-2xl gradient-sunset px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-105"
            >
              {status === "success" ? "Sign in now" : "Back to home"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
