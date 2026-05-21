import { useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Sparkles, Archive, CalendarRange, Repeat, Tags, Users, Layers } from "lucide-react";
import type { Trip } from "@/lib/types";

const mockTrips: Trip[] = [
  {
    _id: "1",
    title: "Bali Soul Escape",
    slug: "bali-soul-escape",
    description:
      "Immerse yourself in the spiritual heart of Bali with curated wellness experiences.",
    destination: "Bali",
    country: "Indonesia",
    category: "Wellness",
    duration: { days: 7, nights: 6 },
    price: { amount: 2490, currency: "USD", originalPrice: 2890, discount: 400 },
    images: [
      { url: "/uploads/bali-1.jpg", caption: "Ubud Rice Terraces", isPrimary: true },
      { url: "/uploads/bali-2.jpg", caption: "Beach Sunset", isPrimary: false },
    ],
    itinerary: [],
    includes: [],
    excludes: [],
    highlights: [],
    maxGroupSize: 12,
    availableSeats: 5,
    difficulty: "easy",
    departureLocation: "Denpasar",
    departureDate: ["2024-06-18", "2024-07-05"],
    rating: { average: 4.9, count: 128 },
    status: "active",
    featured: true,
    tags: ["wellness", "luxury", "culture"],
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    title: "Swiss Alps Escape",
    slug: "swiss-alps-escape",
    description: "Snow-capped luxury stay in the heart of the Alps with private heli tours.",
    destination: "Zermatt",
    country: "Switzerland",
    category: "Luxury",
    duration: { days: 5, nights: 4 },
    price: { amount: 4290, currency: "USD" },
    images: [{ url: "/uploads/swiss-1.jpg", caption: "Matterhorn Views", isPrimary: true }],
    itinerary: [],
    includes: [],
    excludes: [],
    highlights: [],
    maxGroupSize: 8,
    availableSeats: 2,
    difficulty: "moderate",
    departureLocation: "Zurich",
    departureDate: ["2024-06-28"],
    rating: { average: 4.8, count: 96 },
    status: "upcoming",
    featured: true,
    tags: ["mountain", "private", "winter"],
    createdAt: new Date().toISOString(),
  },
  {
    _id: "3",
    title: "Tokyo Neon Nights",
    slug: "tokyo-neon-nights",
    description: "Ultra-modern culinary and culture tour through Tokyo's hidden gems.",
    destination: "Tokyo",
    country: "Japan",
    category: "Urban",
    duration: { days: 6, nights: 5 },
    price: { amount: 3190, currency: "USD", discount: 200 },
    images: [{ url: "/uploads/tokyo-1.jpg", caption: "Shinjuku Skyline", isPrimary: true }],
    itinerary: [],
    includes: [],
    excludes: [],
    highlights: [],
    maxGroupSize: 14,
    availableSeats: 10,
    difficulty: "easy",
    departureLocation: "Tokyo",
    departureDate: ["2024-07-12", "2024-08-01"],
    rating: { average: 4.7, count: 182 },
    status: "active",
    featured: false,
    tags: ["city", "food", "nightlife"],
    createdAt: new Date().toISOString(),
  },
];

const overviewCards = [
  {
    title: "Active Trips",
    value: 18,
    change: "+4 this month",
    icon: <Sparkles className="h-5 w-5 text-white" />,
    gradient: "gradient-sunset",
  },
  {
    title: "Featured Trips",
    value: 9,
    change: "3 expiring soon",
    icon: <Layers className="h-5 w-5 text-white" />,
    gradient: "gradient-aurora",
  },
  {
    title: "Total Capacity",
    value: "168 seats",
    change: "74 seats available",
    icon: <Users className="h-5 w-5 text-white" />,
    gradient: "bg-linear-to-br from-[#9b5de5] to-[#f15bb5]",
  },
  {
    title: "Upcoming Departures",
    value: 12,
    change: "Next departure in 3 days",
    icon: <CalendarRange className="h-5 w-5 text-white" />,
    gradient: "bg-linear-to-br from-[#fee440] to-[#f15bb5]",
  },
];

