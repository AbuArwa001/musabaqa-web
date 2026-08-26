'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { registerInstitution, ApiError } from '@/lib/api'
import type en from '@/dictionaries/en.json'

type Dict = typeof en

const schema = z.object({
  name: z.string().min(1),
  type: z.enum(['MADRASA', 'SCHOOL', 'MOSQUE', 'OTHER']),
  contact_person: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  confirm_password: z.string(),
  region_id: z.string().min(1),
  preferred_language: z.enum(['EN', 'AR']),
}).refine((d) => d.password === d.confirm_password, {
  message: 'mismatch',
  path: ['confirm_password'],
})

type FormData = z.infer<typeof schema>

interface Region { id: number; name_en: string; name_ar: string }

export default function RegisterForm({
  dict,
  regions,
  lang,
}: {
  dict: Dict
  regions: Region[]
  lang: string
}) {
  const t = dict.register
  const isAr = lang === 'ar'
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')
  const [step, setStep] = useState(1)

  const {
    register,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferred_language: isAr ? 'AR' : 'EN', type: '', region_id: '' } as any,
  })

  async function onSubmit(data: FormData) {
    setServerError('')
    try {
      await registerInstitution({
        name: data.name,
        type: data.type,
        contact_person: data.contact_person,
        phone: data.phone,
        email: data.email,
        password: data.password,
        region_id: parseInt(data.region_id),
        preferred_language: data.preferred_language,
      })
      setSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setServerError(t.errors.email_taken)
        else setServerError(dict.common.error)
      } else {
        setServerError(dict.common.error)
      }
    }
  }

  async function nextStep(fields: Array<keyof FormData>) {
    const valid = await trigger(fields)
    if (valid) setStep((s) => s + 1)
  }

  if (success) {
    return (
      <div className="card text-center py-16 px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 bg-jamia-emerald/10 text-jamia-emerald rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-jamia-dark mb-4">{t.success_title}</h2>
        <p className="text-jamia-dark/70 text-lg leading-relaxed max-w-sm mx-auto">{t.success_body}</p>
        <Link
          href={`/${lang}/login`}
          className="btn-primary inline-flex items-center justify-center gap-2 mt-10 w-full sm:w-auto px-8"
        >
          {dict.nav.login}
        </Link>
      </div>
    )
  }

  const inputClass = `input-field w-full transition-all duration-300 ${isAr ? 'text-right' : ''}`

  return (
    <div className="card p-8 sm:p-10 shadow-2xl border-jamia-gold/20 relative overflow-hidden bg-white/80 backdrop-blur-xl">
      {/* Step Indicator */}
      <div className={`flex items-center justify-between mb-10 relative z-10 ${isAr ? 'flex-row-reverse' : ''}`}>
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex items-center ${s < 3 ? 'flex-1' : ''} ${isAr && s < 3 ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                step >= s
                  ? 'bg-jamia-emerald text-white shadow-lg shadow-jamia-emerald/30 scale-110'
                  : 'bg-jamia-dark/5 text-jamia-dark/40'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
            {s < 3 && (
              <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
                step > s ? 'bg-jamia-emerald' : 'bg-jamia-dark/5'
              }`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="relative z-10" noValidate>
        
        {/* Step 1: Institution Details */}
        <div className={`space-y-6 transition-all duration-500 ${step === 1 ? 'block opacity-100 translate-x-0' : 'hidden opacity-0 h-0 overflow-hidden'}`}>
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-jamia-dark">{t.institution_name} & Details</h3>
            <p className="text-jamia-dark/60 text-sm mt-1">Let's start with your institution's core details.</p>
          </div>
          <div>
            <label className="label">{t.institution_name}</label>
            <input {...register('name')} className={inputClass} placeholder={t.institution_name} />
            {errors.name && <p className="error-text">{t.errors.name_required}</p>}
          </div>
          <div>
            <label className="label">{t.institution_type}</label>
            <select {...register('type')} className={inputClass}>
              <option value="" disabled>{t.institution_type}</option>
              <option value="MADRASA">{t.type_madrasa}</option>
              <option value="SCHOOL">{t.type_school}</option>
              <option value="MOSQUE">{t.type_mosque}</option>
              <option value="OTHER">{t.type_other}</option>
            </select>
            {errors.type && <p className="error-text">{t.errors.type_required}</p>}
          </div>
          <div>
            <label className="label">{t.region}</label>
            <select {...register('region_id')} className={inputClass}>
              <option value="" disabled>{t.select_region}</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{isAr ? r.name_ar : r.name_en}</option>
              ))}
            </select>
            {errors.region_id && <p className="error-text">{t.errors.region_required}</p>}
          </div>
          <button type="button" onClick={() => nextStep(['name', 'type', 'region_id'])} className="btn-primary w-full mt-4">
            Next Step
          </button>
        </div>

        {/* Step 2: Contact Info */}
        <div className={`space-y-6 transition-all duration-500 ${step === 2 ? 'block opacity-100 translate-x-0' : 'hidden opacity-0 h-0 overflow-hidden'}`}>
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-jamia-dark">{t.contact_person}</h3>
            <p className="text-jamia-dark/60 text-sm mt-1">Who should we reach out to for updates?</p>
          </div>
          <div>
            <label className="label">{t.contact_person}</label>
            <input {...register('contact_person')} className={inputClass} placeholder={t.contact_person} />
            {errors.contact_person && <p className="error-text">{t.errors.contact_required}</p>}
          </div>
          <div>
            <label className="label">{t.phone}</label>
            <input {...register('phone')} type="tel" className={inputClass} placeholder="+254..." dir="ltr" />
            {errors.phone && <p className="error-text">{t.errors.phone_required}</p>}
          </div>
          <div>
            <label className="label">{t.email}</label>
            <input {...register('email')} type="email" className={inputClass} placeholder="admin@madrasa.ke" dir="ltr" />
            {errors.email && (
              <p className="error-text">
                {errors.email.type === 'invalid_string' ? t.errors.email_invalid : t.errors.email_required}
              </p>
            )}
          </div>
          <div className="flex gap-4 mt-4">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
            <button type="button" onClick={() => nextStep(['contact_person', 'phone', 'email'])} className="btn-primary flex-1">Next Step</button>
          </div>
        </div>

        {/* Step 3: Security */}
        <div className={`space-y-6 transition-all duration-500 ${step === 3 ? 'block opacity-100 translate-x-0' : 'hidden opacity-0 h-0 overflow-hidden'}`}>
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-jamia-dark">Security & Preferences</h3>
            <p className="text-jamia-dark/60 text-sm mt-1">Set up your password and finish registration.</p>
          </div>
          <div>
            <label className="label">{t.password}</label>
            <input {...register('password')} type="password" className={inputClass} dir="ltr" />
            {errors.password && (
              <p className="error-text">
                {errors.password.type === 'too_small' ? t.errors.password_min : t.errors.password_required}
              </p>
            )}
          </div>
          <div>
            <label className="label">{t.confirm_password}</label>
            <input {...register('confirm_password')} type="password" className={inputClass} dir="ltr" />
            {errors.confirm_password && <p className="error-text">{t.errors.password_mismatch}</p>}
          </div>
          <div>
            <label className="label">{t.preferred_language}</label>
            <select {...register('preferred_language')} className={inputClass}>
              <option value="EN">{t.lang_en}</option>
              <option value="AR">{t.lang_ar}</option>
            </select>
          </div>

          {serverError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-600 text-sm text-center font-medium">
              {serverError}
            </div>
          )}

          <div className="flex gap-4 mt-4">
            <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? t.submitting : t.submit}
            </button>
          </div>
        </div>
      </form>

      <div className={`mt-8 pt-6 border-t border-jamia-dark/10 text-sm text-jamia-dark/50 text-center ${isAr ? 'text-right' : ''}`}>
        {t.already_registered}{' '}
        <Link href={`/${lang}/login`} className="text-jamia-gold font-semibold hover:text-jamia-gold-hover transition-colors">
          {t.login_link}
        </Link>
      </div>
    </div>
  )
}
