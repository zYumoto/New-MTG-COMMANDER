import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    // Perfil
    bio: { type: String, default: "", maxlength: 160 },
    avatarUrl: { type: String, default: "", maxlength: 500 },
    avatarData: { type: String, default: "" }, // data:image/... base64
    profileBgUrl: { type: String, default: "", maxlength: 500 }
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
