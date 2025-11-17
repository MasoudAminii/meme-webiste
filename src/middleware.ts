// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If user is WRITER and trying to access anything other than /dashboard/posts
    if (
      token?.role === "WRITER" &&
      !path.startsWith("/dashboard/posts") &&
      path !== "/dashboard"
    ) {
      return NextResponse.redirect(new URL("/dashboard/posts", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token && !!token.id;
      },
    },
    pages: {
      signIn: "/signin",
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
