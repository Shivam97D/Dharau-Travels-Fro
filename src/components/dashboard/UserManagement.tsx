import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  Shield,
  User as UserIcon,
  Mail,
  Calendar,
  Trash2,
  Loader2,
  KeyRound,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import type { User } from "@/lib/types";

function ResetPasswordModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Minimum 6 characters"); return; }
    setLoading(true);
    try {
      await api.adminResetPassword(user._id, password);
      toast.success(`Password reset for ${user.name}`);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-float"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Reset password</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/5 transition hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Set a new password for <strong>{user.name}</strong>.</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3 transition focus-within:border-primary focus-within:bg-card">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password (min 6 chars)"
              required
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-sunset py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02] disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Set password
          </button>
        </form>

        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          The password is stored as a bcrypt hash — it cannot be read, only reset.
        </p>
      </motion.div>
    </div>
  );
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [resetTarget, setResetTarget] = useState<User | null>(null);

  useEffect(() => { fetchUsers(); }, [filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterRole) params.role = filterRole;
      const response = await api.getAllUsers(params);
      if (response.success && response.data) setUsers(response.data as User[]);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      toast.success("Role updated");
      fetchUsers();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.deleteUser(userId);
      toast.success("User deleted");
      fetchUsers();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  };

  const filteredUsers = users.filter((user) =>
    searchQuery
      ? user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true,
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl glass p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold">User Management</h2>
            <p className="mt-1 text-sm text-muted-foreground">Manage users, roles, and credentials</p>
          </div>
          <button className="flex items-center gap-2 self-start rounded-full glass px-4 py-2 text-sm font-medium transition hover:bg-white/10">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl glass p-6 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl bg-white/5 py-2 pl-10 pr-4 text-sm outline-none transition focus:bg-white/10"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-2xl bg-white/5 px-4 py-2 text-sm outline-none transition focus:bg-white/10"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-3xl glass p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-3xl glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">User</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="transition hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full gradient-sunset text-sm font-semibold text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium">{user.name}</p>
                              {user.isVerified && (
                                <span title="Email verified"><CheckCircle2 className="h-3.5 w-3.5 text-green-400" /></span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">ID: {user._id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className={`rounded-full px-3 py-1 text-xs font-medium capitalize outline-none transition ${
                            user.role === "owner"
                              ? "bg-purple-400/20 text-purple-200"
                              : user.role === "admin"
                                ? "bg-blue-400/20 text-blue-200"
                                : "bg-zinc-400/20 text-zinc-200"
                          }`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="owner">Owner</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setResetTarget(user)}
                            className="rounded-lg bg-amber-500/10 p-2 text-amber-400 transition hover:bg-amber-500/20"
                            title="Reset password"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="rounded-lg bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { label: "Total Users", count: users.filter((u) => u.role === "user").length, gradient: "gradient-sunset", Icon: UserIcon },
            { label: "Admins", count: users.filter((u) => u.role === "admin").length, gradient: "gradient-aurora", Icon: Shield },
            { label: "Owners", count: users.filter((u) => u.role === "owner").length, gradient: "gradient-tropic", Icon: Shield },
          ].map(({ label, count, gradient, Icon }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-3xl glass p-6">
              <div className="flex items-center gap-3">
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${gradient}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {resetTarget && <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />}
      </AnimatePresence>
    </>
  );
}
