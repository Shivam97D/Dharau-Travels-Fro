import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Download, Users, Send, Eye, EyeOff,
  CheckSquare, Square, Video, Image, Trash2, Star,
  Upload, RefreshCw, GripVertical, X, Check, Shield, Clock, Save, AlertTriangle,
} from "lucide-react";
import { TravelLoader, TravelDots } from "@/components/ui/TravelLoader";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

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

// Single-file slug (fallback) and multi-file slug
const singleSlug: Record<string, string> = {
  "dharavu/hero":    "hero-video",
  "dharavu/gallery": "gallery-image",
  "dharavu/trips":   "trip-image",
  "dharavu/avatars": "avatar",
};
const multiSlug: Record<string, "trip-images" | "gallery-images" | "hero-videos" | null> = {
  "dharavu/hero":    "hero-videos",
  "dharavu/gallery": "gallery-images",
  "dharavu/trips":   "trip-images",
  "dharavu/avatars": null, // avatars stay single
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

  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
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

  // Upload one or many files to current folder
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setUploadProgress({ done: 0, total: files.length });

    try {
      const batchSlug = multiSlug[folder.key];

      if (batchSlug && files.length > 1) {
        // Multi-file batch upload
        const result = await api.uploadMediaBatch(files, batchSlug);
        setUploadProgress({ done: files.length, total: files.length });
        toast.success(`${result.length} file${result.length !== 1 ? "s" : ""} uploaded!`);
      } else {
        // Single file (or avatars which stay single)
        for (let i = 0; i < files.length; i++) {
          setUploadProgress({ done: i, total: files.length });
          const form = new FormData();
          form.append("file", files[i]);
          const headers: Record<string, string> = {};
          const token = localStorage.getItem("token");
          if (token) headers["Authorization"] = `Bearer ${token}`;
          const slug = singleSlug[folder.key] ?? "image";
          const res = await fetch(`/api/admin/upload/${slug}`, { method: "POST", headers, body: form });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message ?? `Upload failed for ${files[i].name}`);
        }
        toast.success(
          files.length === 1 ? "Uploaded!" : `${files.length} files uploaded!`,
        );
      }

      loadAssets();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(null);
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
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept={folder.type === "video" ? "video/*" : "image/*"}
          multiple={folder.key !== "dharavu/avatars"} // avatars stay single
          className="hidden"
          onChange={handleUpload}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-full gradient-aurora px-4 py-2 text-sm font-medium text-white transition hover:scale-105 disabled:opacity-50"
        >
          {uploading ? <TravelDots /> : <Upload className="h-4 w-4" />}
          {uploading
            ? uploadProgress
              ? `Uploading ${uploadProgress.done}/${uploadProgress.total}…`
              : "Uploading…"
            : `Upload to ${folder.label}`}
        </button>

        <button onClick={loadAssets} disabled={loadingAssets} className="grid h-8 w-8 place-items-center rounded-full glass transition hover:bg-white/10 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loadingAssets ? "animate-spin" : ""}`} />
        </button>

        <span className="text-xs text-muted-foreground">{assets.length} file{assets.length !== 1 ? "s" : ""}</span>

        {/* Multi-select hint */}
        {folder.key !== "dharavu/avatars" && (
          <span className="text-xs text-muted-foreground opacity-60">
            · Select multiple files at once
          </span>
        )}
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
          <TravelLoader size="sm" />
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
                  {deleting === asset.publicId ? <TravelDots /> : <Trash2 className="h-3 w-3" />}
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
            {saving ? <TravelDots /> : <Star className="h-4 w-4" />}
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
            {sending ? <TravelDots /> : <Send className="h-4 w-4" />} Send to all ({activeCount})
          </button>
          <button onClick={() => send(true)} disabled={sending || selected.size === 0} className="flex items-center gap-2 rounded-full border border-border bg-white/5 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-50">
            {sending ? <TravelDots /> : <Send className="h-4 w-4" />} Send to selected ({selected.size})
          </button>
        </div>
      </div>

      <div className="rounded-2xl glass p-5">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-semibold">Subscribers</h4>
          {subscribers.length > 0 && <button onClick={exportCsv} className="flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium transition hover:bg-white/10"><Download className="h-3.5 w-3.5" /> CSV</button>}
        </div>
        {loading ? (
          <div className="flex justify-center py-6"><TravelDots /></div>
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

// ─── Security / Session panel ─────────────────────────────────────────────────
function SecurityPanel() {
  const [sessionDays, setSessionDays] = useState(7);
  const [requireVerification, setRequireVerification] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSiteConfig()
      .then((res) => {
        const s = (res.data as any)?.sessionSettings;
        if (s) {
          setSessionDays(s.sessionDurationDays ?? 7);
          setRequireVerification(s.requireEmailVerification ?? true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.updateSiteConfig({
        sessionSettings: { sessionDurationDays: sessionDays, requireEmailVerification: requireVerification },
      });
      toast.success("Session settings saved — applies to new logins immediately.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><TravelLoader size="sm" /></div>;

  return (
    <div className="space-y-5">
      {/* Session duration */}
      <div className="rounded-3xl glass p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-ocean"><Clock className="h-5 w-5 text-white" /></div>
          <div>
            <h3 className="font-bold">Session Duration</h3>
            <p className="text-xs text-muted-foreground">How long users stay logged in after signing in</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { days: 1,  label: "1 day",    desc: "Highest security" },
            { days: 7,  label: "7 days",   desc: "Recommended" },
            { days: 14, label: "14 days",  desc: "Balanced" },
            { days: 30, label: "30 days",  desc: "Convenient" },
            { days: 90, label: "90 days",  desc: "Long-term" },
            { days: 365,label: "1 year",   desc: "Stay logged in" },
          ].map(({ days, label, desc }) => (
            <button
              key={days}
              onClick={() => setSessionDays(days)}
              className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${
                sessionDays === days
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border glass hover:border-primary/30"
              }`}
            >
              <span className="text-base font-bold">{label}</span>
              <span className="text-xs text-muted-foreground">{desc}</span>
              {days === 7 && <span className="mt-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">Default</span>}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-amber-400/10 border border-amber-400/20 px-4 py-2.5 text-xs text-amber-300">
          Changing session duration applies to <strong>new logins</strong> only. Existing sessions keep their original expiry.
        </div>
      </div>

      {/* Email verification toggle */}
      <div className="rounded-3xl glass p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-sunset"><Shield className="h-5 w-5 text-white" /></div>
          <div>
            <h3 className="font-bold">Email Verification</h3>
            <p className="text-xs text-muted-foreground">Require users to verify email before logging in</p>
          </div>
        </div>

        <button
          onClick={() => setRequireVerification((v) => !v)}
          className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
            requireVerification ? "border-emerald-500/40 bg-emerald-500/5" : "border-border glass"
          }`}
        >
          <div>
            <p className="text-sm font-semibold">{requireVerification ? "Verification required" : "Verification optional"}</p>
            <p className="text-xs text-muted-foreground">
              {requireVerification
                ? "Users must verify email via OTP before accessing their account"
                : "Users can log in without verifying email (not recommended)"}
            </p>
          </div>
          <div className={`ml-4 h-6 w-11 shrink-0 rounded-full transition-colors ${requireVerification ? "bg-emerald-500" : "bg-border"}`}>
            <div className={`mt-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${requireVerification ? "translate-x-5.5 ml-0.5" : "ml-0.5"}`} />
          </div>
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-full gradient-sunset px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-50"
        >
          {saving ? <TravelDots /> : <Save className="h-4 w-4" />}
          Save Security Settings
        </button>
      </div>
    </div>
  );
}

// ─── Payment Settings panel ──────────────────────────────────────────────────
function PaymentSettings() {
  const [mode, setMode] = useState<"upi_qr" | "razorpay">("upi_qr");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSiteConfig().then((res: any) => {
      const d = res.data;
      if (d?.paymentMode) setMode(d.paymentMode);
      if (d?.upiId) setUpiId(d.upiId);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.updateSiteConfig({ paymentMode: mode, upiId: upiId.trim() });
      toast.success("Payment settings saved.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><TravelLoader size="sm" /></div>;

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="rounded-3xl glass p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-sunset">
            <span className="text-lg">₹</span>
          </div>
          <div>
            <h3 className="font-bold">Payment Mode</h3>
            <p className="text-xs text-muted-foreground">Choose how customers pay for bookings</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {([
            { value: "upi_qr", label: "UPI QR Code", desc: "Customer scans QR · zero transaction fees · manual verification" },
            { value: "razorpay", label: "Razorpay", desc: "Instant online payment · automatic confirmation · fees apply" },
          ] as const).map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${
                mode === value ? "border-primary bg-primary/10" : "border-border glass hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {mode === value && <Check className="h-4 w-4 text-primary" />}
                <span className="font-semibold text-sm">{label}</span>
              </div>
              <span className="text-xs text-muted-foreground leading-relaxed">{desc}</span>
              {value === "upi_qr" && <span className="mt-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">Default · Recommended</span>}
            </button>
          ))}
        </div>
      </div>

      {/* UPI ID */}
      <div className="rounded-3xl glass p-6 space-y-4">
        <div>
          <h3 className="font-bold">UPI ID / VPA</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Your UPI address shown to customers when they pay</p>
        </div>
        <input
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="yourname@upi  or  yourphone@bank"
          className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-mono outline-none transition focus:border-primary/50 focus:bg-white/10"
        />
        <p className="text-xs text-muted-foreground">Example: <span className="font-mono text-white/60">dharavujourney@okicici</span> · Customers can also use this to pay manually via any UPI app</p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-full gradient-sunset px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-50"
        >
          {saving ? <TravelDots /> : <Save className="h-4 w-4" />}
          Save Payment Settings
        </button>
      </div>
    </div>
  );
}

// ─── Danger Zone panel ───────────────────────────────────────────────────────
const FLUSH_OPTIONS = [
  { key: "trips",     label: "Trips",      desc: "All trip listings" },
  { key: "bookings",  label: "Bookings",   desc: "All bookings & payment records" },
  { key: "reviews",   label: "Reviews",    desc: "All customer reviews" },
  { key: "inquiries", label: "Inquiries",  desc: "All contact / custom trip inquiries" },
  { key: "users",     label: "Users",      desc: "Regular users only · admin & owner kept" },
] as const;

type FlushKey = typeof FLUSH_OPTIONS[number]["key"];

function DangerZone() {
  const [selected, setSelected] = useState<Set<FlushKey>>(new Set());
  const [confirm, setConfirm] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Record<string, number> | null>(null);

  const toggle = (k: FlushKey) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(k) ? next.delete(k) : next.add(k);
    return next;
  });

  const toggleAll = () => {
    if (selected.size === FLUSH_OPTIONS.length) setSelected(new Set());
    else setSelected(new Set(FLUSH_OPTIONS.map((o) => o.key)));
  };

  const ready = confirm === "DELETE" && selected.size > 0;

  const handleClear = async () => {
    if (!ready) return;
    setRunning(true);
    try {
      const res = await api.clearTestData([...selected]) as any;
      if (res.success) {
        setResult(res.deleted);
        setConfirm("");
        setSelected(new Set());
        toast.success(`Flushed: ${[...selected].join(", ")}`);
      } else {
        toast.error(res.message ?? "Failed");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/20">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-red-400">Danger Zone — Flush Data</h3>
            <p className="text-xs text-muted-foreground">Permanently delete selected data. Activity logs are always kept.</p>
          </div>
        </div>

        {/* Selectable type chips */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Select what to delete</p>
            <button onClick={toggleAll} className="text-xs text-red-400 hover:text-red-300 transition">
              {selected.size === FLUSH_OPTIONS.length ? "Deselect all" : "Select all"}
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {FLUSH_OPTIONS.map(({ key, label, desc }) => {
              const on = selected.has(key);
              return (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition ${
                    on ? "border-red-500/50 bg-red-500/10" : "border-white/10 bg-white/5 hover:border-red-500/30"
                  }`}
                >
                  <div className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${on ? "border-red-500 bg-red-500/20" : "border-white/20"}`}>
                    {on && <Check className="h-3 w-3 text-red-400" />}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${on ? "text-red-300" : "text-foreground"}`}>{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Last result */}
        {result && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300 space-y-0.5">
            <p className="font-semibold">Last flush result:</p>
            {Object.entries(result).map(([k, v]) => (
              <p key={k} className="text-xs">{k}: <strong>{v} deleted</strong></p>
            ))}
          </div>
        )}

        {/* Confirm input */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm
            {selected.size > 0 && <span className="ml-1 text-red-400/70">({[...selected].join(", ")})</span>}
          </label>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="DELETE"
            className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-mono outline-none transition focus:border-red-500/50 focus:bg-white/10"
          />
        </div>

        <button
          onClick={handleClear}
          disabled={!ready || running}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-red-600/80 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {running ? <TravelDots /> : <Trash2 className="h-4 w-4" />}
          {running ? "Deleting…" : selected.size === 0 ? "Select items to delete" : `Flush ${[...selected].join(", ")}`}
        </button>
      </div>
    </div>
  );
}

// ─── Main AdminSettings component ────────────────────────────────────────────
type SettingsTab = "media" | "newsletter" | "payment" | "security" | "danger";

export function AdminSettings() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "owner";

  const [tab, setTab] = useState<SettingsTab>("media");

  // If current tab becomes inaccessible (shouldn't happen but guard it)
  const visibleTab = (!isAdmin && (tab === "security" || tab === "danger")) ? "media" : tab;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl glass p-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Media library, newsletter, and site configuration</p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2">
        {([ ["media", "Media Library"], ["newsletter", "Newsletter"], ["payment", "Payment"], ] as [SettingsTab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${visibleTab === key ? "gradient-sunset text-white shadow-glow" : "glass hover:bg-white/10"}`}>
            {label}
          </button>
        ))}
        {isAdmin && (
          <>
            <button onClick={() => setTab("security")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${visibleTab === "security" ? "gradient-sunset text-white shadow-glow" : "glass hover:bg-white/10"}`}>
              Security
            </button>
            <button onClick={() => setTab("danger")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${visibleTab === "danger" ? "bg-red-600/80 text-white" : "border border-red-500/30 text-red-400 hover:bg-red-500/10"}`}>
              Danger Zone
            </button>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={visibleTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {visibleTab === "media" && <MediaLibrary />}
          {visibleTab === "newsletter" && <NewsletterPanel />}
          {visibleTab === "payment" && <PaymentSettings />}
          {visibleTab === "security" && isAdmin && <SecurityPanel />}
          {visibleTab === "danger" && isAdmin && <DangerZone />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
