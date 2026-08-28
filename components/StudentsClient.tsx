'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createStudent, updateStudent, getStudentPdfUrl, uploadInstitutionMedia, ApiError } from '@/lib/api'
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
  type?: string
  contact_person?: string
  phone?: string
  email?: string
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejection_reason?: string | null
  document_url?: string | null
  teacher_photo_url?: string | null
  classroom_photo_url?: string | null
  students_photo_url?: string | null
  video_url?: string | null
  created_at?: string
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
  institution: initialInst,
  dict,
  lang,
  token,
}: StudentsClientProps) {
  const t = dict.portal
  const tf = dict.student_form
  const isAr = lang === 'ar'

  const [institution, setInstitution] = useState<Institution | null>(initialInst)
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [showForm, setShowForm] = useState(false)
  const [showMediaHub, setShowMediaHub] = useState(false)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [mediaMsg, setMediaMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [serverError, setServerError] = useState('')

  const handleMediaUpload = async (mediaType: 'document' | 'teacher' | 'classroom' | 'students' | 'video', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !institution) return
    const file = e.target.files[0]
    setUploadingType(mediaType)
    setMediaMsg(null)

    try {
      const res = await uploadInstitutionMedia(institution.id, mediaType, file)
      setInstitution((prev) => {
        if (!prev) return prev
        const fieldMap: Record<string, keyof Institution> = {
          document: 'document_url',
          teacher: 'teacher_photo_url',
          classroom: 'classroom_photo_url',
          students: 'students_photo_url',
          video: 'video_url',
        }
        return { ...prev, [fieldMap[mediaType]]: res.url }
      })
      setMediaMsg({
        type: 'success',
        text: isAr ? 'تم رفع الملف بنجاح وحفظه في النظام' : 'File uploaded successfully and saved to AWS.',
      })
    } catch (err: any) {
      setMediaMsg({
        type: 'error',
        text: err.message || (isAr ? 'فشل رفع الملف' : 'Failed to upload file.'),
      })
    } finally {
      setUploadingType(null)
    }
  }

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

      {/* ── Institution Verification Banner ── */}
      {institution && (
        <div className={`admin-card overflow-hidden border-l-4 ${
          institution.status === 'APPROVED'
            ? 'border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 via-white to-white'
            : institution.status === 'REJECTED'
            ? 'border-l-rose-500 bg-gradient-to-r from-rose-50/50 via-white to-white'
            : 'border-l-amber-500 bg-gradient-to-r from-amber-50/60 via-white to-white'
        }`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isAr ? 'sm:flex-row-reverse text-right' : ''}`}>
            <div className="flex items-start gap-3.5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                institution.status === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-700'
                  : institution.status === 'REJECTED'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {institution.status === 'APPROVED' ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ) : institution.status === 'REJECTED' ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              <div>
                <div className={`flex items-center gap-2 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
                  <h3 className="font-serif font-bold text-gray-900 text-base">
                    {institution.name}
                  </h3>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    institution.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : institution.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {institution.status === 'APPROVED'
                      ? (isAr ? '✓ مؤسسة معتمدة وموثقة' : '✓ Verified & Accredited')
                      : institution.status === 'REJECTED'
                      ? (isAr ? '✗ مرفوض' : '✗ Application Rejected')
                      : (isAr ? '⏳ قيد المراجعة والتحقق' : '⏳ Verification Underway')}
                  </span>
                </div>

                <p className="text-gray-600 text-xs mt-1 leading-relaxed max-w-2xl">
                  {institution.status === 'APPROVED'
                    ? (isAr
                        ? 'تم اعتماد مؤسستكم رسميًا للمشاركة في مسابقة حفظ القرآن الكريم ٢٠٢٦ من قبل لجنة مسجد جامع نيروبي.'
                        : 'Your institution has been officially verified and approved for the Jamia Mosque Musabaqa 2026.')
                    : institution.status === 'REJECTED'
                    ? (isAr
                        ? `تم رفض الطلب: ${institution.rejection_reason || 'بيانات غير مكتملة'}. يرجى التواصل مع إدارة المسجد.`
                        : `Application not approved: ${institution.rejection_reason || 'Incomplete details'}. Contact the Jamia Mosque Committee for assistance.`)
                    : (isAr
                        ? 'تقوم لجنة مسجد جامع بمراجعة بيانات المؤسسة والتحقق منها. يمكنك تسجيل طلابك وتجهيز ملفاتهم في هذه الأثناء.'
                        : 'The Jamia Mosque Committee is currently reviewing and verifying your institution profile. You can register your student candidates in the meantime.')}
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-2 shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button
                type="button"
                onClick={() => setShowMediaHub(!showMediaHub)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {showMediaHub
                  ? (isAr ? 'إخفاء ملف التوثيق والوسائط ▲' : 'Hide Verification Media ▲')
                  : (isAr ? 'ملف التوثيق والصور والفيديو (انقر للرفع) ▼' : 'Accreditation Media Hub (Upload) ▼')}
              </button>
              <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-200">
                REF: INST-{String(institution.id).padStart(4, '0')}
              </span>
            </div>
          </div>

          {/* ── Media Feedback Message ── */}
          {mediaMsg && (
            <div className={`mt-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              mediaMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}>
              <span>{mediaMsg.type === 'success' ? '✓' : '⚠️'}</span>
              <span>{mediaMsg.text}</span>
            </div>
          )}

          {/* ── Expandable Accreditation & Media Hub ── */}
          {showMediaHub && (
            <div className="mt-5 pt-5 border-t border-gray-200">
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 ${isAr ? 'sm:flex-row-reverse text-right' : ''}`}>
                <div>
                  <h4 className="font-serif font-bold text-sm text-gray-900">
                    {isAr ? 'ملفات التوثيق والاعتماد لمراجعة اللجنة' : 'Accreditation Dossier & Media for Committee Approval'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isAr
                      ? 'يرجى رفع صور المعلم والفصول والطلاب وفيديو تعريفي بالمدرسة لتسريع الاعتماد.'
                      : 'Attach photos of your lead Ustadh, classroom premises, students in session, and an introduction video to expedite approval.'}
                  </p>
                </div>
                <div className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                  AWS S3: institutions/{institution.name.replace(/\s+/g, '_')}/
                </div>
              </div>

              {/* 5-Slot Media Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                
                {/* 1. Official Registration Document */}
                <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex flex-col justify-between hover:border-emerald-500/50 transition-colors shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        📄
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        institution.document_url ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {institution.document_url ? 'Uploaded ✓' : 'Pending'}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-gray-900">Official Certificate</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Madrasa / SUPKEM Doc</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5">
                    <label className="btn-secondary !py-1 !px-2 text-[10px] flex-1 text-center cursor-pointer hover:bg-emerald-50 hover:text-emerald-800">
                      {uploadingType === 'document' ? 'Uploading…' : (institution.document_url ? 'Replace' : 'Upload')}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
                        className="hidden"
                        disabled={uploadingType !== null}
                        onChange={(e) => handleMediaUpload('document', e)}
                      />
                    </label>
                    {institution.document_url && (
                      <a
                        href={institution.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-emerald-700 hover:text-emerald-900 text-xs font-bold"
                        title="View Document"
                      >
                        ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* 2. Head Ustadh / Teacher Photo */}
                <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex flex-col justify-between hover:border-emerald-500/50 transition-colors shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-xs">
                        👨‍🏫
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        institution.teacher_photo_url ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {institution.teacher_photo_url ? 'Uploaded ✓' : 'Pending'}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-gray-900">Head Ustadh Photo</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Lead Teacher / Imam</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5">
                    <label className="btn-secondary !py-1 !px-2 text-[10px] flex-1 text-center cursor-pointer hover:bg-sky-50 hover:text-sky-800">
                      {uploadingType === 'teacher' ? 'Uploading…' : (institution.teacher_photo_url ? 'Replace' : 'Upload')}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        className="hidden"
                        disabled={uploadingType !== null}
                        onChange={(e) => handleMediaUpload('teacher', e)}
                      />
                    </label>
                    {institution.teacher_photo_url && (
                      <a
                        href={institution.teacher_photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-sky-700 hover:text-sky-900 text-xs font-bold"
                        title="View Photo"
                      >
                        ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* 3. Madrasa Classroom / Premises Photo */}
                <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex flex-col justify-between hover:border-emerald-500/50 transition-colors shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                        🏫
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        institution.classroom_photo_url ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {institution.classroom_photo_url ? 'Uploaded ✓' : 'Pending'}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-gray-900">Classroom Premises</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Halaqa / Building Photo</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5">
                    <label className="btn-secondary !py-1 !px-2 text-[10px] flex-1 text-center cursor-pointer hover:bg-amber-50 hover:text-amber-800">
                      {uploadingType === 'classroom' ? 'Uploading…' : (institution.classroom_photo_url ? 'Replace' : 'Upload')}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        className="hidden"
                        disabled={uploadingType !== null}
                        onChange={(e) => handleMediaUpload('classroom', e)}
                      />
                    </label>
                    {institution.classroom_photo_url && (
                      <a
                        href={institution.classroom_photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-amber-700 hover:text-amber-900 text-xs font-bold"
                        title="View Photo"
                      >
                        ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* 4. Students in Session Photo */}
                <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex flex-col justify-between hover:border-emerald-500/50 transition-colors shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        👥
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        institution.students_photo_url ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {institution.students_photo_url ? 'Uploaded ✓' : 'Pending'}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-gray-900">Students Session</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Madrasa Assembly Photo</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5">
                    <label className="btn-secondary !py-1 !px-2 text-[10px] flex-1 text-center cursor-pointer hover:bg-emerald-50 hover:text-emerald-800">
                      {uploadingType === 'students' ? 'Uploading…' : (institution.students_photo_url ? 'Replace' : 'Upload')}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        className="hidden"
                        disabled={uploadingType !== null}
                        onChange={(e) => handleMediaUpload('students', e)}
                      />
                    </label>
                    {institution.students_photo_url && (
                      <a
                        href={institution.students_photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-emerald-700 hover:text-emerald-900 text-xs font-bold"
                        title="View Photo"
                      >
                        ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* 5. Madrasa / Recitation Video */}
                <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex flex-col justify-between hover:border-emerald-500/50 transition-colors shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs">
                        🎥
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        institution.video_url ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {institution.video_url ? 'Uploaded ✓' : 'Pending'}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-gray-900">Introduction Video</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Tour / Recitation (.mp4)</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5">
                    <label className="btn-secondary !py-1 !px-2 text-[10px] flex-1 text-center cursor-pointer hover:bg-rose-50 hover:text-rose-800">
                      {uploadingType === 'video' ? 'Uploading…' : (institution.video_url ? 'Replace' : 'Upload')}
                      <input
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm,video/*"
                        className="hidden"
                        disabled={uploadingType !== null}
                        onChange={(e) => handleMediaUpload('video', e)}
                      />
                    </label>
                    {institution.video_url && (
                      <a
                        href={institution.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-rose-700 hover:text-rose-900 text-xs font-bold"
                        title="Watch Video"
                      >
                        ▶
                      </a>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

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
