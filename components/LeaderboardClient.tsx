'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getWsUrl } from '@/lib/api'
import type en from '@/dictionaries/en.json'

type Dict = typeof en

interface LeaderboardEntry {
  rank: number | null
  student_id: number
  student_name: string
  institution_id: number
  institution_name: string
  region_id: number | null
  region_name_en: string | null
  final_score: number
  consistency_flagged: boolean
}

interface LeaderboardPayload {
  category_id: number
  round_id: number
  entries: LeaderboardEntry[]
  broadcast_at: string
}

interface Category {
  id: number
  name_en: string
  name_ar: string
}

type WsStatus = 'idle' | 'connecting' | 'connected' | 'disconnected'

export default function LeaderboardClient({
  categories,
  dict,
  lang,
}: {
  categories: Category[]
  dict: Dict
  lang: string
}) {
  const t = dict.leaderboard
  const isAr = lang === 'ar'

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    categories[0]?.id ?? null
  )
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [wsStatus, setWsStatus] = useState<WsStatus>('idle')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connect = useCallback((categoryId: number) => {
    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.close()
    }
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current)

    setWsStatus('connecting')
    const url = getWsUrl(categoryId)
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => setWsStatus('connected')

    ws.onmessage = (event) => {
      try {
        const payload: LeaderboardPayload = JSON.parse(event.data)
        if (Array.isArray(payload.entries)) {
          // Sort by rank or score descending
          const sorted = [...payload.entries].sort((a, b) => (b.final_score || 0) - (a.final_score || 0))
          setEntries(sorted)
          setLastUpdated(new Date())
        }
      } catch (err) {
        console.error('Failed to parse leaderboard websocket event:', err)
      }
    }

    ws.onclose = () => {
      setWsStatus('disconnected')
      reconnectTimer.current = setTimeout(() => connect(categoryId), 3000)
    }

    ws.onerror = () => ws.close()
  }, [])

  useEffect(() => {
    if (selectedCategoryId === null) return
    connect(selectedCategoryId)
    return () => {
      wsRef.current?.close()
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    }
  }, [selectedCategoryId, connect])

  // Filter entries based on search query
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries
    const q = searchQuery.toLowerCase().trim()
    return entries.filter(
      (e) =>
        e.student_name.toLowerCase().includes(q) ||
        e.institution_name.toLowerCase().includes(q) ||
        (e.region_name_en && e.region_name_en.toLowerCase().includes(q))
    )
  }, [entries, searchQuery])

  // Podium contestants
  const top1 = entries[0]
  const top2 = entries[1]
  const top3 = entries[2]

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)

  return (
    <div className="space-y-10">

      {/* ── Category Selector Bar & Live Status Radar ── */}
      <div className="bg-gradient-to-b from-stone-900/80 to-black/60 border border-[#c99335]/25 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className={`flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${isAr ? 'lg:flex-row-reverse' : ''}`}>
          
          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap w-full lg:w-auto">
            {categories.map((cat) => {
              const active = selectedCategoryId === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategoryId(cat.id)
                    setEntries([])
                  }}
                  className={`relative px-5 py-3 rounded-2xl text-xs sm:text-sm font-serif font-bold transition-all duration-300 cursor-pointer overflow-hidden ${
                    active
                      ? 'bg-gradient-to-r from-[#c99335] to-amber-600 text-black shadow-[0_0_25px_rgba(201,147,53,0.4)] scale-105'
                      : 'bg-white/5 text-stone-300 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {isAr ? cat.name_ar : cat.name_en}
                  {active && (
                    <motion.div
                      layoutId="activeCategoryIndicator"
                      className="absolute inset-0 bg-white/20 pointer-events-none"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Live Radar Connection Badge */}
          <div className={`flex items-center gap-4 self-end lg:self-auto ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/50 border border-white/10 backdrop-blur-md">
              <span className={`w-2.5 h-2.5 rounded-full ${
                wsStatus === 'connected'
                  ? 'bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse'
                  : wsStatus === 'connecting'
                  ? 'bg-amber-400 shadow-[0_0_12px_#fbbf24] animate-pulse'
                  : 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'
              }`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                {wsStatus === 'connected'
                  ? (isAr ? 'بث النتائج مباشر' : 'Live Feed Active')
                  : wsStatus === 'connecting'
                  ? (isAr ? 'جارٍ الاتصال…' : 'Connecting…')
                  : (isAr ? 'غير متصل' : 'Disconnected')}
              </span>
            </div>

            {lastUpdated && (
              <span className="text-stone-500 text-xs font-mono hidden sm:inline">
                {isAr ? 'آخر تحديث: ' : 'Updated: '}
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>

        </div>
      </div>

      {/* ── Top 3 Winners Showcase Podium (When Results Exist) ── */}
      {entries.length > 0 && (
        <div className="py-6">
          <div className="text-center mb-8">
            <span className="text-[#c99335] uppercase tracking-[0.3em] text-xs font-semibold">
              {isAr ? 'المراكز الثلاثة الأولى' : 'Top 3 Podium Leaders'}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
              {isAr ? selectedCategory?.name_ar : selectedCategory?.name_en}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto items-end">
            
            {/* 🥈 2nd Place */}
            {top2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-gradient-to-b from-slate-900/90 to-black/80 border border-slate-400/30 rounded-3xl p-6 text-center shadow-xl relative order-2 md:order-1 hover:border-slate-300/60 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-slate-300/10 border border-slate-300/30 text-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                  🥈
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-600">
                  {isAr ? 'المركز الثاني' : '2nd Place'}
                </span>
                <h4 className="font-serif text-lg font-bold text-white mt-3 truncate">{top2.student_name}</h4>
                <p className="text-xs text-stone-400 truncate mt-0.5">{top2.institution_name}</p>
                <div className="mt-4 pt-3 border-t border-slate-700/50">
                  <span className="text-2xl font-serif font-bold text-slate-200">{top2.final_score.toFixed(1)}</span>
                  <span className="text-xs text-stone-500 ms-1">/ 100</span>
                </div>
              </motion.div>
            )}

            {/* 🥇 1st Place (Champion Centerpiece) */}
            {top1 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="bg-gradient-to-b from-amber-950/40 via-stone-900/90 to-black border-2 border-[#c99335] rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(201,147,53,0.25)] relative order-1 md:order-2 md:-translate-y-4 hover:shadow-[0_0_70px_rgba(201,147,53,0.35)] transition-all"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#c99335] to-amber-600 text-black font-bold text-xs shadow-lg uppercase tracking-widest">
                  👑 Champion
                </div>
                <div className="w-16 h-16 rounded-full bg-[#c99335]/20 border border-[#c99335]/50 text-3xl flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(201,147,53,0.3)] mt-2">
                  🥇
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#f6cb7d] bg-[#c99335]/20 px-3 py-1 rounded-full border border-[#c99335]/40">
                  {isAr ? 'المركز الأول' : '1st Place'}
                </span>
                <h4 className="font-serif text-xl font-bold text-white mt-3 truncate">{top1.student_name}</h4>
                <p className="text-xs text-[#f6cb7d]/90 font-medium truncate mt-0.5">{top1.institution_name}</p>
                <div className="mt-5 pt-4 border-t border-[#c99335]/30">
                  <span className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#f6cb7d] to-[#c99335]">
                    {top1.final_score.toFixed(1)}
                  </span>
                  <span className="text-xs text-stone-400 ms-1.5 font-sans">/ 100.0</span>
                </div>
              </motion.div>
            )}

            {/* 🥉 3rd Place */}
            {top3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-b from-stone-900/90 to-black/80 border border-amber-800/40 rounded-3xl p-6 text-center shadow-xl relative order-3 md:order-3 hover:border-amber-700/60 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-amber-900/20 border border-amber-700/30 text-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                  🥉
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800">
                  {isAr ? 'المركز الثالث' : '3rd Place'}
                </span>
                <h4 className="font-serif text-lg font-bold text-white mt-3 truncate">{top3.student_name}</h4>
                <p className="text-xs text-stone-400 truncate mt-0.5">{top3.institution_name}</p>
                <div className="mt-4 pt-3 border-t border-stone-800">
                  <span className="text-2xl font-serif font-bold text-amber-400">{top3.final_score.toFixed(1)}</span>
                  <span className="text-xs text-stone-500 ms-1">/ 100</span>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      )}

      {/* ── Search Bar & Filter ── */}
      {entries.length > 0 && (
        <div className={`flex items-center justify-between gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث باسم المتسابق أو المؤسسة أو المنطقة…' : 'Search contestant, madrasa, or region…'}
              className={`input-field w-full pl-10 text-xs sm:text-sm ${isAr ? 'text-right pr-10 pl-4' : ''}`}
            />
            <svg
              className={`w-4 h-4 text-stone-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3.5' : 'left-3.5'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="text-xs text-stone-400 font-mono">
            {filteredEntries.length} {isAr ? 'متسابقين' : 'Contestants'}
          </div>
        </div>
      )}

      {/* ── Table / Standings Feed ── */}
      {entries.length === 0 ? (
        <div className="card text-center py-20 px-6 border-[#c99335]/20 relative overflow-hidden">
          <div className="w-20 h-20 bg-[#c99335]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#c99335]/30 shadow-[0_0_40px_rgba(201,147,53,0.15)]">
            <span className="text-4xl">📜</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-white mb-2">
            {isAr ? 'في انتظار بدء جولات التحكيم' : 'Live Tabulation In Progress'}
          </h3>
          <p className="text-stone-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-6 font-light">
            {isAr
              ? 'سيتم بث النتائج والدرجات مباشرة هنا فور اعتمادها من قبل لجنة التحكيم في مسجد جامع.'
              : 'Official round scores will broadcast here the instant each judge submits their evaluation.'}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="live-dot" />
            <span>{t.connected}</span>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden p-0 border-[#c99335]/20 shadow-2xl">
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${isAr ? 'text-right' : 'text-left'}`}>
              <thead>
                <tr className="border-b border-white/10 bg-gradient-to-r from-stone-900 via-[#181310] to-stone-900">
                  <th className="px-6 py-4 font-serif font-bold text-xs uppercase tracking-wider text-stone-400">
                    {t.rank}
                  </th>
                  <th className="px-6 py-4 font-serif font-bold text-xs uppercase tracking-wider text-stone-400">
                    {t.student}
                  </th>
                  <th className="px-6 py-4 font-serif font-bold text-xs uppercase tracking-wider text-stone-400">
                    {t.institution}
                  </th>
                  <th className="px-6 py-4 font-serif font-bold text-xs uppercase tracking-wider text-stone-400">
                    {t.region}
                  </th>
                  <th className={`px-6 py-4 font-serif font-bold text-xs uppercase tracking-wider text-[#c99335] ${isAr ? 'text-left' : 'text-right'}`}>
                    {t.score}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {filteredEntries.map((entry, i) => {
                    const isTop1 = entry.rank === 1
                    const isTop2 = entry.rank === 2
                    const isTop3 = entry.rank === 3

                    return (
                      <motion.tr
                        key={entry.student_id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.03 }}
                        className={`transition-colors hover:bg-stone-800/60 ${
                          isTop1
                            ? 'bg-[#c99335]/10 font-semibold'
                            : isTop2
                            ? 'bg-slate-500/5'
                            : isTop3
                            ? 'bg-amber-900/5'
                            : ''
                        }`}
                      >
                        {/* Rank */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center font-bold text-sm ${
                            isTop1 ? 'w-8 h-8 rounded-full bg-amber-400/20 text-yellow-400 border border-yellow-400/40 shadow-[0_0_12px_rgba(250,204,21,0.3)]' :
                            isTop2 ? 'w-8 h-8 rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/40' :
                            isTop3 ? 'w-8 h-8 rounded-full bg-amber-600/20 text-amber-500 border border-amber-600/40' :
                            'text-stone-400 font-mono'
                          }`}>
                            {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${entry.rank ?? i + 1}`}
                          </span>
                        </td>

                        {/* Student Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a1512] to-[#0a0807] border border-[#c99335]/30 flex items-center justify-center text-xs font-bold text-[#f6cb7d] shrink-0">
                              {entry.student_name ? entry.student_name[0].toUpperCase() : 'C'}
                            </div>
                            <div className="min-w-0">
                              <span className={`font-bold text-sm block truncate text-white ${entry.consistency_flagged ? 'text-amber-300' : ''}`}>
                                {entry.student_name}
                              </span>
                              <span className="text-[11px] font-mono text-stone-500">REF-{String(entry.student_id).padStart(4, '0')}</span>
                            </div>
                            {entry.consistency_flagged && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium" title={t.flagged}>
                                ⚠ Audit
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Institution Name */}
                        <td className="px-6 py-4 text-stone-300 text-xs sm:text-sm font-medium">
                          {entry.institution_name}
                        </td>

                        {/* Region */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs text-stone-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            {entry.region_name_en || 'Nairobi'}
                          </span>
                        </td>

                        {/* Final Score */}
                        <td className={`px-6 py-4 whitespace-nowrap ${isAr ? 'text-left' : 'text-right'}`}>
                          <span className="text-lg sm:text-xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#f6cb7d] to-[#c99335]">
                            {entry.final_score.toFixed(1)}
                          </span>
                          <span className="text-xs text-stone-500 ms-1 font-sans">pts</span>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
