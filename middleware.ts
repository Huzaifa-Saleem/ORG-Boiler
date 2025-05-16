import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is for an organization route
  const orgPath = pathname.match(/^\/org\/([^\/]+)/);
  const isOrgPath = !!orgPath;
  
  // Get the session token
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;
  
  // Public paths that don't require authentication
  const publicPaths = [
    "/auth/signin",
    "/auth/register",
    "/auth/forgot-password",
    "/api/auth"
  ];
  
  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path) || pathname === path
  );
  
  // Redirect unauthenticated users to sign in page
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
  
  // For authenticated users trying to access auth pages, redirect to dashboard
  if (isAuthenticated && isPublicPath && !pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // For organization paths, check if the user has access to the organization
  if (isAuthenticated && isOrgPath && token.organizations) {
    const orgSlug = orgPath![1];
    const hasOrgAccess = (token.organizations as any[]).some(
      org => org.slug === orgSlug
    );
    
    if (!hasOrgAccess) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
