'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createStudent, updateStudent, getStudentPdfUrl, ApiError } from '@/lib/api'
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
    PENDING_REVIEW: { label: t.student_status_pending, cls: 'admin-badge-pending' },
    APPROVED:       { label: t.student_status_approved, cls: 'admin-badge-approved' },
    REJECTED:       { label: t.student_status_rejected, cls: 'admin-badge-rejected' },
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

  const filledCategoryIds = new Set(students.map((s) => s.category_id))
  const atCapacity = students.length >= 4

  function openAddForm() {
    reset({ is_backup: false })
    setEditingId(null)
    setShowForm(true)
    setServerError('')
    // Smooth scroll to form
    setTimeout(() => document.getElementById('student-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
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
    setTimeout(() => document.getElementById('student-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
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

  const inputClass = `admin-input ${isAr ? 'text-right' : ''}`
  const selectClass = `admin-select ${isAr ? 'text-right' : ''}`

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={isAr ? 'text-right' : ''}>
          <h1 className="font-serif text-2xl font-bold text-gray-900">{t.students_title}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t.students_subtitle}</p>
        </div>
        {!atCapacity && (
          <button
            onClick={openAddForm}
            className="portal-btn-primary"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t.add_student}
          </button>
        )}
        {atCapacity && (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.student_limit_reached}
          </span>
        )}
      </div>

      {/* ── Category availability pills ── */}
      {categories.length > 0 && (
        <div className={`flex flex-wrap gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
          {categories.map((cat) => {
            const filled = filledCategoryIds.has(cat.id)
            return (
              <span
                key={cat.id}
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium ${
                  filled
                    ? 'bg-gray-50 border-gray-200 text-gray-400'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${filled ? 'bg-gray-300' : 'bg-emerald-400'}`} />
                {isAr ? cat.name_ar : cat.name_en}
                {filled && ` — ${t.category_slot_filled}`}
              </span>
            )
          })}
        </div>
      )}

      {/* ── Empty state ── */}
      {students.length === 0 && !showForm && (
        <div className="admin-card text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-900 font-semibold mb-1">{t.no_students}</p>
          <p className="text-gray-400 text-sm mb-6">Add your first student to get started.</p>
          <button onClick={openAddForm} className="portal-btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t.add_student}
          </button>
        </div>
      )}

      {/* ── Student Cards Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {students.map((student) => {
          const cat = categories.find((c) => c.id === student.category_id)
          return (
            <div
              key={student.id}
              className="admin-card hover:border-[#006838]/30 hover:shadow-md transition-all duration-200"
            >
              <div className={`flex items-start gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                  {student.full_name.charAt(0).toUpperCase()}
                </div>

                <div className={`flex-1 min-w-0 ${isAr ? 'text-right' : ''}`}>
                  <div className={`flex items-center gap-2 mb-1 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
                    <h3 className="font-semibold text-gray-900 text-base leading-tight">{student.full_name}</h3>
                    {student.is_backup && (
                      <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 rounded-full px-2 py-0.5 font-semibold">
                        {t.backup_badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">{cat ? (isAr ? cat.name_ar : cat.name_en) : '—'}</p>
                  <p className="text-gray-400 text-xs mt-0.5">DOB: {student.dob}</p>
                </div>

                <div className={`flex flex-col items-end gap-2 flex-shrink-0 ${isAr ? 'items-start' : ''}`}>
                  {statusBadge(student.review_status, dict)}
                  <div className={`flex items-center gap-1.5 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch(getStudentPdfUrl(student.id), {
                            headers: token ? { Authorization: `Bearer ${token}` } : {}
                          })
                          if (res.ok) {
                            const blob = await res.blob()
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `REF_${String(student.id).padStart(5, '0')}_${student.full_name.replace(/\s+/g, '_')}_Dossier.pdf`
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                            URL.revokeObjectURL(url)
                          } else {
                            alert(isAr ? 'فشل تحميل ملف المرشح' : 'Failed to download candidate dossier PDF')
                          }
                        } catch (e) {
                          console.error(e)
                          alert(isAr ? 'حدث خطأ أثناء تحميل الملف' : 'An error occurred downloading dossier')
                        }
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF
                    </button>
                    <button
                      onClick={() => openEditForm(student)}
                      className="text-[11px] text-[#006838] hover:text-[#004d29] font-semibold px-2 py-1 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    >
                      {t.edit_student}
                    </button>
                  </div>
                </div>
              </div>

              {student.rejection_reason && (
                <div className="mt-3 pt-3 border-t border-red-100">
                  <p className="text-xs text-red-600 font-medium">
                    <span className="font-bold">{t.rejection_reason}:</span> {student.rejection_reason}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Add/Edit Form ── */}
      {showForm && (
        <div id="student-form" className="admin-card border-[#006838]/30 shadow-md mt-2">
          <div className="admin-card-header">
            <h3 className={`font-serif text-lg font-bold text-gray-900 flex items-center gap-2 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
              <span className="w-1.5 h-5 bg-[#006838] rounded-full" />
              {editingId ? tf.edit_title : tf.add_title}
            </h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full name */}
              <div className="sm:col-span-2">
                <label className="admin-label">{tf.full_name}</label>
                <p className="text-[11px] text-gray-400 mb-1.5">{tf.full_name_hint}</p>
                <input
                  {...register('full_name')}
                  className={inputClass}
                  placeholder={isAr ? 'أحمد محمد عبدالله' : 'Ahmad Mohamed'}
                />
                {errors.full_name && <p className="admin-error">{tf.errors.name_required}</p>}
              </div>

              {/* DOB */}
              <div>
                <label className="admin-label">{tf.dob}</label>
                <input {...register('dob')} type="date" className={inputClass} dir="ltr" />
                {errors.dob && <p className="admin-error">{tf.errors.dob_required}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="admin-label">{tf.gender}</label>
                <select {...register('gender')} className={selectClass}>
                  <option value="">{tf.gender}</option>
                  <option value="MALE">{tf.gender_male}</option>
                  <option value="FEMALE">{tf.gender_female}</option>
                </select>
                {errors.gender && <p className="admin-error">{tf.errors.gender_required}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="admin-label">{tf.category}</label>
                <select {...register('category_id')} className={selectClass}>
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
                {errors.category_id && <p className="admin-error">{tf.errors.category_required}</p>}
              </div>

              {/* National ID */}
              <div>
                <label className="admin-label">National ID / Birth Cert No.</label>
                <input {...register('national_id')} className={inputClass} dir="ltr" />
              </div>

              {/* Guardian phone */}
              <div>
                <label className="admin-label">{tf.guardian_phone}</label>
                <input {...register('guardian_phone')} type="tel" className={inputClass} dir="ltr" placeholder="+254..." />
                {errors.guardian_phone && <p className="admin-error">{tf.errors.phone_required}</p>}
              </div>
            </div>

            {/* Backup checkbox */}
            <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <input
                {...register('is_backup')}
                type="checkbox"
                id="is_backup"
                className="w-4 h-4 rounded accent-[#006838]"
              />
              <label htmlFor="is_backup" className="text-sm text-gray-600 cursor-pointer">
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
                {isSubmitting ? tf.submitting : tf.submit}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setServerError('') }}
                className="portal-btn-secondary"
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
