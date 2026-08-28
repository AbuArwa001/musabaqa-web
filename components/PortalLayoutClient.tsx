'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

// types based on what layout provides
interface Institution {
  id: number
  name: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejection_reason?: string | null
}

interface PortalLayoutClientProps {
  children: React.ReactNode
  lang: string
  dict: any
  institution: Institution
  isAr: boolean
  cinzelVar: string
  outfitVar: string
}

export default function PortalLayoutClient({
  children,
  lang,
  dict,
  institution,
  isAr,
  cinzelVar,
  outfitVar,
}: PortalLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const status = institution.status

  // Close sidebar on route change - handled by Next.js navigation typically, but can be done simply by adding an onClick to links

  const NAV_ITEMS = [
    {
      href: `/${lang}/portal/verification`,
      labelKey: 'nav_verification',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      iconColor: 'text-[#c99335]',
    },
    {
      href: `/${lang}/portal/students`,
      labelKey: 'nav_students',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      iconColor: 'text-emerald-400',
    },
    {
      href: `/${lang}/portal/results`,
      labelKey: 'nav_results',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      iconColor: 'text-sky-400',
    },
    {
      href: `/${lang}/portal/notifications`,
      labelKey: 'nav_notifications',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      iconColor: 'text-amber-400',
    },
  ]

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-[#2d2520] bg-[#120e0c]">
        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#c99335]/60 flex items-center justify-center bg-black/50 shadow-md p-1 shrink-0">
            <Image
              src="/images/jamia_logo.png"
              alt="Jamia Mosque Logo"
              width={40}
              height={40}
              priority
              className="object-contain"
            />
          </div>
          <div className={isAr ? 'text-right' : ''}>
            <h1 className="font-serif text-lg font-bold tracking-tight text-white leading-tight">
              Jamia Musabaqa
            </h1>
            <p className="text-[11px] text-[#c99335] font-medium tracking-wider uppercase">
              {isAr ? 'بوابة المؤسسة' : 'Institution Portal'}
            </p>
          </div>
        </div>
        <div className={`mt-5 pt-4 border-t border-white/10 ${isAr ? 'text-right' : ''}`}>
          <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-1">
            {isAr ? 'المؤسسة' : 'Institution'}
          </p>
          <p className="text-sm text-gray-200 font-semibold leading-snug break-words">
            {institution.name}
          </p>
          <span
            className={`mt-2.5 inline-flex text-[10px] font-bold px-2.5 py-1 rounded-md border tracking-wide uppercase ${
              status === 'APPROVED'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : status === 'REJECTED'
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {status}
          </span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-5 px-4">
        <span className={`px-2 text-xs font-bold text-gray-500 uppercase tracking-widest block mb-3 ${isAr ? 'text-right' : ''}`}>
          {isAr ? 'القائمة الرئيسية' : 'Main Menu'}
        </span>
        <ul className="space-y-1.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.labelKey}>
              <Link
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-3 py-3 text-sm font-medium text-gray-300 rounded-xl hover:bg-white/10 hover:text-white transition-all ${isAr ? 'flex-row-reverse' : ''}`}
              >
                <span className={`${item.iconColor} p-1 bg-white/5 rounded-lg`}>{item.icon}</span>
                {dict.portal[item.labelKey]}
              </Link>
            </li>
          ))}
        </ul>
        <div className="pt-5 mt-4 border-t border-white/10">
          <Link
            href={`/${lang}`}
            className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-[#f6cb7d] bg-[#c99335]/15 hover:bg-[#c99335]/30 border border-[#c99335]/40 rounded-xl transition-all ${isAr ? 'flex-row-reverse' : ''}`}
          >
            <span className="p-1">🌐</span>
            <span className="flex-1">{isAr ? 'الموقع العام للمسابقة' : 'View Public Website'}</span>
            <span className="text-[10px] opacity-75">↗</span>
          </Link>
        </div>
      </nav>
      <div className="p-4 border-t border-[#2d2520] bg-[#120e0c]">
        <form action="/api/logout" method="POST" className="w-full">
          <button
            type="submit"
            className={`flex w-full items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-900/50 hover:bg-rose-900/80 rounded-xl transition-colors cursor-pointer ${isAr ? 'flex-row-reverse' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {dict.nav.logout}
          </button>
        </form>
      </div>
    </>
  )

  return (
    <div className={`flex h-screen bg-gray-50 overflow-hidden font-sans ${cinzelVar} ${outfitVar} ${isAr ? 'flex-row-reverse' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex w-72 bg-[#1a1512] text-white flex-col h-full flex-shrink-0 shadow-2xl z-20 ${isAr ? 'border-l border-[#2d2520]' : 'border-r border-[#2d2520]'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar & Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: isAr ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isAr ? '100%' : '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className={`fixed top-0 bottom-0 ${isAr ? 'right-0' : 'left-0'} w-[280px] bg-[#1a1512] text-white flex flex-col shadow-2xl z-50 md:hidden`}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50 relative">
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/80 h-16 flex items-center justify-between px-4 sm:px-6 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex-shrink-0 z-10 sticky top-0">
          <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <span className="hidden sm:block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <h2 className="font-serif text-sm sm:text-base font-bold text-gray-900 truncate max-w-[200px] sm:max-w-none">
              {isAr ? 'بوابة المؤسسة' : 'Institution Portal'}
            </h2>
          </div>

          <div className={`flex items-center gap-2 sm:gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
            {status === 'PENDING' && (
              <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <p className="text-amber-700 font-bold text-[10px] sm:text-xs uppercase tracking-wide">{dict.portal.status_pending}</p>
              </div>
            )}
            {status === 'REJECTED' && (
              <div className="hidden sm:flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <p className="text-red-700 font-bold text-[10px] sm:text-xs uppercase tracking-wide">{dict.portal.status_rejected}</p>
              </div>
            )}

            <Link
              href={`/${lang}`}
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-[#c99335]/40 bg-[#c99335]/10 text-stone-800 hover:bg-[#c99335] hover:text-white transition-all shadow-sm ${isAr ? 'flex-row-reverse' : ''}`}
            >
              <span>🌐</span>
              <span>{isAr ? 'الموقع العام' : 'Public Site'}</span>
              <span className="text-[10px]">↗</span>
            </Link>

            <Link
              href={`/${lang === 'en' ? 'ar' : 'en'}/portal/students`}
              className="text-xs font-bold text-gray-500 hover:text-emerald-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
            >
              {lang === 'en' ? 'العربية' : 'EN'}
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          {status === 'REJECTED' && institution.rejection_reason && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-white border border-red-200 rounded-2xl p-5 shadow-sm">
              <p className="text-red-700 text-sm font-medium flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <span>
                  <span className="font-bold">{dict.portal.reason_label}:</span>{' '}
                  {institution.rejection_reason}
                </span>
              </p>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
