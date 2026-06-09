import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, Download, Users } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface Subscriber {
  _id: string;
  email: string;
  status: string;
  createdAt: string;
}

export function AdminSettings() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getSubscribers();
        if (res.success) {
          setSubscribers((res.data as Subscriber[]) ?? []);
          setActiveCount((res as { activeCount?: number }).activeCount ?? 0);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to load subscribers");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const exportCsv = () => {
    const rows = [["email", "status", "subscribed_at"], ...subscribers.map((s) => [s.email, s.status, s.createdAt])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl glass p-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Newsletter subscribers and platform information</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl glass p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-aurora">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Subscribers</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl glass p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-sunset">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="text-2xl font-bold">{subscribers.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="rounded-3xl glass p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Newsletter Subscribers</h3>
          {subscribers.length > 0 && (
            <button onClick={exportCsv} className="flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium transition hover:bg-white/10">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : subscribers.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No subscribers yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {subscribers.map((s) => (
              <div key={s._id} className="flex items-center justify-between py-3 text-sm">
                <span>{s.email}</span>
                <span className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className={`rounded-full px-2 py-0.5 capitalize ${s.status === "active" ? "bg-emerald-400/20 text-emerald-300" : "bg-zinc-400/20 text-zinc-300"}`}>{s.status}</span>
                  {new Date(s.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
