import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LOCALES = ['en', 'ar']
const DEFAULT_LOCALE = 'en'

function getLocale(request: NextRequest): string {
  const accept = request.headers.get('accept-language') || ''
  // Prefer AR if user's browser indicates Arabic
  if (accept.toLowerCase().includes('ar')) return 'ar'
  return DEFAULT_LOCALE
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files
  ) {
    return
  }

  // Check if path already has a locale prefix
  const hasLocale = LOCALES.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  )

  if (!hasLocale) {
    const locale = getLocale(request)
    request.nextUrl.pathname = `/${locale}${pathname}`
    return NextResponse.redirect(request.nextUrl)
  }

  // Auth guard: protect /[lang]/portal routes
  const isPortal = LOCALES.some(
    (loc) => pathname.startsWith(`/${loc}/portal`)
  )
  if (isPortal) {
    const token = request.cookies.get('musabaqa_token')?.value
    if (!token) {
      // Extract locale from path for redirect
      const locale = LOCALES.find((loc) => pathname.startsWith(`/${loc}/`)) || DEFAULT_LOCALE
      const loginUrl = new URL(`/${locale}/login`, request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}
