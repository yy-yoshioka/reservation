import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Update the session first
  const response = await updateSession(request);
  
  // Extract path from the request URL
  const { pathname } = request.nextUrl;

  // Check if we're on a protected route
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api/') && 
    !pathname.startsWith('/api/auth');

  // Check if we're on an admin-only route
  const isAdminRoute = 
    pathname.startsWith('/dashboard/admin') ||
    pathname.startsWith('/api/admin');

  // Check if we're authenticated by looking for the session
  const authCookie = request.cookies.get('supabase-auth-token');
  const isAuthenticated = !!authCookie;

  // Get user role from the session (if available)
  const supabaseSession = request.cookies.get('supabase-auth-data');
  let isAdmin = false;
  
  if (supabaseSession) {
    try {
      const sessionData = JSON.parse(supabaseSession.value);
      isAdmin = sessionData?.user?.user_metadata?.role === 'admin';
    } catch (error) {
      // If we can't parse the session, assume not admin
      isAdmin = false;
    }
  }

  // Handle redirect based on authentication status and route type
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login if not authenticated
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAdminRoute && !isAdmin) {
    // Redirect to dashboard if not an admin
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
