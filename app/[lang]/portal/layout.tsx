import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { isValidLocale, getDictionary } from '@/lib/dictionaries'
import { getMyInstitution } from '@/lib/api'
import { Cinzel, Outfit } from 'next/font/google'

export const dynamic = 'force-dynamic'

const cinzel = Cinzel({ variable: '--font-cinzel', subsets: ['latin'], display: 'swap' })
const outfit = Outfit({ variable: '--font-outfit', subsets: ['latin'], display: 'swap' })

const NAV_ITEMS = [
  {
    href: (lang: string) => `/${lang}/portal/students`,
    labelKey: 'nav_students' as const,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    iconColor: 'text-emerald-400',
  },
  {
    href: (lang: string) => `/${lang}/portal/results`,
    labelKey: 'nav_results' as const,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    iconColor: 'text-sky-400',
  },
  {
    href: (lang: string) => `/${lang}/portal/notifications`,
    labelKey: 'nav_notifications' as const,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    iconColor: 'text-amber-400',
  },
]

export default async function PortalLayout({
  children,
  params,
}: LayoutProps<'/[lang]/portal'> & { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isValidLocale(lang)) notFound()

  const store = await cookies()
  const token = store.get('musabaqa_token')?.value
  if (!token) redirect(`/${lang}/login`)

  let institution = null
  try {
    institution = await getMyInstitution(token)
  } catch {
    redirect(`/${lang}/login`)
  }

  const dict = await getDictionary(lang)
  const isAr = lang === 'ar'
  const status = institution.status

  return (
    <html lang={lang} dir={isAr ? 'rtl' : 'ltr'} className={`${cinzel.variable} ${outfit.variable}`}>
      <body className={`flex h-screen bg-gray-50 overflow-hidden font-sans ${isAr ? 'flex-row-reverse' : ''}`}>

        {/* ── Sidebar ── */}
        <aside className={`w-64 bg-[#1a1512] text-white flex flex-col h-full flex-shrink-0 shadow-xl ${isAr ? 'border-l border-[#2d2520]' : 'border-r border-[#2d2520]'}`}>

          {/* Brand Header */}
          <div className="p-6 border-b border-[#2d2520] bg-[#120e0c]">
            <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#c99335]/60 flex items-center justify-center bg-black/50 shadow-md p-1 shrink-0">
                <Image
                  src="/images/jamia_logo.png"
                  alt="Jamia Mosque Logo"
                  width={36}
                  height={36}
                  priority
                  className="object-contain"
                />
              </div>
              <div className={isAr ? 'text-right' : ''}>
                <h1 className="font-serif text-base font-bold tracking-tight text-white leading-tight">
                  Jamia Musabaqa
                </h1>
                <p className="text-[10px] text-[#c99335] font-medium tracking-wider uppercase">
                  {isAr ? 'بوابة المؤسسة' : 'Institution Portal'}
                </p>
              </div>
            </div>

            {/* Institution name + status */}
            <div className={`mt-4 pt-3 border-t border-white/10 ${isAr ? 'text-right' : ''}`}>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">
                {isAr ? 'المؤسسة' : 'Institution'}
              </p>
              <p className="text-sm text-gray-200 font-semibold leading-tight truncate">{institution.name}</p>
              <span
                className={`mt-2 inline-flex text-[10px] font-semibold px-2 py-0.5 rounded border ${
                  status === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : status === 'REJECTED'
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {status}
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <span className={`px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 ${isAr ? 'text-right' : ''}`}>
              {isAr ? 'القائمة الرئيسية' : 'Main Menu'}
            </span>
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.labelKey}>
                  <Link
                    href={item.href(lang)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-300 rounded-md hover:bg-white/10 hover:text-white transition-colors ${isAr ? 'flex-row-reverse' : ''}`}
                  >
                    <span className={item.iconColor}>{item.icon}</span>
                    {dict.portal[item.labelKey]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer Logout */}
          <div className="p-4 border-t border-[#2d2520] bg-[#120e0c]">
            <form action="/api/logout" method="POST" className="w-full">
              <button
                type="submit"
                className={`flex w-full items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-900/50 hover:bg-rose-900/60 rounded-md transition-colors cursor-pointer ${isAr ? 'flex-row-reverse' : ''}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {dict.nav.logout}
              </button>
            </form>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">

          {/* Top header bar */}
          <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
            <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-serif text-base font-bold text-gray-900">
                {isAr ? 'مسابقة — بوابة المؤسسة' : 'Musabaqa — Institution Portal'}
              </h2>
            </div>

            {/* Status banners inline in header */}
            {status === 'PENDING' && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <p className="text-amber-700 font-semibold text-xs uppercase tracking-wide">{dict.portal.status_pending}</p>
              </div>
            )}
            {status === 'REJECTED' && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <p className="text-red-700 font-semibold text-xs uppercase tracking-wide">{dict.portal.status_rejected}</p>
              </div>
            )}

            {/* Language switcher */}
            <Link
              href={`/${lang === 'en' ? 'ar' : 'en'}/portal/students`}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-[#006838] hover:text-[#006838] transition-colors"
            >
              {lang === 'en' ? 'العربية' : 'EN'}
            </Link>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-auto p-6 lg:p-8">
            {/* Rejection reason banner */}
            {status === 'REJECTED' && institution.rejection_reason && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm font-medium">
                  <span className="font-bold">{dict.portal.reason_label}:</span>{' '}
                  {institution.rejection_reason}
                </p>
              </div>
            )}

            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
