import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  Star,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  TrendingUp,
  X,
  Save,
  
} from "lucide-react";
import { TravelLoader, TravelDots } from "@/components/ui/TravelLoader";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Trip } from "@/lib/types";

interface TripFormData {
  title: string;
  description: string;
  destination: string;
  country: string;
  categories: string[];
  duration: { days: number; nights: number };
  price: { amount: number; currency: string; originalPrice?: number; discount?: number };
  maxGroupSize: number;
  availableSeats: number;
  difficulty: string;
  departureLocation: string;
  departureDate: string[];
  featured: boolean;
  status: string;
  images: string[];
  highlights: string[];
  includes: string[];
  excludes: string[];
  tags: string[];
}

const EMPTY_FORM: TripFormData = {
  title: "",
  description: "",
  destination: "",
  country: "",
  categories: ["adventure"],
  duration: { days: 7, nights: 6 },
  price: { amount: 0, currency: "INR", originalPrice: undefined, discount: undefined },
  maxGroupSize: 15,
  availableSeats: 15,
  difficulty: "moderate",
  departureLocation: "",
  departureDate: [],
  featured: false,
  status: "active",
  images: [],
  highlights: [],
  includes: [],
  excludes: [],
  tags: [],
};

// Convert the form's flat string fields into the API/document shape.
function toTripPayload(f: TripFormData) {
  return {
    ...f,
    images: f.images.filter((u) => u.trim()).map((url, idx) => ({ url: url.trim(), isPrimary: idx === 0 })),
    highlights: f.highlights.filter((s) => s.trim()),
    includes: f.includes.filter((s) => s.trim()),
    excludes: f.excludes.filter((s) => s.trim()),
    tags: f.tags.filter((s) => s.trim()),
    departureDate: f.departureDate.filter((d) => d),
  };
}

