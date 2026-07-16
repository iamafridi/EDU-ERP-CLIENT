import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LayoutState {
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  isActivityFeedOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleActivityFeed: () => void;
  setActivityFeedOpen: (open: boolean) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      isMobileMenuOpen: false,
      isActivityFeedOpen: false,
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      toggleActivityFeed: () => set((state) => ({ isActivityFeedOpen: !state.isActivityFeedOpen })),
      setActivityFeedOpen: (open) => set({ isActivityFeedOpen: open }),
    }),
    {
      name: "hostelpro-layout-store",
    },
  ),
);
