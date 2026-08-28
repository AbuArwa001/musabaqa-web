'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginInstitution, ApiError } from '@/lib/api'
import type en from '@/dictionaries/en.json'
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from 'lucide-react'

type Dict = typeof en

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

type FormData = z.infer<typeof schema>

export default function LoginForm({ dict, lang }: { dict: Dict; lang: string }) {
  const t = dict.login
  const isAr = lang === 'ar'
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setServerError('')
    try {
      const { access_token } = await loginInstitution(data.email, data.password)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: access_token }),
      })
      if (!res.ok) throw new Error('Session error')
      router.push(`/${lang}/portal/students`)
      router.refresh()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setServerError(isAr ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password. Please try again.')
      } else {
        setServerError(dict.common.error || 'Authentication error. Please try again.')
      }
    }
  }

  const inputClass = `h-12 w-full bg-black/60 border border-white/10 text-white placeholder:text-stone-500 focus:outline-none focus:border-[#c99335] focus:ring-2 focus:ring-[#c99335]/20 rounded-xl text-sm transition-all shadow-inner font-mono ${
    isAr ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'
  }`

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      
      {/* Email Field */}
      <div>
        <label className="text-xs font-semibold text-stone-300 mb-2 flex items-center justify-between">
          <span>{t.email}</span>
          <span className="text-[10px] text-stone-500 font-mono">Madrasa / School Email</span>
        </label>
        <div className="relative">
          <div className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3.5' : 'left-3.5'} text-stone-400 pointer-events-none`}>
            <Mail className="w-4 h-4 text-[#c99335]/80" />
          </div>
          <input
            {...register('email')}
            type="email"
            className={inputClass}
            placeholder="ustadh@madrasa.ke"
            dir="ltr"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-rose-400 font-medium mt-1.5 flex items-center gap-1">
            <span>⚠</span> {t.errors.email_required}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <div className={`flex items-center justify-between mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
          <label className="text-xs font-semibold text-stone-300 block">{t.password}</label>
          <span className="text-[10px] text-stone-500">Secure Access</span>
        </div>
        <div className="relative">
          <div className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3.5' : 'left-3.5'} text-stone-400 pointer-events-none`}>
            <Lock className="w-4 h-4 text-[#c99335]/80" />
          </div>
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            className={`${inputClass} ${isAr ? 'pl-11 pr-11' : 'pr-11 pl-11'}`}
            placeholder="••••••••••••"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'left-3.5' : 'right-3.5'} text-stone-400 hover:text-white transition-colors cursor-pointer p-1`}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-rose-400 font-medium mt-1.5 flex items-center gap-1">
            <span>⚠</span> {t.errors.password_required}
          </p>
        )}
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 text-rose-300 text-xs flex items-center gap-2.5">
          <span className="text-sm">⚠️</span>
          <span>{serverError}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white rounded-xl font-serif font-bold text-sm shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] disabled:opacity-60 transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.99] border border-emerald-500/30"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#f6cb7d]" />
            <span>{t.submitting}</span>
          </>
        ) : (
          <>
            <span>{t.submit}</span>
            <ArrowRight className={`w-4 h-4 text-[#f6cb7d] group-hover:${isAr ? '-translate-x-1' : 'translate-x-1'} transition-transform ${isAr ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-white/5 space-y-3">
        <p className={`text-xs text-stone-400 text-center ${isAr ? 'text-right' : ''}`}>
          {t.no_account}{' '}
          <Link
            href={`/${lang}/register`}
            className="text-[#c99335] hover:text-[#f6cb7d] font-bold transition-colors underline-offset-4 hover:underline"
          >
            {t.register_link} &rarr;
          </Link>
        </p>

        <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Jamia Mosque Committee 256-bit Encrypted Session</span>
        </div>
      </div>
    </form>
  )
}
