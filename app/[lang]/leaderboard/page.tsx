import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isValidLocale, getDictionary } from '@/lib/dictionaries'
import { listCategories } from '@/lib/api'
import LeaderboardClient from '@/components/LeaderboardClient'

export async function generateMetadata(props: PageProps<'/[lang]/leaderboard'>): Promise<Metadata> {
  const { lang } = await props.params
  return {
    title: lang === 'ar' ? 'لوحة النتائج المباشرة' : 'Live Leaderboard',
    description:
      lang === 'ar'
        ? 'نتائج مسابقة حفظ القرآن في الوقت الفعلي'
        : 'Real-time Quran memorization competition scores',
  }
}

export default async function LeaderboardPage(props: PageProps<'/[lang]/leaderboard'>) {
  const { lang } = await props.params
  if (!isValidLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  let categories: any[] = []
  try {
    categories = await listCategories()
  } catch {
    // If API unreachable, render with empty state
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-jamia-emerald/10 border border-jamia-emerald/30 rounded-full px-4 py-1.5 text-jamia-emerald text-sm font-medium mb-4">
            <span className="live-dot" />
            <span>{dict.leaderboard.connected}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-jamia-dark mb-3">
            {dict.leaderboard.title}
          </h1>
          <p className="text-jamia-dark/60 text-lg">{dict.leaderboard.subtitle}</p>
        </div>

        <LeaderboardClient categories={categories} dict={dict} lang={lang} />
      </div>
    </div>
  )
}
