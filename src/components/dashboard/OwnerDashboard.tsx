import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  IndianRupee,
  Package,
  MessageSquare,
  Star,
  ArrowUp,
  ArrowDown,
  Calendar,
  Activity,
  RefreshCw,
  MapPin,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { TravelDots } from "@/components/ui/TravelLoader";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import api from "@/lib/api";
import type { DashboardStats } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────
const PIE_COLORS = ["#f97316", "#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

const TICK_STYLE = { fill: "rgba(255,255,255,0.55)", fontSize: 11 };
const TOOLTIP_STYLE = {
  backgroundColor: "rgba(10,10,20,0.92)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  backdropFilter: "blur(16px)",
  color: "#fff",
  fontSize: 13,
};

const RANGE_LABELS: Record<string, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  "1y": "1 year",
};

const formatINR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const formatINRCompact = (n: number) => {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n}`;
};

// ─── Stat card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  periodLabel: string;
  icon: React.ReactNode;
  gradient: string;
}

function StatCard({ title, value, change, periodLabel, icon, gradient }: StatCardProps) {
  const up = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl glass p-6"
    >
      <div className="absolute inset-0 bg-grain opacity-5" />
      <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${gradient} opacity-10 blur-3xl`} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="mt-2 text-3xl font-bold">{value}</h3>
          </div>
          <div className={`grid h-12 w-12 place-items-center rounded-2xl ${gradient}`}>{icon}</div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          {up ? (
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-400" />
          )}
          <span className={`text-sm font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}>
            {up ? "+" : ""}{change}%
          </span>
          <span className="text-xs text-muted-foreground">{periodLabel}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE} className="p-3 shadow-xl">
      <p className="mb-1 text-xs text-white/60">{label}</p>
      <p className="font-semibold text-orange-400">{formatINR(payload[0]?.value ?? 0)}</p>
      {payload[1] && (
        <p className="text-xs text-white/70 mt-0.5">{payload[1].value} bookings</p>
      )}
    </div>
  );
}

function BookingsTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE} className="p-3 shadow-xl">
      <p className="mb-1 text-xs text-white/60">{label}</p>
      <p className="font-semibold text-violet-400">{payload[0]?.value} bookings</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function OwnerDashboard({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (range: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboardStats(range);
      if (res.success && res.data) {
        setStats(res.data as DashboardStats);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(timeRange);
  }, [timeRange, fetchStats]);

  const overview = stats?.overview;
  const growth = stats?.growth ?? { revenue: 0, bookings: 0, users: 0 };
  const periodStats = stats?.periodStats;
  const chartData = stats?.chartData ?? [];

  const periodLabel = `vs prev ${RANGE_LABELS[timeRange]}`;

  const statCards = [
    {
      title: "Total Revenue",
      value: formatINR(overview?.totalRevenue ?? 0),
      change: periodStats?.revenue.change ?? growth.revenue,
      periodLabel,
      icon: <IndianRupee className="h-6 w-6 text-white" />,
      gradient: "gradient-sunset",
    },
    {
      title: "Registered Users",
      value: (overview?.totalUsers ?? 0).toLocaleString("en-IN"),
      change: growth.users,
      periodLabel: "vs last month",
      icon: <Users className="h-6 w-6 text-white" />,
      gradient: "gradient-aurora",
    },
    {
      title: "Total Bookings",
      value: (overview?.totalBookings ?? 0).toLocaleString("en-IN"),
      change: periodStats?.bookings.change ?? growth.bookings,
      periodLabel,
      icon: <Package className="h-6 w-6 text-white" />,
      gradient: "bg-gradient-to-br from-violet-500 to-pink-500",
    },
    {
      title: "Avg. Rating",
      value: overview?.avgRating ? overview.avgRating.toFixed(1) : "—",
      change: 0,
      periodLabel: "all time",
      icon: <Star className="h-6 w-6 text-white" />,
      gradient: "bg-gradient-to-br from-yellow-400 to-orange-500",
    },
  ];

  const categoryChartData = (stats?.categoryDistribution ?? []).map((c) => ({
    name: c._id.charAt(0).toUpperCase() + c._id.slice(1),
    value: c.count,
  }));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl glass">
        <TravelDots />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl glass p-12 text-center">
        <p className="text-muted-foreground">{error}</p>
        <button
          onClick={() => fetchStats(timeRange)}
          className="flex items-center gap-2 rounded-full gradient-sunset px-5 py-2 text-sm font-semibold text-white"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Business Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {overview?.totalAllTrips ?? 0} trips · {overview?.totalBookings ?? 0} total bookings
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["7d", "30d", "90d", "1y"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                timeRange === range ? "gradient-sunset text-white shadow-glow" : "glass hover:bg-white/10"
              }`}
            >
              {RANGE_LABELS[range]}
            </button>
          ))}
          <button
            onClick={() => fetchStats(timeRange)}
            title="Refresh"
            className="grid h-9 w-9 place-items-center rounded-full glass transition hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Period summary strip */}
      {periodStats && (
        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white/5 p-4 md:grid-cols-4">
          {[
            { label: `Revenue (${RANGE_LABELS[timeRange]})`, value: formatINR(periodStats.revenue.current), change: periodStats.revenue.change },
            { label: "Previous period", value: formatINR(periodStats.revenue.previous), change: null },
            { label: `Bookings (${RANGE_LABELS[timeRange]})`, value: periodStats.bookings.current, change: periodStats.bookings.change },
            { label: "Previous period", value: periodStats.bookings.previous, change: null },
          ].map((item, i) => (
            <div key={i}>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-lg font-bold">{item.value}</span>
                {item.change !== null && (
                  <span className={`text-xs font-semibold ${item.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {item.change >= 0 ? "+" : ""}{item.change}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue area chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl glass p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Revenue</h2>
              <p className="text-xs text-muted-foreground">{RANGE_LABELS[timeRange]}</p>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          {chartData.every((d) => d.revenue === 0) ? (
            <div className="flex h-[260px] flex-col items-center justify-center gap-3 rounded-2xl bg-white/5">
              <IndianRupee className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No revenue in this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                <XAxis
                  dataKey="label"
                  stroke="rgba(255,255,255,0.2)"
                  tick={TICK_STYLE}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="rgba(255,255,255,0.2)"
                  tick={TICK_STYLE}
                  tickLine={false}
                  tickFormatter={formatINRCompact}
                  width={56}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  fill="url(#revGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Bookings bar chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl glass p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Bookings</h2>
              <p className="text-xs text-muted-foreground">{RANGE_LABELS[timeRange]}</p>
            </div>
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          {chartData.every((d) => d.bookings === 0) ? (
            <div className="flex h-[260px] flex-col items-center justify-center gap-3 rounded-2xl bg-white/5">
              <Package className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No bookings in this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="bkgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="rgba(255,255,255,0.2)"
                  tick={TICK_STYLE}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="rgba(255,255,255,0.2)"
                  tick={TICK_STYLE}
                  tickLine={false}
                  allowDecimals={false}
                  width={32}
                />
                <Tooltip content={<BookingsTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                <Bar dataKey="bookings" fill="url(#bkgGrad)" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Category pie + Top trips row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-3xl glass p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Trips by Category</h2>
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          {categoryChartData.length === 0 ? (
            <div className="flex h-[240px] items-center justify-center">
              <p className="text-sm text-muted-foreground">No trip data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: number) => [`${v} trips`, "Count"]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Top performing trips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl glass p-6"
        >
          <h2 className="mb-5 text-lg font-bold">
            Top Trips
            {stats?.topTrips?.[0]?.bookings === 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">by rating</span>
            )}
          </h2>
          {(stats?.topTrips ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No trips yet</p>
          ) : (
            <div className="space-y-2">
              {(stats?.topTrips ?? []).map((trip, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-2xl bg-white/5 p-3 transition hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-sunset text-sm font-bold text-white">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">{trip.name}</p>
                      <p className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {trip.destination}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatINR(trip.revenue)}</p>
                    <p className="text-xs text-muted-foreground">
                      {trip.bookings > 0 ? `${trip.bookings} bkgs` : `★ ${(trip.rating ?? 0).toFixed(1)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent bookings table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="rounded-3xl glass p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent Bookings</h2>
          <button
            onClick={() => onNavigate?.("bookings")}
            className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium transition hover:bg-white/20"
          >
            View all
          </button>
        </div>
        {(stats?.recentBookings ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No bookings yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Booking</th>
                  <th className="pb-3 pr-4 font-medium">Trip</th>
                  <th className="pb-3 pr-4 font-medium">User</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(stats?.recentBookings ?? []).map((b: any, i: number) => (
                  <tr key={i} className="transition hover:bg-white/5">
                    <td className="py-3 pr-4">
                      <span className="font-mono text-xs text-muted-foreground">{b.bookingId ?? b._id?.slice(-6)}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium leading-tight">{b.trip?.title ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{b.trip?.destination ?? ""}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{b.user?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{b.user?.email ?? ""}</p>
                    </td>
                    <td className="py-3 pr-4 font-semibold">{formatINR(b.pricing?.totalAmount ?? 0)}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                        b.status === "confirmed" ? "bg-emerald-500/20 text-emerald-400" :
                        b.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                        b.status === "cancelled" ? "bg-red-500/20 text-red-400" :
                        "bg-white/10 text-white/60"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Status overview cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl glass p-6"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-sunset">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">Pending Inquiries</h3>
              <p className="text-2xl font-bold">{overview?.pendingInquiries ?? 0}</p>
            </div>
          </div>
          <button onClick={() => onNavigate?.("inquiries")} className="w-full rounded-xl bg-white/10 py-2 text-sm font-medium transition hover:bg-white/20">
            View All
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="rounded-3xl glass p-6"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-aurora">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">Pending Reviews</h3>
              <p className="text-2xl font-bold">{overview?.pendingReviews ?? 0}</p>
            </div>
          </div>
          <button onClick={() => onNavigate?.("reviews")} className="w-full rounded-xl bg-white/10 py-2 text-sm font-medium transition hover:bg-white/20">
            Moderate
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-3xl glass p-6"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">Upcoming Trips</h3>
              <p className="text-2xl font-bold">{overview?.upcomingTrips ?? 0}</p>
            </div>
          </div>
          <button onClick={() => onNavigate?.("trips")} className="w-full rounded-xl bg-white/10 py-2 text-sm font-medium transition hover:bg-white/20">
            Manage
          </button>
        </motion.div>
      </div>
    </div>
  );
}
