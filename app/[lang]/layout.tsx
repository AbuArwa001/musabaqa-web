import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isValidLocale, getDictionary } from '@/lib/dictionaries'
import '@/app/globals.css'
import Navbar from '@/components/Navbar'

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ar' }]
}

export async function generateMetadata(props: PageProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await props.params
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: {
      default: 'Musabaqa — Quran Memorization Competition | Jamia Mosque Nairobi',
      template: '%s | Musabaqa',
    },
    description:
      lang === 'ar'
        ? 'مسابقة حفظ القرآن الكريم — مسجد جامع نيروبي'
        : 'Annual Quran Memorization Competition organised by Jamia Mosque Nairobi.',
    openGraph: {
      locale: lang === 'ar' ? 'ar_KE' : 'en_KE',
      type: 'website',
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<'/[lang]'> & { params: Promise<{ lang: string }> }) {
  const { lang } = await params

  if (!isValidLocale(lang)) notFound()

  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const dict = await getDictionary(lang)

  return (
    <html lang={lang} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Cinzel:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#120e0c] text-stone-300 antialiased font-sans select-none overflow-x-hidden">
        {/* Background ambient orbs for the whole site */}
        <div className="fixed top-[-10%] -left-20 w-[500px] h-[500px] bg-emerald-700/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="fixed bottom-[-10%] -right-20 w-[500px] h-[500px] bg-[#c99335]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(#c99335_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.02] pointer-events-none -z-10" />
        
        <Navbar lang={lang} dict={dict} />
        <main className="relative z-0">{children}</main>
        <footer className="relative z-10 border-t border-white/5 mt-24 py-10 text-center text-stone-500 text-sm">
          <p>© 2025 Jamia Mosque Nairobi — Musabaqa</p>
        </footer>
      </body>
    </html>
  )
}
