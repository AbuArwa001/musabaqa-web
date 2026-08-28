'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function Footer({ lang }: { lang: string }) {
  const pathname = usePathname()
  const isAr = lang === 'ar'

  // Do not render public footer on portal dashboard routes
  if (pathname?.includes('/portal')) {
    return null
  }

  return (
    <footer className="relative z-10 border-t border-white/10 mt-24 py-12 bg-black/40 backdrop-blur-md text-stone-400 text-sm">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#c99335]/40 flex items-center justify-center bg-black/60 p-0.5">
            <Image
              src="/images/jamia_logo.png"
              alt="Jamia Mosque Logo"
              width={30}
              height={30}
              className="object-contain"
            />
          </div>
          <div className={isAr ? 'text-right' : 'text-left'}>
            <p className="font-serif font-bold text-white text-sm">
              {isAr ? 'مسجد جامع نيروبي' : 'Jamia Mosque Nairobi'}
            </p>
            <p className="text-[11px] text-[#c99335] font-mono">
              Quran Memorization Competition 2026
            </p>
          </div>
        </div>

        {/* Links */}
        <div className={`flex items-center gap-6 text-xs text-stone-400 ${isAr ? 'flex-row-reverse' : ''}`}>
          <Link href={`/${lang}`} className="hover:text-[#c99335] transition-colors">
            {isAr ? 'الرئيسية' : 'Home'}
          </Link>
          <Link href={`/${lang}/leaderboard`} className="hover:text-[#c99335] transition-colors">
            {isAr ? 'لوحة الشرف' : 'Leaderboard'}
          </Link>
          <Link href={`/${lang}/login`} className="hover:text-[#c99335] transition-colors">
            {isAr ? 'دخول المؤسسات' : 'Portal Login'}
          </Link>
          <Link href={`/${lang}/register`} className="hover:text-[#c99335] transition-colors">
            {isAr ? 'تسجيل مؤسسة جديدة' : 'Register Madrasa'}
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-xs text-stone-500 font-mono text-center sm:text-right">
          © {new Date().getFullYear()} Jamia Mosque Committee
        </p>

      </div>
    </footer>
  )
}
