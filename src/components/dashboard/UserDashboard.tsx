import { motion } from "framer-motion";
import { Plane, Calendar, Heart, Settings, LogOut } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function UserDashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold">My Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your trips, bookings, and account settings
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl glass p-6"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-sunset">
            <Plane className="h-6 w-6 text-white" />
          </div>
          <h3 className="mt-4 text-2xl font-bold">0</h3>
          <p className="text-sm text-muted-foreground">My Trips</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl glass p-6"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-aurora">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <h3 className="mt-4 text-2xl font-bold">0</h3>
          <p className="text-sm text-muted-foreground">Bookings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl glass p-6"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <h3 className="mt-4 text-2xl font-bold">0</h3>
          <p className="text-sm text-muted-foreground">Saved Trips</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl glass p-6"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <h3 className="mt-4 text-2xl font-bold">Settings</h3>
          <p className="text-sm text-muted-foreground">Account</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 rounded-3xl glass p-6"
      >
        <h2 className="mb-4 text-xl font-bold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 transition hover:bg-white/10"
          >
            <Plane className="h-5 w-5" />
            <span>Browse Trips</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 transition hover:bg-white/10"
          >
            <Heart className="h-5 w-5" />
            <span>View Saved Trips</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 transition hover:bg-white/10"
          >
            <Calendar className="h-5 w-5" />
            <span>My Bookings</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 transition hover:bg-white/10"
          >
            <Settings className="h-5 w-5" />
            <span>Account Settings</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
