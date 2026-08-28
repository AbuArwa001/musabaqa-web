'use client'

import type en from '@/dictionaries/en.json'

type Dict = typeof en

interface Student {
  id: number
  category_id: number
  full_name: string
}

interface Category {
  id: number
  name_en: string
  name_ar: string
}

interface RoundResult {
  id: number
  round_id: number
  student_id: number
  final_score: number
  rank: number | null
  consistency_flagged: boolean
}

export default function PortalResultsClient({
  students,
  categories,
  resultsMap,
  dict,
  lang,
}: {
  students: Student[]
  categories: Category[]
  resultsMap: Record<number, RoundResult[]>
  dict: Dict
  lang: string
}) {
  const t = dict.portal
  const isAr = lang === 'ar'
  const hasAnyResults = Object.values(resultsMap).some((r) => r.length > 0)

  const getRankDisplay = (rank: number | null) => {
    if (rank === 1) return { emoji: '🥇', label: '1st', color: 'text-yellow-600' }
    if (rank === 2) return { emoji: '🥈', label: '2nd', color: 'text-gray-500' }
    if (rank === 3) return { emoji: '🥉', label: '3rd', color: 'text-amber-700' }
    return { emoji: null, label: rank ? `#${rank}` : '—', color: 'text-gray-500' }
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className={isAr ? 'text-right' : ''}>
        <h1 className="font-serif text-2xl font-bold text-gray-900">{t.results_title}</h1>
        <p className="text-gray-500 text-sm mt-0.5">{t.results_subtitle}</p>
      </div>

      {/* ── Empty state ── */}
      {!hasAnyResults && (
        <div className="admin-card text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-900 font-semibold mb-1">{t.no_results}</p>
          <p className="text-gray-400 text-sm">Results will appear here once scoring begins.</p>
        </div>
      )}

      {/* ── Results Cards ── */}
      <div className="space-y-4">
        {students.map((student) => {
          const cat = categories.find((c) => c.id === student.category_id)
          const results = resultsMap[student.id] || []
          if (results.length === 0) return null

          const best = results.reduce((a, b) => (a.final_score > b.final_score ? a : b), results[0])
          const rankInfo = getRankDisplay(best.rank)

          return (
            <div key={student.id} className="admin-card hover:border-[#006838]/30 transition-colors">
              {/* Student header row */}
              <div className={`flex items-center justify-between gap-4 mb-5 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                    {student.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className={isAr ? 'text-right' : ''}>
                    <h3 className="font-semibold text-gray-900 text-base">{student.full_name}</h3>
                    <p className="text-gray-500 text-sm">{cat ? (isAr ? cat.name_ar : cat.name_en) : '—'}</p>
                  </div>
                </div>

                {/* Best score */}
                <div className={`text-center ${isAr ? 'text-left' : 'text-right'}`}>
                  <p className="text-3xl font-bold text-[#006838]">{best.final_score.toFixed(1)}</p>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{t.score_label}</p>
                </div>
              </div>

              {/* Rank badge */}
              {best.rank && (
                <div className={`flex items-center gap-3 mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-semibold text-sm ${
                    best.rank === 1 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                    best.rank === 2 ? 'bg-gray-50 border-gray-200 text-gray-600' :
                    best.rank === 3 ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    'bg-gray-50 border-gray-200 text-gray-500'
                  }`}>
                    {rankInfo.emoji && <span className="text-base">{rankInfo.emoji}</span>}
                    <span>{t.rank_label} {best.rank}</span>
                  </div>
                  {best.consistency_flagged && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                      ⚠ {dict.leaderboard.flagged}
                    </span>
                  )}
                </div>
              )}

              {/* All rounds table */}
              {results.length > 1 && (
                <div className="border-t border-gray-100 pt-4">
                  <p className={`text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-3 ${isAr ? 'text-right' : ''}`}>
                    All Rounds
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className={`pb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide ${isAr ? 'text-right' : 'text-left'}`}>Round</th>
                          <th className={`pb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide ${isAr ? 'text-left' : 'text-right'}`}>Score</th>
                          <th className={`pb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide ${isAr ? 'text-left' : 'text-right'}`}>Rank</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {results.map((r) => (
                          <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-2.5 text-gray-700 font-medium">Round {r.round_id}</td>
                            <td className={`py-2.5 font-bold text-[#006838] ${isAr ? 'text-left' : 'text-right'}`}>
                              {r.final_score.toFixed(1)}
                            </td>
                            <td className={`py-2.5 text-gray-500 text-xs ${isAr ? 'text-left' : 'text-right'}`}>
                              {r.rank ? `#${r.rank}` : '—'}
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
        })}
      </div>
    </div>
  )
}