export function TripManagement() {
  const featuredCount = useMemo(() => mockTrips.filter((trip) => trip.featured).length, []);

  return (
    <section className="mt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col gap-4 rounded-3xl glass p-6"
      >
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-bold">Trip Control Center</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Schedule, duplicate, feature, and fine-tune every itinerary in real-time
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-2 rounded-full gradient-sunset px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02]">
              <Plus className="h-4 w-4" />
              Create Trip
            </button>
            <button className="flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium transition hover:bg-white/10">
              <Repeat className="h-4 w-4" />
              Duplicate
            </button>
            <button className="flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium transition hover:bg-white/10">
              <Archive className="h-4 w-4" />
              Archive
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="relative overflow-hidden rounded-3xl bg-white/5 p-5 backdrop-blur-lg"
            >
              <div
                className={`absolute -right-6 -top-6 h-28 w-28 rounded-full ${card.gradient} opacity-10 blur-3xl`}
              />
              <div className="relative">
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${card.gradient}`}>
                  {card.icon}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{card.title}</p>
                <p className="mt-1 text-2xl font-semibold">{card.value}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-foreground/70">
                  <Sparkles className="h-3 w-3" />
                  {card.change}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl bg-white/5 p-4 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Active Inventory</h3>
              <p className="text-sm text-muted-foreground">
                {mockTrips.length} luxury itineraries • {featuredCount} featured •{" "}
                {mockTrips.reduce((acc, trip) => acc + trip.availableSeats, 0)} seats available
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:bg-white/20">
                Filter
              </button>
              <button className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:bg-white/20">
                Export
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-white/5">
            <div className="grid grid-cols-12 bg-white/5 px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
              <div className="col-span-4">Trip</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Departure</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Actions</div>
            </div>

            {mockTrips.map((trip, index) => (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="grid grid-cols-12 items-center border-t border-white/5 bg-background/40 px-4 py-4 text-sm transition hover:bg-white/10"
              >
                <div className="col-span-4">
                  <p className="font-medium">{trip.title}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {trip.destination}, {trip.country}
                    </span>
                    <span>•</span>
                    <span>
                      {trip.duration.days}D / {trip.duration.nights}N
                    </span>
                    <span>•</span>
                    <span>${trip.price.amount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize text-foreground/80">
                    {trip.category}
                  </span>
                </div>
                <div className="col-span-2 text-xs text-foreground/80">
                  <p>{new Date(trip.departureDate[0]).toLocaleDateString()}</p>
                  <p className="text-muted-foreground">{trip.availableSeats} seats</p>
                </div>
                <div className="col-span-2">
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
                </div>
                <div className="col-span-2 flex flex-wrap gap-2">
                  <button className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium transition hover:bg-white/20">
                    Edit
                  </button>
                  <button className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium transition hover:bg-white/20">
                    Schedule
                  </button>
                  <button className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium transition hover:bg-white/20">
                    Feature
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-3xl bg-white/5 p-6 backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Automation Rules</h3>
              <Tags className="h-4 w-4 text-muted-foreground" />
            </div>
            <ul className="mt-4 space-y-3 text-sm text-foreground/80">
              <li className="flex items-start gap-3 rounded-2xl bg-white/5 p-3">
                <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                Auto-feature trips that achieve 50+ bookings in 7 days
              </li>
              <li className="flex items-start gap-3 rounded-2xl bg-white/5 p-3">
                <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                Trigger concierge outreach when luxury inventory falls below 3 seats
              </li>
              <li className="flex items-start gap-3 rounded-2xl bg-white/5 p-3">
                <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                Duplicate and localize itineraries for high-performing regions
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-3xl bg-white/5 p-6 backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Scheduling Queue</h3>
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-4 space-y-3 text-sm text-foreground/80">
              {mockTrips.slice(0, 3).map((trip) => (
                <div key={trip._id} className="rounded-2xl bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{trip.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Next departure {new Date(trip.departureDate[0]).toLocaleDateString()} •{" "}
                        {trip.availableSeats} seats
                      </p>
                    </div>
                    <button className="rounded-full bg-white/10 px-3 py-1 text-xs transition hover:bg-white/20">
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
