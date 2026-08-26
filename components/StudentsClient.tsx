'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createStudent, updateStudent, ApiError } from '@/lib/api'
import type en from '@/dictionaries/en.json'

type Dict = typeof en

type ReviewStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'

interface Student {
  id: number
  category_id: number
  full_name: string
  dob: string
  gender: 'MALE' | 'FEMALE'
  national_id: string
  guardian_phone: string
  review_status: ReviewStatus
  rejection_reason: string | null
  is_backup: boolean
}

interface Category {
  id: number
  name_en: string
  name_ar: string
  min_age: number | null
  max_age: number
}

interface Institution {
  id: number
  name: string
}

const studentSchema = z.object({
  full_name: z.string().min(1),
  dob: z.string().min(1),
  gender: z.enum(['MALE', 'FEMALE']),
  national_id: z.string().min(1),
  guardian_phone: z.string().min(1),
  category_id: z.string().min(1),
  is_backup: z.boolean().optional(),
})

type StudentFormData = z.infer<typeof studentSchema>

function statusBadge(status: ReviewStatus, dict: Dict) {
  const t = dict.portal
  const map = {
    PENDING_REVIEW: { label: t.student_status_pending, cls: 'badge-pending' },
    APPROVED: { label: t.student_status_approved, cls: 'badge-approved' },
    REJECTED: { label: t.student_status_rejected, cls: 'badge-rejected' },
  }
  const { label, cls } = map[status]
  return <span className={cls}>{label}</span>
}

interface StudentsClientProps {
  initialStudents: Student[]
  categories: Category[]
  institution: Institution | null
  dict: Dict
  lang: string
  token: string
}

