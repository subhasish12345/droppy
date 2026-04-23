import { create } from "zustand";
import api from "../api/axios";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  error: null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/login", { email, password });
      const { user, token } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, token, isAuthenticated: true, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || "Login failed", loading: false });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/register", { name, email, password });
      const { user, token } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, token, isAuthenticated: true, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || "Registration failed", loading: false });
      throw err;
    }
  },

  guestLogin: async (name) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/guest", { name });
      const { user, token } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, token, isAuthenticated: true, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || "Guest login failed", loading: false });
      throw err;
    }
  },

  claimAccount: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put("/auth/claim", { email, password });
      const { user } = res.data;
      // update local user without changing token
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || "Failed to claim account", loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
