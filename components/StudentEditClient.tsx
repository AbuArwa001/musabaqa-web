'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { updateStudent, ApiError } from '@/lib/api'
import type en from '@/dictionaries/en.json'

type Dict = typeof en

const schema = z.object({
  full_name: z.string().min(1),
  dob: z.string().min(1),
  gender: z.enum(['MALE', 'FEMALE']),
  guardian_phone: z.string().min(1),
  is_backup: z.boolean().optional(),
})
type FormData = z.infer<typeof schema>

interface Student {
  id: number
  category_id: number
  full_name: string
  dob: string
  gender: 'MALE' | 'FEMALE'
  national_id: string
  guardian_phone: string
  is_backup: boolean
}

interface Category {
  id: number
  name_en: string
  name_ar: string
}

export default function StudentEditClient({
  student,
  categories,
  dict,
  lang,
  token,
}: {
  student: Student
  categories: Category[]
  dict: Dict
  lang: string
  token: string
}) {
  const tf = dict.student_form
  const isAr = lang === 'ar'
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const cat = categories.find((c) => c.id === student.category_id)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: student.full_name,
      dob: student.dob,
      gender: student.gender,
      guardian_phone: student.guardian_phone,
      is_backup: student.is_backup,
    },
  })

  async function onSubmit(data: FormData) {
    setServerError('')
    try {
      await updateStudent(token, student.id, {
        full_name: data.full_name,
        dob: data.dob,
        gender: data.gender,
        guardian_phone: data.guardian_phone,
        is_backup: data.is_backup,
      })
      setSuccess(true)
      setTimeout(() => router.push(`/${lang}/portal/students`), 1500)
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : dict.common.error)
    }
  }

  const inputClass = `admin-input ${isAr ? 'text-right' : ''}`

  if (success) {
    return (
      <div className="admin-card text-center py-16">
        <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-serif text-lg font-bold text-gray-900 mb-1">Saved!</p>
        <p className="text-gray-400 text-sm">Redirecting back to students…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* ── Page Header ── */}
      <div className={isAr ? 'text-right' : ''}>
        <h1 className="font-serif text-2xl font-bold text-gray-900">{tf.edit_title}</h1>
        {cat && <p className="text-gray-500 text-sm mt-0.5">{isAr ? cat.name_ar : cat.name_en}</p>}
      </div>

      {/* ── Edit Form Card ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
            <span className="w-1.5 h-5 bg-[#006838] rounded-full" />
            <p className="text-sm font-semibold text-gray-700">Student Details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Full name */}
          <div>
            <label className="admin-label">{tf.full_name}</label>
            <p className="text-[11px] text-gray-400 mb-1.5">{tf.full_name_hint}</p>
            <input {...register('full_name')} className={inputClass} />
            {errors.full_name && <p className="admin-error">{tf.errors.name_required}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* DOB */}
            <div>
              <label className="admin-label">{tf.dob}</label>
              <input {...register('dob')} type="date" className={inputClass} dir="ltr" />
              {errors.dob && <p className="admin-error">{tf.errors.dob_required}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="admin-label">{tf.gender}</label>
              <select {...register('gender')} className={`admin-select ${isAr ? 'text-right' : ''}`}>
                <option value="MALE">{tf.gender_male}</option>
                <option value="FEMALE">{tf.gender_female}</option>
              </select>
            </div>
          </div>

          {/* Guardian phone */}
          <div>
            <label className="admin-label">{tf.guardian_phone}</label>
            <input {...register('guardian_phone')} type="tel" className={inputClass} dir="ltr" />
            {errors.guardian_phone && <p className="admin-error">{tf.errors.phone_required}</p>}
          </div>

          {/* Backup checkbox */}
          <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 ${isAr ? 'flex-row-reverse' : ''}`}>
            <input
              {...register('is_backup')}
              type="checkbox"
              id="backup"
              className="w-4 h-4 rounded accent-[#006838]"
            />
            <label htmlFor="backup" className="text-sm text-gray-700 cursor-pointer font-medium">
              {tf.is_backup}
            </label>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {serverError}
            </div>
          )}

          <div className={`flex gap-3 pt-2 border-t border-gray-100 ${isAr ? 'flex-row-reverse' : ''}`}>
            <button type="submit" disabled={isSubmitting} className="portal-btn-primary flex-1">
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {tf.submitting}
                </>
              ) : tf.submit}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="portal-btn-secondary"
            >
              {tf.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
