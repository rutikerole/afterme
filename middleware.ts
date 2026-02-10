import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// =============================================================================
// ROUTE CONFIGURATION
// =============================================================================

const AUTH_COOKIE_NAME = "afterme_session";

// Routes that require authentication
const protectedRoutes = ["/dashboard"];

// Routes only for unauthenticated users
const authRoutes = ["/auth/login", "/auth/register"];

// =============================================================================
// SECURITY HEADERS
// =============================================================================

function addSecurityHeaders(response: NextResponse): NextResponse {
  const headers = response.headers;

  // Prevent clickjacking
  headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // Enable XSS filter
  headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer policy
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions policy (disable unused browser features)
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(self), geolocation=(), interest-cohort=()"
  );

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://res.cloudinary.com https://*.cloudinary.com https://*.sentry.io wss:",
    "media-src 'self' https://res.cloudinary.com https://*.cloudinary.com blob:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
  ];

  // Only set strict CSP in production
  if (process.env.NODE_ENV === "production") {
    headers.set("Content-Security-Policy", cspDirectives.join("; "));
    // Strict Transport Security (HTTPS only)
    headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

// =============================================================================
// MIDDLEWARE
// =============================================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const isAuthenticated = !!sessionCookie?.value;

  // Check if current path starts with any protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(loginUrl);
    return addSecurityHeaders(response);
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && isAuthenticated) {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    return addSecurityHeaders(response);
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

// =============================================================================
// MATCHER
// =============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (they handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};
