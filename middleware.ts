import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  
  // Check if using a subdomain
  const subdomain = getSubdomain(host);
  const isSubdomainRoute = !!subdomain;
  
  // Check if the path is for an organization route
  const orgPath = pathname.match(/^\/org\/([^\/]+)/);
  const isOrgPath = !!orgPath;
  
  // Get the session token
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;
  
  // Public paths that don't require authentication
  const publicPaths = [
    "/",
    "/auth/signin",
    "/auth/register",
    "/auth/join",
    "/auth/forgot-password",
    "/api/auth"
  ];
  
  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path) || pathname === path
  ) || pathname.startsWith("/api/public");
  
  // Check if path is in dashboard or organizations section (protected routes)
  const isProtectedRoute = [
    "/dashboard",
    "/organizations",
    "/onboarding",
    "/profile"
  ].some(path => pathname.startsWith(path));
  
  // Check if the path is in the auth section
  const isAuthPath = pathname.startsWith("/auth/");
  
  // Handle subdomain routing
  if (isSubdomainRoute && !pathname.startsWith("/api/")) {
    // If accessing via subdomain, rewrite to the organization route
    const url = request.nextUrl.clone();
    url.pathname = `/organizations/${subdomain}${pathname}`;
    
    // If not authenticated and not a public path, redirect to sign in
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    
    // If authenticated, check if user has access to this organization
    if (isAuthenticated && token.organizations) {
      const hasOrgAccess = (token.organizations as any[]).some(
        org => org.slug === subdomain
      );
      
      if (!hasOrgAccess) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    
    return NextResponse.rewrite(url);
  }
  
  // Standard middleware checks for non-subdomain routes
  
  // Redirect unauthenticated users to sign in page if trying to access protected routes
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
  
  // For authenticated users trying to access auth pages, redirect to dashboard
  if (isAuthenticated && isAuthPath && !pathname.startsWith("/api/")) {
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

// Helper function to extract subdomain from host
function getSubdomain(host: string): string | null {
  // Skip for localhost or direct IP access
  if (host.includes('localhost') || /^\d+\.\d+\.\d+\.\d+/.test(host)) {
    return null;
  }
  
  // Extract subdomain from host
  const parts = host.split('.');
  if (parts.length > 2) {
    return parts[0];
  }
  
  return null;
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
