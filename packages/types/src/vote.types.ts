export interface Vote {
  id: string;
  electionId: string;
  voterId: string;
  encryptedVote: string;
  transactionHash: string;
  timestamp: Date;
}

export interface VoteSubmissionDto {
  electionId: string;
  choice: string;
}

export interface VoteReceipt {
  id: string;
  electionId: string;
  timestamp: Date;
  transactionHash: string;
}