'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type en from '@/dictionaries/en.json'

type Dict = typeof en

interface ScheduleAndPrizesProps {
  lang: string
  dict: Dict
}

interface StageItem {
  number: string
  title_en: string
  title_ar: string
  badge_en: string
  badge_ar: string
  date_en: string
  date_ar: string
  location_en: string
  location_ar: string
  desc_en: string
  desc_ar: string
  icon: string
  status_en: string
  status_ar: string
  highlight?: boolean
}

interface PrizeTier {
  rank_en: string
  rank_ar: string
  title_en: string
  title_ar: string
  medal: string
  metalColor: string
  borderClass: string
  glowClass: string
  bgGradient: string
  badgeBg: string
  badgeText: string
  awards_en: string[]
  awards_ar: string[]
  special_en?: string
  special_ar?: string
}

export default function ScheduleAndPrizes({ lang, dict }: ScheduleAndPrizesProps) {
  const isAr = lang === 'ar'
  const t = dict.home

  const [activeTab, setActiveTab] = useState<'prizes' | 'schedule' | 'venue'>('prizes')

  const PRIZE_TIERS: PrizeTier[] = [
    {
      rank_en: '1st Place',
      rank_ar: 'المركز الأول',
      title_en: 'Grand Champion',
      title_ar: 'بطل المسابقة — تاج الوقار',
      medal: '🥇',
      metalColor: 'text-[#f6cb7d]',
      borderClass: 'border-[#c99335]/70 hover:border-[#f6cb7d]',
      glowClass: 'shadow-[0_0_35px_rgba(201,147,53,0.3)]',
      bgGradient: 'from-[#2a1c0d]/90 via-[#18120c]/90 to-black/90',
      badgeBg: 'bg-[#c99335]/25 border border-[#c99335]/50',
      badgeText: 'text-[#f6cb7d]',
      awards_en: [
        'Musabaqa Championship Grand Trophy',
        'Official Jamia Mosque Gold Medallion',
        'Major Cash Honorarium & Educational Grant',
        'Certified Sanad Plaque of Quranic Distinction',
        'Institutional Madrasa Championship Shield',
      ],
      awards_ar: [
        'درع البطولة الكبرى لمسابقة مسجد جامع',
        'وسام الشرف الذهبي لمسجد جامع نيروبي',
        'مكافأة نقدية كبرى ومنحة دراسية قرآنية',
        'شهادة الإجازة والتقدير المعتمدة من لجنة التحكيم',
        'درع التميز المؤسسي للمدرسة الدينية الفائزة',
      ],
      special_en: 'Eligible for national nomination to international Quran competitions',
      special_ar: 'الترشيح الرسمي للمسابقات الدولية لحفظ القرآن الكريم',
    },
    {
      rank_en: '2nd Place',
      rank_ar: 'المركز الثاني',
      title_en: 'First Runner-Up',
      title_ar: 'الوصيف الأول — وسام الإتقان',
      medal: '🥈',
      metalColor: 'text-stone-200',
      borderClass: 'border-stone-400/40 hover:border-stone-300',
      glowClass: 'shadow-[0_0_25px_rgba(226,232,240,0.15)]',
      bgGradient: 'from-stone-900/90 via-[#141212]/90 to-black/90',
      badgeBg: 'bg-stone-800/80 border border-stone-600/50',
      badgeText: 'text-stone-200',
      awards_en: [
        'Silver Cup of Quranic Excellence',
        'Official Jamia Mosque Silver Medallion',
        'Substantial Cash Honorarium',
        'Certificate of High Quranic Distinction',
        'Gift Package of Classical Tafsir & Islamic Works',
      ],
      awards_ar: [
        'كأس التميز القرآني الفضي',
        'وسام الإتقان الفضي لمسجد جامع',
        'مكافأة نقدية تشجيعية مجزية',
        'شهادة تفوق وتقدير معتمدة',
        'حقيبة علمية فاخرة من كتب التفسير والعلوم القرآنية',
      ],
    },
    {
      rank_en: '3rd Place',
      rank_ar: 'المركز الثالث',
      title_en: 'Second Runner-Up',
      title_ar: 'المرتبة الثالثة — وسام الاستحقاق',
      medal: '🥉',
      metalColor: 'text-amber-400',
      borderClass: 'border-amber-700/40 hover:border-amber-600',
      glowClass: 'shadow-[0_0_25px_rgba(217,119,6,0.15)]',
      bgGradient: 'from-[#1f150f]/90 via-[#140f0c]/90 to-black/90',
      badgeBg: 'bg-amber-950/60 border border-amber-700/40',
      badgeText: 'text-amber-300',
      awards_en: [
        'Bronze Cup of Quranic Merit',
        'Official Jamia Mosque Bronze Medallion',
        'Cash Honorarium Award',
        'Certificate of Quranic Merit',
        'Selected Quranic Reference Books',
      ],
      awards_ar: [
        'كأس الاستحقاق القرآني البرونزي',
        'وسام الاستحقاق البرونزي',
        'مكافأة مالية تقديرية',
        'شهادة جدارة واستحقاق قرآنية',
        'مجموعة مراجع ومصاحف مذهبة مختارة',
      ],
    },
  ]

  const STAGES: StageItem[] = [
    {
      number: '01',
      title_en: 'Institutional Registration & Roster Intake',
      title_ar: 'تسجيل المؤسسات ورفع القوائم',
      badge_en: 'Step 1: Intake',
      badge_ar: 'المرحلة الأولى',
      date_en: 'Oct 01 – Nov 30, 2025',
      date_ar: '١ أكتوبر – ٣٠ نوفمبر ٢٠٢٥',
      location_en: 'Online Portal & Jamia Secretariat',
      location_ar: 'البوابة الرقمية وسكرتارية المسجد',
      desc_en: 'Madrasas and institutions register officially and submit candidate lists across the four tier categories with documentation verification.',
      desc_ar: 'تسجيل المدارس الدينية والمراكز القرآنية ورفع قوائم الطلاب المعتمدة ضمن الفئات الأربع واستكمال الوثائق.',
      icon: '📋',
      status_en: 'Active',
      status_ar: 'مستمر حالياً',
    },
    {
      number: '02',
      title_en: 'Preliminary Auditions & Screening',
      title_ar: 'التصفيات التمهيدية والتحقق المبدئي',
      badge_en: 'Step 2: Auditions',
      badge_ar: 'المرحلة الثانية',
      date_en: 'Dec 05 – Dec 10, 2025',
      date_ar: '٥ ديسمبر – ١٠ ديسمبر ٢٠٢٥',
      location_en: 'Jamia Mosque Training Center',
      location_ar: 'مركز تدريب مسجد جامع نيروبي',
      desc_en: 'Candidates undergo standard diagnostic recall and basic Tajweed assessments by senior examiners to qualify for the main stage.',
      desc_ar: 'خضوع المتسابقين لاختبارات استذكار تشخيصية وضبط أحكام التجويد من قبل شيوخ ولجان فرعية للتأهل للجولات الرئيسية.',
      icon: '🎙️',
      status_en: 'Upcoming',
      status_ar: 'قريباً',
    },
    {
      number: '03',
      title_en: 'Championship Stage & Live Jury Examination',
      title_ar: 'الجولات الختامية والتحكيم المنبري المباشر',
      badge_en: 'Step 3: Main Event',
      badge_ar: 'المرحلة الثالثة',
      date_en: 'Dec 15 – Dec 18, 2025',
      date_ar: '١٥ ديسمبر – ١٨ ديسمبر ٢٠٢٥',
      location_en: 'Jamia Mosque Main Prayer Hall',
      location_ar: 'الصحن الرئيسي لمسجد جامع نيروبي',
      desc_en: 'Finalists recite live before the esteemed panel of three independent Qira\'at scholars with computerized real-time scoring.',
      desc_ar: 'تنافس المتأهلين على المنبر أمام لجنة التحكيم الثلاثية المعتمدة مع رصد الدرجات عبر المنظومة الإلكترونية الموحدة.',
      icon: '📖',
      status_en: 'Championship',
      status_ar: 'المرحلة الكبرى',
      highlight: true,
    },
    {
      number: '04',
      title_en: 'Grand Award Ceremony & Huffaz Crowning',
      title_ar: 'الحفل الختامي وتتويج حفظة كتاب الله',
      badge_en: 'Step 4: Finale',
      badge_ar: 'المرحلة الرابعة',
      date_en: 'Dec 20, 2025 • After Asr Prayer',
      date_ar: '٢٠ ديسمبر ٢٠٢٥ • بعد صلاة العصر',
      location_en: 'Main Conference Auditorium & Horizon TV Broadcast',
      location_ar: 'القاعة الكبرى مع بث مباشر على هورايزون TV',
      desc_en: 'Announcement of winners, distribution of cash awards, medallions, institutional shields, and closing du\'a with national dignitaries.',
      desc_ar: 'إعلان النتائج النهائية وتوزيع الجوائز الكبرى والأوسمة والدروع وتكريم الشيوخ والمدارس بحضور كبار العلماء والشخصيات.',
      icon: '👑',
      status_en: 'Ceremony',
      status_ar: 'حفل الختام',
    },
  ]

  return (
    <section className="relative py-28 px-4 overflow-hidden bg-gradient-to-b from-[#120e0c] via-[#0d0a09] to-[#120e0c] border-t border-white/5">
      
      {/* Background Ambience & Islamic Lattice Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_25%,rgba(201,147,53,0.1),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#c99335_1px,transparent_1px)] [background-size:64px_64px] opacity-[0.035] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        
        {/* ── Section Header ── */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-4 mb-4">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#c99335]/60" />
            <span className="text-[#c99335] uppercase tracking-[0.35em] text-xs font-semibold font-sans">
              {isAr ? 'الجوائز الكبرى والجدول الزمني' : 'Honors, Schedule & Venue'}
            </span>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#c99335]/60" />
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-stone-100 to-[#c99335] mb-4 drop-shadow-md">
            {isAr ? 'جوائز المسابقة الكبرى والبرنامج الزمني' : 'Championship Honors & Official Schedule'}
          </h2>

          <p className="text-stone-400 text-sm sm:text-base max-w-3xl mx-auto font-light leading-relaxed">
            {isAr
              ? 'احتفاءً بحملة كتاب الله وإكراماً لأهل القرآن، رصدت لجنة مسجد جامع نيروبي جوائز قيّمة وأوسمة شرفية للفائزين، مع برنامج شامل ومحكم لكافة مراحل المسابقة.'
              : 'Honoring the guardians of the Divine Scripture. The Jamia Mosque Committee provides distinguished awards, scholastic grants, and standardized evaluation stages.'}
          </p>
        </div>

        {/* ── Navigation Tab Pill Bar ── */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl shadow-2xl">
            <button
              onClick={() => setActiveTab('prizes')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === 'prizes'
                  ? 'bg-gradient-to-r from-[#c99335] to-amber-600 text-white shadow-[0_0_20px_rgba(201,147,53,0.4)]'
                  : 'text-stone-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>🏆</span>
              <span>{isAr ? 'الجوائز والتكريم' : 'Prizes & Awards'}</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-gradient-to-r from-[#c99335] to-amber-600 text-white shadow-[0_0_20px_rgba(201,147,53,0.4)]'
                  : 'text-stone-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>📅</span>
              <span>{isAr ? 'المراحل والجدول الزمني' : 'Competition Timeline'}</span>
            </button>

            <button
              onClick={() => setActiveTab('venue')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === 'venue'
                  ? 'bg-gradient-to-r from-[#c99335] to-amber-600 text-white shadow-[0_0_20px_rgba(201,147,53,0.4)]'
                  : 'text-stone-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>📍</span>
              <span>{isAr ? 'المقر والتغطية المباشرة' : 'Venue & Facilities'}</span>
            </button>
          </div>
        </div>

        {/* ── Tab 1: Prizes & Awards ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'prizes' && (
            <motion.div
              key="prizes"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-12"
            >
              {/* Podium Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                {PRIZE_TIERS.map((tier, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-3xl p-8 border flex flex-col justify-between transition-all duration-500 backdrop-blur-xl ${tier.bgGradient} ${tier.borderClass} ${tier.glowClass} ${
                      idx === 0 ? 'md:-translate-y-3 z-10' : ''
                    } hover:-translate-y-2`}
                  >
                    {/* Top Ribbon Badge for 1st Place */}
                    {idx === 0 && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-[#c99335] to-amber-600 text-black font-extrabold text-[10px] sm:text-xs uppercase tracking-widest px-4 py-1 rounded-full shadow-lg border border-amber-300">
                        {isAr ? 'المركز الأسمى' : 'Supreme Honor'}
                      </div>
                    )}

                    <div>
                      {/* Medal Icon & Rank Header */}
                      <div className={`flex items-center justify-between gap-4 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-4xl sm:text-5xl filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                            {tier.medal}
                          </span>
                          <div>
                            <span className="text-xs uppercase tracking-widest text-stone-400 font-mono block">
                              {isAr ? tier.rank_ar : tier.rank_en}
                            </span>
                            <h3 className={`font-serif text-lg sm:text-xl font-bold ${tier.metalColor}`}>
                              {isAr ? tier.title_ar : tier.title_en}
                            </h3>
                          </div>
                        </div>

                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${tier.badgeBg} ${tier.badgeText}`}>
                          {idx === 0 ? '100 pts' : idx === 1 ? 'High Distinction' : 'Distinction'}
                        </span>
                      </div>

                      {/* Awards List */}
                      <div className="space-y-3.5 pt-4 border-t border-white/10">
                        {(isAr ? tier.awards_ar : tier.awards_en).map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className={`flex items-start gap-3 text-xs sm:text-sm text-stone-300 ${isAr ? 'flex-row-reverse text-right' : ''}`}
                          >
                            <span className={`text-sm shrink-0 mt-0.5 ${tier.metalColor}`}>✦</span>
                            <span className="leading-snug font-light">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Special Note / Footer */}
                    {tier.special_en && (
                      <div className="mt-8 pt-4 border-t border-white/10">
                        <div className="p-3 rounded-xl bg-[#c99335]/15 border border-[#c99335]/30 text-center">
                          <p className="text-[11px] sm:text-xs text-[#f6cb7d] font-medium leading-relaxed">
                            ⭐ {isAr ? tier.special_ar : tier.special_en}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Special Categories & All-Finalist Recognition Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#181310]/95 via-stone-900/90 to-[#181310]/95 border border-[#c99335]/30 shadow-2xl backdrop-blur-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x md:divide-white/10">
                  
                  {/* Commemorative Mushaf */}
                  <div className={`flex items-center gap-4 ${isAr ? 'text-right flex-row-reverse md:pl-6' : 'md:pr-6'}`}>
                    <div className="w-12 h-12 rounded-2xl bg-[#c99335]/20 border border-[#c99335]/40 flex items-center justify-center text-2xl shrink-0">
                      📖
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-white text-sm sm:text-base">
                        {isAr ? 'مصحف مذهب وهدية شرفية' : 'Commemorative Mushaf Gift'}
                      </h4>
                      <p className="text-xs text-stone-400 font-light mt-0.5">
                        {isAr
                          ? 'مصحف شريف فاخر وغلاف جلدي مذهب لكافة المتسابقين المتأهلين للنهائيات.'
                          : 'Deluxe leather-bound Medina Quran gift set awarded to all stage finalists.'}
                      </p>
                    </div>
                  </div>

                  {/* Certified Huffaz Certificates */}
                  <div className={`pt-4 md:pt-0 flex items-center gap-4 ${isAr ? 'text-right flex-row-reverse md:px-6' : 'md:px-6'}`}>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl shrink-0">
                      📜
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-white text-sm sm:text-base">
                        {isAr ? 'شهادات الإتقان المعتمدة' : 'Official Certifications'}
                      </h4>
                      <p className="text-xs text-stone-400 font-light mt-0.5">
                        {isAr
                          ? 'شهادات معتمدة ومختومة رسمياً من كبار قراء وأئمة مسجد جامع نيروبي.'
                          : 'Formally authenticated certificates signed by the Chief Qadi and Jamia Mosque Imams.'}
                      </p>
                    </div>
                  </div>

                  {/* Special Awards for Best Saut & Youngest Hafidh */}
                  <div className={`pt-4 md:pt-0 flex items-center gap-4 ${isAr ? 'text-right flex-row-reverse md:pr-0 md:pl-6' : 'md:pl-6'}`}>
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-2xl shrink-0">
                      ✨
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-white text-sm sm:text-base">
                        {isAr ? 'جوائز خاصة إضافية' : 'Juror Special Accolades'}
                      </h4>
                      <p className="text-xs text-stone-400 font-light mt-0.5">
                        {isAr
                          ? 'جوائز شرفية لأحسن صوت قرآني وأصغر حافظ متقن من الأشبال.'
                          : 'Special juror trophies for "Most Melodic Voice" and "Youngest Hafidh of the Year".'}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* ── Tab 2: Timeline Schedule ── */}
          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {STAGES.map((stg, i) => (
                  <div
                    key={i}
                    className={`relative rounded-3xl p-6 sm:p-8 border transition-all duration-300 backdrop-blur-xl ${
                      stg.highlight
                        ? 'bg-gradient-to-br from-[#241a10] via-stone-900/90 to-black/90 border-[#c99335]/60 shadow-[0_0_30px_rgba(201,147,53,0.18)]'
                        : 'bg-black/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Top Row */}
                    <div className={`flex items-center justify-between gap-4 mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-sm text-[#c99335]">
                          {stg.number}
                        </span>
                        <span className="text-2xl">{stg.icon}</span>
                      </div>

                      <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        stg.highlight
                          ? 'bg-[#c99335]/20 text-[#f6cb7d] border-[#c99335]/40'
                          : 'bg-white/5 text-stone-300 border-white/10'
                      }`}>
                        {isAr ? stg.status_ar : stg.status_en}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className={`font-serif text-lg sm:text-xl font-bold text-white mb-2 ${isAr ? 'text-right' : ''}`}>
                      {isAr ? stg.title_ar : stg.title_en}
                    </h3>

                    {/* Description */}
                    <p className={`text-stone-300 text-xs sm:text-sm font-light leading-relaxed mb-6 ${isAr ? 'text-right' : ''}`}>
                      {isAr ? stg.desc_ar : stg.desc_en}
                    </p>

                    {/* Metadata Footer */}
                    <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className={`flex items-center gap-2 text-stone-400 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                        <span className="text-[#c99335]">📅</span>
                        <span className="font-mono">{isAr ? stg.date_ar : stg.date_en}</span>
                      </div>

                      <div className={`flex items-center gap-2 text-stone-400 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                        <span className="text-emerald-400">📍</span>
                        <span className="truncate">{isAr ? stg.location_ar : stg.location_en}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Callout Notice */}
              <div className="p-4 rounded-2xl bg-stone-900/60 border border-white/10 text-center max-w-2xl mx-auto">
                <p className="text-xs text-stone-400 font-light">
                  {isAr
                    ? 'ملاحظة: تُبلغ المدارس والمؤسسات المشاركة بأوقات الحضور الفردية عبر البوابة والرسائل النصية قبل كل مرحلة.'
                    : 'Note: Registered Madrasas will receive designated time slots and reporting schedules via the portal and SMS prior to each round.'}
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Tab 3: Venue & Live Coverage ── */}
          {activeTab === 'venue' && (
            <motion.div
              key="venue"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Venue Card */}
              <div className="bg-gradient-to-br from-stone-900/90 via-[#181310]/90 to-black/90 border border-[#c99335]/30 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c99335]/15 border border-[#c99335]/30 text-[#f6cb7d] text-xs font-semibold uppercase tracking-wider mb-6">
                    <span>🕌</span>
                    <span>{isAr ? 'مقر المسابقة الرسمي' : 'Official Musabaqa Venue'}</span>
                  </div>

                  <h3 className={`font-serif text-2xl sm:text-3xl font-bold text-white mb-4 ${isAr ? 'text-right' : ''}`}>
                    {isAr ? 'مسجد جامع نيروبي العريق' : 'Jamia Mosque Nairobi Complex'}
                  </h3>

                  <p className={`text-stone-300 text-sm font-light leading-relaxed mb-6 ${isAr ? 'text-right' : ''}`}>
                    {isAr
                      ? 'يحتضن الصحن الرئيسي والقاعة الكبرى لمسجد جامع نيروبي بوسط العاصمة فعاليات المسابقة، مع تجهيزات صوتية متطورة مصممة لإبراز مخارج التلاوة والترتيل بأبهى صورة.'
                      : 'Located in the heart of Nairobi CBD along Banda Street. The competition stages utilize the Main Prayer Sanctuary and the Multi-purpose Conference Complex, acoustically tuned for sacred recitation.'}
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className={`flex items-start gap-3 text-xs sm:text-sm text-stone-300 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                      <span className="text-[#c99335] mt-0.5">📌</span>
                      <span><strong>{isAr ? 'الموقع:' : 'Location:'}</strong> {isAr ? 'شارع باندا، وسط مدينة نيروبي (CBD)' : 'Banda Street, City Square, Nairobi CBD'}</span>
                    </div>

                    <div className={`flex items-start gap-3 text-xs sm:text-sm text-stone-300 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                      <span className="text-emerald-400 mt-0.5">🎧</span>
                      <span><strong>{isAr ? 'البيئة الصوتية:' : 'Acoustics:'}</strong> {isAr ? 'أنظمة صوت رقمية نقية مخصصة للترتيل وأحكام التجويد' : 'High-fidelity acoustic isolation optimized for Tajweed precision'}</span>
                    </div>

                    <div className={`flex items-start gap-3 text-xs sm:text-sm text-stone-300 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                      <span className="text-sky-400 mt-0.5">👥</span>
                      <span><strong>{isAr ? 'مدرجات الضيوف:' : 'Guest Seating:'}</strong> {isAr ? 'أجنحة مخصصة للجمهور والمشايخ وأولياء الأمور' : 'Designated galleries for attendees, teachers, and guardians'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-mono">Latitude: -1.2841° S, 36.8214° E</span>
                  <a
                    href="https://maps.google.com/?q=Jamia+Mosque+Nairobi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#f6cb7d] hover:text-white transition-colors"
                  >
                    <span>{isAr ? 'عرض على الخريطة' : 'Open in Google Maps'}</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>

              {/* Broadcast & Facilities Card */}
              <div className="bg-gradient-to-br from-black/80 via-stone-900/80 to-black/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
                    <span>📡</span>
                    <span>{isAr ? 'البث المباشر والخدمات' : 'Broadcast & Participant Services'}</span>
                  </div>

                  <h3 className={`font-serif text-2xl sm:text-3xl font-bold text-white mb-4 ${isAr ? 'text-right' : ''}`}>
                    {isAr ? 'تغطية إعلامية وخدمات متكاملة' : 'Media Coverage & Live Streaming'}
                  </h3>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className={`flex items-center gap-3 mb-1 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                        <span className="text-lg">📺</span>
                        <h4 className="font-serif font-bold text-white text-sm">
                          {isAr ? 'بث حي عالي الدقة (HD)' : 'High-Definition Live Broadcast'}
                        </h4>
                      </div>
                      <p className={`text-xs text-stone-400 font-light ${isAr ? 'text-right' : ''}`}>
                        {isAr
                          ? 'نقل حي لكافة الجولات عبر قناة Horizon TV ومنصات مسجد جامع الرقمية على اليوتيوب وفيسبوك.'
                          : 'Streamed live across Horizon TV and Jamia Mosque digital channels with live scoring graphics.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className={`flex items-center gap-3 mb-1 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                        <span className="text-lg">🛋️</span>
                        <h4 className="font-serif font-bold text-white text-sm">
                          {isAr ? 'غرف المراجعة والراحة للمتسابقين' : 'Quiet Pre-Stage Rehearsal Suites'}
                        </h4>
                      </div>
                      <p className={`text-xs text-stone-400 font-light ${isAr ? 'text-right' : ''}`}>
                        {isAr
                          ? 'قاعات هادئة ومجهزة بمصاحف مراجعة وضيافة مخصصة للمتسابقين قبل اعتلائهم منصة الاختبار.'
                          : 'Dedicated green rooms with Mushaf copies and vocal rest amenities before stage entry.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className={`flex items-center gap-3 mb-1 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                        <span className="text-lg">⚡</span>
                        <h4 className="font-serif font-bold text-white text-sm">
                          {isAr ? 'شاشات النتائج اللحظية' : 'Real-time Onsite & Online Leaderboards'}
                        </h4>
                      </div>
                      <p className={`text-xs text-stone-400 font-light ${isAr ? 'text-right' : ''}`}>
                        {isAr
                          ? 'عرض النتائج وتحديثها لحظة بلحظة على الشاشات الكبرى في الحرم وعبر بوابتنا الرقمية.'
                          : 'Live scores instantly rendered on auditorium display walls and online via the live leaderboard.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                  <Link
                    href={`/${lang}/leaderboard`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#c99335] hover:text-[#f6cb7d] transition-colors"
                  >
                    <span>{isAr ? 'الانتقال إلى لوحة النتائج المباشرة' : 'View Live Leaderboard Feed'}</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  )
}