export default function StudentsClient({
  initialStudents,
  categories,
  institution,
  dict,
  lang,
  token,
}: StudentsClientProps) {
  const t = dict.portal
  const tf = dict.student_form
  const isAr = lang === 'ar'

  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<StudentFormData>({ resolver: zodResolver(studentSchema) })

  // Which categories already have a non-deleted student
  const filledCategoryIds = new Set(students.map((s) => s.category_id))
  const atCapacity = students.length >= 4

  function openAddForm() {
    reset({ is_backup: false })
    setEditingId(null)
    setShowForm(true)
    setServerError('')
  }

  function openEditForm(student: Student) {
    reset({
      full_name: student.full_name,
      dob: student.dob,
      gender: student.gender,
      national_id: student.national_id,
      guardian_phone: student.guardian_phone,
      category_id: String(student.category_id),
      is_backup: student.is_backup,
    })
    setEditingId(student.id)
    setShowForm(true)
    setServerError('')
  }

  async function onSubmit(data: StudentFormData) {
    setServerError('')
    try {
      const payload = {
        institution_id: institution!.id,
        category_id: parseInt(data.category_id),
        full_name: data.full_name,
        dob: data.dob,
        gender: data.gender,
        national_id: data.national_id,
        guardian_phone: data.guardian_phone,
        is_backup: data.is_backup || false,
      }
      if (editingId) {
        const updated = await updateStudent(token, editingId, payload)
        setStudents((prev) => prev.map((s) => (s.id === editingId ? (updated as Student) : s)))
      } else {
        const created = await createStudent(token, payload)
        setStudents((prev) => [...prev, created as Student])
      }
      setShowForm(false)
      reset()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setServerError(err.message)
        else setServerError(dict.common.error)
      } else {
        setServerError(dict.common.error)
      }
    }
  }

  const inputClass = `input-field ${isAr ? 'text-right' : ''}`

  return (
    <div>
      {/* Header row */}
      <div className={`flex items-center justify-between mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={isAr ? 'text-right' : ''}>
          <h2 className="text-2xl font-bold text-white">{t.students_title}</h2>
          <p className="text-stone-400 text-sm mt-1">{t.students_subtitle}</p>
        </div>
        {!atCapacity && (
          <button onClick={openAddForm} className="btn-primary flex items-center gap-2">
            <span>+</span>
            <span>{t.add_student}</span>
          </button>
        )}
        {atCapacity && (
          <span className="text-sm text-stone-400 border border-white/10 rounded-lg px-4 py-2">
            {t.student_limit_reached}
          </span>
        )}
      </div>

      {/* Student grid */}
      {students.length === 0 && !showForm && (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">👤</p>
          <p className="text-stone-400">{t.no_students}</p>
          <button onClick={openAddForm} className="btn-primary mt-6 inline-flex items-center gap-2">
            <span>+</span> {t.add_student}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {students.map((student) => {
          const cat = categories.find((c) => c.id === student.category_id)
          return (
            <div key={student.id} className="card hover:border-amber-500/30 transition-colors">
              <div className={`flex items-start justify-between gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-1 ${isAr ? 'text-right' : ''}`}>
                  <div className={`flex items-center gap-2 mb-1 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <h3 className="font-semibold text-white text-lg">{student.full_name}</h3>
                    {student.is_backup && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full px-2 py-0.5">
                        {t.backup_badge}
                      </span>
                    )}
                  </div>
                  <p className="text-stone-300 text-sm">
                    {cat ? (isAr ? cat.name_ar : cat.name_en) : '—'}
                  </p>
                  <p className="text-stone-500 text-xs mt-1">DOB: {student.dob}</p>
                </div>
                <div className={`flex flex-col items-end gap-2 ${isAr ? 'items-start' : ''}`}>
                  {statusBadge(student.review_status, dict)}
                  <button
                    onClick={() => openEditForm(student)}
                    className="text-xs text-jamia-gold hover:text-jamia-gold-hover transition-colors"
                  >
                    {t.edit_student}
                  </button>
                </div>
              </div>
              {student.rejection_reason && (
                <p className="text-xs text-red-400 mt-3 border-t border-white/10 pt-3">
                  {t.rejection_reason}: {student.rejection_reason}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Category availability legend */}
      {categories.length > 0 && (
        <div className={`flex flex-wrap gap-2 mb-8 ${isAr ? 'flex-row-reverse' : ''}`}>
          {categories.map((cat) => {
            const filled = filledCategoryIds.has(cat.id)
            return (
              <span
                key={cat.id}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  filled
                    ? 'bg-white/5 border-white/10 text-stone-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                }`}
              >
                {isAr ? cat.name_ar : cat.name_en}
                {filled && ` — ${t.category_slot_filled}`}
              </span>
            )
          })}
        </div>
      )}

      {/* Inline Add/Edit Form */}
      {showForm && (
        <div className="card mt-8 border-amber-500/30 bg-amber-900/10 shadow-[0_0_30px_rgba(201,147,53,0.1)]">
          <h3 className={`text-xl font-bold text-white mb-6 ${isAr ? 'text-right' : ''}`}>
            {editingId ? tf.edit_title : tf.add_title}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Full name — accepts Arabic */}
            <div>
              <label className="label">{tf.full_name}</label>
              <p className="text-xs text-stone-400 mb-2">{tf.full_name_hint}</p>
              <input
                {...register('full_name')}
                className={inputClass}
                placeholder={isAr ? 'أحمد محمد عبدالله' : 'Ahmad Mohamed'}
                // No dir override — accept both scripts
              />
              {errors.full_name && <p className="error-text">{tf.errors.name_required}</p>}
            </div>

            {/* DOB */}
            <div>
              <label className="label">{tf.dob}</label>
              <input {...register('dob')} type="date" className={inputClass} dir="ltr" />
              {errors.dob && <p className="error-text">{tf.errors.dob_required}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="label">{tf.gender}</label>
              <select {...register('gender')} className={inputClass}>
                <option value="">{tf.gender}</option>
                <option value="MALE">{tf.gender_male}</option>
                <option value="FEMALE">{tf.gender_female}</option>
              </select>
              {errors.gender && <p className="error-text">{tf.errors.gender_required}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="label">{tf.category}</label>
              <select {...register('category_id')} className={inputClass}>
                <option value="">{tf.select_category}</option>
                {categories.map((cat) => {
                  const alreadyFilled = filledCategoryIds.has(cat.id) &&
                    cat.id !== students.find((s) => s.id === editingId)?.category_id
                  return (
                    <option key={cat.id} value={cat.id} disabled={alreadyFilled}>
                      {isAr ? cat.name_ar : cat.name_en}
                      {alreadyFilled ? ` (${t.category_slot_filled})` : ''}
                    </option>
                  )
                })}
              </select>
              {errors.category_id && <p className="error-text">{tf.errors.category_required}</p>}
            </div>

            {/* National ID */}
            <div>
              <label className="label">National ID / Birth Cert No.</label>
              <input {...register('national_id')} className={inputClass} dir="ltr" />
            </div>

            {/* Guardian phone */}
            <div>
              <label className="label">{tf.guardian_phone}</label>
              <input {...register('guardian_phone')} type="tel" className={inputClass} dir="ltr" placeholder="+254..." />
              {errors.guardian_phone && <p className="error-text">{tf.errors.phone_required}</p>}
            </div>

            {/* Backup */}
            <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <input
                {...register('is_backup')}
                type="checkbox"
                id="is_backup"
                className="w-4 h-4 rounded accent-amber-400"
              />
              <label htmlFor="is_backup" className="text-sm text-stone-300 cursor-pointer">
                {tf.is_backup}
              </label>
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
                onClick={() => { setShowForm(false); setServerError('') }}
                className="btn-secondary"
              >
                {tf.cancel}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
