import mongoose, { Document, Schema } from "mongoose";

export interface ICandidateResult {
  candidateId: number;
  candidateName: string;
  party?: string;
  votes: number;
  percentage: number;
}

export interface IResultMetadata {
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
}

export interface IResult extends Document {
  electionId: mongoose.Types.ObjectId;
  contractElectionId: number;
  publishedAt: Date;
  results: ICandidateResult[];
  winner: {
    candidateId: number;
    candidateName: string;
    party?: string;
    votes: number;
    percentage: number;
  };
  metadata: IResultMetadata;
  ipfsHash?: string;
  isFinalized: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResultSchema: Schema = new Schema(
  {
    electionId: {
      type: Schema.Types.ObjectId,
      ref: "Election",
      required: true,
      unique: true,
      index: true,
    },
    contractElectionId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    results: [
      {
        candidateId: {
          type: Number,
          required: true,
        },
        candidateName: {
          type: String,
          required: true,
        },
        party: {
          type: String,
        },
        votes: {
          type: Number,
          required: true,
          min: 0,
        },
        percentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
      },
    ],
    winner: {
      candidateId: {
        type: Number,
        required: true,
      },
      candidateName: {
        type: String,
        required: true,
      },
      party: {
        type: String,
      },
      votes: {
        type: Number,
        required: true,
        min: 0,
      },
      percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    },
    metadata: {
      totalVoters: {
        type: Number,
        required: true,
        min: 0,
      },
      voterTurnout: {
        type: Number,
        required: true,
        min: 0,
      },
      turnoutPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      invalidVotes: {
        type: Number,
        required: true,
        min: 0,
      },
      electionType: {
        type: String,
        required: true,
      },
      verificationMethod: {
        type: String,
        required: true,
      },
      blockchainInfo: {
        networkId: Number,
        contractAddress: String,
        finalizedBlockNumber: Number,
        finalizationTxHash: String,
      },
    },
    ipfsHash: {
      type: String,
    },
    isFinalized: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ResultSchema.index({ publishedAt: -1 });
ResultSchema.index({ "metadata.electionType": 1 });

export default mongoose.model<IResult>("Result", ResultSchema);
