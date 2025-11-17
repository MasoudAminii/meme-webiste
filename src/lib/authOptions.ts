// src/lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt" as const, // Add 'as const' to make it a literal type
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
          // Don't fail login if activity logging fails
        }

        return {
          id: String(user.id), // NextAuth expects string id
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
    async jwt({ token, user }) {
      // Add user data to token on sign in
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        return token;
      }

      // Verify user still exists in database on subsequent requests
      if (token.id) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { id: parseInt(token.id) }, // Convert string to number
          });

          // If user doesn't exist, invalidate token
          if (!existingUser) {
            // Delete the properties to invalidate
            delete token.id;
            delete token.username;
            delete token.role;
            return token;
          }

          // Optional: Update token if role changed
          if (existingUser.role !== token.role) {
            token.role = existingUser.role;
          }
        } catch (error) {
          console.error("Error checking user existence:", error);
          // On error, keep token as is to avoid breaking active sessions
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Check if token has valid user data
      if (!token.id || !token.username) {
        // Return session with no user to trigger logout
        return {
          ...session,
          expires: new Date(0).toISOString(), // Expire immediately
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
