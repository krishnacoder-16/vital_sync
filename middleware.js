import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Routes that should ONLY be accessible to unauthenticated users
const AUTH_ROUTES = ['/login', '/register'];

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Build a response object we can mutate (needed to refresh cookies)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a server-side Supabase client that reads/writes cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Fetch the active session — this also refreshes expired tokens automatically
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // If trying to access a protected route without a session → bounce to login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the original destination so we can redirect back after login later
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and trying to visit login/register → bounce to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

// Tell Next.js which paths to run middleware on
// Exclude static files, API routes, and Next.js internals
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
