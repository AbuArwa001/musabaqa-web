import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { isValidLocale, getDictionary } from '@/lib/dictionaries'
import { getMyInstitution } from '@/lib/api'
import PortalNav from '@/components/PortalNav'

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
    <div className="min-h-screen">
      {/* Status banners */}
      {status === 'PENDING' && (
        <div className="bg-jamia-gold/10 border-b border-jamia-gold/30 px-4 py-4 text-center">
          <p className="text-jamia-gold font-semibold text-sm">{dict.portal.status_pending}</p>
          <p className="text-jamia-gold-hover/70 text-xs mt-1">{dict.portal.status_pending_body}</p>
        </div>
      )}
      {status === 'REJECTED' && (
        <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-4 text-center">
          <p className="text-red-600 font-semibold text-sm">{dict.portal.status_rejected}</p>
          <p className="text-red-300/70 text-xs mt-1">{dict.portal.status_rejected_body}</p>
          {institution.rejection_reason && (
            <p className="text-red-300 text-sm mt-2">
              <span className="font-medium">{dict.portal.reason_label}:</span>{' '}
              {institution.rejection_reason}
            </p>
          )}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className={`flex items-center justify-between mb-8 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className={isAr ? 'text-right' : ''}>
            <p className="text-jamia-dark/60 text-sm">{dict.portal.welcome}</p>
            <h1 className="text-2xl font-bold text-jamia-dark">{institution.name}</h1>
          </div>
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-jamia-dark/50 hover:text-jamia-dark/80 transition-colors border border-jamia-dark/10 rounded-lg px-4 py-2"
            >
              {dict.nav.logout}
            </button>
          </form>
        </div>

        {/* Sub-navigation */}
        <PortalNav lang={lang} dict={dict} />

        {/* Content */}
        <div className="mt-8">
          {children}
        </div>
      </div>
    </div>
  )
}
