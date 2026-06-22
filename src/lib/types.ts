export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "owner";
  avatar?: string;
  phone?: string;
  address?: string;
  isVerified: boolean;
  savedTrips?: string[];
  createdAt: string;
}

export interface Trip {
  _id: string;
  title: string;
  slug: string;
  description: string;
  destination: string;
  country: string;
  categories: string[];
  duration: {
    days: number;
    nights: number;
  };
  price: {
    amount: number;
    currency: string;
    originalPrice?: number;
    discount?: number;
    taxPercent?: number;
    childrenPricePercent?: number;
  };
  paymentQR?: {
    url: string;
    publicId: string;
  };
  images: {
    url: string;
    caption?: string;
    isPrimary: boolean;
  }[];
  itinerary: ItineraryDay[];
  includes: string[];
  excludes: string[];
  highlights: string[];
  maxGroupSize: number;
  availableSeats: number;
  difficulty: "easy" | "moderate" | "challenging" | "extreme";
  badge?: string;
  departureLocation: string;
  departureDate: string[];
  rating: {
    average: number;
    count: number;
  };
  status: "active" | "inactive" | "soldout" | "upcoming";
  featured: boolean;
  tags: string[];
  createdAt: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  accommodation?: string;
}

export interface Booking {
  _id: string;
  bookingId: string;
  user: User;
  trip: Trip;
  departureDate: string;
  travelers: {
    adults: number;
    children: number;
    infants: number;
  };
  travelerDetails: TravelerDetail[];
  pricing: {
    basePrice: number;
    discount: number;
    tax: number;
    totalAmount: number;
    currency: string;
  };
  payment: {
    status: "pending" | "processing" | "completed" | "failed" | "refunded";
    method: string;
    transactionId?: string;
    paidAt?: string;
  };
  paymentProof?: {
    url: string;
    publicId: string;
    uploadedAt?: string;
    verifiedAt?: string;
    rejectedAt?: string;
    rejectionNote?: string;
  };
  status: "pending" | "confirmed" | "cancelled" | "completed";
  specialRequests?: string;
  createdAt: string;
}

export interface TravelerDetail {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  passportNumber?: string;
  nationality?: string;
  type: "adult" | "child" | "infant";
}

export interface Review {
  _id: string;
  user: {
    name: string;
    avatar?: string;
  };
  trip: string;
  rating: number;
  title: string;
  comment: string;
  ratings?: {
    accommodation?: number;
    transportation?: number;
    food?: number;
    activities?: number;
    guide?: number;
    valueForMoney?: number;
  };
  images?: string[];
  isVerified: boolean;
  helpful: {
    count: number;
  };
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Inquiry {
  type: "contact" | "custom_trip" | "general" | "support" | "partnership";
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  customTripDetails?: {
    destination?: string;
    duration?: number;
    travelers?: number;
    budget?: string;
    preferredDates?: string;
    interests?: string[];
    specialRequirements?: string;
  };
}

export interface DashboardStats {
  overview: {
    totalTrips: number;
    totalAllTrips: number;
    totalBookings: number;
    totalUsers: number;
    totalRevenue: number;
    pendingInquiries: number;
    pendingReviews: number;
    upcomingTrips: number;
    avgRating: number;
  };
  growth: {
    revenue: number;
    bookings: number;
    users: number;
  };
  recentBookings: Booking[];
  monthlyRevenue: {
    _id: { year: number; month: number };
    revenue: number;
    count: number;
  }[];
  chartData: {
    label: string;
    revenue: number;
    bookings: number;
  }[];
  periodStats: {
    revenue: { current: number; previous: number; change: number };
    bookings: { current: number; previous: number; change: number };
  };
  categoryDistribution: {
    _id: string;
    count: number;
  }[];
  topTrips: {
    name: string;
    destination: string;
    bookings: number;
    revenue: number;
    rating?: number;
  }[];
  popularDestinations: {
    _id: string;
    count: number;
    revenue: number;
  }[];
}

export interface OwnerAnalytics extends DashboardStats {
  conversionRate: number;
  cancellationRate: number;
  averageBookingValue: number;
  revenueByCategory: {
    category: string;
    revenue: number;
    percentage: number;
  }[];
  userActivity: {
    date: string;
    activeUsers: number;
    newUsers: number;
  }[];
}

export interface Notification {
  _id: string;
  type: "booking" | "inquiry" | "review" | "system" | "promo";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface AdminUser extends User {
  permissions: string[];
  lastActive?: string;
  activityLog: ActivityLog[];
}

export interface ActivityLog {
  action: string;
  details: string;
  timestamp: string;
  ip?: string;
}

export interface PromoCode {
  _id: string;
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  status: "active" | "expired" | "disabled";
}

export interface Transaction {
  _id: string;
  booking: Booking;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed" | "refunded";
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
}
