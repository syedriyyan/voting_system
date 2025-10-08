import mongoose, { Document, Schema } from "mongoose";

export enum ElectionStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  ACTIVE = "active",
  ENDED = "ended",
  RESULTS_PUBLISHED = "results_published",
}

export interface ICandidate {
  id: number;
  name: string;
  party?: string;
  symbol?: string;
  description?: string;
  imageUrl?: string;
}

export interface IElection extends Document {
  contractElectionId: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  status: ElectionStatus;
  creator: mongoose.Types.ObjectId;
  candidates: ICandidate[];
  totalVotes: number;
  eligibleVoters: mongoose.Types.ObjectId[];
  contractAddress?: string;
  transactionHash?: string;
  ipfsHash?: string;
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
  createdAt: Date;
  updatedAt: Date;
}

const CandidateSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    party: {
      type: String,
      trim: true,
    },
    symbol: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const ElectionSchema: Schema = new Schema(
  {
    contractElectionId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    startTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date) {
          return value > new Date();
        },
        message: "Start time must be in the future",
      },
    },
    endTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: IElection, value: Date) {
          return value > this.startTime;
        },
        message: "End time must be after start time",
      },
    },
    status: {
      type: String,
      enum: Object.values(ElectionStatus),
      default: ElectionStatus.DRAFT,
      index: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    candidates: {
      type: [CandidateSchema],
      validate: {
        validator: function (arr: ICandidate[]) {
          return arr.length >= 2;
        },
        message: "At least 2 candidates required",
      },
    },
    totalVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    eligibleVoters: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    contractAddress: {
      type: String,
      trim: true,
    },
    transactionHash: {
      type: String,
      trim: true,
    },
    ipfsHash: {
      type: String,
      trim: true,
    },
    metadata: {
      constituency: String,
      electionType: String,
      region: String,
      country: String,
    },
    results: [
      {
        candidateId: Number,
        votes: Number,
        percentage: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ElectionSchema.index({ startTime: 1, endTime: 1 });
ElectionSchema.index({ status: 1, startTime: 1 });
ElectionSchema.index({ "metadata.region": 1 });

// Auto-update status based on time
ElectionSchema.pre("save", function (next) {
  const now = new Date();

  if (
    this.status === ElectionStatus.SCHEDULED &&
    now >= (this.startTime as Date) &&
    now <= (this.endTime as Date)
  ) {
    this.status = ElectionStatus.ACTIVE;
  } else if (
    this.status === ElectionStatus.ACTIVE &&
    now > (this.endTime as Date)
  ) {
    this.status = ElectionStatus.ENDED;
  }

  next();
});

export default mongoose.model<IElection>("Election", ElectionSchema);
