'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connect = useCallback((categoryId: number) => {
    // Clean up existing socket
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
        setEntries(payload.entries)
        setLastUpdated(new Date())
      } catch {}
    }

    ws.onclose = () => {
      setWsStatus('disconnected')
      // Auto-reconnect after 3s
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

  const statusIndicator = {
    idle: null,
    connecting: (
      <span className="flex items-center gap-2 text-jamia-gold text-sm">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        {t.connecting}
      </span>
    ),
    connected: (
      <span className="flex items-center gap-2 text-jamia-emerald text-sm">
        <span className="live-dot" />
        {t.connected}
      </span>
    ),
    disconnected: (
      <span className="flex items-center gap-2 text-red-600 text-sm">
        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        {t.disconnected}
      </span>
    ),
  }[wsStatus]

  return (
    <div>
      {/* Category selector */}
      <div className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8 ${isAr ? 'sm:flex-row-reverse' : ''}`}>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedCategoryId === cat.id
                  ? 'bg-jamia-gold text-black shadow-lg shadow-amber-500/20'
                  : 'bg-jamia-dark/5 text-jamia-dark/80 hover:bg-jamia-dark/10'
              }`}
            >
              {isAr ? cat.name_ar : cat.name_en}
            </button>
          ))}
          {categories.length === 0 && (
            <p className="text-jamia-dark/50 text-sm">{t.select_category}</p>
          )}
        </div>

        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
          {statusIndicator}
          {lastUpdated && (
            <span className="text-jamia-dark/40 text-xs">
              {t.last_updated}: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      {entries.length === 0 ? (
        <div className="card text-center py-20">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-jamia-dark/60">{t.no_results}</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${isAr ? 'text-right' : 'text-left'}`}>
              <thead>
                <tr className="border-b border-jamia-dark/10 bg-white">
                  {[t.rank, t.student, t.institution, t.region, t.score].map((h) => (
                    <th
                      key={h}
                      className={`px-5 py-4 font-semibold text-jamia-dark/70 uppercase tracking-wider text-xs ${
                        isAr && h === t.score ? 'text-left' : ''
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr
                    key={entry.student_id}
                    className={`border-b border-jamia-dark/10 transition-colors hover:bg-white ${
                      i < 3 ? 'bg-jamia-gold/5' : ''
                    }`}
                  >
                    <td className="px-5 py-4">
                      <span className={`font-bold text-lg ${
                        entry.rank === 1 ? 'text-yellow-400' :
                        entry.rank === 2 ? 'text-slate-300' :
                        entry.rank === 3 ? 'text-amber-600' : 'text-jamia-dark/80'
                      }`}>
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-medium text-jamia-dark ${entry.consistency_flagged ? 'text-jamia-gold-hover' : ''}`}>
                        {entry.student_name}
                      </span>
                      {entry.consistency_flagged && (
                        <span className="ms-2 text-amber-500 text-xs" title={t.flagged}>⚠</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-jamia-dark/70">{entry.institution_name}</td>
                    <td className="px-5 py-4 text-jamia-dark/60 text-xs">
                      {entry.region_name_en || '—'}
                    </td>
                    <td className={`px-5 py-4 font-bold text-jamia-gold text-base ${isAr ? 'text-left' : 'text-right'}`}>
                      {entry.final_score.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
