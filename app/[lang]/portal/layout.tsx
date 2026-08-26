import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { isValidLocale, getDictionary } from '@/lib/dictionaries'
import { getMyInstitution } from '@/lib/api'
import PortalNav from '@/components/PortalNav'

export const dynamic = 'force-dynamic'

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

  // Show status banner for non-approved institutions
  const status = institution.status

  return (
    <div className="min-h-screen pb-20 relative selection:bg-[#c99335]/30">
      
      {/* Background ambient orbs specifically for the portal area (if needed above global) */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Status banners */}
      {status === 'PENDING' && (
        <div className="bg-gradient-to-r from-amber-900/40 via-amber-700/20 to-amber-900/40 border-b border-amber-500/30 px-4 py-4 text-center backdrop-blur-md shadow-[0_0_20px_-5px_rgba(201,147,53,0.3)]">
          <p className="text-amber-400 font-bold text-sm tracking-wide uppercase drop-shadow-md">{dict.portal.status_pending}</p>
          <p className="text-amber-200/70 text-xs mt-1.5">{dict.portal.status_pending_body}</p>
        </div>
      )}
      {status === 'REJECTED' && (
        <div className="bg-gradient-to-r from-red-900/40 via-red-700/20 to-red-900/40 border-b border-red-500/50 px-4 py-4 text-center backdrop-blur-md shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]">
          <p className="text-red-400 font-bold text-sm tracking-wide uppercase drop-shadow-md">{dict.portal.status_rejected}</p>
          <p className="text-red-200/70 text-xs mt-1.5">{dict.portal.status_rejected_body}</p>
          {institution.rejection_reason && (
            <p className="text-red-300 text-sm mt-3 bg-red-950/50 inline-block px-4 py-2 rounded-lg border border-red-500/20">
              <span className="font-bold">{dict.portal.reason_label}:</span>{' '}
              {institution.rejection_reason}
            </p>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 ${isAr ? 'sm:flex-row-reverse' : ''}`}>
          <div className={isAr ? 'text-right' : ''}>
            <p className="text-[#c99335] text-xs font-semibold tracking-widest uppercase mb-1.5">{dict.portal.welcome}</p>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-stone-400">{institution.name}</h1>
          </div>
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="text-sm font-medium text-stone-400 hover:text-white transition-all bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 rounded-xl px-6 py-2.5 shadow-lg active:scale-95"
            >
              {dict.nav.logout}
            </button>
          </form>
        </div>

        {/* Sub-navigation */}
        <PortalNav lang={lang} dict={dict} />

        {/* Content */}
        <div className="mt-8 relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}
