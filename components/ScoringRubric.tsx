'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type en from '@/dictionaries/en.json'

type Dict = typeof en

interface ScoringRubricProps {
  lang: string
  dict: Dict
}

const CATEGORIES = [
  {
    id: 'juz10',
    name_en: "Juz' 1–10 (Beginner Tier)",
    name_ar: 'الأجزاء ١–١٠ (المستوى الأول)',
    short_en: "Juz' 1–10",
    short_ar: 'الأجزاء ١–١٠',
    ages_en: '7–12 Years',
    ages_ar: '٧–١٢ سنة',
    color: 'emerald',
    gradient: 'from-emerald-600/30 via-emerald-950/20 to-black/80',
    border: 'border-emerald-500/30',
    activeBorder: 'border-emerald-400',
    accentText: 'text-emerald-400',
    glowColor: 'rgba(16,185,129,0.2)',
    icon: '📗',
    badge_en: 'Junior Huffaz',
    badge_ar: 'فئة الأشبال',
    description_en: 'Designed for young Quranic scholars mastering the first ten juz with solid recall and basic Tajweed rules.',
    description_ar: 'مخصصة للأشبال والناشئة لإتقان الأجزاء العشرة الأولى حفظاً وتجويداً وأداءً.',
    criteria: [
      {
        name_en: 'Memorization (Hifdh & Recall)',
        name_ar: 'الحفظ والإتقان وعدم التردد',
        points: 50,
        pct: 50,
        color: 'from-emerald-500 to-emerald-400',
        details_en: 'Flawless recall without judge intervention. Deductions: minor stumble (-0.5), judge prompt (-1.0).',
        details_ar: 'استحضار تام للآيات دون تردد أو تنبيه. (التردد -٠.٥، التنبيه بالآية -١.٠).',
      },
      {
        name_en: 'Tajweed Rules & Articulation',
        name_ar: 'أحكام التجويد ومخارج الحروف',
        points: 30,
        pct: 30,
        color: 'from-[#c99335] to-[#f6cb7d]',
        details_en: 'Accurate Makhaarij (letters articulation), Noon & Meem Sakinah, Ghunnah, and Madd rules.',
        details_ar: 'صحة مخارج الحروف، وأحكام النون والميم الساكنتين، والمدود والغنات.',
      },
      {
        name_en: 'Voice, Melody & Performance',
        name_ar: 'حسن الصوت والأداء القرآني',
        points: 20,
        pct: 20,
        color: 'from-sky-500 to-sky-400',
        details_en: 'Melodic recitation, breath control, respect for Waqf (stops) and Ibtida (starts).',
        details_ar: 'جمال التلاوة والخشوع، وحسن الوقف والابتداء وضبط النفس.',
      },
    ],
  },
  {
    id: 'juz20',
    name_en: "Juz' 11–20 (Intermediate Tier)",
    name_ar: 'الأجزاء ١١–٢٠ (المستوى الثاني)',
    short_en: "Juz' 11–20",
    short_ar: 'الأجزاء ١١–٢٠',
    ages_en: '10–15 Years',
    ages_ar: '١٠–١٥ سنة',
    color: 'sky',
    gradient: 'from-sky-600/30 via-sky-950/20 to-black/80',
    border: 'border-sky-500/30',
    activeBorder: 'border-sky-400',
    accentText: 'text-sky-400',
    glowColor: 'rgba(56,189,248,0.2)',
    icon: '📘',
    badge_en: 'Intermediate Rank',
    badge_ar: 'المستوى المتوسط',
    description_en: 'Tests rigorous retention across Surah Yusuf through Surah Al-Anbiya with meticulous phonetic precision.',
    description_ar: 'اختبار دقيق في عشرين جزءاً من سورة يوسف حتى الأنبياء مع التركيز على دقّة المخارج.',
    criteria: [
      {
        name_en: 'Memorization (Hifdh & Recall)',
        name_ar: 'الحفظ والإتقان وعدم التردد',
        points: 50,
        pct: 50,
        color: 'from-sky-500 to-sky-400',
        details_en: 'Confidence in mutashabihat (similar verses) and seamless navigation between Surahs.',
        details_ar: 'التمكن من المتشابهات اللفظية والانتقال السلس بين السور والآيات.',
      },
      {
        name_en: 'Tajweed & Sifaat Precision',
        name_ar: 'أحكام التجويد وصفات الحروف',
        points: 30,
        pct: 30,
        color: 'from-[#c99335] to-[#f6cb7d]',
        details_en: 'Tafkheem & Tarqeeq, correct Qalqalah levels, and precise vowel durations.',
        details_ar: 'التفخيم والترقيق، ومراتب القلقلة، وموازين المدود بدقة متناهية.',
      },
      {
        name_en: 'Saut & Maqaam Delivery',
        name_ar: 'جمال الصوت ورزانة الأداء',
        points: 20,
        pct: 20,
        color: 'from-purple-500 to-purple-400',
        details_en: 'Consistent pace (Tarteel/Tadweer) and emotional resonance suitable for the sacred text.',
        details_ar: 'الترتيل المتزن بحزن وخشوع مع حسن توزيع النبر ومراعاة المعاني.',
      },
    ],
  },
  {
    id: 'juz29',
    name_en: "Juz' 21–29 (Advanced Tier)",
    name_ar: 'الأجزاء ٢١–٢٩ (المستوى المتقدم)',
    short_en: "Juz' 21–29",
    short_ar: 'الأجزاء ٢١–٢٩',
    ages_en: '13–18 Years',
    ages_ar: '١٣–١٨ سنة',
    color: 'purple',
    gradient: 'from-purple-600/30 via-purple-950/20 to-black/80',
    border: 'border-purple-500/30',
    activeBorder: 'border-purple-400',
    accentText: 'text-purple-400',
    glowColor: 'rgba(168,85,247,0.2)',
    icon: '📙',
    badge_en: 'Advanced Huffaz',
    badge_ar: 'المستوى المتقدم',
    description_en: 'Demands deep memorization mastery across 29 Juz of the Holy Quran tested under multi-question jury examination.',
    description_ar: 'مستوى متقدم يشمل تسعة وعشرين جزءاً مع أسئلة متعددة من مشايخ وقراء معتمدين.',
    criteria: [
      {
        name_en: 'Memorization (Hifdh & Recall)',
        name_ar: 'الحفظ والإتقان الشامل',
        points: 50,
        pct: 50,
        color: 'from-purple-500 to-purple-400',
        details_en: 'Testing 4 distinct oral questions picked randomly by the computerized exam engine.',
        details_ar: 'الإجابة على ٤ أسئلة عشوائية تسحب إلكترونياً من كامل الأجزاء الـ ٢٩.',
      },
      {
        name_en: 'Tajweed Mastery & Rules',
        name_ar: 'إتقان التجويد التام',
        points: 30,
        pct: 30,
        color: 'from-[#c99335] to-[#f6cb7d]',
        details_en: 'Complete mastery of Hafs an Asim rules with zero phonetic flaws or slurs.',
        details_ar: 'التطبيق المحكم لرواية حفص عن عاصم من طريق الشاطبية دون أي خطأ جلي أو خفي.',
      },
      {
        name_en: 'Voice, Waqf & Presentation',
        name_ar: 'حسن الصوت والوقف والابتداء',
        points: 20,
        pct: 20,
        color: 'from-emerald-500 to-emerald-400',
        details_en: 'Distinguished recitation posture, vocal richness, and natural melodic flow.',
        details_ar: 'ثبات النبرة والصوت الشجي وإبراز المعاني القرآنية بالوقف التام والحسن.',
      },
    ],
  },
  {
    id: 'juz30',
    name_en: "Juz' 30 Complete Quran (Grand Championship)",
    name_ar: 'القرآن كاملاً ٣٠ جزءاً (الفئة الكبرى)',
    short_en: "Full Quran (30 Juz')",
    short_ar: 'القرآن كاملاً',
    ages_en: 'Open Category',
    ages_ar: 'الفئة المفتوحة (كافة الأعمار)',
    color: 'gold',
    gradient: 'from-amber-600/35 via-[#1a1410] to-black',
    border: 'border-[#c99335]/50',
    activeBorder: 'border-[#f6cb7d]',
    accentText: 'text-[#f6cb7d]',
    glowColor: 'rgba(201,147,53,0.3)',
    icon: '👑',
    badge_en: 'Grand Championship',
    badge_ar: 'الفئة الكبرى — تاج الوقار',
    description_en: 'The pinnacle of the Jamia Musabaqa. Full Quran memorization, advanced Tajweed, vocal artistry, plus Tafsir & Vocabulary understanding.',
    description_ar: 'ذروة سنام المسابقة: حفظ كتاب الله كاملاً عن ظهر قلب، مع إتقان التجويد وأداء بديع واختبار التفسير والمعاني.',
    criteria: [
      {
        name_en: 'Full Quran Memorization',
        name_ar: 'الحفظ الكامل الشامل (٣٠ جزءاً)',
        points: 45,
        pct: 45,
        color: 'from-[#c99335] to-[#f6cb7d]',
        details_en: '5 comprehensive examination questions covering all 30 Juz with instant recall.',
        details_ar: '٥ أسئلة شاملة وموزعة على كافة أرباع وأجزاء المصحف الشريف.',
      },
      {
        name_en: 'Tajweed Mastery (Hafs \'an Asim)',
        name_ar: 'أحكام التجويد والاتقان',
        points: 25,
        pct: 25,
        color: 'from-emerald-500 to-emerald-400',
        details_en: 'Theoretical & practical mastery of all Tajweed rules, Sifaat, and Makhaarij.',
        details_ar: 'التطبيق العملي الدقيق لجميع قواعد التجويد ومخارج الحروف وصفاتها اللازمة والعارضة.',
      },
      {
        name_en: 'Voice, Melody & Khushoo\'',
        name_ar: 'حسن الصوت والأداء القرآني',
        points: 20,
        pct: 20,
        color: 'from-sky-500 to-sky-400',
        details_en: 'Inspiring recitation quality, breath capacity, and emotive maqamat connection.',
        details_ar: 'عذوبة الصوت والترتيل الخاشع المتقن وحسن الوقف والابتداء.',
      },
      {
        name_en: 'Tafsir & Vocabulary (Ma\'ani)',
        name_ar: 'التفسير ومعاني المفردات',
        points: 10,
        pct: 10,
        color: 'from-purple-500 to-purple-400',
        details_en: 'Understanding of rare vocabulary (Gharib al-Quran), core themes, and context.',
        details_ar: 'معاني مفردات غريب القرآن والمقاصد العامة للآيات المختارة.',
      },
    ],
  },
]

