import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname, host } = request.nextUrl;

  // Skip middleware for API routes and static files
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Extract subdomain from host
  const subdomain = host.split(".")[0];

  // Skip if it's localhost without subdomain
  if (host === "localhost:3000" || host === "127.0.0.1:3000") {
    return NextResponse.next();
  }

  // If we have a subdomain, add it to the request headers
  if (subdomain && subdomain !== "www" && subdomain !== "localhost") {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-tenant-slug", subdomain);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
