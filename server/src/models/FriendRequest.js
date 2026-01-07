import mongoose from "mongoose";

const FriendRequestSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "DENIED"], default: "PENDING" }
  },
  { timestamps: true }
);

FriendRequestSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

export default mongoose.model("FriendRequest", FriendRequestSchema);
