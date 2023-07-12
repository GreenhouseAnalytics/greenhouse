import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { env } from "@/env";
import mongoPromise from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: AuthOptions = {
  secret: env.JWT_SECRET,
  adapter: MongoDBAdapter(mongoPromise),

  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const userRecord = await User.auth(
          credentials?.username,
          credentials?.password
        );
        if (!userRecord) {
          return null;
        }
        return {
          email: userRecord?.email,
          id: String(userRecord?._id),
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },
};
