'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
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
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-[#1a1512]">
      {/* Parallax Background Gradient */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 z-0 w-full h-[120%]"
      >
        {/* Layered radial gradients simulating a mosque atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(201,147,53,0.18),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_80%,rgba(0,104,56,0.15),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-[#120e0c] via-[#120e0c]/60 to-transparent" />

        {/* Decorative geometric pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#c99335_1px,transparent_1px)] [background-size:60px_60px] opacity-[0.03]" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-24 w-full max-w-5xl mx-auto">

        {/* Emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="mb-10 relative w-24 h-24 flex items-center justify-center"
        >
          {/* Glow rings */}
          <div className="absolute -inset-4 rounded-full bg-[#c99335]/10 blur-xl" />
          <div className="absolute -inset-2 rounded-full bg-gradient-to-b from-[#c99335]/20 to-emerald-600/10 blur-md" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-[#1a1512] to-[#0a0807] border border-[#c99335]/40 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(201,147,53,0.15)] backdrop-blur-md">
            <span className="font-serif text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#e39e3b] via-[#c99335] to-[#fcf9f2]">
              م
            </span>
          </div>
        </motion.div>

        {/* Eyebrow label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="inline-flex items-center justify-center gap-4 mb-6"
        >
          <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#c99335]/60" />
          <span className="text-[#c99335] uppercase tracking-[0.35em] text-xs sm:text-sm font-semibold font-sans">
            {isAr ? 'مسجد جامع نيروبي' : 'Jamia Mosque Nairobi'}
          </span>
          <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#c99335]/60" />
        </motion.div>

        {/* Giant watermark letter */}
        <div className="relative flex justify-center items-center w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.03 }}
            transition={{ duration: 2 }}
            className="absolute text-[260px] sm:text-[360px] md:text-[440px] font-serif text-white leading-none top-1/2 -translate-y-1/2 pointer-events-none select-none"
          >
            {isAr ? 'م' : 'M'}
          </motion.div>

          {/* Main heading */}
          <div className="relative z-10 space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
              className="text-6xl sm:text-8xl lg:text-9xl font-serif text-white tracking-widest uppercase drop-shadow-2xl"
            >
              {isAr ? 'مسابقة' : 'Musabaqa'}
            </motion.h1>
          </div>
        </div>

        {/* Gold tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
          className="mt-4 text-[#c99335] text-lg md:text-2xl font-serif tracking-widest uppercase"
        >
          {isAr ? 'مسابقة حفظ القرآن الكريم' : 'Quran Memorization Competition'}
        </motion.p>

        {/* Sub-description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
          className="mt-6 text-lg sm:text-xl text-stone-400 max-w-2xl mx-auto leading-relaxed font-light font-sans"
        >
          {t.about_body}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1, ease: 'easeOut' }}
          className={`pt-10 flex flex-col sm:flex-row items-center justify-center gap-4 ${isAr ? 'sm:flex-row-reverse' : ''}`}
        >
          <Link
            href={`/${lang}/register`}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-xl hover:from-emerald-500 hover:to-emerald-700 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] active:scale-95 overflow-hidden"
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
            className="px-8 py-4 font-bold text-stone-300 transition-all duration-300 bg-stone-900/50 border border-white/10 rounded-xl backdrop-blur-md hover:bg-stone-800/80 hover:text-white hover:border-white/20 active:scale-95 font-sans"
          >
            {dict.nav.leaderboard}
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-white/40 text-xs uppercase tracking-widest mb-2 font-sans">Discover</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-[1px] h-12 bg-gradient-to-b from-[#c99335] to-transparent"
        />
      </motion.div>
    </section>
  )
}
