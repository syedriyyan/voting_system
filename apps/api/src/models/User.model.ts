import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

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

export interface IUser extends Document {
  walletAddress: string;
  email: string;
  name: string;
  nationalIdHash: string;
  role: UserRole;
  status: UserStatus;
  phoneNumber?: string;
  dateOfBirth?: Date;
  password?: string;
  publicKey?: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    nationalIdHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.VOTER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING,
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"],
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (value: Date) {
          const age = new Date().getFullYear() - value.getFullYear();
          return age >= 18;
        },
        message: "User must be at least 18 years old",
      },
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    publicKey: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationExpires: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Index for faster queries
UserSchema.index({ createdAt: 1 });
UserSchema.index({ role: 1, status: 1 });

export default mongoose.model<IUser>("User", UserSchema);
