// Base API URL from environment variables
export const API_BASE =
  (typeof window !== "undefined" && (window as any).__NEXT_PUBLIC_API_URL__) ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

import { getToken } from "./auth";

// Core fetch wrapper
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Helper methods
export async function fetcher<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET", cache: "no-store" });
}

export async function post<T = any>(path: string, body: any): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export async function put<T = any>(path: string, body: any): Promise<T> {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

export async function patch<T = any>(path: string, body: any): Promise<T> {
  return request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}

export async function del<T = any>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}

// Auth endpoints
export async function login(payload: {
  voterId?: string;
  walletAddress?: string;
  password?: string;
  signature?: string;
  message?: string;
}): Promise<any> {
  return post("/auth/login", payload);
}

export async function register(form: FormData): Promise<any> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// API endpoints organized by resource
export const authAPI = {
  login,
  register,
  getProfile: () => fetcher("/auth/profile"),
  getNonce: (walletAddress: string) => fetcher(`/auth/nonce/${walletAddress}`),
};

export const electionAPI = {
  getAllElections: (filters?: any) =>
    fetcher(
      "/elections" +
        (filters ? `?${new URLSearchParams(filters).toString()}` : "")
    ),
  getElectionById: (id: string) => fetcher(`/elections/${id}`),
  createElection: (electionData: any) => post("/elections", electionData),
  updateElection: (id: string, electionData: any) =>
    put(`/elections/${id}`, electionData),
  deleteElection: (id: string) => del(`/elections/${id}`),
};

export const candidateAPI = {
  getAllCandidates: (filters?: any) =>
    fetcher(
      "/candidates" +
        (filters ? `?${new URLSearchParams(filters).toString()}` : "")
    ),
  getCandidateById: (id: string) => fetcher(`/candidates/${id}`),
  createCandidate: async (candidateData: FormData) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/candidates`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: candidateData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  updateCandidate: async (id: string, candidateData: FormData) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/candidates/${id}`, {
      method: "PUT",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: candidateData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  deleteCandidate: (id: string) => del(`/candidates/${id}`),
  toggleCandidateStatus: (id: string, isActive: boolean) =>
    patch(`/candidates/${id}/status`, { isActive }),
};

export const voteAPI = {
  castVote: (voteData: any) => post("/votes", voteData),
  getVoterHistory: () => fetcher("/votes/my-votes"),
};

export const resultAPI = {
  getAllResults: (page = 1, limit = 10) =>
    fetcher(`/results?page=${page}&limit=${limit}`),
  getResultsByElection: (electionId: string) =>
    fetcher(`/results/${electionId}`),
  generateResults: (electionId: string) =>
    post(`/results/generate/${electionId}`, {}),
  finalizeResults: (electionId: string, blockchainData: any) =>
    patch(`/results/${electionId}/finalize`, blockchainData),
};

export const userAPI = {
  getAllUsers: (filters?: any) =>
    fetcher(
      "/users" + (filters ? `?${new URLSearchParams(filters).toString()}` : "")
    ),
  getUserById: (id: string) => fetcher(`/users/${id}`),
  updateUserStatus: (id: string, status: string) =>
    patch(`/users/${id}/status`, { status }),
  verifyUser: (id: string) => patch(`/users/${id}/verify`, {}),
};

export const analyticsAPI = {
  getVotingStatistics: () => fetcher("/analytics/voting-stats"),
  getElectionStatistics: () => fetcher("/analytics/election-stats"),
  getUserStatistics: () => fetcher("/analytics/user-stats"),
};
