import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isValidLocale, getDictionary } from '@/lib/dictionaries'
import { listCategories } from '@/lib/api'
import LeaderboardClient from '@/components/LeaderboardClient'

export async function generateMetadata(props: PageProps<'/[lang]/leaderboard'>): Promise<Metadata> {
  const { lang } = await props.params
  return {
    title: lang === 'ar'
      ? 'لوحة النتائج المباشرة والترتيب | مسابقة مسجد جامع نيروبي'
      : 'Live Leaderboard & Standings | Jamia Mosque Musabaqa 2026',
    description:
      lang === 'ar'
        ? 'بث مباشر لنتائج وترتيب حفظة القرآن الكريم في مسابقة مسجد جامع نيروبي ٢٠٢٦ في جميع الفئات.'
        : 'Real-time broadcast of Quran memorization and Tajweed scores across all 4 categories at Jamia Mosque Nairobi.',
  }
}

export default async function LeaderboardPage(props: PageProps<'/[lang]/leaderboard'>) {
  const { lang } = await props.params
  if (!isValidLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const isAr = lang === 'ar'

  let categories: any[] = []
  try {
    categories = await listCategories()
  } catch {
    // If API unreachable, fallback with standard categories
    categories = [
      { id: 1, name_en: "Juz' 1–10", name_ar: 'الأجزاء ١–١٠' },
      { id: 2, name_en: "Juz' 11–20", name_ar: 'الأجزاء ١١–٢٠' },
      { id: 3, name_en: "Juz' 21–29", name_ar: 'الأجزاء ٢١–٢٩' },
      { id: 4, name_en: "Juz' 30 (Complete)", name_ar: 'القرآن كاملاً' },
    ]
  }

  return (
    <div className="relative min-h-screen px-4 pt-32 pb-24 overflow-hidden bg-[#120e0c]">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(201,147,53,0.18),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#c99335_1px,transparent_1px)] [background-size:60px_60px] opacity-[0.03] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          {/* Quranic Ribbon */}
          <div className="inline-flex items-center gap-2 bg-black/40 border border-[#c99335]/30 rounded-full px-5 py-1.5 text-stone-300 text-xs sm:text-sm font-medium mb-6 backdrop-blur-md shadow-lg">
            <span className="font-serif text-[#f6cb7d] font-bold">﴿ فَاسْتَبِقُوا الْخَيْرَاتِ ﴾</span>
            <span className="text-stone-600">•</span>
            <span className="text-[11px] text-stone-400 font-sans">
              {isAr ? 'سورة البقرة: ١٤٨' : 'Al-Baqarah: 148 — "So race towards all that is good"'}
            </span>
          </div>

          {/* Divider */}
          <div className="inline-flex items-center justify-center gap-4 mb-4">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#c99335]/60" />
            <span className="text-[#c99335] uppercase tracking-[0.35em] text-xs font-semibold font-sans">
              {isAr ? 'البث الحي للدرجات' : 'Real-Time Standings'}
            </span>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#c99335]/60" />
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-stone-100 to-[#c99335] mb-3 drop-shadow-lg">
            {dict.leaderboard.title}
          </h1>
          <p className="text-stone-400 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            {dict.leaderboard.subtitle}
          </p>
        </div>

        {/* Client Component */}
        <LeaderboardClient categories={categories} dict={dict} lang={lang} />
      </div>
    </div>
  )
}
