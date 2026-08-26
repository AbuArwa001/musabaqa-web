import { notFound } from 'next/navigation'
import { isValidLocale, getDictionary } from '@/lib/dictionaries'

export default async function NotificationsPage(props: PageProps<'/[lang]/portal/notifications'>) {
  const { lang } = await props.params
  if (!isValidLocale(lang)) notFound()
  const dict = await getDictionary(lang)
  const t = dict.portal
  const isAr = lang === 'ar'

  // Knock-powered notifications would be fetched here via API
  // For now, render empty state — real data flows through Knock feed
  return (
    <div>
      <div className={`mb-6 ${isAr ? 'text-right' : ''}`}>
        <h2 className="text-2xl font-bold text-white">{t.notifications_title}</h2>
      </div>

      <div className="card text-center py-16">
        <p className="text-4xl mb-4">🔔</p>
        <p className="text-stone-400">{t.notifications_empty}</p>
      </div>
    </div>
  )
}
