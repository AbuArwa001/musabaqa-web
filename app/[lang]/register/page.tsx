import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isValidLocale, getDictionary } from '@/lib/dictionaries'
import { listRegions } from '@/lib/api'
import RegisterForm from '@/components/RegisterForm'

export async function generateMetadata(props: PageProps<'/[lang]/register'>): Promise<Metadata> {
  const { lang } = await props.params
  return {
    title: lang === 'ar' ? 'تسجيل المؤسسة' : 'Register Institution',
    description: lang === 'ar'
      ? 'سجّل مؤسستك للمشاركة في مسابقة حفظ القرآن'
      : 'Register your institution to participate in the Musabaqa',
  }
}

export default async function RegisterPage(props: PageProps<'/[lang]/register'>) {
  const { lang } = await props.params
  if (!isValidLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  let regions: Array<{ id: number; name_en: string; name_ar: string }> = []
  try {
    regions = await listRegions()
  } catch {}

  const isAr = lang === 'ar'

  return (
    <div className="min-h-screen px-4 pt-28 pb-16">
      <div className="max-w-lg mx-auto">
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
          <h1 className="font-serif text-3xl font-bold text-white mb-2">{dict.register.title}</h1>
          <p className="text-stone-400">{dict.register.subtitle}</p>
        </div>

        <RegisterForm dict={dict} regions={regions} lang={lang} />
      </div>
    </div>
  )
}
