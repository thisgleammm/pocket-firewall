import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (
    pathname === "/sw.js" ||
    pathname === "/_offline" ||
    pathname.startsWith("/workbox-") ||
    pathname.startsWith("/worker-") ||
    pathname.startsWith("/fallback-")
  ) {
    return NextResponse.next()
  }

  const session = getSessionCookie(request)
  
  if (!session && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (session && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/auth|login|_next|favicon.ico|manifest.json|icons|sw\\.js|_offline|workbox-.*|worker-.*|fallback-.*).*)']
}
