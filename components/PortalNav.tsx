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
    <nav className={`flex gap-1 border-b border-jamia-dark/10 pb-0 ${isAr ? 'flex-row-reverse' : ''}`}>
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-xl border-b-2 transition-all duration-150 ${
              active
                ? 'border-amber-400 text-jamia-gold bg-amber-400/5'
                : 'border-transparent text-jamia-dark/60 hover:text-jamia-dark hover:bg-white'
            } ${isAr ? 'flex-row-reverse' : ''}`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
