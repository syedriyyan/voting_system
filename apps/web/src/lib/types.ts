// Common types used throughout the application

export enum UserRole {
  VOTER = "voter",
  ADMIN = "admin",
  ELECTION_COMMISSIONER = "election_commissioner",
}

export enum UserStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  SUSPENDED = "suspended",
}

export enum ElectionStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  ACTIVE = "active",
  ENDED = "ended",
  RESULTS_PUBLISHED = "results_published",
}

export interface User {
  _id: string;
  walletAddress: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  publicKey?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  _id: string;
  name: string;
  party: string;
  bio: string;
  imageUrl?: string;
  symbol?: string;
  votes: number;
  electionId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Election {
  _id: string;
  contractElectionId: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: ElectionStatus;
  creator: string | User;
  candidates: {
    id: number;
    name: string;
    party?: string;
    symbol?: string;
    description?: string;
    imageUrl?: string;
  }[];
  totalVotes: number;
  eligibleVoters: string[] | User[];
  contractAddress?: string;
  transactionHash?: string;
  metadata: {
    constituency?: string;
    electionType?: string;
    region?: string;
    country?: string;
  };
  results?: {
    candidateId: number;
    votes: number;
    percentage: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  _id: string;
  electionId: string;
  contractElectionId: number;
  voter: string | User;
  voterAddress: string;
  candidateId: number;
  encryptedVote: string;
  voteHash: string;
  transactionHash: string;
  blockNumber?: number;
  signature: string;
  ipfsHash?: string;
  timestamp: string;
  verified: boolean;
  createdAt: string;
}

export interface Result {
  _id: string;
  electionId: string | Election;
  contractElectionId: number;
  publishedAt: string;
  results: {
    candidateId: number;
    candidateName: string;
    party?: string;
    votes: number;
    percentage: number;
  }[];
  winner: {
    candidateId: number;
    candidateName: string;
    party?: string;
    votes: number;
    percentage: number;
  };
  metadata: {
    totalVoters: number;
    voterTurnout: number;
    turnoutPercentage: number;
    invalidVotes: number;
    electionType: string;
    verificationMethod: string;
    blockchainInfo?: {
      networkId: number;
      contractAddress: string;
      finalizedBlockNumber: number;
      finalizationTxHash: string;
    };
  };
  ipfsHash?: string;
  isFinalized: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
  data: T[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
