import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { isValidLocale, getDictionary } from '@/lib/dictionaries'
import LoginForm from '@/components/LoginForm'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function generateMetadata(props: PageProps<'/[lang]/login'>): Promise<Metadata> {
  const { lang } = await props.params
  return {
    title: lang === 'ar' ? 'تسجيل دخول المؤسسات | مسابقة مسجد جامع نيروبي' : 'Institution Portal Login | Jamia Mosque Musabaqa 2026',
    description: lang === 'ar'
      ? 'بوابة تسجيل دخول المدارس والمؤسسات القرآنية لإدارة المتسابقين وملف الاعتماد'
      : 'Official institutional login portal for madrasas and Islamic schools to manage candidate rosters and accreditation.',
  }
}

export default async function LoginPage(props: PageProps<'/[lang]/login'>) {
  const { lang } = await props.params
  if (!isValidLocale(lang)) notFound()

  // If already logged in, automatically proceed to the portal
  const store = await cookies()
  if (store.get('musabaqa_token')?.value) {
    redirect(`/${lang}/portal/students`)
  }

  const dict = await getDictionary(lang)
  const isAr = lang === 'ar'

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#120e0c] px-4 py-28 sm:px-6 lg:px-8 overflow-hidden font-sans select-none" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Background Image: Subtle Holy Quran on Rehal */}
      <div className="absolute inset-0 select-none pointer-events-none opacity-25">
        <Image
          src="/images/quran_rehal_hero.jpg"
          alt="Holy Quran Background"
          fill
          priority
          className="object-cover object-center filter brightness-[0.35] blur-[2px]"
        />
      </div>

      {/* Layered brand shading */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#120e0c] via-[#120e0c]/85 to-[#120e0c]/60 pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#c99335]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#c99335_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03] pointer-events-none" />

      {/* ── Main Split-Layout Container ── */}
      <div className="relative w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left / Info Column (5 Cols) */}
        <div className={`lg:col-span-5 space-y-6 text-center lg:text-left ${isAr ? 'lg:text-right' : ''}`}>
          
          {/* Emblem & Branding */}
          <div className="inline-flex items-center gap-3.5">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#1e1713] to-[#0c0908] border-2 border-[#c99335]/60 flex items-center justify-center shadow-xl shadow-black/60 p-2">
              <Image
                src="/images/jamia_logo.png"
                alt="Jamia Mosque Logo"
                width={56}
                height={56}
                priority
                className="object-contain"
              />
            </div>
            <div>
              <p className="font-serif text-xl font-bold text-white leading-tight">
                {isAr ? 'مسجد جامع نيروبي' : 'Jamia Mosque Nairobi'}
              </p>
              <p className="text-[11px] text-[#c99335] uppercase tracking-widest font-semibold font-mono">
                {isAr ? 'بوابة إدارة المؤسسات والمدارس' : 'Musabaqa Institutional Portal'}
              </p>
            </div>
          </div>

          {/* Quranic Verse Box */}
          <div className="p-5 rounded-2xl bg-black/40 border border-[#c99335]/30 backdrop-blur-xl shadow-lg">
            <p className="font-serif text-lg font-bold text-[#f6cb7d] leading-relaxed text-center" dir="rtl">
              ﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾
            </p>
            <p className="text-[11px] text-stone-400 text-center mt-1">
              {isAr ? 'سورة طه: ١١٤' : 'Surah Taha: 114 — "And say: My Lord, increase me in knowledge"'}
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3 hidden sm:block">
            <div className="flex items-center gap-3 text-xs text-stone-300 bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>{isAr ? 'تسجيل وإدارة حتى ٤ مرشحين من حفظة القرآن' : 'Register and manage up to 4 student contestants'}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-300 bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-[#c99335] font-bold">✓</span>
              <span>{isAr ? 'إرفاق ملفات وصور وفيديوهات التوثيق والاعتماد' : 'Accreditation dossier & rich media verification'}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-300 bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-sky-400 font-bold">✓</span>
              <span>{isAr ? 'متابعة نتائج التحكيم المباشرة وبطاقات المشاركة' : 'Real-time live jury scoring & student passes'}</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href={`/${lang}`}
              className="text-xs text-stone-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <span>&larr;</span> {isAr ? 'العودة إلى الصفحة الرئيسية' : 'Return to Public Homepage'}
            </Link>
          </div>
        </div>

        {/* Right / Login Card Column (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-gradient-to-br from-[#1c1613]/95 via-stone-900/95 to-black/95 backdrop-blur-2xl border border-[#c99335]/35 rounded-3xl p-7 sm:p-10 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
            
            {/* Ambient gold glow in top corner */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#c99335]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-2 mb-8 border-b border-white/10 pb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c99335]/15 border border-[#c99335]/30 text-[#f6cb7d] text-xs font-semibold uppercase tracking-wider">
                <span>🔐</span>
                <span>{isAr ? 'دخول معتمد' : 'Accredited Portal'}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {dict.login.title || 'Institution Sign In'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 font-light">
                {dict.login.subtitle || 'Enter your registered madrasa credentials to access your portal.'}
              </p>
            </div>

            {/* Form */}
            <LoginForm dict={dict} lang={lang} />
          </div>
        </div>

      </div>

    </div>
  )
}
