import mongoose from "mongoose";

const { Schema } = mongoose;
const accountSchema = new Schema({
  type: String,
  provider: String,
  providerAccountId: String,
  refresh_token: String,
  access_token: String,
  expires_at: Number,
  token_type: String,
  scope: String,
  id_token: String,
  session_state: String,
  userId: { type: Schema.Types.ObjectId, ref: "User" },
});
accountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

export default mongoose.model("Account", accountSchema, undefined, {
  overwriteModels: true,
});
