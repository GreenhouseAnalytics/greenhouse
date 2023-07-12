import mongoose from "mongoose";

const { Schema } = mongoose;
const verificationTokenSchema = new Schema({
  identifier: String,
  token: String,
  expires: Date,
});
verificationTokenSchema.index({ identifier: 1, token: 1 }, { unique: true });

export default mongoose.model(
  "VerificationToken",
  verificationTokenSchema,
  undefined,
  { overwriteModels: true }
);
