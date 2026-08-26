'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginInstitution, ApiError } from '@/lib/api'
import type en from '@/dictionaries/en.json'
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'

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
      // Store token via server action / API route
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
        setServerError(t.errors.invalid_credentials)
      } else {
        setServerError(dict.common.error)
      }
    }
  }

  const inputClass = `pl-10 ${isAr ? 'pr-10 pl-4' : 'pl-10'} h-11 w-full bg-stone-950/70 border border-stone-800 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-[#c99335] focus:ring-1 focus:ring-[#c99335] rounded-xl text-sm transition-all font-mono`

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label className="text-xs font-semibold text-stone-300 mb-1.5 block">{t.email}</label>
        <div className="relative">
          <Mail className={`w-4 h-4 absolute ${isAr ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none`} />
          <input {...register('email')} type="email" className={inputClass} placeholder="admin@madrasa.ke" dir="ltr" />
        </div>
        {errors.email && <p className="text-xs text-rose-400 font-medium pl-1 mt-1">{t.errors.email_required}</p>}
      </div>

      <div>
        <label className="text-xs font-semibold text-stone-300 mb-1.5 block">{t.password}</label>
        <div className="relative">
          <Lock className={`w-4 h-4 absolute ${isAr ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none`} />
          <input {...register('password')} type={showPassword ? 'text' : 'password'} className={`${inputClass} ${isAr ? 'pl-10 pr-10' : 'pr-10'}`} dir="ltr" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute ${isAr ? 'left-3.5' : 'right-3.5'} top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition-colors`}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-rose-400 font-medium pl-1 mt-1">{t.errors.password_required}</p>}
      </div>

      {serverError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
          {serverError}
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className="w-full h-12 mt-2 bg-gradient-to-r from-[#006838] via-emerald-600 to-[#004d29] hover:from-[#007c43] hover:to-[#005e32] text-white rounded-xl font-serif font-bold text-sm shadow-xl shadow-emerald-950/80 hover:shadow-emerald-900/60 disabled:opacity-60 transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.99]">
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
            <span>{t.submitting}</span>
          </>
        ) : (
          <>
            <span>{t.submit}</span>
            <ArrowRight className={`w-4 h-4 group-hover:${isAr ? '-translate-x-1' : 'translate-x-1'} transition-transform text-amber-300 ${isAr ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
        <p className={`text-xs text-stone-400 text-center ${isAr ? 'text-right' : ''}`}>
          {t.no_account}{' '}
          <Link href={`/${lang}/register`} className="text-[#c99335] hover:text-amber-300 transition-colors font-medium">
            {t.register_link}
          </Link>
        </p>
      </div>
    </form>
  )
}
