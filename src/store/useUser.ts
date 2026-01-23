import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useStore = create<any>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user: any) => set({ user }),
      hydrated: false,
      setHydrated: (value: any) => set({ hydrated: value }),
    }),
    {
      name: "user-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
