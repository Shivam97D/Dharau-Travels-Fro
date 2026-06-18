const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
  count?: number;
  total?: number;
  pages?: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = this.getStoredToken();
  }

  private getStoredToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  private setStoredToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      this.token = token;
    }
  }

  private removeStoredToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      this.token = null;
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async register(name: string, email: string, password: string) {
    const response = await this.post("/auth/register", { name, email, password });
    if (response.token) {
      this.setStoredToken(response.token);
    }
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.post("/auth/login", { email, password });
    if (response.token) {
      this.setStoredToken(response.token);
    }
    return response;
  }

  async logout() {
    await this.get("/auth/logout");
    this.removeStoredToken();
  }

  async getMe() {
    return this.get("/auth/me");
  }

  async forgotPassword(email: string) {
    return this.post("/auth/forgot-password", { email });
  }

  async resetPassword(token: string, password: string) {
    const response = await this.put(`/auth/reset-password/${token}`, { password });
    if (response.token) {
      this.setStoredToken(response.token);
    }
    return response;
  }

  async getTrips(params?: Record<string, any>) {
    const queryString = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.get(`/trips${queryString}`);
  }

  async getTripById(id: string) {
    return this.get(`/trips/${id}`);
  }

  async getTripBySlug(slug: string) {
    return this.get(`/trips/slug/${slug}`);
  }

  async getFeaturedTrips() {
    return this.get("/trips/featured");
  }

  async getDestinations() {
    return this.get("/trips/destinations");
  }

  async searchTrips(query: string) {
    return this.get(`/trips/search?q=${encodeURIComponent(query)}`);
  }

  async createBooking(bookingData: any) {
    return this.post("/bookings", bookingData);
  }

  async getMyBookings() {
    return this.get("/bookings/my-bookings");
  }

  async getBookingById(id: string) {
    return this.get(`/bookings/${id}`);
  }

  async cancelBooking(id: string, reason: string) {
    return this.put(`/bookings/${id}/cancel`, { reason });
  }

  async createReview(reviewData: any) {
    return this.post("/reviews", reviewData);
  }

  async getTripReviews(tripId: string) {
    return this.get(`/reviews/trip/${tripId}`);
  }

  async getHomeReviews() {
    return this.get("/reviews");
  }

  async setReviewOrder(id: string, sortOrder: number) {
    return this.put(`/reviews/${id}/order`, { sortOrder });
  }

  async verifyEmail(token: string) {
    return this.get(`/auth/verify-email/${token}`);
  }

  async createInquiry(inquiryData: any) {
    return this.post("/inquiries", inquiryData);
  }

  async saveTrip(tripId: string) {
    return this.post(`/users/save-trip/${tripId}`);
  }

  async getSavedTrips() {
    return this.get("/users/saved-trips");
  }

  async updateProfile(data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    avatar?: string;
  }) {
    return this.put("/auth/update-profile", data);
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    return this.put("/auth/update-password", { currentPassword, newPassword });
  }

  async getAdminTrips(params?: Record<string, string>) {
    const queryString = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.get(`/admin/trips${queryString}`);
  }

  async getDashboardStats() {
    return this.get("/admin/stats");
  }

  async getAllBookings(params?: Record<string, any>) {
    const queryString = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.get(`/admin/bookings${queryString}`);
  }

  async createTrip(tripData: any) {
    return this.post("/admin/trips", tripData);
  }

  async updateTrip(id: string, tripData: any) {
    return this.put(`/admin/trips/${id}`, tripData);
  }

  async deleteTrip(id: string) {
    return this.delete(`/admin/trips/${id}`);
  }

  async getAllUsers(params?: Record<string, any>) {
    const queryString = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.get(`/admin/users${queryString}`);
  }

  async updateUserRole(id: string, role: string) {
    return this.put(`/admin/users/${id}/role`, { role });
  }

  async deleteUser(id: string) {
    return this.delete(`/admin/users/${id}`);
  }

  async adminResetPassword(id: string, password: string) {
    return this.put(`/admin/users/${id}/reset-password`, { password });
  }

  async getAllReviews(params?: Record<string, any>) {
    const queryString = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.get(`/admin/reviews${queryString}`);
  }

  async updateReviewStatus(id: string, status: string) {
    return this.put(`/admin/reviews/${id}/status`, { status });
  }

  async deleteReview(id: string) {
    return this.delete(`/reviews/${id}`);
  }

  async getTripAnalytics(id: string) {
    return this.get(`/admin/trips/${id}/analytics`);
  }

  async getAllInquiries(params?: Record<string, any>) {
    const queryString = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.get(`/admin/inquiries${queryString}`);
  }

  async updateInquiryStatus(id: string, status: string) {
    return this.put(`/admin/inquiries/${id}/status`, { status });
  }

  async respondToInquiry(id: string, text: string) {
    return this.post(`/admin/inquiries/${id}/respond`, { text });
  }

  async updateBookingStatus(id: string, status: string) {
    return this.put(`/bookings/${id}/status`, { status });
  }

  async updatePaymentStatus(id: string, payload: { status: string; method?: string; transactionId?: string }) {
    return this.put(`/bookings/${id}/payment`, payload);
  }

  async markReviewHelpful(id: string) {
    return this.post(`/reviews/${id}/helpful`);
  }

  async subscribeNewsletter(email: string) {
    return this.post("/newsletter/subscribe", { email });
  }

  async getSubscribers(params?: Record<string, any>) {
    const queryString = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.get(`/newsletter${queryString}`);
  }
}

export const api = new ApiClient(API_URL);
export default api;
