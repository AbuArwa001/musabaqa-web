'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type en from '@/dictionaries/en.json'

type Dict = typeof en

interface NavbarProps {
  lang: string
  dict: Dict
}

export default function Navbar({ lang, dict }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [, startTransition] = useTransition()
  const isRTL = lang === 'ar'

  const otherLang = lang === 'en' ? 'ar' : 'en'
  // Build the same page in the other locale
  const altHref = pathname.replace(/^\/(en|ar)/, `/${otherLang}`)

  const isPortal = pathname.includes('/portal')
  const isLoggedIn = false // determined client-side from cookie presence — we use portal layout guard

  const links = [
    { href: `/${lang}`, label: dict.nav.home },
    { href: `/${lang}/leaderboard`, label: dict.nav.leaderboard },
    { href: `/${lang}/register`, label: dict.nav.register },
    { href: `/${lang}/login`, label: dict.nav.login },
  ]

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    startTransition(() => router.push(`/${lang}/login`))
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#120e0c]/70 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between h-20 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Logo */}
          <Link href={`/${lang}`} className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a1512] to-[#0a0807] border border-[#c99335]/30 flex items-center justify-center shadow-lg group-hover:border-[#c99335]/60 transition-colors">
              <span className="font-serif text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#e39e3b] via-[#c99335] to-[#fcf9f2]">
                J
              </span>
            </div>
            <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
              <span className="font-serif font-bold text-xl text-white tracking-wide group-hover:text-amber-200 transition-colors">
                {isRTL ? 'المسابقة' : 'Musabaqa'}
              </span>
              <span className="text-[10px] text-[#c99335] uppercase tracking-widest font-semibold mt-0.5">
                Jamia Mosque
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className={`hidden md:flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {links.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-r from-[#c99335]/20 to-amber-500/10 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_-3px_rgba(201,147,53,0.3)]'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right side controls */}
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Language switcher */}
            <Link
              href={altHref}
              className="px-3 py-1.5 text-xs font-semibold border border-white/10 rounded-lg text-stone-400 hover:text-white hover:border-[#c99335]/50 hover:bg-[#c99335]/10 transition-all"
              aria-label={`Switch to ${otherLang === 'ar' ? 'Arabic' : 'English'}`}
            >
              {otherLang === 'ar' ? 'العربية' : 'EN'}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-white/10 pt-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors mb-2 ${
                  pathname === link.href
                    ? 'bg-gradient-to-r from-[#c99335]/20 to-amber-500/10 text-amber-300 border border-amber-500/30'
                    : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'
                } ${isRTL ? 'text-right' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
