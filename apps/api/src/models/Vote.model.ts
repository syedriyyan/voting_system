import mongoose, { Document, Schema } from "mongoose";

export interface IVote extends Document {
  electionId: mongoose.Types.ObjectId;
  contractElectionId: number;
  voter: mongoose.Types.ObjectId;
  voterAddress: string;
  candidateId: number;
  encryptedVote: string;
  voteHash: string;
  transactionHash: string;
  blockNumber?: number;
  signature: string;
  ipfsHash?: string;
  timestamp: Date;
  verified: boolean;
  createdAt: Date;
}

const VoteSchema: Schema = new Schema(
  {
    electionId: {
      type: Schema.Types.ObjectId,
      ref: "Election",
      required: true,
      index: true,
    },
    contractElectionId: {
      type: Number,
      required: true,
      index: true,
    },
    voter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    voterAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    candidateId: {
      type: Number,
      required: true,
    },
    encryptedVote: {
      type: String,
      required: true,
    },
    voteHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    transactionHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    blockNumber: {
      type: Number,
    },
    signature: {
      type: String,
      required: true,
    },
    ipfsHash: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound indexes
VoteSchema.index({ electionId: 1, voter: 1 }, { unique: true });
VoteSchema.index({ contractElectionId: 1, voterAddress: 1 }, { unique: true });
VoteSchema.index({ timestamp: -1 });

export default mongoose.model<IVote>("Vote", VoteSchema);
