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

  return (
    <div>
      <div className={`mb-6 ${isAr ? 'text-right' : ''}`}>
        <h2 className="text-2xl font-bold text-white">{t.results_title}</h2>
        <p className="text-stone-400 text-sm mt-1">{t.results_subtitle}</p>
      </div>

      {!hasAnyResults && (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-stone-400">{t.no_results}</p>
        </div>
      )}

      <div className="space-y-4">
        {students.map((student) => {
          const cat = categories.find((c) => c.id === student.category_id)
          const results = resultsMap[student.id] || []
          if (results.length === 0) return null

          const best = results.reduce((a, b) => (a.final_score > b.final_score ? a : b), results[0])

          return (
            <div key={student.id} className="card">
              <div className={`flex items-center justify-between mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className={isAr ? 'text-right' : ''}>
                  <h3 className="font-semibold text-white text-lg">{student.full_name}</h3>
                  <p className="text-stone-400 text-sm">
                    {cat ? (isAr ? cat.name_ar : cat.name_en) : '—'}
                  </p>
                </div>
                <div className={`text-center ${isAr ? 'text-left' : 'text-right'}`}>
                  <p className="text-3xl font-bold text-jamia-gold">{best.final_score.toFixed(1)}</p>
                  <p className="text-xs text-white/50">{t.score_label}</p>
                </div>
              </div>

              {best.rank && (
                <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-2xl">
                    {best.rank === 1 ? '🥇' : best.rank === 2 ? '🥈' : best.rank === 3 ? '🥉' : `#${best.rank}`}
                  </span>
                  <span className="text-white/70 text-sm">{t.rank_label} {best.rank}</span>
                  {best.consistency_flagged && (
                    <span className="text-jamia-gold text-xs">⚠ {dict.leaderboard.flagged}</span>
                  )}
                </div>
              )}

              {results.length > 1 && (
                <div className="mt-4 border-t border-jamia-dark/10 pt-4">
                  <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">All Rounds</p>
                  <div className="flex gap-3 flex-wrap">
                    {results.map((r) => (
                      <div key={r.id} className="bg-white border border-jamia-dark/10 rounded-lg px-3 py-2 text-center">
                        <p className="text-sm font-semibold text-jamia-gold">{r.final_score.toFixed(1)}</p>
                        <p className="text-xs text-white/50">Round {r.round_id}</p>
                      </div>
                    ))}
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
