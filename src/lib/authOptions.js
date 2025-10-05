// src/lib/authOptions.js
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/db";

export const authOptions = {
  // We use JWT sessions (no adapter required). You can switch to DB sessions later if you want.
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        // Find user by username in your Prisma DB
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user) return null;

        // Compare passwords (supports bcrypt hashed password in DB)
        const isValid = await compare(
          String(credentials.password),
          user.password,
        );
        if (!isValid) return null;

        // Return the user object that will be available in jwt callback as `user`
        return {
          id: user.id,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/signin", // ← custom sign-in page
  },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // Save fields to the token when the user signs in
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    // Expose token fields on the client session
    async session({ session, token }) {
      session.user = session.user || {};
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.role = token.role;
      session.user.name = session.user.name ?? token.username;
      return session;
    },
  },
};
