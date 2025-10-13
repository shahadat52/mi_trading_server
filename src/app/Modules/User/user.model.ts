/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { TUser, TUserModel } from './user.interface';

// Define the User schema
const userSchema = new Schema<TUser>(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, required: true, unique: true, trim: true },
    role: {
      type: String,
      enum: ['superAdmin', 'admin', 'manager', 'employee'],
      default: 'employee',
    },
    otp: { type: String, trim: true, default: '', required: false },
    otpExpires: { type: Date }, // ✅ OK
    status: {
      type: String,
      enum: ['in-progress', 'blocked'],
      default: 'in-progress',
    },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: function (doc, ret: any) {
        delete ret._id;
        delete ret.password;
      },
    },
  }
);

// 🧩 Static method to check if user exists
userSchema.statics.isUserExists = async function (id: string) {
  return await this.findById(id).select('+password');
};

// 🧩 Static method to match password
userSchema.statics.isPasswordMatch = async function (
  plainPassword: string,
  hashPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashPassword);
};

// 🧩 Static method to check if password changed after token issued
userSchema.statics.isPasswordChangeAfterTokenIssue = async function (
  passwordChangeTime: Date,
  iAt: number
): Promise<boolean> {
  if (passwordChangeTime) {
    const changedTime = Math.floor(passwordChangeTime.getTime() / 1000);
    return changedTime > iAt;
  }
  return false;
};

// 🔐 Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const hashed = await bcrypt.hash(this.password, 10);
    this.password = hashed;
  }
  next();
});

// Create and export the model
export const UserModel = model<TUser, TUserModel>('User', userSchema);
