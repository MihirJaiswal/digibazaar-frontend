import { create, StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:8800/api",
  withCredentials: true,
  timeout: 5000,
});

type User = {
  id: string;
  username: string;
  email: string;
  img: string;
  country: string;
  phone: string;
  desc: string;
  isSeller: boolean;
};

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
  setToken: (token: string | null) => void;
  register: (
    username: string,
    email: string,
    password: string,
    img: string,
    country: string,
    phone: string,
    desc: string,
    isSeller: boolean
  ) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

type AuthStorePersist = (
  config: StateCreator<AuthState>,
  options: PersistOptions<AuthState>
) => StateCreator<AuthState>;

export const useAuthStore = create<AuthState>()(
  (persist as AuthStorePersist)(
    (set) => ({
      user: null,
      token: null,
      setUser: (user: User) => set({ user }),
      setToken: (token: string | null) => set({ token }),

      register: async (
        username,
        email,
        password,
        img,
        country,
        phone,
        desc,
        isSeller
      ) => {
        try {
          const response = await api.post("/auth/register", {
            username,
            email,
            password,
            img,
            country,
            phone,
            desc,
            isSeller
          });

          const { token, user } = response.data;
          set({ user, token });
        } catch (error: any) {
          console.error("Registration error:", error);
          if (error.code === "ECONNABORTED") {
            throw new Error("Server not responding. Please try again later.");
          }
          throw new Error(
            error.response?.data?.message || "Registration failed. Please check your connection."
          );
        }
      },

      login: async (username, password) => {
        try {
          const response = await api.post("/auth/login", { 
            username, 
            password 
          });

          const { token, user } = response.data;
          set({ user, token });
        } catch (error: any) {
          console.error("Login error:", error);
          if (error.code === "ECONNABORTED") {
            throw new Error("Server not responding. Please try again later.");
          }
          throw new Error(
            error.response?.data?.message || "Login failed. Please check your connection."
          );
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch (error) {
          console.warn("Logout request failed, clearing local state anyway:", error);
        } finally {
          set({ user: null, token: null });
        }
      },
    }),
    {
      name: "auth-store",
    }
  )
);
