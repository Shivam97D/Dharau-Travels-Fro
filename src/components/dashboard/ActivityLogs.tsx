import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, ChevronLeft, ChevronRight, Activity } from "lucide-react";
import { TravelLoader, TravelDots } from "@/components/ui/TravelLoader";
import api from "@/lib/api";

interface ActivityLog {
  _id: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  meta?: Record<string, unknown>;
  ip?: string;
  createdAt: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  user_login:              { label: "Login",            color: "bg-emerald-500/20 text-emerald-300" },
  user_verified:           { label: "Verified",         color: "bg-teal-500/20 text-teal-300" },
  admin_trip_create:       { label: "Trip Created",     color: "bg-blue-500/20 text-blue-300" },
  admin_trip_update:       { label: "Trip Updated",     color: "bg-amber-500/20 text-amber-300" },
  admin_trip_delete:       { label: "Trip Deleted",     color: "bg-red-500/20 text-red-300" },
  admin_user_role_change:  { label: "Role Changed",     color: "bg-purple-500/20 text-purple-300" },
  admin_user_delete:       { label: "User Deleted",     color: "bg-red-500/20 text-red-300" },
};

function ActionBadge({ action }: { action: string }) {
  const cfg = ACTION_LABELS[action] ?? { label: action.replace(/_/g, " "), color: "bg-zinc-500/20 text-zinc-300" };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function metaString(meta?: Record<string, unknown>): string {
  if (!meta) return "";
  return Object.entries(meta)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
}

const ACTION_FILTERS = [
  { value: "", label: "All actions" },
  { value: "user_login", label: "Logins" },
  { value: "user_verified", label: "Verifications" },
  { value: "admin_trip_create", label: "Trip created" },
  { value: "admin_trip_update", label: "Trip updated" },
  { value: "admin_trip_delete", label: "Trip deleted" },
  { value: "admin_user_role_change", label: "Role changes" },
  { value: "admin_user_delete", label: "User deleted" },
];

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const LIMIT = 50;
  const abortRef = useRef<AbortController | null>(null);

  const doFetch = async (p: number, force = false) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    if (force) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.getActivityLogs({ page: p, limit: LIMIT, action: actionFilter || undefined, search: search || undefined });
      const data = res.data as unknown as { data: ActivityLog[]; total: number; page: number; pages: number };
      setLogs(data?.data ?? []);
      setTotal(data?.total ?? 0);
      setPages(data?.pages ?? 1);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setPage(1);
    doFetch(1);
  }, [actionFilter, search]);

  useEffect(() => {
    doFetch(page);
  }, [page]);

  const handleSearch = (val: string) => {
    setSearch(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl glass p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Activity Logs</h2>
          <p className="mt-1 text-sm text-muted-foreground">{total.toLocaleString()} events recorded</p>
        </div>
        <button
          onClick={() => doFetch(page, true)}
          disabled={refreshing}
          className="flex items-center gap-2 self-start rounded-full glass px-4 py-2 text-sm font-medium transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-3xl glass p-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by user or action…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-2xl bg-white/5 py-2 pl-10 pr-4 text-sm outline-none transition focus:bg-white/10"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-2xl bg-white/5 px-4 py-2 text-sm outline-none transition focus:bg-white/10"
        >
          {ACTION_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center rounded-3xl glass p-12">
          <TravelLoader />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl glass p-16 text-center">
          <Activity className="h-10 w-10 text-muted-foreground opacity-40" />
          <p className="font-semibold">No activity logged yet</p>
          <p className="text-sm text-muted-foreground">Events will appear here as users and admins take actions.</p>
        </div>
      ) : (
        <div className="rounded-3xl glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Action</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">User</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground hidden md:table-cell">Details</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <motion.tr key={log._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="transition hover:bg-white/5">
                    <td className="px-5 py-3">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-5 py-3">
                      {log.userName ? (
                        <div>
                          <p className="text-sm font-medium">{log.userName}</p>
                          <p className="text-xs text-muted-foreground">{log.userEmail}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">System</span>
                      )}
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">{metaString(log.meta)}</span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 px-5 py-3">
              <p className="text-xs text-muted-foreground">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="grid h-8 w-8 place-items-center rounded-full glass transition hover:bg-white/10 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="grid h-8 w-8 place-items-center rounded-full glass transition hover:bg-white/10 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {refreshing && (
        <div className="flex justify-center py-2">
          <TravelDots />
        </div>
      )}
    </div>
  );
}