export default function ScoringRubric({ lang, dict }: ScoringRubricProps) {
  const isAr = lang === 'ar'
  const t = dict.home

  const [selectedCatId, setSelectedCatId] = useState('juz30')
  const activeCategory = CATEGORIES.find((c) => c.id === selectedCatId) || CATEGORIES[3]

  return (
    <section className="relative py-28 px-4 overflow-hidden bg-gradient-to-b from-[#120e0c] via-[#0e0b0a] to-[#120e0c]">
      
      {/* Ambient background illumination */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,rgba(201,147,53,0.09),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#c99335_1px,transparent_1px)] [background-size:64px_64px] opacity-[0.03] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        
        {/* ── Section Header ── */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-4 mb-4">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#c99335]/60" />
            <span className="text-[#c99335] uppercase tracking-[0.35em] text-xs font-semibold font-sans">
              {isAr ? 'معايير التحكيم والتقييم' : 'Examination Standards & Rubric'}
            </span>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#c99335]/60" />
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-stone-100 to-[#c99335] mb-4 drop-shadow-md">
            {isAr ? 'معايير الدرجات والأوزان النسبية' : 'Scoring Rubric & Evaluation Weights'}
          </h2>

          <p className="text-stone-400 text-sm sm:text-base max-w-3xl mx-auto font-light leading-relaxed">
            {isAr
              ? 'تعتمد مسابقة مسجد جامع نيروبي نظام تحكيم إلكتروني موحد يضمن أعلى معايير الشفافية والعدالة بين المتسابقين وفق المعايير القرآنية المعتمدة عالمياً.'
              : 'The Jamia Mosque Musabaqa employs a standardized 100-point rubric scored by certified Qira\'at scholars to guarantee absolute transparency, consistency, and fairness.'}
          </p>
        </div>

        {/* ── Category Tier Selection Buttons ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10 max-w-5xl mx-auto">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCatId === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`relative rounded-2xl p-4 sm:p-5 text-center transition-all duration-300 border flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden ${
                  isSelected
                    ? `${cat.border} ${cat.gradient} shadow-[0_0_30px_${cat.glowColor}] scale-[1.02]`
                    : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-black/60 text-stone-400'
                }`}
              >
                {/* Active Indicator Top Glow */}
                {isSelected && (
                  <motion.div
                    layoutId="activeRubricTab"
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c99335] to-transparent"
                  />
                )}

                <span className="text-2xl sm:text-3xl filter drop-shadow-md">{cat.icon}</span>

                <div>
                  <h4 className={`font-serif text-sm sm:text-base font-bold ${isSelected ? 'text-white' : 'text-stone-300'}`}>
                    {isAr ? cat.short_ar : cat.short_en}
                  </h4>
                  <span className={`text-[11px] font-mono mt-0.5 block ${isSelected ? cat.accentText : 'text-stone-500'}`}>
                    {isAr ? cat.ages_ar : cat.ages_en}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* ── Active Tier Detail Spotlight Card ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className={`bg-gradient-to-br from-black/90 via-[#181310]/95 to-black/90 border ${activeCategory.border} rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl relative overflow-hidden`}
          >
            {/* Background Corner Glow */}
            <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[radial-gradient(circle,${activeCategory.glowColor},transparent_70%)] pointer-events-none`} />

            {/* Header of Active Category */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10 ${isAr ? 'md:flex-row-reverse text-right' : ''}`}>
              <div>
                <div className={`flex items-center gap-3 flex-wrap mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-2xl">{activeCategory.icon}</span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    {isAr ? activeCategory.name_ar : activeCategory.name_en}
                  </h3>
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#c99335]/20 text-[#f6cb7d] border border-[#c99335]/40">
                    {isAr ? activeCategory.badge_ar : activeCategory.badge_en}
                  </span>
                </div>
                <p className="text-stone-300 text-sm sm:text-base max-w-3xl font-light leading-relaxed">
                  {isAr ? activeCategory.description_ar : activeCategory.description_en}
                </p>
              </div>

              {/* Total Score Seal Badge */}
              <div className="flex items-center gap-3 self-start md:self-auto shrink-0 bg-black/60 border border-[#c99335]/40 rounded-2xl px-5 py-3.5 shadow-lg">
                <div className="text-center">
                  <span className="text-[10px] uppercase tracking-widest text-[#c99335] font-bold block">
                    {isAr ? 'الدرجة الكلية' : 'Max Score'}
                  </span>
                  <span className="font-serif text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#f6cb7d] to-[#c99335]">
                    100.0
                  </span>
                  <span className="text-[10px] text-stone-400 block font-mono">Points</span>
                </div>
              </div>
            </div>

            {/* ── Criteria Cards Breakdown Grid ── */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {activeCategory.criteria.map((crit, idx) => (
                <div
                  key={idx}
                  className="bg-black/50 border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-[#c99335]/50 transition-all duration-300 shadow-md group hover:-translate-y-1"
                >
                  <div>
                    {/* Header with points */}
                    <div className={`flex items-start justify-between gap-2 mb-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <h4 className="font-serif font-bold text-base text-white group-hover:text-[#f6cb7d] transition-colors leading-snug">
                        {isAr ? crit.name_ar : crit.name_en}
                      </h4>
                      <span className="font-serif text-lg font-bold text-[#c99335] bg-[#c99335]/15 px-2.5 py-1 rounded-xl border border-[#c99335]/30 shrink-0">
                        {crit.points} <span className="text-[10px] font-sans text-stone-400">pts</span>
                      </span>
                    </div>

                    {/* Progress Fill Meter */}
                    <div className="w-full bg-white/5 rounded-full h-2 mb-4 overflow-hidden border border-white/10">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${crit.color}`}
                        style={{ width: `${(crit.points / 50) * 100}%` }}
                      />
                    </div>

                    {/* Description Details */}
                    <p className={`text-xs text-stone-300 leading-relaxed font-light ${isAr ? 'text-right' : 'text-left'}`}>
                      {isAr ? crit.details_ar : crit.details_en}
                    </p>
                  </div>

                  {/* Weight tag */}
                  <div className={`mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-stone-400 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <span>{isAr ? 'الوزن النسبي' : 'Relative Weight'}</span>
                    <span className="font-bold text-white">{crit.pct}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Jury & Fair Scoring Safeguards Banner ── */}
            <div className={`mt-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-black/60 to-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isAr ? 'sm:flex-row-reverse text-right' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0 border border-emerald-500/30">
                  ⚖️
                </div>
                <div>
                  <h5 className="font-serif font-bold text-sm text-white">
                    {isAr ? 'ضمانات التحكيم والعدالة الرقمية' : 'Triple-Judge Jury & Outlier Detection'}
                  </h5>
                  <p className="text-xs text-stone-400 font-light mt-0.5">
                    {isAr
                      ? 'يُقيّم كل متسابق من قبل ٣ محكمين مجازين بصورة مستقلة، مع كشف تلقائي لأي تفاوت في الدرجات لضمان النزاهة.'
                      : 'Each candidate is evaluated by 3 independent certified Qari judges with automated statistical outlier anomaly filtering.'}
                  </p>
                </div>
              </div>

              <div className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-700/50 self-start sm:self-auto shrink-0">
                {isAr ? 'معتمد رسمياً ✓' : 'Audited Protocol ✓'}
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}
