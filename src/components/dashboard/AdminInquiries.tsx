import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, Phone, MapPin, Send, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface InquiryRow {
  _id: string;
  type: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  customTripDetails?: { destination?: string; travelers?: number; budget?: string; preferredDates?: string };
  response?: { text?: string };
}

const statusStyles: Record<string, string> = {
  new: "bg-amber-400/20 text-amber-300",
  in_progress: "bg-sky-400/20 text-sky-300",
  responded: "bg-emerald-400/20 text-emerald-300",
  closed: "bg-zinc-400/20 text-zinc-300",
};

export function AdminInquiries() {
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      const res = await api.getAllInquiries(params);
      if (res.success) setInquiries((res.data as InquiryRow[]) ?? []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filterStatus]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.updateInquiryStatus(id, status);
      setInquiries((prev) => prev.map((i) => (i._id === id ? { ...i, status } : i)));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  const sendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setBusy(true);
    try {
      await api.respondToInquiry(id, replyText.trim());
      toast.success("Response saved");
      setInquiries((prev) => prev.map((i) => (i._id === id ? { ...i, status: "responded", response: { text: replyText.trim() } } : i)));
      setReplyText("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not save response");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl glass p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inquiries</h2>
          <p className="mt-1 text-sm text-muted-foreground">Contact messages and custom trip requests</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-2xl bg-white/5 px-4 py-2 text-sm outline-none transition focus:bg-white/10"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="responded">Responded</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center rounded-3xl glass p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="rounded-3xl glass p-12 text-center text-sm text-muted-foreground">No inquiries found.</div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((i) => {
            const isOpen = expanded === i._id;
            return (
              <motion.div key={i._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl glass p-4">
                <button onClick={() => { setExpanded(isOpen ? null : i._id); setReplyText(i.response?.text ?? ""); }} className="flex w-full items-center justify-between gap-3 text-left">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{i.subject}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[i.status]}`}>{i.status.replace("_", " ")}</span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs capitalize">{i.type.replace("_", " ")}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{i.name} · {i.email} · {new Date(i.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                    <p className="text-sm text-muted-foreground">{i.message}</p>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{i.email}</span>
                      {i.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{i.phone}</span>}
                      {i.customTripDetails?.destination && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{i.customTripDetails.destination}</span>}
                      {i.customTripDetails?.travelers ? <span>{i.customTripDetails.travelers} travelers</span> : null}
                      {i.customTripDetails?.budget && <span>Budget: {i.customTripDetails.budget}</span>}
                      {i.customTripDetails?.preferredDates && <span>Dates: {i.customTripDetails.preferredDates}</span>}
                    </div>

                    <div>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                        placeholder="Write a response (saved to the inquiry record)…"
                        className="w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:bg-white/10"
                      />
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <button onClick={() => sendReply(i._id)} disabled={busy} className="flex items-center gap-2 rounded-full gradient-sunset px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-50">
                          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Save response
                        </button>
                        <select value={i.status} onChange={(e) => updateStatus(i._id, e.target.value)} className="rounded-full bg-white/5 px-3 py-2 text-xs outline-none">
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="responded">Responded</option>
                          <option value="closed">Closed</option>
                        </select>
                        <a href={`mailto:${i.email}`} className="rounded-full bg-white/5 px-4 py-2 text-xs font-medium transition hover:bg-white/10">Email customer</a>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
