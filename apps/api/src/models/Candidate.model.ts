import mongoose, { Document, Schema } from "mongoose";

export interface ICandidate extends Document {
  name: string;
  party: string;
  bio: string;
  imageUrl?: string;
  symbol?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  manifesto?: string;
  electionId: mongoose.Types.ObjectId;
  votes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    party: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    symbol: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    socialMedia: {
      twitter: String,
      facebook: String,
      instagram: String,
      linkedin: String,
    },
    manifesto: {
      type: String,
      trim: true,
    },
    electionId: {
      type: Schema.Types.ObjectId,
      ref: "Election",
      required: true,
      index: true,
    },
    votes: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
CandidateSchema.index({ electionId: 1, name: 1 });
CandidateSchema.index({ party: 1 });
CandidateSchema.index({ votes: -1 });

export default mongoose.model<ICandidate>("Candidate", CandidateSchema);
