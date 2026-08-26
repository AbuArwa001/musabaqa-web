'use client'

import { useEffect, useState } from 'react'

interface CountdownProps {
  label: string
  target: Date
  dict: { days: string; hours: string; minutes: string; seconds: string }
  accent?: 'green' | 'amber' | 'gold'
}

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff === 0,
  }
}

export default function Countdown({ label, target, dict, accent = 'green' }: CountdownProps) {
  const [time, setTime] = useState(getTimeLeft(target))

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  const colorClass = {
    green: 'text-emerald-400',
    amber: 'text-jamia-gold',
    gold: 'text-yellow-400',
  }[accent]

  const units = [
    { value: time.days, label: dict.days },
    { value: time.hours, label: dict.hours },
    { value: time.minutes, label: dict.minutes },
    { value: time.seconds, label: dict.seconds },
  ]

  return (
    <div className="card text-center">
      <p className="text-sm text-jamia-dark/60 mb-4 uppercase tracking-wider">{label}</p>
      <div className="flex justify-center gap-3">
        {units.map(({ value, label: unitLabel }) => (
          <div key={unitLabel} className="flex flex-col items-center">
            <span className={`text-3xl sm:text-4xl font-bold tabular-nums ${colorClass}`}>
              {String(value).padStart(2, '0')}
            </span>
            <span className="text-xs text-jamia-dark/50 mt-1">{unitLabel}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
