import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getDictionary, isValidLocale } from '@/lib/dictionaries'
import Countdown from '@/components/Countdown'

export async function generateMetadata(props: PageProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await props.params
  return {
    title: lang === 'ar'
      ? 'مسابقة حفظ القرآن | مسجد جامع نيروبي'
      : 'Musabaqa — Quran Memorization Competition | Jamia Mosque Nairobi',
    description: lang === 'ar'
      ? 'مسابقة حفظ القرآن الكريم السنوية — مسجد جامع نيروبي'
      : 'Annual Quran Memorization Competition by Jamia Mosque Nairobi. Compete in 4 categories.',
  }
}

const CATEGORIES = [
  {
    nameKey: 'category_juz10' as const,
    name_en: "Juz' 1–10",
    name_ar: 'الأجزاء ١–١٠',
    ages: '7–12',
    rubric: [
      { name_en: 'Memorization', name_ar: 'الحفظ', points: 50 },
      { name_en: 'Tajweed', name_ar: 'التجويد', points: 30 },
      { name_en: 'Saut', name_ar: 'الصوت', points: 20 },
    ],
    color: 'from-emerald-600/30 to-emerald-800/10',
    border: 'border-emerald-500/30',
    icon: '📗',
  },
  {
    nameKey: 'category_juz20' as const,
    name_en: "Juz' 11–20",
    name_ar: 'الأجزاء ١١–٢٠',
    ages: '10–15',
    rubric: [
      { name_en: 'Memorization', name_ar: 'الحفظ', points: 50 },
      { name_en: 'Tajweed', name_ar: 'التجويد', points: 30 },
      { name_en: 'Saut', name_ar: 'الصوت', points: 20 },
    ],
    color: 'from-blue-600/30 to-blue-800/10',
    border: 'border-blue-500/30',
    icon: '📘',
  },
  {
    nameKey: 'category_juz29' as const,
    name_en: "Juz' 21–29",
    name_ar: 'الأجزاء ٢١–٢٩',
    ages: '13–18',
    rubric: [
      { name_en: 'Memorization', name_ar: 'الحفظ', points: 50 },
      { name_en: 'Tajweed', name_ar: 'التجويد', points: 30 },
      { name_en: 'Saut', name_ar: 'الصوت', points: 20 },
    ],
    color: 'from-purple-600/30 to-purple-800/10',
    border: 'border-purple-500/30',
    icon: '📙',
  },
  {
    nameKey: 'category_juz30' as const,
    name_en: "Juz' 30 (Complete)",
    name_ar: 'الجزء الثلاثون (حفظ كامل)',
    ages: 'Open',
    rubric: [
      { name_en: 'Memorization', name_ar: 'الحفظ', points: 45 },
      { name_en: 'Tajweed', name_ar: 'التجويد', points: 25 },
      { name_en: 'Tafsir', name_ar: 'التفسير', points: 10 },
      { name_en: 'Saut', name_ar: 'الصوت', points: 20 },
    ],
    color: 'from-amber-600/30 to-amber-800/10',
    border: 'border-jamia-gold/30',
    icon: '📜',
  },
]

// Competition dates
const DATES = {
  registrationOpen: new Date('2025-10-01T00:00:00Z'),
  registrationClose: new Date('2025-11-30T23:59:59Z'),
  competition: new Date('2025-12-15T07:00:00Z'),
}

