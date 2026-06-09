import { create } from 'zustand'

interface LayoutStore {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
  toggleSidebar: () => void
  focusMode: boolean
  setFocusMode: (v: boolean) => void
  toggleFocusMode: () => void
  lockInMode: boolean
  setLockInMode: (v: boolean) => void
  toggleLockIn: () => void
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  focusMode: false,
  setFocusMode: (v) => set({ focusMode: v }),
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
  lockInMode: false,
  setLockInMode: (v) => set({ lockInMode: v }),
  toggleLockIn: () => set((s) => ({ lockInMode: !s.lockInMode })),
}))
