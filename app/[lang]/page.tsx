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
    <div className="overflow-hidden">
      {/* ── Hero ── */}
      

      {/* ── Countdown ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Countdown
              label={t.countdown_registration}
              target={DATES.registrationOpen}
              dict={{ days: t.days, hours: t.hours, minutes: t.minutes, seconds: t.seconds }}
            />
            <Countdown
              label={t.countdown_deadline}
              target={DATES.registrationClose}
              dict={{ days: t.days, hours: t.hours, minutes: t.minutes, seconds: t.seconds }}
              accent="amber"
            />
            <Countdown
              label={t.countdown_competition}
              target={DATES.competition}
              dict={{ days: t.days, hours: t.hours, minutes: t.minutes, seconds: t.seconds }}
              accent="gold"
            />
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-jamia-dark">{t.about_title}</h2>
          <p className="text-lg text-jamia-dark/70 leading-relaxed max-w-2xl mx-auto">{t.about_body}</p>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-jamia-dark">{t.categories_title}</h2>
          <p className="text-center text-jamia-dark/60 mb-12">{t.rubric_title}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.name_en}
                className={`relative rounded-2xl border ${cat.border} bg-gradient-to-b ${cat.color} p-6 flex flex-col gap-4 hover:scale-[1.02] transition-transform duration-200`}
              >
                <div className="text-4xl">{cat.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-jamia-dark">
                    {isAr ? cat.name_ar : cat.name_en}
                  </h3>
                  <p className="text-sm text-jamia-dark/60 mt-1">
                    {t.age_range}: {cat.ages === 'Open' ? (isAr ? 'مفتوح' : 'Open') : cat.ages}
                  </p>
                </div>
                <div className="space-y-2">
                  {cat.rubric.map((r) => (
                    <div key={r.name_en} className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                      <span className="text-sm text-jamia-dark/70">{isAr ? r.name_ar : r.name_en}</span>
                      <span className="text-sm font-semibold text-jamia-gold">{r.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Schedule ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-jamia-dark">{t.schedule_title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="card flex flex-col items-center gap-3">
              <span className="text-4xl">📍</span>
              <p className="text-jamia-dark/60 text-sm uppercase tracking-wider">Venue</p>
              <p className="text-xl font-semibold text-jamia-dark">{t.schedule_venue}</p>
            </div>
            <div className="card flex flex-col items-center gap-3">
              <span className="text-4xl">📅</span>
              <p className="text-jamia-dark/60 text-sm uppercase tracking-wider">Date</p>
              <p className="text-xl font-semibold text-jamia-dark">{t.schedule_date}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Prizes ── */}
      <section className="py-20 px-4 bg-gradient-to-b from-amber-500/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-jamia-dark">{t.prizes_title}</h2>
          <p className="text-lg text-jamia-dark/70 leading-relaxed max-w-2xl mx-auto">{t.prizes_body}</p>
          <div className="mt-10 flex justify-center gap-8">
            {['🥇', '🥈', '🥉'].map((medal, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-5xl">{medal}</span>
                <span className="text-sm text-jamia-dark/60">{isAr ? `المركز ${i + 1}` : `${['1st', '2nd', '3rd'][i]} Place`}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto card border-jamia-gold/30 bg-gradient-to-b from-amber-500/5 to-transparent">
          <h2 className="text-2xl font-bold text-jamia-dark mb-4">{t.register_cta}</h2>
          <p className="text-jamia-dark/70 mb-8">{t.about_body}</p>
          <Link
            href={`/${lang}/register`}
            className="btn-primary inline-flex items-center gap-2"
          >
            {t.register_cta}
          </Link>
        </div>
      </section>
    </div>
  )
}
