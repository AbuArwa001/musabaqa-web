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
    <nav className="sticky top-0 z-50 bg-jamia-cream/90 backdrop-blur-md border-b border-jamia-dark/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between h-16 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Logo */}
          <Link href={`/${lang}`} className="flex items-center gap-2 group">
            <Image src="/images/jamia_logo.png" alt="Jamia Mosque Logo" width={40} height={40} className="w-10 h-10 object-contain" />
            <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
              <span className="font-bold text-xl text-jamia-emerald leading-none">
                {isRTL ? 'المسابقة' : 'Musabaqa'}
              </span>
              <span className="text-[10px] text-jamia-dark/50 uppercase tracking-widest font-semibold mt-0.5">
                Jamia Mosque
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className={`hidden md:flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {links.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-jamia-gold/20 text-jamia-gold'
                      : 'text-jamia-dark/70 hover:text-jamia-dark hover:bg-jamia-dark/5'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right side controls */}
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Language switcher */}
            <Link
              href={altHref}
              className="px-3 py-1.5 text-xs font-semibold border border-jamia-dark/20 rounded-lg text-jamia-dark/80 hover:text-jamia-dark hover:border-amber-400/50 transition-colors"
              aria-label={`Switch to ${otherLang === 'ar' ? 'Arabic' : 'English'}`}
            >
              {otherLang === 'ar' ? 'العربية' : 'EN'}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-jamia-dark/70 hover:text-jamia-dark hover:bg-jamia-dark/5 transition-colors"
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
          <div className="md:hidden pb-4 border-t border-jamia-dark/10 pt-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                  pathname === link.href
                    ? 'bg-jamia-gold/20 text-jamia-gold'
                    : 'text-jamia-dark/80 hover:text-jamia-dark hover:bg-jamia-dark/5'
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
