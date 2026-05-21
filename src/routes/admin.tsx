import { useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { OwnerDashboard } from "@/components/dashboard/OwnerDashboard";
import { AdminTripManagement } from "@/components/dashboard/AdminTripManagement";
import { UserManagement } from "@/components/dashboard/UserManagement";
import { Navbar } from "@/components/site/Navbar";
import { LayoutDashboard, MapPin, Users, Settings } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "trips" | "users" | "settings">(
    "dashboard",
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" />;
  }

  if (!user) {
    return null;
  }

  if (user.role === "owner" || user.role === "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onLogin={() => {}} />
        <div className="mx-auto max-w-screen-2xl px-4 py-8 pt-28 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">
                {user.role === "owner" ? "Owner" : "Admin"} Panel
              </h1>
              <p className="mt-2 text-muted-foreground">
                Manage your platform, trips, users, and settings
              </p>
            </div>
          </div>

          <div className="mb-8 flex gap-2 overflow-x-auto rounded-3xl glass p-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-medium transition ${
                activeTab === "dashboard"
                  ? "gradient-sunset text-white shadow-glow"
                  : "hover:bg-white/10"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("trips")}
              className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-medium transition ${
                activeTab === "trips"
                  ? "gradient-sunset text-white shadow-glow"
                  : "hover:bg-white/10"
              }`}
            >
              <MapPin className="h-4 w-4" />
              Trip Management
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-medium transition ${
                activeTab === "users"
                  ? "gradient-sunset text-white shadow-glow"
                  : "hover:bg-white/10"
              }`}
            >
              <Users className="h-4 w-4" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-medium transition ${
                activeTab === "settings"
                  ? "gradient-sunset text-white shadow-glow"
                  : "hover:bg-white/10"
              }`}
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>

          {activeTab === "dashboard" && <OwnerDashboard />}
          {activeTab === "trips" && <AdminTripManagement />}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "settings" && (
            <div className="rounded-3xl glass p-12 text-center">
              <h2 className="text-2xl font-bold">Settings</h2>
              <p className="mt-2 text-muted-foreground">Coming soon...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <h1 className="text-4xl font-bold">Access Denied</h1>
        <p className="mt-4 text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    </div>
  );
}
