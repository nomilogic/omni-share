import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUser = create<any>()(
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
