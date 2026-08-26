import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const store = await cookies()
  store.delete('musabaqa_token')
  // Determine locale from referer for redirect
  const referer = request.headers.get('referer') || '/'
  const localeMatch = referer.match(/\/(en|ar)\//)
  const locale = localeMatch?.[1] || 'en'
  return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
}
