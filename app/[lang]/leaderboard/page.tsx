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
    <div className="min-h-screen px-4 pt-32 pb-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 text-emerald-400 text-sm font-medium mb-6">
            <span className="live-dot" />
            <span>{dict.leaderboard.connected}</span>
          </div>
          {/* Gold divider label */}
          <div className="inline-flex items-center justify-center gap-4 mb-4">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#c99335]/50" />
            <span className="text-[#c99335] uppercase tracking-[0.3em] text-xs font-semibold font-sans">Live Scores</span>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#c99335]/50" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-400 mb-3">
            {dict.leaderboard.title}
          </h1>
          <p className="text-stone-400 text-lg">{dict.leaderboard.subtitle}</p>
        </div>

        <LeaderboardClient categories={categories} dict={dict} lang={lang} />
      </div>
    </div>
  )
}

