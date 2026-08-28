'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import type en from '@/dictionaries/en.json'

type Dict = typeof en

interface NavbarProps {
  lang: string
  dict: Dict
}

const linkVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export default function Navbar({ lang, dict }: NavbarProps) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isRTL = lang === 'ar'

  const otherLang = lang === 'en' ? 'ar' : 'en'
  const altHref = pathname ? pathname.replace(/^\/(en|ar)/, `/${otherLang}`) : `/${otherLang}`

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Do not render public navbar on portal dashboard routes
  if (pathname?.includes('/portal')) {
    return null
  }

  const navLinks = [
    { name: dict.nav.home, href: `/${lang}` },
    { name: dict.nav.leaderboard, href: `/${lang}/leaderboard` },
    { name: dict.nav.login, href: `/${lang}/login` },
  ]

  const renderLinkGroup = (links: { name: string; href: string }[]) =>
    links.map((link, index) => {
      const isActive =
        link.href === `/${lang}`
          ? pathname === link.href
          : pathname.startsWith(link.href)

      return (
        <div key={link.name} className="flex items-center">
          <motion.div variants={linkVariants}>
            <Link
              href={link.href}
              className={`relative py-1 transition-all duration-300 font-serif tracking-widest whitespace-nowrap text-[13px] md:text-[14px] uppercase ${
                isActive
                  ? 'text-[#c99335] drop-shadow-[0_0_10px_rgba(201,147,53,0.5)]'
                  : 'text-white/90 hover:text-white drop-shadow-md'
              } group`}
            >
              {link.name}
              <span
                className={`absolute left-0 -bottom-1 w-full h-[1px] bg-gradient-to-r from-transparent via-[#c99335] to-transparent transform origin-center transition-transform duration-500 ${
                  isActive
                    ? 'scale-x-100 opacity-100'
                    : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                }`}
              />
            </Link>
          </motion.div>

          {/* Dot separator */}
          {index < links.length - 1 && (
            <motion.span
              variants={linkVariants}
              className="mx-4 text-[#c99335]/40 text-xs select-none"
            >
              •
            </motion.span>
          )}
        </div>
      )
    })

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-gradient-to-b from-[#1a1512]/95 to-[#1a1512]/80 backdrop-blur-xl border-b border-[#c99335]/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)] py-4'
            : 'bg-gradient-to-b from-black/60 via-black/20 to-transparent py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Desktop Navigation */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className={`hidden md:flex items-center justify-between relative ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {/* Jamia Brand Logo */}
            <Link href={`/${lang}`} className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#c99335]/40 shadow-md group-hover:border-[#c99335] transition-all">
                <img
                  src="/images/jamia_logo.png"
                  alt="Jamia Mosque Logo"
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <span className="font-serif text-sm font-bold text-white tracking-wider block leading-tight">
                  {isRTL ? 'مسجد جامع نيروبي' : 'JAMIA MOSQUE'}
                </span>
                <span className="text-[10px] text-[#c99335] uppercase tracking-widest font-mono block">
                  Musabaqa 2026
                </span>
              </div>
            </Link>

            <div className={`flex items-center justify-center flex-wrap gap-y-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {renderLinkGroup(navLinks)}
            </div>

            {/* Register CTA — pinned right */}
            <div className="flex items-center gap-3">
              {/* Language switcher */}
              <Link
                href={altHref}
                className="px-3 py-1 text-xs font-semibold border border-white/20 rounded-full text-stone-400 hover:text-white hover:border-[#c99335]/60 hover:bg-[#c99335]/10 transition-all font-sans"
                aria-label={`Switch to ${otherLang === 'ar' ? 'Arabic' : 'English'}`}
              >
                {otherLang === 'ar' ? 'العربية' : 'EN'}
              </Link>

              <Link
                href={`/${lang}/register`}
                className="bg-gradient-to-r from-[#cca04b] to-[#b88c3a] text-white px-7 py-2 rounded-full font-serif text-[12px] tracking-[0.15em] uppercase shadow-sm hover:shadow-[0_0_20px_rgba(204,160,75,0.5)] hover:scale-105 transition-all duration-300 border border-[#e3ca8c]/30"
              >
                {dict.nav.register}
              </Link>
            </div>
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center justify-between h-8">
            {/* Mobile logo */}
            <Link href={`/${lang}`} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#c99335]/40 flex items-center justify-center shadow-lg bg-black/40">
                <img
                  src="/images/jamia_logo.png"
                  alt="Jamia Mosque Logo"
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <span className="font-serif text-sm font-bold text-white tracking-wide">Jamia Musabaqa</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-[#c99335] transition-colors p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10 shadow-lg"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[60px] left-0 w-full bg-[#1a1512]/98 backdrop-blur-2xl border-b border-[#c99335]/20 z-40 md:hidden overflow-hidden shadow-2xl"
          >
            <div className={`flex flex-col px-6 py-6 space-y-1 ${isRTL ? 'items-end' : ''}`}>
              {[...navLinks, { name: dict.nav.register, href: `/${lang}/register` }].map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-3.5 px-4 rounded-xl text-sm font-serif tracking-[0.2em] uppercase transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#c99335]/20 to-transparent text-[#c99335] border-l-2 border-[#c99335]'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white hover:pl-6'
                    } ${isRTL ? 'text-right border-l-0 border-r-2' : ''}`}
                  >
                    {link.name}
                  </Link>
                )
              })}

              {/* Language switcher mobile */}
              <div className={`pt-4 border-t border-white/10 ${isRTL ? 'text-right' : ''}`}>
                <Link
                  href={altHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-2 text-xs text-stone-400 hover:text-white transition-colors font-semibold"
                >
                  <span className="w-4 h-4 text-[#c99335]">🌐</span>
                  {otherLang === 'ar' ? 'العربية' : 'English'}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
