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

  const inputClass = `input-field ${isAr ? 'text-right' : ''}`

  return (
    <div>
      <div className={`mb-6 ${isAr ? 'text-right' : ''}`}>
        <h1 className="text-2xl font-bold text-jamia-dark">{tf.edit_title}</h1>
        <p className="text-jamia-dark/60 text-sm mt-1">
          {cat ? (isAr ? cat.name_ar : cat.name_en) : ''}
        </p>
      </div>

      {success ? (
        <div className="card text-center py-10">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-jamia-dark font-semibold">Saved! Redirecting…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5" noValidate>
          <div>
            <label className="label">{tf.full_name}</label>
            <p className="text-xs text-jamia-dark/50 mb-1">{tf.full_name_hint}</p>
            <input {...register('full_name')} className={inputClass} />
            {errors.full_name && <p className="error-text">{tf.errors.name_required}</p>}
          </div>

          <div>
            <label className="label">{tf.dob}</label>
            <input {...register('dob')} type="date" className={inputClass} dir="ltr" />
            {errors.dob && <p className="error-text">{tf.errors.dob_required}</p>}
          </div>

          <div>
            <label className="label">{tf.gender}</label>
            <select {...register('gender')} className={inputClass}>
              <option value="MALE">{tf.gender_male}</option>
              <option value="FEMALE">{tf.gender_female}</option>
            </select>
          </div>

          <div>
            <label className="label">{tf.guardian_phone}</label>
            <input {...register('guardian_phone')} type="tel" className={inputClass} dir="ltr" />
            {errors.guardian_phone && <p className="error-text">{tf.errors.phone_required}</p>}
          </div>

          <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
            <input {...register('is_backup')} type="checkbox" id="backup" className="w-4 h-4 rounded accent-amber-400" />
            <label htmlFor="backup" className="text-sm text-jamia-dark/80 cursor-pointer">{tf.is_backup}</label>
          </div>

          {serverError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-600 text-sm">
              {serverError}
            </div>
          )}

          <div className={`flex gap-3 pt-2 ${isAr ? 'flex-row-reverse' : ''}`}>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? tf.submitting : tf.submit}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              {tf.cancel}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
