// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions);

// ONLY export GET and POST - do NOT export authOptions here
export { handler as GET, handler as POST };
