"use client";
import { create } from "zustand";
import { Notification } from "@/types";

interface UIState {
  sidebarOpen: boolean;
  notifications: Notification[];
  unreadCount: number;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (n: Notification) => void;
  markAllRead: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  notifications: [],
  unreadCount: 0,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications.slice(0, 49)],
      unreadCount: s.unreadCount + (n.read ? 0 : 1),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));
