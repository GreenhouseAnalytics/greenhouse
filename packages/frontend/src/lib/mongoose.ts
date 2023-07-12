import _mongoose, { connect, MongooseOptions } from "mongoose";
import { env } from "../env";

const MONGODB_URI = env.MONGODB_URI;
const OPTIONS: MongooseOptions = {
  bufferCommands: false,
  autoIndex: env.NODE_ENV !== "production",
};
if (!MONGODB_URI) {
  throw new Error("Missing mongo connection URI");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
declare global {
  var mongoose: {
    promise: ReturnType<typeof connect> | null;
    conn: typeof _mongoose | null;
  };
}
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function mongooseConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = connect(MONGODB_URI!, OPTIONS).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
