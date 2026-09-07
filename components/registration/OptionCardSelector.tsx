'use client'

import React from 'react'
import { Building2, UserPlus, Zap, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react'
import type en from '@/dictionaries/en.json'

type Dict = typeof en

interface OptionCardSelectorProps {
  selectedOption: 1 | 2 | 3
  onSelectOption: (option: 1 | 2 | 3) => void
  dict: Dict
  lang: string
}

export default function OptionCardSelector({
  selectedOption,
  onSelectOption,
  dict,
  lang,
}: OptionCardSelectorProps) {
  const t = dict.registration_options
  const isAr = lang === 'ar'

  const options = [
    {
      id: 1 as const,
      tag: t.option1_tag,
      title: t.option1_title,
      desc: t.option1_desc,
      badge: t.option1_badge,
      badgeColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
      icon: Building2,
      accentBorder: 'hover:border-amber-500/50',
      activeBorder: 'border-[#c99335] shadow-[0_0_30px_rgba(201,147,53,0.25)] bg-gradient-to-b from-[#1f1914] to-[#120e0c]',
      warning: t.option1_warning,
    },
    {
      id: 2 as const,
      tag: t.option2_tag,
      title: t.option2_title,
      desc: t.option2_desc,
      badge: t.option2_badge,
      badgeColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
      icon: Zap,
      accentBorder: 'hover:border-emerald-500/50',
      activeBorder: 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.25)] bg-gradient-to-b from-[#0e1d16] to-[#120e0c]',
      recommended: true,
    },
    {
      id: 3 as const,
      tag: t.option3_tag,
      title: t.option3_title,
      desc: t.option3_desc,
      badge: t.option3_badge,
      badgeColor: 'text-sky-300 bg-sky-500/10 border-sky-500/30',
      icon: ShieldCheck,
      accentBorder: 'hover:border-sky-500/50',
      activeBorder: 'border-sky-500 shadow-[0_0_30px_rgba(14,165,233,0.25)] bg-gradient-to-b from-[#0c1822] to-[#120e0c]',
    },
  ]

  return (
    <div className="w-full mb-10">
      <div className={`text-center mb-8 ${isAr ? 'text-right' : ''}`}>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
          {t.section_title}
        </h2>
        <p className="text-stone-400 text-sm max-w-xl mx-auto">
          {t.section_subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.id
          const Icon = opt.icon

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectOption(opt.id)}
              className={`relative text-left p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                isAr ? 'text-right' : 'text-left'
              } ${
                isSelected
                  ? opt.activeBorder
                  : `bg-white/[0.03] border-white/10 ${opt.accentBorder} hover:bg-white/[0.06]`
              }`}
            >
              {/* Optional Recommended Ribbon */}
              {opt.recommended && (
                <div
                  className={`absolute -top-3 ${
                    isAr ? 'left-4' : 'right-4'
                  } flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-md`}
                >
                  <Sparkles size={12} />
                  <span>{isAr ? 'الأسرع' : 'Fast-Track'}</span>
                </div>
              )}

              <div>
                {/* Header Icon + Badge */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#c99335]/20 text-[#f6cb7d] border border-[#c99335]/40'
                        : 'bg-white/5 text-stone-300 border border-white/10'
                    }`}
                  >
                    <Icon size={22} />
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${opt.badgeColor}`}
                  >
                    {opt.badge}
                  </span>
                </div>

                {/* Tag & Title */}
                <span className="text-[11px] font-mono text-[#c99335] uppercase tracking-wider font-medium">
                  {opt.tag}
                </span>
                <h3 className="font-serif text-lg font-bold text-white mt-1 mb-2 leading-snug">
                  {opt.title}
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {opt.desc}
                </p>

                {/* Option 1 Warning Box */}
                {opt.warning && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-amber-200/90 text-xs">
                    <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-400" />
                    <p className="leading-snug text-[11px]">{opt.warning}</p>
                  </div>
                )}
              </div>

              {/* Radio Indicator at bottom */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className={`font-semibold ${isSelected ? 'text-white' : 'text-stone-500'}`}>
                  {isSelected ? (isAr ? 'الخيار المحدد' : 'Selected') : (isAr ? 'اضغط للاختيار' : 'Click to select')}
                </span>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-[#c99335] bg-[#c99335]'
                      : 'border-stone-600'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-stone-900" />}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
