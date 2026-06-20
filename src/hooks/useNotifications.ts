import { useState, useEffect, useRef, useCallback } from "react";
import api from "@/lib/api";
import { playNotificationSound } from "@/lib/notification-sound";
import { useAuth } from "@/lib/auth-context";

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

const POLL_MS = 30_000;

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const prevUnread = useRef(0);

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getNotificationCount();
      const count = (res as { count?: number }).count ?? 0;
      if (count > prevUnread.current && prevUnread.current !== -1) {
        playNotificationSound();
      }
      prevUnread.current = count;
      setUnreadCount(count);
    } catch {}
  }, [isAuthenticated]);

  const fetchAll = useCallback(async (page = 1) => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.getNotifications(page);
      const data = res as { data?: Notification[]; unreadCount?: number };
      setNotifications(data.data ?? []);
      setUnreadCount(data.unreadCount ?? 0);
      prevUnread.current = data.unreadCount ?? 0;
    } catch {} finally { setLoading(false); }
  }, [isAuthenticated]);

  // Poll for unread count
  useEffect(() => {
    if (!isAuthenticated) { setUnreadCount(0); setNotifications([]); prevUnread.current = -1; return; }
    prevUnread.current = -1; // skip sound on first load
    fetchCount();
    const interval = setInterval(fetchCount, POLL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchCount]);

  const markRead = useCallback(async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
    prevUnread.current = Math.max(0, prevUnread.current - 1);
  }, []);

  const markAllRead = useCallback(async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    prevUnread.current = 0;
  }, []);

  const deleteOne = useCallback(async (id: string) => {
    const n = notifications.find((x) => x._id === id);
    await api.deleteNotification(id);
    setNotifications((prev) => prev.filter((x) => x._id !== id));
    if (n && !n.read) { setUnreadCount((c) => Math.max(0, c - 1)); prevUnread.current = Math.max(0, prevUnread.current - 1); }
  }, [notifications]);

  const clearAll = useCallback(async () => {
    await api.clearAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
    prevUnread.current = 0;
  }, []);

  return { notifications, unreadCount, loading, fetchAll, markRead, markAllRead, deleteOne, clearAll };
}
