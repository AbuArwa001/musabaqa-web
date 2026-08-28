import { notFound } from 'next/navigation'
import { isValidLocale, getDictionary } from '@/lib/dictionaries'

export default async function NotificationsPage(props: PageProps<'/[lang]/portal/notifications'>) {
  const { lang } = await props.params
  if (!isValidLocale(lang)) notFound()
  const dict = await getDictionary(lang)
  const t = dict.portal
  const isAr = lang === 'ar'

  return (
    <div className="space-y-6">
      <div className={isAr ? 'text-right' : ''}>
        <h1 className="font-serif text-2xl font-bold text-gray-900">{t.notifications_title}</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {isAr ? 'إشعارات المؤسسة والطلاب' : 'Institution and student notifications'}
        </p>
      </div>

      <div className="admin-card text-center py-20">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <p className="text-gray-900 font-semibold mb-1">{t.notifications_empty}</p>
        <p className="text-gray-400 text-sm">You're all caught up — no new notifications.</p>
      </div>
    </div>
  )
}

