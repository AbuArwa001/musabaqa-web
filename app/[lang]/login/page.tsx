import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isValidLocale, getDictionary } from '@/lib/dictionaries'
import LoginForm from '@/components/LoginForm'

export async function generateMetadata(props: PageProps<'/[lang]/login'>): Promise<Metadata> {
  const { lang } = await props.params
  return {
    title: lang === 'ar' ? 'تسجيل الدخول' : 'Institution Login',
  }
}

export default async function LoginPage(props: PageProps<'/[lang]/login'>) {
  const { lang } = await props.params
  if (!isValidLocale(lang)) notFound()
  const dict = await getDictionary(lang)

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#120e0c] p-4 sm:p-6 lg:p-8 overflow-hidden font-sans select-none" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#c99335]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(#c99335_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />

      {/* Main Glassmorphic Container */}
      <div className="relative w-full max-w-lg z-10">
        
        {/* Top Mosque Emblem Badge */}
        <div className="text-center mb-6 space-y-3">
          <div className="inline-flex relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#c99335] via-emerald-500 to-[#c99335] rounded-2xl blur-md opacity-40 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a1512] to-[#0a0807] border border-[#c99335]/40 flex items-center justify-center shadow-2xl">
              <span className="font-serif text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#e39e3b] via-[#c99335] to-[#fcf9f2]">
                J
              </span>
            </div>
          </div>
          
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
              Jamia Mosque <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c99335] to-amber-300">Nairobi</span>
            </h1>
            <p className="text-xs text-[#c99335]/90 font-semibold uppercase tracking-widest mt-1">
              {dict.login.title}
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="bg-stone-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
          <div className="space-y-1 text-center border-b border-white/5 pb-4">
            <p className="text-xs text-stone-400">
              {dict.login.subtitle}
            </p>
          </div>
          <LoginForm dict={dict} lang={lang} />
        </div>
      </div>
    </div>
  )
}
