import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Mail, Download, Users, Send, Eye, EyeOff,
  CheckSquare, Square, Video, Image, Trash2, Star,
  Upload, RefreshCw, GripVertical, X, Check,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Subscriber { _id: string; email: string; status: string; createdAt: string; }
interface MediaAsset { publicId: string; url: string; format: string; resourceType: string; bytes: number; createdAt: string; }
interface ConfigItem { url: string; publicId: string; label: string; }

// ─── Folder tabs ─────────────────────────────────────────────────────────────
const FOLDERS = [
  { key: "dharavu/hero",    label: "Hero Videos",   type: "video" as const, max: 6,  purpose: "heroVideos" },
  { key: "dharavu/gallery", label: "Gallery",        type: "image" as const, max: 12, purpose: "galleryImages" },
  { key: "dharavu/trips",   label: "Trip Images",    type: "image" as const, max: 0,  purpose: "" },
  { key: "dharavu/avatars", label: "Avatars",        type: "image" as const, max: 0,  purpose: "" },
];

const uploadSlug: Record<string, string> = {
  "dharavu/hero":    "hero-video",
  "dharavu/gallery": "gallery-image",
  "dharavu/trips":   "trip-image",
  "dharavu/avatars": "avatar",
};

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 ** 2).toFixed(1)} MB`;
}

// ─── Media Library panel ─────────────────────────────────────────────────────
function MediaLibrary() {
  const [folderIdx, setFolderIdx] = useState(0);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Site config state
  const [heroVideos, setHeroVideos] = useState<ConfigItem[]>([]);
  const [galleryImages, setGalleryImages] = useState<ConfigItem[]>([]);
  const [saving, setSaving] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const folder = FOLDERS[folderIdx];

  // Load assets for current folder
  const loadAssets = async () => {
    setLoadingAssets(true);
    try {
      const res = await api.listMediaAssets(folder.key, folder.type);
      setAssets((res.data as MediaAsset[]) ?? []);
    } catch {
      toast.error("Could not load media — check Cloudinary keys in Render env");
      setAssets([]);
    } finally {
      setLoadingAssets(false);
    }
  };

  // Load current site config
  const loadConfig = async () => {
    try {
      const res = await api.getSiteConfig();
      setHeroVideos(res.data?.heroVideos ?? []);
      setGalleryImages(res.data?.galleryImages ?? []);
    } catch {}
  };

  useEffect(() => { loadAssets(); }, [folderIdx]);
  useEffect(() => { loadConfig(); }, []);

  // Upload new file to current folder
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const slug = uploadSlug[folder.key] ?? "image";
      const form = new FormData();
      form.append("file", file);
      const headers: Record<string, string> = {};
      const token = localStorage.getItem("token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`/api/admin/upload/${slug}`, { method: "POST", headers, body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Upload failed");
      toast.success("Uploaded!");
      loadAssets();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Delete asset from Cloudinary
  const handleDelete = async (asset: MediaAsset) => {
    if (!confirm("Delete this asset from Cloudinary? This cannot be undone.")) return;
    setDeleting(asset.publicId);
    try {
      await api.deleteMediaAsset(asset.publicId, folder.type);
      toast.success("Deleted");
      setAssets((prev) => prev.filter((a) => a.publicId !== asset.publicId));
      // Also remove from config if it was selected
      setHeroVideos((prev) => prev.filter((v) => v.publicId !== asset.publicId));
      setGalleryImages((prev) => prev.filter((v) => v.publicId !== asset.publicId));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  // Toggle selection for hero videos or gallery
  const toggleSelection = (asset: MediaAsset) => {
    if (folder.purpose === "heroVideos") {
      const exists = heroVideos.find((v) => v.publicId === asset.publicId);
      if (exists) {
        setHeroVideos((prev) => prev.filter((v) => v.publicId !== asset.publicId));
      } else {
        if (heroVideos.length >= 6) { toast.error("Max 6 hero videos"); return; }
        setHeroVideos((prev) => [...prev, { url: asset.url, publicId: asset.publicId, label: "" }]);
      }
    } else if (folder.purpose === "galleryImages") {
      const exists = galleryImages.find((v) => v.publicId === asset.publicId);
      if (exists) {
        setGalleryImages((prev) => prev.filter((v) => v.publicId !== asset.publicId));
      } else {
        if (galleryImages.length >= 12) { toast.error("Max 12 gallery images"); return; }
        setGalleryImages((prev) => [...prev, { url: asset.url, publicId: asset.publicId, label: "" }]);
      }
    }
  };

  const isSelected = (asset: MediaAsset) => {
    if (folder.purpose === "heroVideos") return heroVideos.some((v) => v.publicId === asset.publicId);
    if (folder.purpose === "galleryImages") return galleryImages.some((v) => v.publicId === asset.publicId);
    return false;
  };

  // Save config
  const saveConfig = async () => {
    setSaving(true);
    try {
      await api.updateSiteConfig({ heroVideos, galleryImages });
      toast.success("Site config saved — hero & gallery updated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Folder tabs */}
      <div className="flex flex-wrap gap-2">
        {FOLDERS.map((f, i) => (
          <button
            key={f.key}
            onClick={() => setFolderIdx(i)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              i === folderIdx
                ? "gradient-sunset text-white shadow-glow"
                : "glass hover:bg-white/10"
            }`}
          >
            {f.type === "video" ? <Video className="h-3.5 w-3.5" /> : <Image className="h-3.5 w-3.5" />}
            {f.label}
          </button>
        ))}
      </div>

      {/* Upload bar */}
      <div className="flex items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept={folder.type === "video" ? "video/*" : "image/*"}
          className="hidden"
          onChange={handleUpload}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-full gradient-aurora px-4 py-2 text-sm font-medium text-white transition hover:scale-105 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading…" : `Upload to ${folder.label}`}
        </button>
        <button onClick={loadAssets} disabled={loadingAssets} className="grid h-8 w-8 place-items-center rounded-full glass transition hover:bg-white/10 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loadingAssets ? "animate-spin" : ""}`} />
        </button>
        <span className="text-xs text-muted-foreground">{assets.length} file{assets.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Selection hint for configurable folders */}
      {folder.purpose && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs text-muted-foreground">
          {folder.purpose === "heroVideos"
            ? `Click videos below to select/deselect for the hero section (max 6). Currently selected: ${heroVideos.length}.`
            : `Click images below to select/deselect for the gallery section (max 12). Currently selected: ${galleryImages.length}.`}
          {" "}Hit <strong>Save Config</strong> when done.
        </div>
      )}

      {/* Asset grid */}
      {loadingAssets ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl glass py-10 text-center">
          <p className="text-sm text-muted-foreground">No files in <code className="text-xs">{folder.key}</code> yet.</p>
          <p className="text-xs text-muted-foreground">Upload files above to populate this folder.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => {
            const selected = isSelected(asset);
            return (
              <div
                key={asset.publicId}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 transition ${
                  selected ? "border-primary shadow-glow" : "border-transparent hover:border-white/20"
                }`}
                onClick={() => folder.purpose && toggleSelection(asset)}
              >
                {folder.type === "video" ? (
                  <video
                    src={asset.url}
                    className="h-28 w-full object-cover"
                    muted
                    onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLVideoElement).pause(); (e.currentTarget as HTMLVideoElement).currentTime = 0; }}
                  />
                ) : (
                  <img src={asset.url} alt={asset.publicId} className="h-28 w-full object-cover" loading="lazy" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 transition group-hover:opacity-100" />

                {selected && (
                  <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                )}

                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(asset); }}
                  disabled={deleting === asset.publicId}
                  className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-red-500/80 text-white opacity-0 transition hover:bg-red-600 group-hover:opacity-100 disabled:opacity-50"
                >
                  {deleting === asset.publicId ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                </button>

                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-[10px] text-white/70 opacity-0 group-hover:opacity-100">
                  {fmtBytes(asset.bytes)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save config button — shown only for configurable folders */}
      {folder.purpose && (
        <div className="flex items-center justify-end gap-3 pt-2">
          <span className="text-xs text-muted-foreground">
            {folder.purpose === "heroVideos" ? `${heroVideos.length} video(s) selected` : `${galleryImages.length} image(s) selected`}
          </span>
          <button
            onClick={saveConfig}
            disabled={saving}
            className="flex items-center gap-2 rounded-full gradient-sunset px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
            Save Config
          </button>
        </div>
      )}

      {/* Current selection order for hero */}
      {folder.purpose === "heroVideos" && heroVideos.length > 0 && (
        <div className="rounded-2xl glass p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hero playback order</p>
          <div className="space-y-2">
            {heroVideos.map((v, idx) => (
              <div key={v.publicId} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{idx + 1}.</span>
                <video src={v.url} className="h-8 w-14 rounded object-cover" muted />
                <span className="flex-1 truncate text-xs">{v.publicId.split("/").pop()}</span>
                <button
                  onClick={() => {
                    if (idx === 0) return;
                    const next = [...heroVideos];
                    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                    setHeroVideos(next);
                  }}
                  disabled={idx === 0}
                  className="rounded p-1 transition hover:bg-white/10 disabled:opacity-20"
                >↑</button>
                <button
                  onClick={() => {
                    if (idx === heroVideos.length - 1) return;
                    const next = [...heroVideos];
                    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                    setHeroVideos(next);
                  }}
                  disabled={idx === heroVideos.length - 1}
                  className="rounded p-1 transition hover:bg-white/10 disabled:opacity-20"
                >↓</button>
                <button
                  onClick={() => setHeroVideos((prev) => prev.filter((_, i) => i !== idx))}
                  className="rounded p-1 text-red-400 transition hover:bg-red-500/10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current gallery selection */}
      {folder.purpose === "galleryImages" && galleryImages.length > 0 && (
        <div className="rounded-2xl glass p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gallery order & labels</p>
          <div className="space-y-2">
            {galleryImages.map((img, idx) => (
              <div key={img.publicId} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">
                <img src={img.url} className="h-8 w-12 rounded object-cover" alt="" />
                <input
                  value={img.label}
                  onChange={(e) => {
                    const next = [...galleryImages];
                    next[idx] = { ...next[idx], label: e.target.value };
                    setGalleryImages(next);
                  }}
                  placeholder="Caption…"
                  className="flex-1 rounded-lg bg-white/5 px-2 py-1 text-xs outline-none focus:bg-white/10"
                />
                <button
                  onClick={() => setGalleryImages((prev) => prev.filter((_, i) => i !== idx))}
                  className="rounded p-1 text-red-400 transition hover:bg-red-500/10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Newsletter panel ─────────────────────────────────────────────────────────
function NewsletterPanel() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getSubscribers();
        if (res.success) {
          const subs = (res.data as Subscriber[]) ?? [];
          setSubscribers(subs);
          setActiveCount((res as { activeCount?: number }).activeCount ?? subs.filter((s) => s.status === "active").length);
        }
      } catch { toast.error("Failed to load subscribers"); }
      finally { setLoading(false); }
    })();
  }, []);

  const exportCsv = () => {
    const rows = [["email", "status", "subscribed_at"], ...subscribers.map((s) => [s.email, s.status, s.createdAt])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const activeEmails = subscribers.filter((s) => s.status === "active").map((s) => s.email);
  const allSelected = activeEmails.length > 0 && activeEmails.every((e) => selected.has(e));
  const toggleSelect = (email: string) => setSelected((prev) => { const n = new Set(prev); n.has(email) ? n.delete(email) : n.add(email); return n; });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(activeEmails));

  const send = async (toSelected: boolean) => {
    if (!subject.trim() || !html.trim()) { toast.error("Subject and content required"); return; }
    const emailIds = toSelected ? Array.from(selected) : [];
    if (toSelected && emailIds.length === 0) { toast.error("Select at least one subscriber"); return; }
    if (!confirm(`Send to ${toSelected ? `${emailIds.length} selected` : `all ${activeCount} active`} subscriber(s)?`)) return;
    setSending(true);
    try {
      const res = await api.sendNewsletter({ subject, html, emailIds });
      toast.success((res as { message?: string }).message ?? "Sent!");
      setSubject(""); setHtml(""); setSelected(new Set());
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl glass p-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-aurora"><Users className="h-5 w-5 text-white" /></div>
          <div><p className="text-xs text-muted-foreground">Active</p><p className="text-xl font-bold">{activeCount}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl glass p-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-sunset"><Mail className="h-5 w-5 text-white" /></div>
          <div><p className="text-xs text-muted-foreground">Total records</p><p className="text-xl font-bold">{subscribers.length}</p></div>
        </div>
      </div>

      <div className="rounded-2xl glass p-5 space-y-4">
        <h4 className="font-semibold">Compose</h4>
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line…" className="w-full rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm outline-none focus:bg-white/10" />
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Body (HTML or plain text)</span>
            <button onClick={() => setPreviewMode((p) => !p)} className="flex items-center gap-1 rounded-full glass px-3 py-1 text-xs transition hover:bg-white/10">
              {previewMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {previewMode ? "Edit" : "Preview"}
            </button>
          </div>
          {previewMode
            ? <div className="min-h-[160px] rounded-xl border border-border bg-white/5 px-4 py-3 text-sm" dangerouslySetInnerHTML={{ __html: html || "<em>Nothing to preview</em>" }} />
            : <textarea rows={8} value={html} onChange={(e) => setHtml(e.target.value)} placeholder={"<h2>Hey traveler! 🌍</h2>\n<p>New trips are out…</p>"} className="w-full resize-y rounded-xl border border-border bg-white/5 px-4 py-3 font-mono text-sm outline-none focus:bg-white/10" />
          }
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => send(false)} disabled={sending || activeCount === 0} className="flex items-center gap-2 rounded-full gradient-sunset px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-50">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send to all ({activeCount})
          </button>
          <button onClick={() => send(true)} disabled={sending || selected.size === 0} className="flex items-center gap-2 rounded-full border border-border bg-white/5 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-50">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send to selected ({selected.size})
          </button>
        </div>
      </div>

      <div className="rounded-2xl glass p-5">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-semibold">Subscribers</h4>
          {subscribers.length > 0 && <button onClick={exportCsv} className="flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium transition hover:bg-white/10"><Download className="h-3.5 w-3.5" /> CSV</button>}
        </div>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : subscribers.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No subscribers yet.</p>
        ) : (
          <>
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
              <button onClick={toggleAll} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                {allSelected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                {allSelected ? "Deselect all" : "Select all active"}
              </button>
              {selected.size > 0 && <span className="ml-auto text-xs font-medium text-primary">{selected.size} selected</span>}
            </div>
            <div className="divide-y divide-white/5">
              {subscribers.map((s) => (
                <div key={s._id} className="flex items-center gap-3 py-2.5 text-sm">
                  <button onClick={() => s.status === "active" && toggleSelect(s.email)} disabled={s.status !== "active"} className="shrink-0 disabled:opacity-30">
                    {selected.has(s.email) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  <span className="flex-1 truncate">{s.email}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${s.status === "active" ? "bg-emerald-400/20 text-emerald-300" : "bg-zinc-400/20 text-zinc-300"}`}>{s.status}</span>
                  <span className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main AdminSettings component ────────────────────────────────────────────
type SettingsTab = "media" | "newsletter" | "info";

export function AdminSettings() {
  const [tab, setTab] = useState<SettingsTab>("media");

  return (
    <div className="space-y-6">
      <div className="rounded-3xl glass p-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Media library, newsletter, and site configuration</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2">
        {([ ["media", "Media Library"], ["newsletter", "Newsletter"], ["info", "Site Info"], ] as [SettingsTab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${tab === key ? "gradient-sunset text-white shadow-glow" : "glass hover:bg-white/10"}`}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {tab === "media" && <MediaLibrary />}
          {tab === "newsletter" && <NewsletterPanel />}
          {tab === "info" && (
            <div className="rounded-3xl glass p-6 space-y-3 text-sm text-muted-foreground">
              <h3 className="text-lg font-bold text-foreground">Site & Contact Configuration</h3>
              <div className="flex flex-wrap gap-2"><span className="font-medium text-foreground">Email:</span><span>dharavujourney@gmail.com</span></div>
              <div className="flex flex-wrap gap-2"><span className="font-medium text-foreground">Phones:</span><span>+91 95792 65920 · +91 93568 01338</span></div>
              <div className="flex flex-wrap gap-2"><span className="font-medium text-foreground">Instagram:</span><a href="https://www.instagram.com/dharavu_journey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@dharavu_journey</a></div>
              <div className="flex flex-wrap gap-2"><span className="font-medium text-foreground">Featured trips:</span><span>Edit any trip → toggle the Featured checkbox</span></div>
              <div className="mt-4 rounded-2xl bg-amber-400/10 border border-amber-400/20 px-4 py-3 text-xs text-amber-300">
                <strong>Razorpay reminder:</strong> Add webhook at dashboard → Settings → Webhooks → URL: <code>/api/payments/webhook</code> → event: payment.captured → copy the secret → add RAZORPAY_WEBHOOK_SECRET to Render env.
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
