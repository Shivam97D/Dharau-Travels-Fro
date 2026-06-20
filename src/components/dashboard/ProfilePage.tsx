import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Camera, Save, Lock, Eye, EyeOff } from "lucide-react";
import { TravelLoader, TravelDots } from "@/components/ui/TravelLoader";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

const ROLE_CONFIG = {
  owner: { emoji: "🎩", label: "Owner", gradientClass: "gradient-aurora" },
  admin: { emoji: "💻", label: "Administrator", gradientClass: "gradient-ocean" },
  user: { emoji: "👤", label: "Traveler", gradientClass: "gradient-sunset" },
};

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const roleConfig = ROLE_CONFIG[user?.role ?? "user"];

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: form.name || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        avatar: form.avatar || undefined,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setChangingPassword(true);
    try {
      await api.updatePassword(pwForm.currentPassword, pwForm.newPassword);
      toast.success("Password changed successfully! 🔐");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold">My Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your personal information and account settings
        </p>
      </motion.div>

      {/* Avatar + role hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`relative mb-6 overflow-hidden rounded-3xl p-8 ${roleConfig.gradientClass}`}
      >
        <div className="absolute inset-0 bg-grain opacity-30" />
        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-end">
          <div className="shrink-0">
            {form.avatar ? (
              <img
                src={form.avatar}
                alt={user?.name}
                className="h-24 w-24 rounded-2xl object-cover shadow-float ring-4 ring-white/30"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty(
                    "display",
                    "grid",
                  );
                }}
              />
            ) : null}
            <div
              className={`${form.avatar ? "hidden" : "grid"} h-24 w-24 place-items-center rounded-2xl bg-white/20 shadow-float ring-4 ring-white/30 backdrop-blur`}
            >
              <span className="font-display text-4xl font-bold text-white">{initials}</span>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <span className="text-3xl">{roleConfig.emoji}</span>
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
            </div>
            <p className="mt-1 text-sm text-white/80">{user?.email}</p>
            {user?.phone && <p className="mt-0.5 text-sm text-white/70">{user.phone}</p>}
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {roleConfig.emoji} {roleConfig.label}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Personal info form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSave}
        className="mb-6 rounded-3xl glass p-6"
      >
        <h2 className="mb-6 text-xl font-bold">Personal Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ProfileField
            label="Full Name"
            icon={<User className="h-4 w-4" />}
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            required
          />
          <ProfileField
            label="Email Address"
            icon={<Mail className="h-4 w-4" />}
            type="email"
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            required
          />
          <ProfileField
            label="Phone Number"
            icon={<Phone className="h-4 w-4" />}
            type="tel"
            value={form.phone}
            onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
            placeholder="+1 (555) 000-0000"
          />
          <ProfileField
            label="Address"
            icon={<MapPin className="h-4 w-4" />}
            value={form.address}
            onChange={(v) => setForm((f) => ({ ...f, address: v }))}
            placeholder="City, Country"
          />
          <div className="sm:col-span-2">
            <ProfileField
              label="Profile Photo URL (optional)"
              icon={<Camera className="h-4 w-4" />}
              value={form.avatar}
              onChange={(v) => setForm((f) => ({ ...f, avatar: v }))}
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-2xl gradient-sunset px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <TravelDots /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </motion.form>

      {/* Change password form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onSubmit={handlePasswordChange}
        className="rounded-3xl glass p-6"
      >
        <h2 className="mb-6 text-xl font-bold">Change Password</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <PasswordField
              label="Current Password"
              value={pwForm.currentPassword}
              onChange={(v) => setPwForm((f) => ({ ...f, currentPassword: v }))}
              show={showCurrentPw}
              onToggle={() => setShowCurrentPw((s) => !s)}
            />
          </div>
          <PasswordField
            label="New Password"
            value={pwForm.newPassword}
            onChange={(v) => setPwForm((f) => ({ ...f, newPassword: v }))}
            show={showNewPw}
            onToggle={() => setShowNewPw((s) => !s)}
          />
          <PasswordField
            label="Confirm New Password"
            value={pwForm.confirmPassword}
            onChange={(v) => setPwForm((f) => ({ ...f, confirmPassword: v }))}
            show={showNewPw}
            onToggle={() => setShowNewPw((s) => !s)}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={changingPassword}
            className="flex items-center gap-2 rounded-2xl gradient-ocean px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {changingPassword ? (
              <TravelDots />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            Update Password
          </button>
        </div>
      </motion.form>
    </div>
  );
}

function ProfileField({
  label,
  icon,
  value,
  onChange,
  ...props
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3 transition focus-within:border-primary focus-within:bg-card">
        <span className="shrink-0 text-muted-foreground">{icon}</span>
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        />
      </div>
    </label>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3 transition focus-within:border-primary focus-within:bg-card">
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 text-muted-foreground transition hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}
