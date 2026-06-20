import { useState, useEffect } from "react";
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
} from "lucide-react";
import { TravelLoader, TravelDots } from "@/components/ui/TravelLoader";
import {
  LineChart,
  Line,
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

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F"];

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  gradient: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const RANGE_MONTHS: Record<string, number> = { "7d": 1, "30d": 3, "90d": 6, "1y": 12 };

const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function StatCard({ title, value, change, icon, gradient }: StatCardProps) {
  const isPositive = change >= 0;
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
          {isPositive ? (
            <ArrowUp className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {Math.abs(change)}%
          </span>
          <span className="text-sm text-muted-foreground">vs last month</span>
        </div>
      </div>
    </motion.div>
  );
}

export function OwnerDashboard({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data as DashboardStats);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  const overview = stats?.overview;
  const growth = stats?.growth ?? { revenue: 0, bookings: 0, users: 0 };

  const revenueChartData = (stats?.monthlyRevenue ?? [])
    .slice(-(RANGE_MONTHS[timeRange] ?? 12))
    .map((m) => ({
      month: MONTHS[m._id.month - 1],
      revenue: m.revenue,
      bookings: m.count,
    }));

  const categoryChartData = (stats?.categoryDistribution ?? []).map((c) => ({
    name: c._id.charAt(0).toUpperCase() + c._id.slice(1),
    value: c.count,
  }));

  const statCards = [
    {
      title: "Total Revenue",
      value: formatINR(overview?.totalRevenue ?? 0),
      change: growth.revenue,
      icon: <IndianRupee className="h-6 w-6 text-white" />,
      gradient: "gradient-sunset",
    },
    {
      title: "Registered Users",
      value: (overview?.totalUsers ?? 0).toLocaleString("en-IN"),
      change: growth.users,
      icon: <Users className="h-6 w-6 text-white" />,
      gradient: "gradient-aurora",
    },
    {
      title: "Total Bookings",
      value: (overview?.totalBookings ?? 0).toLocaleString("en-IN"),
      change: growth.bookings,
      icon: <Package className="h-6 w-6 text-white" />,
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
    {
      title: "Avg. Rating",
      value: overview?.avgRating ? overview.avgRating.toFixed(1) : "—",
      change: 0,
      icon: <Star className="h-6 w-6 text-white" />,
      gradient: "bg-gradient-to-br from-yellow-400 to-orange-500",
    },
  ];

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
          onClick={fetchStats}
          className="flex items-center gap-2 rounded-full gradient-sunset px-5 py-2 text-sm font-semibold text-white"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Business Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {overview?.totalAllTrips ?? 0} trips · {overview?.totalBookings ?? 0} total bookings
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["7d", "30d", "90d", "1y"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                timeRange === range ? "gradient-sunset text-white shadow-glow" : "glass hover:bg-white/10"
              }`}
            >
              {range === "7d" ? "7 days" : range === "30d" ? "30 days" : range === "90d" ? "90 days" : "1 year"}
            </button>
          ))}
          <button
            onClick={fetchStats}
            title="Refresh"
            className="grid h-9 w-9 place-items-center rounded-full glass transition hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue line chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl glass p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Revenue Overview</h2>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          {revenueChartData.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center gap-3 rounded-2xl bg-white/5">
              <IndianRupee className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No revenue data yet</p>
              <p className="text-xs text-muted-foreground/60">Revenue will appear here after completed bookings</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(0,0,0,0.85)", border: "none", borderRadius: "12px", backdropFilter: "blur(10px)" }}
                  formatter={(v: number) => [formatINR(v), "Revenue"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="url(#colorRevenue)" strokeWidth={3} dot={{ fill: "#FF6B6B", r: 5 }} />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FF6B6B" />
                    <stop offset="100%" stopColor="#4ECDC4" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Category pie chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl glass p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Trips by Category</h2>
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          {categoryChartData.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-sm text-muted-foreground">No trip data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(0,0,0,0.85)", border: "none", borderRadius: "12px" }}
                  formatter={(v: number) => [`${v} trips`, "Count"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Top performing trips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-3xl glass p-6"
      >
        <h2 className="mb-6 text-xl font-bold">
          Top Performing Trips
          {stats?.topTrips?.[0]?.bookings === 0 && (
            <span className="ml-3 text-sm font-normal text-muted-foreground">(by rating — no bookings yet)</span>
          )}
        </h2>
        {(stats?.topTrips ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No trips data yet</p>
        ) : (
          <div className="space-y-3">
            {(stats?.topTrips ?? []).map((trip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.07 }}
                className="flex items-center justify-between rounded-2xl bg-white/5 p-4 transition hover:bg-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl gradient-sunset text-lg font-bold text-white">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold">{trip.name}</h3>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {trip.destination}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatINR(trip.revenue)}</p>
                  <p className="text-xs text-muted-foreground">
                    {trip.bookings > 0 ? `${trip.bookings} bookings` : `★ ${(trip.rating ?? 0).toFixed(1)}`}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick status cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-3xl glass p-6"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-sunset">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Pending Inquiries</h3>
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
          transition={{ delay: 0.7 }}
          className="rounded-3xl glass p-6"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-aurora">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Pending Reviews</h3>
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
          transition={{ delay: 0.8 }}
          className="rounded-3xl glass p-6"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Upcoming Trips</h3>
              <p className="text-2xl font-bold">{overview?.upcomingTrips ?? 0}</p>
            </div>
          </div>
          <button onClick={() => onNavigate?.("bookings")} className="w-full rounded-xl bg-white/10 py-2 text-sm font-medium transition hover:bg-white/20">
            Manage
          </button>
        </motion.div>
      </div>
    </div>
  );
}
