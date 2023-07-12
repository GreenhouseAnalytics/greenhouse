import { MongoClient } from "mongodb";
import { env } from "@/env";

const MONGODB_URI = env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Missing mongo connection URI");
}

const client = new MongoClient(MONGODB_URI, {});
const clientPromise = client.connect();

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
