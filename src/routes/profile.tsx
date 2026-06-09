import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { ProfilePage } from "@/components/dashboard/ProfilePage";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

function Profile() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />
      <main className="pb-12 pt-24">
        <ProfilePage />
      </main>
      <Footer />
    </div>
  );
}
