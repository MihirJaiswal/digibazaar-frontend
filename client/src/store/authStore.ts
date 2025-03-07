// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  store: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zip: string;
    phone: string;
    email: string;
    website: string;
    logo: string;
    banner: string;
  }
  id: string;
  username: string;
  email: string;
  profilePic?: string;
  avatar?: string;
  country: string;
  phone: string;
  bio?: string;
  isSeller: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  _hasRehydrated: boolean; // Add this flag
  setUser: (userData: User | null, token?: string | null) => void;
  logout: () => void;
  setHasRehydrated: (state: boolean) => void; // Add this action
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      _hasRehydrated: false, // Initial state
      setUser: (userData, token = null) => set({ user: userData, token }),
      logout: () => set({ user: null, token: null }),
      setHasRehydrated: (state) => set({ _hasRehydrated: state }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasRehydrated(true);
        }
      },
    }
  )
);
