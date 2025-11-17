// src/lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user) return null;

        const isValid = await compare(
          String(credentials.password),
          user.password,
        );

        if (!isValid) return null;

        // Log the login activity
        try {
          await prisma.activity.create({
            data: {
              type: "login",
              userId: user.id,
              userName: user.username,
              action: "وارد سیستم شد",
            },
          });
        } catch (error) {
          console.error("Failed to log login activity:", error);
        }

        return {
          id: String(user.id),
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Add user data to token on sign in
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.lastChecked = Date.now(); // Add timestamp
        return token;
      }

      // Only check database every 5 minutes (not on every request!)
      const now = Date.now();
      const lastChecked = (token.lastChecked as number) || 0;
      const fiveMinutes = 5 * 60 * 1000;

      if (token.id && now - lastChecked > fiveMinutes) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { id: parseInt(token.id as string) },
          });

          token.lastChecked = now; // Update timestamp

          // If user doesn't exist, invalidate token
          if (!existingUser) {
            delete token.id;
            delete token.username;
            delete token.role;
            return token;
          }

          // Update token if role changed
          if (existingUser.role !== token.role) {
            token.role = existingUser.role;
          }
        } catch (error) {
          console.error("Error checking user existence:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Check if token has valid user data
      if (!token.id || !token.username) {
        return {
          ...session,
          expires: new Date(0).toISOString(),
        };
      }

      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
