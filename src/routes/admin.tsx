import { useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { OwnerDashboard } from "@/components/dashboard/OwnerDashboard";
import { AdminTripManagement } from "@/components/dashboard/AdminTripManagement";
import { AdminBookings } from "@/components/dashboard/AdminBookings";
import { AdminInquiries } from "@/components/dashboard/AdminInquiries";
import { AdminReviews } from "@/components/dashboard/AdminReviews";
import { UserManagement } from "@/components/dashboard/UserManagement";
import { AdminSettings } from "@/components/dashboard/AdminSettings";
import { ActivityLogs } from "@/components/dashboard/ActivityLogs";
import { Navbar } from "@/components/site/Navbar";
import { LayoutDashboard, MapPin, CalendarCheck, MessageSquare, Star, Users, Settings, Activity } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Tab = "dashboard" | "trips" | "bookings" | "inquiries" | "reviews" | "users" | "settings" | "activity";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "trips", label: "Trips", icon: <MapPin className="h-4 w-4" /> },
  { id: "bookings", label: "Bookings", icon: <CalendarCheck className="h-4 w-4" /> },
  { id: "inquiries", label: "Inquiries", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "reviews", label: "Reviews", icon: <Star className="h-4 w-4" /> },
  { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
  { id: "activity", label: "Activity", icon: <Activity className="h-4 w-4" /> },
  { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

function AdminPage() {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin || !user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-screen-2xl px-4 py-8 pt-28 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">{user.role === "owner" ? "Owner" : "Admin"} Panel</h1>
          <p className="mt-2 text-muted-foreground">Manage your platform, trips, users, and settings</p>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto rounded-3xl glass p-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition ${
                activeTab === t.id ? "gradient-sunset text-white shadow-glow" : "hover:bg-white/10"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && <OwnerDashboard onNavigate={(t) => setActiveTab(t as Tab)} />}
        {activeTab === "trips" && <AdminTripManagement />}
        {activeTab === "bookings" && <AdminBookings />}
        {activeTab === "inquiries" && <AdminInquiries />}
        {activeTab === "reviews" && <AdminReviews />}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "activity" && <ActivityLogs />}
        {activeTab === "settings" && <AdminSettings />}
      </div>
    </div>
  );
}
