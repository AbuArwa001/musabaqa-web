'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TierEmblem from '@/components/TierEmblem'
import { Target, Clock, Users, Zap, ShieldCheck, Scale, Info, Check } from 'lucide-react'
import type en from '@/dictionaries/en.json'

type Dict = typeof en

interface ScoringRubricProps {
  lang: string
  dict: Dict
}

interface Criterion {
  name_en: string
  name_ar: string
  points: number
  pct: number
  color: string
  details_en: string
  details_ar: string
  subItems_en?: string[]
  subItems_ar?: string[]
}

interface CategoryTier {
  id: string
  name_en: string
  name_ar: string
  short_en: string
  short_ar: string
  ages_en: string
  ages_ar: string
  color: string
  gradient: string
  border: string
  activeBorder: string
  accentText: string
  glowColor: string
  icon: string
  badge_en: string
  badge_ar: string
  questions_en: string
  questions_ar: string
  duration_en: string
  duration_ar: string
  description_en: string
  description_ar: string
  criteria: Criterion[]
}

export default function ScoringRubric({ lang, dict }: ScoringRubricProps) {
  const isAr = lang === 'ar'
  const t = dict.home

  const [selectedCatId, setSelectedCatId] = useState('juz30')
  const [activeViewMode, setActiveViewMode] = useState<'rubric' | 'deductions' | 'jury'>('rubric')

  const CATEGORIES: CategoryTier[] = [
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
      badge_ar: 'فئة الأشبال والبراعم',
      questions_en: '3 Questions (1 page each)',
      questions_ar: '٣ أسئلة (صفحة كاملة لكل سؤال)',
      duration_en: '10–12 Minutes',
      duration_ar: '١٠–١٢ دقيقة',
      description_en: 'Designed for young Quranic scholars mastering the first ten juz with solid recall and basic Tajweed rules.',
      description_ar: 'مخصصة للأشبال والناشئة لإتقان الأجزاء العشرة الأولى حفظاً وتجويداً وأداءً متزناً.',
      criteria: [
        {
          name_en: 'Memorization (Hifdh & Instant Recall)',
          name_ar: 'الحفظ والإتقان وعدم التردد',
          points: 50,
          pct: 50,
          color: 'from-emerald-500 to-emerald-400',
          details_en: 'Flawless recall without judge intervention. Deductions applied for hesitation, stumbles, and memory prompts.',
          details_ar: 'استحضار تام للآيات دون تردد أو توقف. تُخصم الدرجات عند التردد أو التنبيه بالآية.',
          subItems_en: ['Fluency & Flow', 'Prompt Recovery', 'Surah Boundary Navigation'],
          subItems_ar: ['طلاقة السرد', 'سرعة الاستدراك', 'ضبط أوائل وأواخر السور'],
        },
        {
          name_en: 'Tajweed Rules & Letter Articulation',
          name_ar: 'أحكام التجويد ومخارج الحروف',
          points: 30,
          pct: 30,
          color: 'from-[#c99335] to-[#f6cb7d]',
          details_en: 'Accurate Makhaarij (letters articulation), Noon & Meem Sakinah, Ghunnah durations, and basic Madd rules.',
          details_ar: 'صحة مخارج الحروف، وأحكام النون والميم الساكنتين، ومقادير المدود والغنات.',
          subItems_en: ['Makhaarij Accuracy', 'Noon/Meem Rules', 'Madd Durations (2/4/6)'],
          subItems_ar: ['صحة المخارج', 'النون والميم الساكنتان', 'أزمنة المدود'],
        },
        {
          name_en: 'Voice, Melodic Flow & Tarteel',
          name_ar: 'حسن الصوت والأداء والتؤدة',
          points: 20,
          pct: 20,
          color: 'from-sky-500 to-sky-400',
          details_en: 'Measured recitation speed (Tarteel/Tadweer), natural melodiousness, and respectful adherence to Waqf & Ibtida.',
          details_ar: 'الترتيل الهادئ المتزن، وجمال النبرة الخاشعة، ومراعاة علامات الوقف والابتداء.',
          subItems_en: ['Vocal Pitch & Steady Tempo', 'Breath Control', 'Sound Waqf (Pauses)'],
          subItems_ar: ['رزانة الصوت والوتيرة', 'ضبط النفس', 'حسن الوقف والابتداء'],
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
      badge_ar: 'المستوى المتوسط للفتيان',
      questions_en: '4 Questions (1.25 pages each)',
      questions_ar: '٤ أسئلة (صفحة وربع لكل سؤال)',
      duration_en: '12–15 Minutes',
      duration_ar: '١٢–١٥ دقيقة',
      description_en: 'Tests rigorous retention across Surah Yusuf through Surah Al-Anbiya with meticulous phonetic precision.',
      description_ar: 'اختبار دقيق في عشرين جزءاً من سورة يوسف حتى سورة الأنبياء مع التركيز على دقّة المخارج والمتشابهات.',
      criteria: [
        {
          name_en: 'Memorization & Mutashabihat Recall',
          name_ar: 'الحفظ والتمكن من المتشابهات اللفظية',
          points: 50,
          pct: 50,
          color: 'from-sky-500 to-sky-400',
          details_en: 'Confidence in mutashabihat (cross-surah similar verses) with instant recall across dense narrative chapters.',
          details_ar: 'التمكن من المتشابهات اللفظية والربط السلس بين القصص والسور دون أدنى لبس.',
          subItems_en: ['Mutashabihat Precision', 'Zero Memory Gaps', 'Instant Prompt Response'],
          subItems_ar: ['ضبط المتشابهات', 'عدم التردد', 'الاستجابة الفورية للسؤال'],
        },
        {
          name_en: 'Tajweed & Sifaat Precision',
          name_ar: 'أحكام التجويد وصفات الحروف اللازمة',
          points: 30,
          pct: 30,
          color: 'from-[#c99335] to-[#f6cb7d]',
          details_en: 'Tafkheem & Tarqeeq balance, Qalqalah levels, Itbaaq, and exact letter characteristics.',
          details_ar: 'التفخيم والترقيق، ومراتب القلقلة، والإطباق والاستعلاء، وموازين المدود بدقة متناهية.',
          subItems_en: ['Tafkheem & Tarqeeq', 'Qalqalah Levels', 'Clear Sifaat Separation'],
          subItems_ar: ['مراتب التفخيم والترقيق', 'القلقلة ومراتبها', 'إبراز صفات الحروف'],
        },
        {
          name_en: 'Saut & Emotional Maqaam Delivery',
          name_ar: 'جمال الصوت ورزانة الأداء القرآني',
          points: 20,
          pct: 20,
          color: 'from-purple-500 to-purple-400',
          details_en: 'Consistent pace (Tadweer), emotional resonance fitting the sacred text, and deliberate breath control.',
          details_ar: 'الترتيل المتزن بحزن وخشوع مع حسن توزيع النبر ومراعاة عظمة الآيات القرآنية.',
          subItems_en: ['Emotional Khushoo', 'Tadweer Rhythm', 'Waqf Hasan Mastery'],
          subItems_ar: ['الخشوع والتأثير', 'وزن التدوير', 'حسن الوقف الكافي والتام'],
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
      badge_ar: 'المستوى المتقدم للشباب',
      questions_en: '4 Questions (1.5 pages each)',
      questions_ar: '٤ أسئلة (صفحة ونصف لكل سؤال)',
      duration_en: '15–18 Minutes',
      duration_ar: '١٥–١٨ دقيقة',
      description_en: 'Demands deep memorization mastery across 29 Juz of the Holy Quran tested under multi-question jury examination.',
      description_ar: 'مستوى متقدم يشمل تسعة وعشرين جزءاً مع أسئلة مسحوبة إلكترونياً تغطي مختلف الأحزاب والأرباع.',
      criteria: [
        {
          name_en: 'Comprehensive Memorization',
          name_ar: 'الحفظ المتقن والاستحضار الفوري الشامل',
          points: 50,
          pct: 50,
          color: 'from-purple-500 to-purple-400',
          details_en: 'Testing 4 distinct oral questions drawn randomly by computerized exam engine across all 29 Juz.',
          details_ar: 'الإجابة على ٤ أسئلة عشوائية تسحب إلكترونياً من كامل الأجزاء الـ ٢٩ بدقة استحضار فورية.',
          subItems_en: ['4 Exhaustive Questions', 'Instant Verse Recall', 'Firm Mutashabihat Grip'],
          subItems_ar: ['٤ أسئلة شاملة', 'استحضار فوري', 'إحكام المتشابهات المعقدة'],
        },
        {
          name_en: 'Tajweed Mastery (Hafs \'an Asim)',
          name_ar: 'إتقان التجويد التام برواية حفص',
          points: 30,
          pct: 30,
          color: 'from-[#c99335] to-[#f6cb7d]',
          details_en: 'Complete mastery of Hafs an Asim rules with zero phonetic flaws or unintentional slurs.',
          details_ar: 'التطبيق المحكم لرواية حفص عن عاصم من طريق الشاطبية دون أي لحن جلي أو خفي.',
          subItems_en: ['Zero Phonetic Slurs', 'Perfect Vowel Weights', 'Full Sifaat Execution'],
          subItems_ar: ['سلامة الحركات والإعراب', 'ميزان المدود التام', 'صفات الحروف المركبة'],
        },
        {
          name_en: 'Vocal Dignity & Waqf/Ibtida',
          name_ar: 'رزانة الصوت وجمال الوقف والابتداء',
          points: 20,
          pct: 20,
          color: 'from-emerald-500 to-emerald-400',
          details_en: 'Distinguished recitation posture, vocal richness, and natural melodic flow without exaggerated cadence.',
          details_ar: 'ثبات النبرة والصوت الشجي وإبراز المعاني القرآنية بالوقف التام والحسن وتجنب التكلف.',
          subItems_en: ['Reverent Posture', 'Acoustic Clarity', 'Waqf Taam Mastery'],
          subItems_ar: ['السمت القرآني الخاشع', 'النقاء الصوتي', 'إحكام الوقف التام'],
        },
      ],
    },
    {
      id: 'juz30',
      name_en: "Full Quran 30 Juz' (Grand Championship)",
      name_ar: 'القرآن كاملاً ٣٠ جزءاً (الفئة الكبرى)',
      short_en: "Full Quran (30 Juz')",
      short_ar: 'القرآن كاملاً',
      ages_en: 'Open Category (All Ages)',
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
      questions_en: '5 Comprehensive Questions',
      questions_ar: '٥ أسئلة شاملة وموزعة',
      duration_en: '20–25 Minutes',
      duration_ar: '٢٠–٢٥ دقيقة',
      description_en: 'The pinnacle of the Jamia Musabaqa. Full Quran memorization, advanced Tajweed, vocal artistry, plus Tafsir & Vocabulary understanding.',
      description_ar: 'ذروة سنام المسابقة: حفظ كتاب الله كاملاً عن ظهر قلب، مع إتقان التجويد وأداء بديع واختبار التفسير والمعاني.',
      criteria: [
        {
          name_en: 'Full Quran Memorization & Recall',
          name_ar: 'الحفظ الكامل الشامل (٣٠ جزءاً)',
          points: 45,
          pct: 45,
          color: 'from-[#c99335] to-[#f6cb7d]',
          details_en: '5 comprehensive examination questions covering all 30 Juz with instant recall and flawless cross-surah navigation.',
          details_ar: '٥ أسئلة شاملة وموزعة على كافة أرباع وأجزاء المصحف الشريف مع استحضار فوري متقن.',
          subItems_en: ['5 Multi-Juz Questions', 'Complete Mutashabihat Control', 'Zero Recall Gaps'],
          subItems_ar: ['٥ أسئلة موزعة على المصحف', 'ضبط كامل للمتشابهات', 'استرسال متصل دون تلعثم'],
        },
        {
          name_en: 'Tajweed Mastery (Hafs \'an Asim)',
          name_ar: 'أحكام التجويد والاتقان العملي',
          points: 25,
          pct: 25,
          color: 'from-emerald-500 to-emerald-400',
          details_en: 'Theoretical & practical mastery of all Tajweed rules, Sifaat, and Makhaarij from Shatibiyyah pathway.',
          details_ar: 'التطبيق العملي الدقيق لجميع قواعد التجويد ومخارج الحروف وصفاتها اللازمة والعارضة.',
          subItems_en: ['Shatibiyyah Strictness', 'Micro-Madd Precision', 'No Lahn Khafi'],
          subItems_ar: ['طريق الشاطبية', 'أزمنة الغنن والمدود', 'انتفاء اللحن الخفي'],
        },
        {
          name_en: 'Voice, Melodic Khushoo & Tarteel',
          name_ar: 'حسن الصوت والأداء والترتيل الخاشع',
          points: 20,
          pct: 20,
          color: 'from-sky-500 to-sky-400',
          details_en: 'Inspiring recitation quality, breath capacity, and emotive maqamat connection reflecting the majesty of the verses.',
          details_ar: 'عذوبة الصوت والترتيل الخاشع المتقن وحسن الوقف والابتداء ومطابقة النغم لمعاني الآيات.',
          subItems_en: ['Solemn Vocal Warmth', 'Breath Mastery', 'Pacing & Articulation'],
          subItems_ar: ['خشوع النبرة وحسن الصوت', 'سعة النفس والتحكم', 'اتزان وتيرة الترتيل'],
        },
        {
          name_en: 'Tafsir & Vocabulary (Gharib al-Quran)',
          name_ar: 'التفسير ومعاني مفردات غريب القرآن',
          points: 10,
          pct: 10,
          color: 'from-purple-500 to-purple-400',
          details_en: 'Understanding of rare vocabulary (Gharib al-Quran), core Surah themes, and concise exegetical context.',
          details_ar: 'معاني مفردات غريب القرآن والمقاصد العامة للسور والآيات المختارة في الاختبار.',
          subItems_en: ['Gharib al-Quran Meanings', 'Surah Core Themes', 'Historical Context'],
          subItems_ar: ['غريب ألفاظ القرآن', 'المقاصد الموضوعية للسور', 'أسباب النزول والمعاني'],
        },
      ],
    },
  ]

  const DEDUCTIONS_TABLE = [
    {
      category_en: 'Memorization Penalties (Hifdh)',
      category_ar: 'خصومات الحفظ والاستذكار',
      items: [
        {
          error_en: 'Minor Hesitation or Stumble (Taraddud)',
          error_ar: 'التردد أو التلعثم البسيط مع الاستدراك الذاتي',
          penalty: '-0.5',
          penalty_ar: '-٠.٥',
          note_en: 'Contestant pauses noticeably or repeats a word to regain rhythm without judge intervention.',
          note_ar: 'توقف المتسابق أو تكراره للكلمة ليستدرك حفظه بنفسه دون فتح من المحكم.',
        },
        {
          error_en: 'First Judicial Opening / Prompt (Al-Fatha)',
          error_ar: 'تنبيه المحكم بالفتح لأول مرة',
          penalty: '-1.0',
          penalty_ar: '-١.٠',
          note_en: 'When a candidate is stuck or makes an error and the judge reads the correct opening word.',
          note_ar: 'عند توقف المتسابق التام أو تحريفه للفظ فيتدخل المحكم بفتح الآية له.',
        },
        {
          error_en: 'Second Consecutive Prompt on Same Verse',
          error_ar: 'التنبيه والفتح للمرة الثانية في نفس الموضع',
          penalty: '-2.0',
          penalty_ar: '-٢.٠',
          note_en: 'Candidate cannot continue after the first prompt, requiring a second judicial opening.',
          note_ar: 'عجز المتسابق عن المواصلة بعد التنبيه الأول مما يستوجب تدخلاً ثانياً.',
        },
        {
          error_en: 'Skipping a Line or Verse (Isqaat Ayah)',
          error_ar: 'إسقاط آية أو جملة من الآية',
          penalty: '-2.0',
          penalty_ar: '-٢.٠',
          note_en: 'Omission of an entire sentence or jumping across Mutashabihat to a different chapter.',
          note_ar: 'تجاوز آية كاملة أو الانتقال لمتشابه في سورة أخرى دون استدراك.',
        },
      ],
    },
    {
      category_en: 'Tajweed Penalties (Ahkam)',
      category_ar: 'خصومات أحكام التجويد والمخارج',
      items: [
        {
          error_en: 'Obvious Lahn Jali (Vowel or Letter Error)',
          error_ar: 'اللحن الجلي (تغيير حركة إعرابية أو إبدال حرف)',
          penalty: '-1.0',
          penalty_ar: '-١.٠',
          note_en: 'Changing a dammah to fatha, or substituting letters (e.g., seen instead of saad).',
          note_ar: 'خطأ إعرابي بتغيير حركة أو استبدال حرف بحرف آخر يغير بنية الكلمة.',
        },
        {
          error_en: 'Subtle Lahn Khafi (Imperfect Madd or Ghunnah)',
          error_ar: 'اللحن الخفي (نقص أو زيادة في مقادير المد أو الغنة)',
          penalty: '-0.5',
          penalty_ar: '-٠.٥',
          note_en: 'Shortening a compulsory madd, imperfect ghunnah hold, or dropping Qalqalah.',
          note_ar: 'قصر المد الواجب أو اختلاس الغنة أو ترك القلقلة في موضعها.',
        },
        {
          error_en: 'Improper Stop or Start (Waqf Qabeeh)',
          error_ar: 'الوقف القبيح أو الابتداء المفسد للمعنى',
          penalty: '-0.5',
          penalty_ar: '-٠.٥',
          note_en: 'Stopping on a phrase that alters theological meaning without proper resumption.',
          note_ar: 'الوقف على ما يفسد المعنى الشرعي للآية دون إعادة وصل ما قبله.',
        },
      ],
    },
  ]

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
              {isAr ? 'معايير التحكيم والتقييم' : 'Standardized Evaluation Rubric'}
            </span>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#c99335]/60" />
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-stone-100 to-[#c99335] mb-4 drop-shadow-md">
            {isAr ? 'معايير الدرجات ولائحة التحكيم الإلكترونية' : 'Scoring Rubric & Evaluation Weights'}
          </h2>

          <p className="text-stone-400 text-sm sm:text-base max-w-3xl mx-auto font-light leading-relaxed">
            {isAr
              ? 'تعتمد مسابقة مسجد جامع نيروبي نظام تحكيم إلكتروني موحد يضمن أعلى معايير الشفافية والعدالة بين المتسابقين وفق المعايير القرآنية المعتمدة عالمياً.'
              : 'The Jamia Mosque Musabaqa employs a standardized 100-point rubric scored in real-time by certified Qira\'at scholars to guarantee absolute transparency, consistency, and fairness.'}
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

                <TierEmblem id={cat.id} isSelected={isSelected} size="md" />

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

        {/* ── Sub-navigation View Toggle: Criteria vs Deductions vs Jury Oath ── */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-xl bg-stone-900/80 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setActiveViewMode('rubric')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeViewMode === 'rubric'
                  ? 'bg-[#c99335] text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {isAr ? 'الأوزان والمعايير التقييمية' : 'Evaluation Pillars & Weights'}
            </button>
            <button
              onClick={() => setActiveViewMode('deductions')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeViewMode === 'deductions'
                  ? 'bg-[#c99335] text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {isAr ? 'سلم الخصومات والعقوبات' : 'Penalty & Deduction Matrix'}
            </button>
            <button
              onClick={() => setActiveViewMode('jury')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeViewMode === 'jury'
                  ? 'bg-[#c99335] text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {isAr ? 'بروتوكول التحكيم والنزاهة' : 'Jury Protocol & Outlier Filter'}
            </button>
          </div>
        </div>

        {/* ── Active Tier Detail Spotlight Card ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory.id}-${activeViewMode}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className={`bg-gradient-to-br from-black/90 via-[#181310]/95 to-black/90 border ${activeCategory.border} rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl relative overflow-hidden`}
          >
            {/* Background Corner Glow */}
            <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[radial-gradient(circle,${activeCategory.glowColor},transparent_70%)] pointer-events-none`} />

            {/* Header of Active Category */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10 ${isAr ? 'md:flex-row-reverse text-right' : ''}`}>
              <div>
                <div className={`flex items-center gap-3 flex-wrap mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <TierEmblem id={activeCategory.id} isSelected={true} size="sm" />
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
                <div className={`flex items-center gap-4 mt-3 text-xs text-stone-400 font-mono ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#c99335] shrink-0" />
                    <span>{isAr ? activeCategory.questions_ar : activeCategory.questions_en}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{isAr ? activeCategory.duration_ar : activeCategory.duration_en}</span>
                  </span>
                </div>
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

            {/* ── View 1: Rubric Breakdown Cards ── */}
            {activeViewMode === 'rubric' && (
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
                      <p className={`text-xs text-stone-300 leading-relaxed font-light mb-4 ${isAr ? 'text-right' : 'text-left'}`}>
                        {isAr ? crit.details_ar : crit.details_en}
                      </p>

                      {/* Sub-items check badges */}
                      {crit.subItems_en && (
                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                          {(isAr ? crit.subItems_ar : crit.subItems_en)?.map((sub, sIdx) => (
                            <div key={sIdx} className={`flex items-center gap-2 text-[11px] text-stone-400 ${isAr ? 'flex-row-reverse' : ''}`}>
                              <span className="text-[#c99335] text-[10px]">✓</span>
                              <span>{sub}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Weight tag */}
                    <div className={`mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-stone-400 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <span>{isAr ? 'الوزن النسبي' : 'Relative Weight'}</span>
                      <span className="font-bold text-white">{crit.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── View 2: Detailed Deductions Matrix ── */}
            {activeViewMode === 'deductions' && (
              <div className="mt-8 space-y-6">
                <div className="p-4 rounded-xl bg-[#c99335]/10 border border-[#c99335]/20 text-xs text-[#f6cb7d] leading-relaxed flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#f6cb7d] shrink-0" />
                  <span>
                    {isAr
                      ? 'جدول الخصومات القياسي المعتمد في المنظومة الرقمية: يُسجل كل محكم الخصومات فورياً، وتُحسب الدرجات بصورة آلية دون تدخل بشري.'
                      : 'Official computerized deduction standard: Judges tap individual error triggers on their tablets, and composite scores are calculated automatically in real time.'}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {DEDUCTIONS_TABLE.map((section, sIdx) => (
                    <div key={sIdx} className="bg-black/60 border border-white/10 rounded-2xl p-6">
                      <h4 className={`font-serif font-bold text-base text-white mb-4 flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <Scale className="w-4 h-4 text-[#c99335] shrink-0" />
                        <span>{isAr ? section.category_ar : section.category_en}</span>
                      </h4>

                      <div className="space-y-3">
                        {section.items.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            className={`p-3 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-4 ${isAr ? 'flex-row-reverse text-right' : ''}`}
                          >
                            <div className="space-y-1">
                              <p className="text-xs sm:text-sm font-semibold text-stone-200">
                                {isAr ? item.error_ar : item.error_en}
                              </p>
                              <p className="text-[11px] text-stone-400 font-light">
                                {isAr ? item.note_ar : item.note_en}
                              </p>
                            </div>

                            <span className="shrink-0 font-mono font-bold text-rose-400 bg-rose-950/50 border border-rose-800/40 px-2.5 py-1 rounded-lg text-xs">
                              {isAr ? item.penalty_ar : item.penalty}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── View 3: Jury Protocol & Integrity ── */}
            {activeViewMode === 'jury' && (
              <div className="mt-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-black/60 border border-emerald-500/30">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/30">
                      <Users className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif font-bold text-white text-base mb-2">
                      {isAr ? 'هيئة تحكيم ثلاثية مستقلة' : 'Triple-Judge Bench'}
                    </h4>
                    <p className="text-xs text-stone-300 font-light leading-relaxed">
                      {isAr
                        ? 'تتكون لجنة التحكيم من ٣ قراء مجازين بالأسانيد المتصلة، يسجل كل منهم تقييمه باستقلالية تامة عبر جهاز لوحي منفصل.'
                        : 'Three independent certified Qira\'at scholars grade each recitation simultaneously on isolated electronic terminals.'}
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-black/60 border border-[#c99335]/30">
                    <div className="w-12 h-12 rounded-xl bg-[#c99335]/20 text-[#f6cb7d] flex items-center justify-center mb-4 border border-[#c99335]/30">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif font-bold text-white text-base mb-2">
                      {isAr ? 'خوارزمية رصد التباين الآلي' : 'Automated Outlier Detection'}
                    </h4>
                    <p className="text-xs text-stone-300 font-light leading-relaxed">
                      {isAr
                        ? 'عند وجود فارق يتجاوز ٥ درجات بين أي محكمين، يقوم النظام بإشعار رئيس اللجنة تلقائياً للمراجعة والتدقيق الفوري.'
                        : 'Any divergence exceeding 5% between judge scores automatically triggers a flagged review by the Chief Arbitrator.'}
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-black/60 border border-sky-500/30">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-4 border border-sky-500/30">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif font-bold text-white text-base mb-2">
                      {isAr ? 'سحب الأسئلة الرقمي العشوائي' : 'Computerized Question Draw'}
                    </h4>
                    <p className="text-xs text-stone-300 font-light leading-relaxed">
                      {isAr
                        ? 'تُسحب الأسئلة إلكترونياً وبصورة عشوائية أمام الحضور عبر شاشة المنصة لمنع أي انحياز أو تكرار مسبق.'
                        : 'Recitation test passages are drawn via cryptographic random selection on the auditorium screen in real time.'}
                    </p>
                  </div>
                </div>

                {/* Bottom Juror Oath Banner */}
                <div className={`p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-black/60 to-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isAr ? 'sm:flex-row-reverse text-right' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-serif font-bold text-sm text-white">
                        {isAr ? 'ميثاق الأمانة والحيادية المعتمد' : 'Solemn Oath of Impartiality'}
                      </h5>
                      <p className="text-xs text-stone-400 font-light mt-0.5">
                        {isAr
                          ? 'يؤدي كافة المحكمين قسماً شرعياً أمام الملأ بتحري أقصى درجات العدل والنزاهة، استجابةً لأمر الله تعالى.'
                          : 'Every panelist is bound by the religious pact of absolute equity and Quranic fidelity under the supervision of Jamia Mosque.'}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/80 px-3.5 py-1.5 rounded-lg border border-emerald-700/50 self-start sm:self-auto shrink-0 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>{isAr ? 'معتمد رسمياً' : 'Audited Protocol'}</span>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}
