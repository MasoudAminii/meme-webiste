// /middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    // allow only when a token exists (i.e. user is authenticated)
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  // protects /dashboard and any nested route like /dashboard/settings, /dashboard/x/y
  matcher: ["/dashboard/:path*"],
};
