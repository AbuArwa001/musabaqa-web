'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type en from '@/dictionaries/en.json'

type Dict = typeof en

export default function PortalNav({ lang, dict }: { lang: string; dict: Dict }) {
  const pathname = usePathname()
  const t = dict.portal
  const isAr = lang === 'ar'

  const tabs = [
    { href: `/${lang}/portal/students`, label: t.nav_students, icon: '👥' },
    { href: `/${lang}/portal/results`, label: t.nav_results, icon: '📊' },
    { href: `/${lang}/portal/notifications`, label: t.nav_notifications, icon: '🔔' },
  ]

  return (
    <nav className={`flex flex-wrap gap-2 pb-0 ${isAr ? 'flex-row-reverse' : ''}`}>
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-2xl transition-all duration-300 backdrop-blur-md border ${
              active
                ? 'border-amber-400/50 text-[#c99335] bg-gradient-to-br from-amber-400/10 to-amber-600/5 shadow-[0_0_15px_rgba(201,147,53,0.15)]'
                : 'border-white/5 text-stone-400 bg-white/5 hover:text-white hover:bg-white/10 hover:border-white/10'
            } ${isAr ? 'flex-row-reverse' : ''}`}
          >
            <span className={active ? 'drop-shadow-md' : 'opacity-70'}>{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
