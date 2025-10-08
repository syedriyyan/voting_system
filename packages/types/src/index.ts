export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'voter';
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'ended';
  candidates: Candidate[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: string;
  name: string;
  description: string;
  electionId: string;
}

export interface Vote {
  id: string;
  electionId: string;
  voterId: string;
  encryptedVote: string;
  timestamp: Date;
  transactionHash: string;
}