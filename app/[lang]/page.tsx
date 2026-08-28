import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDictionary, isValidLocale } from '@/lib/dictionaries'
import Countdown from '@/components/Countdown'
import HomeHero from '@/components/HomeHero'
import ScoringRubric from '@/components/ScoringRubric'

export async function generateMetadata(props: PageProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await props.params
  return {
    title: lang === 'ar'
      ? 'مسابقة حفظ القرآن الكريم وتجويده | مسجد جامع نيروبي'
      : 'Musabaqa — Quran Memorization & Recitation Competition 2026 | Jamia Mosque Nairobi',
    description: lang === 'ar'
      ? 'مسابقة حفظ القرآن الكريم السنوية — مسجد جامع نيروبي. التنافس في ٤ فئات لحفظ كتاب الله.'
      : 'Annual Quran Memorization & Recitation Competition by Jamia Mosque Nairobi. Celebrating the Huffaz across 4 tiers.',
  }
}

// Quranic Verses on Memorization and Recitation
const QURANIC_VERSES = [
  {
    arabic: 'إِنَّ الَّذِينَ يَتْلُونَ كِتَابَ اللَّهِ وَأَقَامُوا الصَّلَاةَ وَأَنفَقُوا مِمَّا رَزَقْنَاهُمْ سِرًّا وَعَلَانِيَةً يَرْجُونَ تِجَارَةً لَّن تَبُورَ',
    translation_en: 'Indeed, those who recite the Book of Allah and establish prayer and spend out of what We have provided them, secretly and publicly, hope for a commerce that will never perish.',
    translation_ar: 'الذين يداومون على قراءة القرآن، وأقاموا الصلاة، وأنفقوا مما رزقناهم يرجون تجارة لن تبور ولن تهلك.',
    reference_en: 'Surah Fatir [35:29]',
    reference_ar: 'سورة فاطر: ٢٩',
    badge_en: 'The Everlasting Commerce',
    badge_ar: 'التجارة الرابحة',
  },
  {
    arabic: 'وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا',
    translation_en: 'And recite the Quran with measured recitation and Tajweed.',
    translation_ar: 'فاقرأ القرآن بتؤدة وتمهل وتبيين للحروف والوقوف.',
    reference_en: 'Surah Al-Muzzammil [73:4]',
    reference_ar: 'سورة المزمل: ٤',
    badge_en: 'Divine Command for Tajweed',
    badge_ar: 'الأمر بالتلاوة والترتيل',
  },
  {
    arabic: 'إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ',
    translation_en: 'Indeed, it is We who sent down the Quran and indeed, We will be its guardian.',
    translation_ar: 'إنا نحن أنزلنا هذا القرآن على نبينا محمد ﷺ، وإنا لحافظون له من الزيادة والنقصان والتحريف.',
    reference_en: 'Surah Al-Hijr [15:9]',
    reference_ar: 'سورة الحجر: ٩',
    badge_en: 'Divine Preservation in Hearts',
    badge_ar: 'حفظ الله لكتابه',
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

      {/* ── Hero (with Holy Quran on Rehal & gold-grey shade) ── */}
      <HomeHero lang={lang} dict={dict} />

      {/* ── Countdown ── */}
      <section className="relative z-20 py-16 px-4 -mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-stone-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <Countdown
                label={t.countdown_registration}
                target={DATES.registrationOpen}
                dict={{ days: t.days, hours: t.hours, minutes: t.minutes, seconds: t.seconds }}
              />
            </div>
            <div className="bg-gradient-to-br from-[#c99335]/25 to-amber-950/40 backdrop-blur-2xl border border-[#c99335]/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden transform md:-translate-y-4">
              <div className="absolute inset-0 bg-gradient-to-t from-[#c99335]/15 to-transparent pointer-events-none" />
              <Countdown
                label={t.countdown_deadline}
                target={DATES.registrationClose}
                dict={{ days: t.days, hours: t.hours, minutes: t.minutes, seconds: t.seconds }}
                accent="amber"
              />
            </div>
            <div className="bg-stone-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
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

      {/* ── Noble Quranic Verses Section (User Requirement) ── */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-[#120e0c] via-[#0d0a09] to-[#120e0c] border-y border-[#c99335]/15">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(201,147,53,0.08),transparent)] pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center gap-4 mb-4">
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#c99335]/60" />
              <span className="text-[#c99335] uppercase tracking-[0.3em] text-xs font-semibold">
                {isAr ? 'فضل القرآن الكريم وتلاوته' : 'Divine Quranic Virtues'}
              </span>
              <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#c99335]/60" />
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-stone-200 to-[#c99335] mb-4">
              {isAr ? 'آيات بينات في فضل القرآن وحفظته' : 'Guiding Quranic Verses on Memorization'}
            </h2>
            <p className="text-stone-400 text-sm sm:text-base max-w-2xl mx-auto font-light">
              {isAr
                ? 'قال رسول الله ﷺ: «خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ» — تكريماً لأهل القرآن وخاصته في رحاب مسجد جامع نيروبي.'
                : 'The Prophet ﷺ said: "The best of you are those who learn the Quran and teach it" — Celebrating the memorizers of Allah\'s Book.'}
            </p>
          </div>

          {/* Verses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {QURANIC_VERSES.map((v, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-black/60 via-[#181310]/80 to-black/60 border border-[#c99335]/25 rounded-3xl p-8 flex flex-col justify-between hover:border-[#c99335]/60 transition-all duration-500 hover:shadow-[0_15px_40px_rgba(201,147,53,0.12)] backdrop-blur-xl"
              >
                <div className="space-y-6">
                  {/* Top Badge */}
                  <div className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#c99335] bg-[#c99335]/10 px-3 py-1 rounded-full border border-[#c99335]/20">
                      {isAr ? v.badge_ar : v.badge_en}
                    </span>
                    <span className="text-xs font-mono text-stone-500">
                      {isAr ? v.reference_ar : v.reference_en}
                    </span>
                  </div>

                  {/* Arabic Quranic Verse */}
                  <div className="text-center py-4 px-2 bg-gradient-to-b from-white/5 to-transparent rounded-2xl border border-white/5">
                    <p className="font-serif text-xl sm:text-2xl text-white font-bold leading-loose tracking-wide text-center" dir="rtl">
                      ﴿ {v.arabic} ﴾
                    </p>
                  </div>

                  {/* Translation */}
                  <p className={`text-sm text-stone-300 leading-relaxed font-light ${isAr ? 'text-right' : 'text-left'}`}>
                    {isAr ? v.translation_ar : `"${v.translation_en}"`}
                  </p>
                </div>

                {/* Footer Reference */}
                <div className={`pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-stone-400 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="font-semibold text-[#f6cb7d]">{isAr ? v.reference_ar : v.reference_en}</span>
                  <span className="text-stone-500">Jamia Mosque Musabaqa</span>
                </div>
              </div>
            ))}
          </div>

          {/* Prophetic Hadith Banner */}
          <div className="mt-12 p-6 sm:p-8 bg-gradient-to-r from-emerald-950/40 via-stone-900/60 to-emerald-950/40 border border-emerald-500/30 rounded-3xl text-center max-w-3xl mx-auto shadow-xl">
            <p className="font-serif text-xl sm:text-2xl font-bold text-emerald-300 mb-2" dir="rtl">
              « خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ »
            </p>
            <p className="text-xs sm:text-sm text-stone-300 font-light">
              {isAr
                ? 'رواه الإمام البخاري في صحيحه عن عثمان بن عفان رضي الله عنه'
                : 'Narrated by Uthman bin Affan (RA) — Sahih Al-Bukhari: "The best among you are those who learn the Quran and teach it."'}
            </p>
          </div>
        </div>
      </section>

      {/* ── Scoring Rubric & Evaluation Standards ── */}
      <ScoringRubric lang={lang} dict={dict} />

      {/* ── Schedule & Prizes ── */}
      <section className="relative py-24 px-4 border-t border-white/5 bg-gradient-to-b from-[#120e0c] to-[#0a0807]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Schedule */}
          <div className="space-y-8">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">{t.schedule_title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-stone-900/50 border border-white/5 rounded-2xl p-6 flex flex-col items-start gap-4 hover:bg-stone-900/80 transition-colors group">
                <div className="p-3 bg-emerald-500/10 group-hover:bg-emerald-500/20 rounded-xl text-emerald-400 transition-colors">
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
              <div className="bg-stone-900/50 border border-white/5 rounded-2xl p-6 flex flex-col items-start gap-4 hover:bg-stone-900/80 transition-colors group">
                <div className="p-3 bg-[#c99335]/10 group-hover:bg-[#c99335]/20 rounded-xl text-[#c99335] transition-colors">
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
              {(['🥇', '🥈', '🥉'] as const).map((medal, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-b from-stone-800/50 to-stone-900/50 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center hover:border-[#c99335]/20 transition-colors"
                >
                  <span className="text-4xl sm:text-5xl filter drop-shadow-[0_0_15px_rgba(201,147,53,0.4)]">{medal}</span>
                  <span className="text-xs sm:text-sm font-bold text-stone-300">
                    {isAr ? `المركز ${i + 1}` : `${['1st', '2nd', '3rd'][i]} Place`}
                  </span>
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
          <div className="inline-flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#c99335]/50" />
            <span className="text-[#c99335] uppercase tracking-[0.3em] text-xs font-semibold">
              {isAr ? 'انضم إلينا' : 'Join Us'}
            </span>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#c99335]/50" />
          </div>
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
