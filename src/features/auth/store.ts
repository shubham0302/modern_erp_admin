import { create } from "zustand";
import type { Admin } from "./types";
import { getAccessToken } from "./storage";

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

type AuthState = {
  admin: Admin | null;
  status: AuthStatus;
  setAuth: (admin: Admin) => void;
  setAdmin: (admin: Admin) => void;
  setStatus: (status: AuthStatus) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  status: getAccessToken() ? "idle" : "unauthenticated",
  setAuth: (admin) => set({ admin, status: "authenticated" }),
  setAdmin: (admin) => set({ admin }),
  setStatus: (status) => set({ status }),
  clear: () => set({ admin: null, status: "unauthenticated" }),
}));
