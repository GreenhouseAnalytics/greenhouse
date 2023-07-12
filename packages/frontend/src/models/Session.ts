import mongoose from "mongoose";

const { Schema } = mongoose;
const sessionSchema = new Schema({
  sessionToken: { type: String, unique: true },
  expires: Date,
  userId: { type: Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Session", sessionSchema, undefined, {
  overwriteModels: true,
});