export function AdminTripManagement() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState<TripFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTrips();
  }, [filterCategory, filterStatus]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.status = filterStatus;

      const response = await api.getAdminTrips(params);
      if (response.success && response.data) {
        setTrips((response.data as { data?: Trip[] }).data ?? (response.data as Trip[]));
      }
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async () => {
    try {
      setSubmitting(true);
      const response = await api.createTrip(toTripPayload(formData));
      if (response.success) {
        toast.success("Trip created");
        setShowCreateModal(false);
        fetchTrips();
        resetForm();
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to create trip");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTrip = async () => {
    if (!selectedTrip) return;
    try {
      setSubmitting(true);
      const response = await api.updateTrip(selectedTrip._id, toTripPayload(formData));
      if (response.success) {
        toast.success("Trip updated");
        setShowEditModal(false);
        fetchTrips();
        resetForm();
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update trip");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      await api.deleteTrip(id);
      toast.success("Trip deleted");
      fetchTrips();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete trip");
    }
  };

  const handleEditClick = (trip: Trip) => {
    setSelectedTrip(trip);
    setFormData({
      title: trip.title,
      description: trip.description,
      destination: trip.destination,
      country: trip.country,
      categories: trip.categories ?? [],
      duration: trip.duration,
      price: trip.price,
      maxGroupSize: trip.maxGroupSize,
      availableSeats: trip.availableSeats,
      difficulty: trip.difficulty,
      departureLocation: trip.departureLocation || "",
      departureDate: (trip.departureDate || []).map((d) => new Date(d).toISOString().split("T")[0]),
      featured: trip.featured,
      status: trip.status,
      images: (trip.images || []).map((i) => i.url),
      highlights: trip.highlights || [],
      includes: trip.includes || [],
      excludes: trip.excludes || [],
      tags: trip.tags || [],
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setSelectedTrip(null);
  };

  const filteredTrips = trips.filter((trip) =>
    searchQuery
      ? trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
      : true,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl glass p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trip Management</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit, and manage all trips in your inventory
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-full gradient-sunset px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            Create Trip
          </button>
          <button className="flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium transition hover:bg-white/10">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl glass p-6 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl bg-white/5 py-2 pl-10 pr-4 text-sm outline-none transition focus:bg-white/10"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-2xl bg-white/5 px-4 py-2 text-sm outline-none transition focus:bg-white/10"
        >
          <option value="">All Categories</option>
          <option value="group-tour">Group Tour</option>
          <option value="solo">Solo</option>
          <option value="trekking">Trekking</option>
          <option value="camping">Camping</option>
          <option value="adventure">Adventure</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-2xl bg-white/5 px-4 py-2 text-sm outline-none transition focus:bg-white/10"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="upcoming">Upcoming</option>
          <option value="soldout">Sold Out</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-3xl glass p-12">
          <TravelLoader />
        </div>
      ) : (
        <div className="rounded-3xl glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Trip
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" /> Price
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Seats
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTrips.map((trip) => (
                  <motion.tr
                    key={trip._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="transition hover:bg-white/5"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {trip.images && trip.images[0] && (
                          <img
                            src={trip.images[0].url}
                            alt={trip.title}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{trip.title}</p>
                          <p className="text-xs text-muted-foreground">
                            <MapPin className="inline h-3 w-3" /> {trip.destination}, {trip.country}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(trip.categories ?? []).map((c) => (
                          <span key={c} className="rounded-full bg-white/10 px-2 py-0.5 text-xs capitalize">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">₹{trip.price.amount.toLocaleString("en-IN")}</p>
                      {trip.price.discount && (
                        <p className="text-xs text-green-400">₹{trip.price.discount.toLocaleString("en-IN")} off</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">
                        {trip.availableSeats}/{trip.maxGroupSize}
                      </p>
                      <p className="text-xs text-muted-foreground">available</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          trip.status === "active"
                            ? "bg-emerald-400/20 text-emerald-200"
                            : trip.status === "upcoming"
                              ? "bg-sky-400/20 text-sky-200"
                              : "bg-zinc-400/20 text-zinc-200"
                        }`}
                      >
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(trip)}
                          className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrip(trip._id)}
                          className="rounded-lg bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20"
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

      <AnimatePresence>
        {(showCreateModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4 backdrop-blur-md"
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl glass p-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {showEditModal ? "Edit Trip" : "Create New Trip"}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Trip Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-2xl bg-white/5 px-4 py-2 outline-none transition focus:bg-white/10"
                    placeholder="e.g., Bali Soul Escape"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Destination</label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full rounded-2xl bg-white/5 px-4 py-2 outline-none transition focus:bg-white/10"
                    placeholder="e.g., Bali"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full rounded-2xl bg-white/5 px-4 py-2 outline-none transition focus:bg-white/10"
                    placeholder="e.g., Indonesia"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Categories (select all that apply)</label>
                  <div className="flex flex-wrap gap-2 rounded-2xl bg-white/5 px-4 py-3">
                    {(["group-tour", "solo", "trekking", "camping", "adventure"] as const).map((cat) => {
                      const checked = formData.categories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            const next = checked
                              ? formData.categories.filter((c) => c !== cat)
                              : [...formData.categories, cat];
                            setFormData({ ...formData, categories: next });
                          }}
                          className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                            checked ? "gradient-sunset text-white shadow-glow" : "bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          {cat.replace("-", " ")}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Price (INR ₹)</label>
                  <input
                    type="number"
                    value={formData.price.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: { ...formData.price, amount: Number(e.target.value) },
                      })
                    }
                    className="w-full rounded-2xl bg-white/5 px-4 py-2 outline-none transition focus:bg-white/10"
                    placeholder="89999"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Max Group Size</label>
                  <input
                    type="number"
                    value={formData.maxGroupSize}
                    onChange={(e) =>
                      setFormData({ ...formData, maxGroupSize: Number(e.target.value) })
                    }
                    className="w-full rounded-2xl bg-white/5 px-4 py-2 outline-none transition focus:bg-white/10"
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Available Seats</label>
                  <input
                    type="number"
                    value={formData.availableSeats}
                    onChange={(e) =>
                      setFormData({ ...formData, availableSeats: Number(e.target.value) })
                    }
                    className="w-full rounded-2xl bg-white/5 px-4 py-2 outline-none transition focus:bg-white/10"
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-2xl bg-white/5 px-4 py-2 outline-none transition focus:bg-white/10"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="soldout">Sold Out</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Days</label>
                  <input
                    type="number"
                    value={formData.duration.days}
                    onChange={(e) => setFormData({ ...formData, duration: { ...formData.duration, days: Number(e.target.value) } })}
                    className="w-full rounded-2xl bg-white/5 px-4 py-2 outline-none transition focus:bg-white/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Nights</label>
                  <input
                    type="number"
                    value={formData.duration.nights}
                    onChange={(e) => setFormData({ ...formData, duration: { ...formData.duration, nights: Number(e.target.value) } })}
                    className="w-full rounded-2xl bg-white/5 px-4 py-2 outline-none transition focus:bg-white/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Original Price (₹, optional)</label>
                  <input
                    type="number"
                    value={formData.price.originalPrice ?? ""}
                    onChange={(e) => setFormData({ ...formData, price: { ...formData.price, originalPrice: e.target.value ? Number(e.target.value) : undefined } })}
                    className="w-full rounded-2xl bg-white/5 px-4 py-2 outline-none transition focus:bg-white/10"
                    placeholder="99999"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Discount (₹, optional)</label>
                  <input
                    type="number"
                    value={formData.price.discount ?? ""}
                    onChange={(e) => setFormData({ ...formData, price: { ...formData.price, discount: e.target.value ? Number(e.target.value) : undefined } })}
                    className="w-full rounded-2xl bg-white/5 px-4 py-2 outline-none transition focus:bg-white/10"
                    placeholder="10000"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full rounded-2xl bg-white/5 px-4 py-2 outline-none transition focus:bg-white/10"
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="challenging">Challenging</option>
                    <option value="extreme">Extreme</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Departure Location</label>
                  <input
                    type="text"
                    value={formData.departureLocation}
                    onChange={(e) => setFormData({ ...formData, departureLocation: e.target.value })}
                    className="w-full rounded-2xl bg-white/5 px-4 py-2 outline-none transition focus:bg-white/10"
                    placeholder="e.g., Mumbai Airport"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Departure Dates (comma-separated, YYYY-MM-DD)</label>
                  <input
                    type="text"
                    value={formData.departureDate.join(", ")}
                    onChange={(e) => setFormData({ ...formData, departureDate: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                    className="w-full rounded-2xl bg-white/5 px-4 py-2 outline-none transition focus:bg-white/10"
                    placeholder="2026-08-15, 2026-09-20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Images</label>
                  <div className="space-y-3">
                    {/* Upload from device */}
                    <div className="flex items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files ?? []);
                          if (!files.length) return;
                          setUploading(true);
                          try {
                            const results = await api.uploadMediaBatch(files, "trip-images");
                            const urls = results.map((r) => r.url);
                            setFormData((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
                            toast.success(`${urls.length} image${urls.length !== 1 ? "s" : ""} uploaded`);
                          } catch (err: unknown) {
                            toast.error(err instanceof Error ? err.message : "Upload failed");
                          } finally {
                            setUploading(false);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 rounded-2xl border border-border bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10 disabled:opacity-50"
                      >
                        {uploading ? <TravelDots /> : <Upload className="h-4 w-4" />}
                        {uploading ? "Uploading…" : "Upload from device"}
                      </button>
                      <span className="text-xs text-muted-foreground">or paste URLs below</span>
                    </div>
                    {/* URL textarea */}
                    <textarea
                      value={formData.images.join("\n")}
                      onChange={(e) => setFormData({ ...formData, images: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                      rows={3}
                      className="w-full rounded-2xl bg-white/5 px-4 py-2 font-mono text-xs outline-none transition focus:bg-white/10"
                      placeholder={"https://res.cloudinary.com/your-cloud/…\nhttps://images.unsplash.com/…"}
                    />
                    {/* Thumbnails */}
                    {formData.images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.images.map((url, idx) => (
                          <div key={idx} className="relative">
                            <img src={url} alt={`img-${idx}`} className="h-16 w-24 rounded-xl object-cover" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                              className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600"
                            >×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full rounded-2xl bg-white/5 px-4 py-2 outline-none transition focus:bg-white/10"
                    placeholder="Describe the trip experience..."
                  />
                </div>

                {([
                  ["highlights", "Highlights (comma-separated)"],
                  ["includes", "Included (comma-separated)"],
                  ["excludes", "Not included (comma-separated)"],
                  ["tags", "Tags (comma-separated)"],
                ] as const).map(([key, label]) => (
                  <div key={key} className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium">{label}</label>
                    <input
                      type="text"
                      value={(formData[key] as string[]).join(", ")}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                      className="w-full rounded-2xl bg-white/5 px-4 py-2 outline-none transition focus:bg-white/10"
                    />
                  </div>
                ))}

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4 rounded"
                  />
                  <label htmlFor="featured" className="text-sm font-medium">
                    Featured Trip
                  </label>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="rounded-full glass px-6 py-2 text-sm font-medium transition hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={showEditModal ? handleUpdateTrip : handleCreateTrip}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-full gradient-sunset px-6 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02] disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <TravelDots />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {showEditModal ? "Update Trip" : "Create Trip"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
