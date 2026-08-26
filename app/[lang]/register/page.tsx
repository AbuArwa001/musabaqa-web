import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
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

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Image src="/images/jamia_logo.png" alt="Jamia Mosque Logo" width={80} height={80} className="w-20 h-20 object-contain drop-shadow-md" />
          </div>
          <h1 className="text-3xl font-bold text-jamia-dark mb-2">{dict.register.title}</h1>
          <p className="text-jamia-dark/60">{dict.register.subtitle}</p>
        </div>
        <RegisterForm dict={dict} regions={regions} lang={lang} />
      </div>
    </div>
  )
}
