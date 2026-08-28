'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import type en from '@/dictionaries/en.json'

type Dict = typeof en

interface HomeHeroProps {
  lang: string
  dict: Dict
}

export default function HomeHero({ lang, dict }: HomeHeroProps) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 120])
  const opacity = useTransform(scrollY, [0, 350], [1, 0])

  const t = dict.home
  const isAr = lang === 'ar'

  return (
    <section className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden bg-[#120e0c]">
      
      {/* ── Parallax Background with Quran on Rehal & Gold/Grey Shading ── */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 z-0 w-full h-[120%]"
      >
        {/* Background Image: Holy Quran on Rehal Stand */}
        <div className="absolute inset-0 select-none pointer-events-none">
          <Image
            src="/images/quran_rehal_hero.jpg"
            alt="Holy Quran on ornate wooden Rehal book stand"
            fill
            priority
            className="object-cover object-center scale-105 filter brightness-[0.42] contrast-[1.12] saturate-[0.95]"
          />
        </div>

        {/* Layered brand shading: Premium goldish grey and dark obsidian overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#120e0c] via-[#120e0c]/75 to-[#120e0c]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(201,147,53,0.22),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_90%,rgba(0,104,56,0.2),transparent_70%)]" />
        
        {/* Fine gold noise grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#c99335_1px,transparent_1px)] [background-size:64px_64px] opacity-[0.04]" />
      </motion.div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-28 pb-16 w-full max-w-5xl mx-auto">

        {/* Emblem & Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="mb-8 relative w-24 h-24 flex items-center justify-center"
        >
          <div className="absolute -inset-4 rounded-full bg-[#c99335]/15 blur-xl" />
          <div className="absolute -inset-2 rounded-full bg-gradient-to-b from-[#c99335]/30 to-emerald-600/20 blur-md" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-[#1e1713]/90 to-[#0c0908]/90 border border-[#c99335]/50 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(201,147,53,0.25)] backdrop-blur-md">
            <span className="font-serif text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#f8d697] via-[#c99335] to-[#fcf9f2]">
              م
            </span>
          </div>
        </motion.div>

        {/* Quranic Verse Ribbon in Hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 px-5 py-2 rounded-full bg-black/40 border border-[#c99335]/30 backdrop-blur-md mb-6 shadow-lg"
        >
          <span className="font-serif text-sm sm:text-base font-bold text-[#f6cb7d] tracking-wide">
            ﴿ إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ ﴾
          </span>
          <span className="hidden sm:inline text-stone-600">•</span>
          <span className="text-[11px] sm:text-xs text-stone-400 font-sans">
            {isAr ? 'سورة الإسراء: ٩' : 'Al-Isra: 9 — "Indeed, this Quran guides to what is most upright"'}
          </span>
        </motion.div>

        {/* Eyebrow Label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="inline-flex items-center justify-center gap-4 mb-4"
        >
          <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#c99335]/60" />
          <span className="text-[#c99335] uppercase tracking-[0.35em] text-xs sm:text-sm font-semibold font-sans">
            {isAr ? 'مسجد جامع نيروبي' : 'Jamia Mosque Nairobi'}
          </span>
          <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#c99335]/60" />
        </motion.div>

        {/* Giant Watermark & Main Heading */}
        <div className="relative flex justify-center items-center w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.04 }}
            transition={{ duration: 2 }}
            className="absolute text-[260px] sm:text-[360px] md:text-[440px] font-serif text-[#c99335] leading-none top-1/2 -translate-y-1/2 pointer-events-none select-none"
          >
            {isAr ? 'م' : 'M'}
          </motion.div>

          <div className="relative z-10 space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
              className="text-6xl sm:text-8xl lg:text-9xl font-serif text-white tracking-widest uppercase drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
            >
              {isAr ? 'مسابقة' : 'Musabaqa'}
            </motion.h1>
          </div>
        </div>

        {/* Gold Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          className="mt-3 text-[#c99335] text-lg md:text-2xl font-serif tracking-widest uppercase font-semibold"
        >
          {isAr ? 'مسابقة حفظ القرآن الكريم وتجويده' : 'Quran Memorization & Recitation Competition 2026'}
        </motion.p>

        {/* Sub-description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
          className="mt-5 text-base sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed font-light font-sans"
        >
          {t.about_body}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0, ease: 'easeOut' }}
          className={`pt-8 flex flex-col sm:flex-row items-center justify-center gap-4 ${isAr ? 'sm:flex-row-reverse' : ''}`}
        >
          <Link
            href={`/${lang}/register`}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 rounded-xl hover:from-emerald-500 hover:to-emerald-700 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.6)] active:scale-95 overflow-hidden border border-emerald-500/30"
          >
            <span className="relative flex items-center gap-2">
              {t.register_cta}
              <svg
                className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </Link>

          <Link
            href={`/${lang}/leaderboard`}
            className="px-8 py-4 font-bold text-stone-200 transition-all duration-300 bg-black/40 border border-[#c99335]/30 rounded-xl backdrop-blur-md hover:bg-black/60 hover:text-white hover:border-[#c99335]/60 hover:shadow-[0_0_30px_rgba(201,147,53,0.15)] active:scale-95 font-sans"
          >
            {dict.nav.leaderboard}
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-white/40 text-[10px] uppercase tracking-widest mb-1.5 font-sans">Explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-[1px] h-10 bg-gradient-to-b from-[#c99335] to-transparent"
        />
      </motion.div>
    </section>
  )
}
