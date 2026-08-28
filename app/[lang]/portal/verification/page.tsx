import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { isValidLocale, getDictionary } from '@/lib/dictionaries'
import { getMyInstitution } from '@/lib/api'
import VerificationClient from '@/components/VerificationClient'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return {
    title: lang === 'ar' ? 'ملف التوثيق والاعتماد | مسابقة مسجد جامع نيروبي' : 'Accreditation & Media Dossier | Jamia Mosque Musabaqa',
  }
}

export default async function VerificationPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isValidLocale(lang)) notFound()

  const store = await cookies()
  const token = store.get('musabaqa_token')?.value
  if (!token) redirect(`/${lang}/login`)

  let institution = null
  try {
    institution = await getMyInstitution(token)
  } catch {
    redirect(`/${lang}/login`)
  }

  if (!institution) redirect(`/${lang}/login`)

  const dict = await getDictionary(lang)

  return (
    <VerificationClient
      institution={institution}
      dict={dict}
      lang={lang}
      token={token}
    />
  )
}
