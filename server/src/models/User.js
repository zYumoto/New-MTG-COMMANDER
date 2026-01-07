// server/src/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    bio: { type: String, default: "", maxlength: 160 },
    avatarUrl: { type: String, default: "", maxlength: 500 },
    avatarData: { type: String, default: "" },
    profileBgUrl: { type: String, default: "", maxlength: 500 },

    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastSeen: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
