// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  email: string;
  profilePic?: string;
  country: string;
  phone: string;
  bio?: string;
  isSeller: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (userData: User | null, token?: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, // Initially, no user is logged in
      token: null, // Initially, no token is stored
      setUser: (userData, token = null) => set({ user: userData, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: "auth-storage", // Unique key for storing in localStorage
    }
  )
);
