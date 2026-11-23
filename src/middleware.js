import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;
    const pathname = req.nextUrl.pathname;

    // Strict Role-Based Access Control for Admin Suite
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        // Authenticated customers attempting to access admin routes are redirected to home with AccessDenied parameter
        const redirectUrl = new URL("/", req.url);
        redirectUrl.searchParams.set("error", "AccessDenied");
        return NextResponse.redirect(redirectUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Determines whether the user is authenticated to access protected paths
      authorized: ({ token }) => {
        // Must have a valid session token
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/profile/:path*",
    "/profile",
    "/addresses/:path*",
    "/addresses",
    "/orders/:path*",
    "/orders",
    "/checkout/:path*",
    "/checkout",
    "/admin/:path*",
    "/admin",
  ],
};

