import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Plane, Moon, Sun, LogOut, Shield, LayoutDashboard } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal";

const links = ["Destinations", "Trips", "Categories", "Gallery", "Contact"];

export function Navbar({ onLogin }: { onLogin?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { openAuth } = useAuthModal();
  const handleSignIn = onLogin ?? openAuth;

  const roleEmoji = user?.role === "owner" ? "🎩" : user?.role === "admin" ? "💻" : "👤";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className={`flex items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 ${
            scrolled ? "glass shadow-soft" : "bg-transparent"
          }`}
        >
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <img 
              src="/Screenshot_2026-05-26_180910-removebg-preview.png" 
              alt="DHARAVU JOURNEYS" 
              className="h-9 w-9 object-contain"
            />
            <span className="tracking-tight">DHARAVU JOURNEYS</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l}
                href={`/#${l.toLowerCase()}`}
                className="relative px-4 py-2 text-sm font-medium text-foreground/80 transition hover:text-foreground"
              >
                <span className="relative z-10">{l}</span>
                <motion.span
                  layoutId={`nav-${l}`}
                  className="absolute inset-0 z-0 rounded-full opacity-0 transition group-hover:opacity-100"
                />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center rounded-full glass text-foreground transition hover:scale-105"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    title="Admin Panel"
                    className="hidden h-9 w-9 place-items-center rounded-full glass text-foreground/80 transition hover:scale-105 hover:text-foreground sm:grid"
                  >
                    <Shield className="h-4 w-4" />
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  title="My Dashboard"
                  className="hidden h-9 w-9 place-items-center rounded-full glass text-foreground/80 transition hover:scale-105 hover:text-foreground sm:grid"
                >
                  <LayoutDashboard className="h-4 w-4" />
                </Link>
                <Link
                  to="/profile"
                  className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold backdrop-blur-sm transition hover:scale-105 hover:border-white/30 hover:bg-white/10 sm:flex"
                >
                  <span className="text-base leading-none">{roleEmoji}</span>
                  <span className="max-w-[90px] truncate text-foreground/90">
                    {user?.name?.split(" ")[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="hidden h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-foreground/60 backdrop-blur-sm transition hover:scale-105 hover:border-white/25 hover:text-foreground sm:grid"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSignIn}
                  className="hidden rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:text-foreground sm:block"
                >
                  Sign in
                </button>
                <a
                  href="#trips"
                  className="hidden rounded-full gradient-sunset px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-105 sm:block"
                >
                  Book now
                </a>
              </>
            )}

            <button
              onClick={() => setOpen((o) => !o)}
              className="grid h-9 w-9 place-items-center rounded-full glass md:hidden"
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 overflow-hidden rounded-3xl glass-mobile-nav p-4 md:hidden"
            >
              <nav className="flex flex-col gap-1">
                {links.map((l) => (
                  <a
                    key={l}
                    href={`/#${l.toLowerCase()}`}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-medium hover:bg-white/40"
                  >
                    {l}
                  </a>
                ))}
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium hover:bg-white/40"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium hover:bg-white/40"
                    >
                      <span className="text-base">{roleEmoji}</span>
                      <span>{user?.name}</span>
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium hover:bg-white/40"
                    >
                      <span className="text-base">📋</span>
                      My Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium hover:bg-white/40"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleSignIn();
                    }}
                    className="mt-2 rounded-2xl gradient-sunset px-4 py-3 text-sm font-semibold text-primary-foreground"
                  >
                    Sign in
                  </button>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
