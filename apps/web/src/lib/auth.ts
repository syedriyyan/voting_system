import { UserRole } from "./types";

const TOKEN_KEY = "sv_token";
const ROLE_KEY = "sv_role";
const USER_KEY = "sv_user";
const WALLET_KEY = "sv_wallet";

export function setToken(token?: string) {
  if (typeof window === "undefined") return;
  if (!token) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setRole(role?: UserRole | "admin" | "voter") {
  if (typeof window === "undefined") return;
  if (!role) localStorage.removeItem(ROLE_KEY);
  else localStorage.setItem(ROLE_KEY, role);
}

export function getRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROLE_KEY);
}

export function setUser(userData?: any) {
  if (typeof window === "undefined") return;
  if (!userData) localStorage.removeItem(USER_KEY);
  else localStorage.setItem(USER_KEY, JSON.stringify(userData));
}

export function getUser(): any {
  if (typeof window === "undefined") return null;
  const userData = localStorage.getItem(USER_KEY);
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch (e) {
    return null;
  }
}

export function setWalletAddress(address?: string) {
  if (typeof window === "undefined") return;
  if (!address) localStorage.removeItem(WALLET_KEY);
  else localStorage.setItem(WALLET_KEY, address);
}

export function getWalletAddress(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WALLET_KEY);
}

export function clearAuth() {
  setToken(undefined);
  setRole(undefined as any);
  setUser(undefined);
  setWalletAddress(undefined);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  const role = getRole();
  return role === "admin" || role === UserRole.ADMIN.toString();
}

export function isElectionCommissioner(): boolean {
  const role = getRole();
  return (
    role === "election_commissioner" ||
    role === UserRole.ELECTION_COMMISSIONER.toString()
  );
}

export function isVoter(): boolean {
  const role = getRole();
  return role === "voter" || role === UserRole.VOTER.toString();
}