export default async function HomePage(props: PageProps<'/[lang]'>) {
  const { lang } = await props.params
  if (!isValidLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const t = dict.home
  const isAr = lang === 'ar'

  return (
    <div className="relative overflow-hidden selection:bg-[#c99335]/30">
      
      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-20 pb-32 text-center">
        {/* Decorative Mosque Silhouettes / Arches could go here */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#120e0c]/50 to-[#120e0c] z-0 pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center space-x-4 mb-6">
            <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-[#c99335]/50"></div>
            <span className="text-[#c99335] uppercase tracking-[0.3em] text-xs sm:text-sm font-semibold">
              {isAr ? 'الحدث السنوي الأكبر' : 'The Premier Annual Event'}
            </span>
            <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-[#c99335]/50"></div>
          </div>
          
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-stone-200 to-stone-400 drop-shadow-2xl">
            {isAr ? 'مسابقة حفظ القرآن الكريم' : 'Quran Memorization'}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e39e3b] via-[#c99335] to-[#fcf9f2]">
              {isAr ? 'مسجد جامع نيروبي' : 'Competition'}
            </span>
          </h1>
          
          <p className="text-lg sm:text-2xl text-stone-400 max-w-3xl mx-auto leading-relaxed font-light">
            {t.about_body}
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href={`/${lang}/register`}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-xl hover:from-emerald-500 hover:to-emerald-700 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-20 mix-blend-overlay"></div>
              <span className="relative flex items-center gap-2">
                {t.register_cta}
                <svg className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Link>
            <Link
              href={`/${lang}/leaderboard`}
              className="px-8 py-4 font-bold text-stone-300 transition-all duration-300 bg-stone-900/50 border border-white/10 rounded-xl backdrop-blur-md hover:bg-stone-800/80 hover:text-white hover:border-white/20 active:scale-95"
            >
              {dict.nav.leaderboard}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Countdown ── */}
      <section className="relative z-20 py-16 px-4 -mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-stone-900/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-2xl">
              <Countdown
                label={t.countdown_registration}
                target={DATES.registrationOpen}
                dict={{ days: t.days, hours: t.hours, minutes: t.minutes, seconds: t.seconds }}
              />
            </div>
            <div className="bg-gradient-to-br from-[#c99335]/20 to-amber-900/20 backdrop-blur-2xl border border-[#c99335]/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden transform md:-translate-y-4">
              <div className="absolute inset-0 bg-gradient-to-t from-[#c99335]/10 to-transparent pointer-events-none"></div>
              <Countdown
                label={t.countdown_deadline}
                target={DATES.registrationClose}
                dict={{ days: t.days, hours: t.hours, minutes: t.minutes, seconds: t.seconds }}
                accent="amber"
              />
            </div>
            <div className="bg-stone-900/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-2xl">
              <Countdown
                label={t.countdown_competition}
                target={DATES.competition}
                dict={{ days: t.days, hours: t.hours, minutes: t.minutes, seconds: t.seconds }}
                accent="gold"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="relative py-24 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-[#120e0c] to-[#120e0c] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-stone-400 mb-4">{t.categories_title}</h2>
            <p className="text-stone-400 text-lg max-w-2xl mx-auto">{t.rubric_title}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.name_en}
                className="group relative bg-stone-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col gap-6 hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(201,147,53,0.15)] hover:border-[#c99335]/30 overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${cat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                
                <div className="text-5xl drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500 origin-bottom">
                  {cat.icon}
                </div>
                
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white mb-2">
                    {isAr ? cat.name_ar : cat.name_en}
                  </h3>
                  <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-3 py-1">
                    <span className="text-xs font-medium text-stone-300">
                      {t.age_range}: <span className="text-[#c99335]">{cat.ages === 'Open' ? (isAr ? 'مفتوح' : 'Open') : cat.ages}</span>
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3 mt-auto pt-6 border-t border-white/5">
                  {cat.rubric.map((r) => (
                    <div key={r.name_en} className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                      <span className="text-sm text-stone-400 group-hover:text-stone-300 transition-colors">{isAr ? r.name_ar : r.name_en}</span>
                      <span className="text-sm font-bold text-[#c99335] bg-[#c99335]/10 px-2 py-0.5 rounded">{r.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Schedule & Prizes ── */}
      <section className="relative py-24 px-4 border-t border-white/5 bg-gradient-to-b from-[#120e0c] to-[#0a0807]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Schedule */}
          <div className="space-y-8">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">{t.schedule_title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-stone-900/50 border border-white/5 rounded-2xl p-6 flex flex-col items-start gap-4 hover:bg-stone-900/80 transition-colors">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-stone-500 text-xs uppercase tracking-widest font-semibold mb-1">Venue</p>
                  <p className="text-lg font-medium text-stone-200">{t.schedule_venue}</p>
                </div>
              </div>
              <div className="bg-stone-900/50 border border-white/5 rounded-2xl p-6 flex flex-col items-start gap-4 hover:bg-stone-900/80 transition-colors">
                <div className="p-3 bg-[#c99335]/10 rounded-xl text-[#c99335]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-stone-500 text-xs uppercase tracking-widest font-semibold mb-1">Date</p>
                  <p className="text-lg font-medium text-stone-200">{t.schedule_date}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Prizes */}
          <div className="space-y-8">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">{t.prizes_title}</h2>
            <p className="text-stone-400 leading-relaxed">{t.prizes_body}</p>
            <div className="flex gap-4 sm:gap-8 pt-4">
              {['🥇', '🥈', '🥉'].map((medal, i) => (
                <div key={i} className="flex-1 bg-gradient-to-b from-stone-800/50 to-stone-900/50 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center">
                  <span className="text-4xl sm:text-5xl filter drop-shadow-[0_0_15px_rgba(201,147,53,0.4)]">{medal}</span>
                  <span className="text-xs sm:text-sm font-bold text-stone-300">{isAr ? `المركز ${i + 1}` : `${['1st', '2nd', '3rd'][i]} Place`}</span>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#c99335]/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-6">{t.register_cta}</h2>
          <p className="text-xl text-stone-400 mb-10 font-light">{t.about_body}</p>
          <Link
            href={`/${lang}/register`}
            className="inline-flex items-center gap-3 px-10 py-5 font-bold text-white transition-all duration-300 bg-gradient-to-r from-[#c99335] to-amber-600 rounded-2xl hover:shadow-[0_0_50px_-10px_rgba(201,147,53,0.6)] active:scale-95 text-lg"
          >
            {t.register_cta}
          </Link>
        </div>
      </section>
      
    </div>
  )
}
