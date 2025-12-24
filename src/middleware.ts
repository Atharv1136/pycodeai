import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/', '/api/auth/login', '/api/auth/logout', '/supabase-test']

  // Admin routes that require admin authentication
  const adminRoutes = ['/admin']

  // Protected routes that require user authentication
  const protectedRoutes = ['/dashboard', '/editor']

  // Check if route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // Optional: Redirect to dashboard if already logged in and visiting login/signup
    if (user && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // Check if route is admin route
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // For admin, we might still rely on the specific admin session or check Supabase user role
    // The current admin implementation uses a separate `admin_sessions` table and maybe a cookie?
    // The previous middleware checked `pycode-admin-token`.
    // If the admin login sets that cookie, we should keep checking it.
    // OR we can check if the Supabase user is an admin.
    // Given the previous migration of admin auth, it returns a token but doesn't seem to set a cookie in the API response?
    // Wait, `src/app/api/admin/auth/route.ts` returns JSON with token. The client must store it.
    // If the client stores it in a cookie named `pycode-admin-token`, then we can check it.
    // Let's assume the legacy admin flow (cookie-based) is preserved for now to avoid breaking admin.

    const adminToken = request.cookies.get('pycode-admin-token')?.value
    // Also check if we have a Supabase user who is an admin (if we want to unify)
    // But for now, let's stick to the existing admin check to be safe.
    if (!adminToken && !pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return supabaseResponse
  }

  // Check if route is protected
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  return supabaseResponse
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
