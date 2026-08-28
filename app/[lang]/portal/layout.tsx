import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { isValidLocale, getDictionary } from '@/lib/dictionaries'
import { getMyInstitution } from '@/lib/api'
import { Cinzel, Outfit } from 'next/font/google'
import PortalLayoutClient from '@/components/PortalLayoutClient'

export const dynamic = 'force-dynamic'

const cinzel = Cinzel({ variable: '--font-cinzel', subsets: ['latin'], display: 'swap' })
const outfit = Outfit({ variable: '--font-outfit', subsets: ['latin'], display: 'swap' })



export default async function PortalLayout({
  children,
  params,
}: LayoutProps<'/[lang]/portal'> & { params: Promise<{ lang: string }> }) {
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

  const dict = await getDictionary(lang)
  const isAr = lang === 'ar'

  return (
    <PortalLayoutClient
      lang={lang}
      dict={dict}
      institution={institution}
      isAr={isAr}
      cinzelVar={cinzel.variable}
      outfitVar={outfit.variable}
    >
      {children}
    </PortalLayoutClient>
  )
}
