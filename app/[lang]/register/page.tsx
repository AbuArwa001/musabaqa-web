import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isValidLocale, getDictionary } from '@/lib/dictionaries'
import {
  listCounties,
  listRegions,
  listInstitutionDirectory,
  listCompetitions,
  listCategories,
  type County,
  type Region,
  type InstitutionDirectoryItem,
  type CompetitionRead,
  type Category,
} from '@/lib/api'
import RegisterClient from '@/components/registration/RegisterClient'

export async function generateMetadata(props: PageProps<'/[lang]/register'>): Promise<Metadata> {
  const { lang } = await props.params
  return {
    title: lang === 'ar' ? 'تسجيل المؤسسات والمتسابقين' : 'Institution & Contestant Registration',
    description: lang === 'ar'
      ? 'سجّل مؤسستك أو طلابك للمشاركة في مسابقة حفظ القرآن الكريم'
      : 'Register your madrasa or candidate students for the annual Quran Musabaqa',
  }
}

export default async function RegisterPage(props: PageProps<'/[lang]/register'>) {
  const { lang } = await props.params
  if (!isValidLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  const [counties, regions, institutions, competitions, categories] = await Promise.all([
    listCounties().catch(() => [] as County[]),
    listRegions().catch(() => [] as Region[]),
    listInstitutionDirectory().catch(() => [] as InstitutionDirectoryItem[]),
    listCompetitions().catch(() => [] as CompetitionRead[]),
    listCategories().catch(() => [] as Category[]),
  ])

  const isAr = lang === 'ar'

  return (
    <div className="min-h-screen px-4 pt-28 pb-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-10 ${isAr ? 'text-right' : ''}`}>
          {/* Logo emblem */}
          <div className="flex justify-center mb-8">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute -inset-3 rounded-full bg-[#c99335]/10 blur-xl" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-[#1a1512] to-[#0a0807] border border-[#c99335]/40 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(201,147,53,0.1)]">
                <span className="font-serif text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#e39e3b] via-[#c99335] to-[#fcf9f2]">
                  {isAr ? 'م' : 'M'}
                </span>
              </div>
            </div>
          </div>
          {/* Gold divider label */}
          <div className="inline-flex items-center justify-center gap-4 mb-4">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#c99335]/50" />
            <span className="text-[#c99335] uppercase tracking-[0.3em] text-xs font-semibold font-sans">
              {isAr ? 'مسجد جامع نيروبي' : 'Jamia Mosque Nairobi'}
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#c99335]/50" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">
            {dict.register.title}
          </h1>
          <p className="text-stone-400 max-w-xl mx-auto text-sm sm:text-base">
            {dict.register.subtitle}
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-12 text-stone-500">Loading registration options...</div>}>
          <RegisterClient
            counties={counties}
            regions={regions}
            institutions={institutions}
            competitions={competitions}
            categories={categories}
            dict={dict}
            lang={lang}
          />
        </Suspense>
      </div>
    </div>
  )
}
