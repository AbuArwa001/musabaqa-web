'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
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
  full_name: z.string().min(1, 'Full name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE']),
  national_id: z.string().min(1, 'ID / Birth Certificate No. is required'),
  guardian_phone: z.string().min(1, 'Guardian contact phone is required'),
  category_id: z.string().min(1, 'Please select a competition category'),
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
  const { label, cls } = map[status] || map.PENDING_REVIEW
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
  const [downloadingPdfId, setDownloadingPdfId] = useState<number | null>(null)
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
        text: isAr ? 'تم رفع الملف وحفظه بنجاح في السحابة' : 'File uploaded successfully and saved to AWS S3.',
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

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } =
    useForm<StudentFormData>({ resolver: zodResolver(studentSchema) })

  const selectedCatWatch = watch('category_id')
  const filledCategoryIds = new Set(students.map((s) => s.category_id))
  const primaryStudents = students.filter((s) => !s.is_backup)
  const atCapacity = primaryStudents.length >= 4

  function openAddFormForCategory(catId?: number) {
    reset({
      full_name: '',
      dob: '',
      gender: 'MALE',
      national_id: '',
      guardian_phone: '',
      category_id: catId ? String(catId) : (categories[0] ? String(categories[0].id) : '1'),
      is_backup: false,
    })
    setEditingId(null)
    setShowForm(true)
    setServerError('')
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
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.status === 409) setServerError(err.message)
        else setServerError(dict.common.error)
      } else {
        setServerError(err.message || dict.common.error)
      }
    }
  }

  async function handleDownloadPdf(student: Student) {
    setDownloadingPdfId(student.id)
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
    } finally {
      setDownloadingPdfId(null)
    }
  }

  const uploadedMediaCount = [
    institution?.document_url,
    institution?.teacher_photo_url,
    institution?.classroom_photo_url,
    institution?.students_photo_url,
    institution?.video_url,
  ].filter(Boolean).length

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* ── 1. Master Accreditation & Institution Status Banner ── */}
      {institution && (
        <div className="admin-card overflow-hidden bg-white border border-gray-200/80 rounded-2xl shadow-sm hover:shadow transition-shadow">
          <div className={`p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${isAr ? 'lg:flex-row-reverse text-right' : ''}`}>
            
            {/* Left: Emblem & Institution Info */}
            <div className={`flex items-start gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                institution.status === 'APPROVED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : institution.status === 'REJECTED'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
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
                <div className={`flex items-center gap-2.5 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
                  <h2 className="font-serif font-bold text-gray-900 text-lg sm:text-xl">
                    {institution.name}
                  </h2>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    institution.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : institution.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {institution.status === 'APPROVED'
                      ? (isAr ? '✓ مؤسسة معتمدة رسمياً' : '✓ Verified & Accredited')
                      : institution.status === 'REJECTED'
                      ? (isAr ? '✗ الطلب مرفوض' : '✗ Application Rejected')
                      : (isAr ? '⏳ قيد المراجعة والتدقيق' : '⏳ Verification Underway')}
                  </span>
                </div>

                <p className="text-gray-600 text-xs sm:text-sm mt-1 leading-relaxed max-w-2xl">
                  {institution.status === 'APPROVED'
                    ? (isAr
                        ? 'تم اعتماد مؤسستكم رسميًا من قبل لجنة مسجد جامع نيروبي للمشاركة في مسابقة حفظ القرآن الكريم ٢٠٢٦.'
                        : 'Your madrasa has been officially accredited by Jamia Mosque Committee for the 2026 Musabaqa.')
                    : (isAr
                        ? 'تقوم اللجنة بمراجعة بيانات المؤسسة. يمكنك تسجيل مرشحيك الـ ٤ وتجهيز ملفاتهم في هذه الأثناء.'
                        : 'Accreditation review is underway. You can register your 4 student candidates and upload media in the meantime.')}
                </p>
              </div>
            </div>

            {/* Right: Media Hub Toggle & Reference */}
            <div className={`flex items-center gap-3 shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button
                type="button"
                onClick={() => setShowMediaHub(!showMediaHub)}
                className="text-xs font-bold px-4 py-2.5 rounded-xl border border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>📁</span>
                <span>{showMediaHub ? (isAr ? 'إخفاء ملف التوثيق ▲' : 'Hide Media Hub ▲') : (isAr ? 'ملف التوثيق والصور (٥/٥) ▼' : 'Accreditation Media Hub ▼')}</span>
                <span className="bg-emerald-900/60 px-1.5 py-0.5 rounded text-[10px] font-mono">{uploadedMediaCount}/5</span>
              </button>

              <span className="text-xs font-mono text-gray-600 bg-gray-100 px-3 py-2 rounded-xl border border-gray-200">
                REF: INST-{String(institution.id).padStart(4, '0')}
              </span>
            </div>
          </div>

          {/* Media Hub Notification Alert */}
          {mediaMsg && (
            <div className={`mx-6 mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              mediaMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}>
              <span>{mediaMsg.type === 'success' ? '✓' : '⚠️'}</span>
              <span>{mediaMsg.text}</span>
            </div>
          )}

          {/* ── Expandable Accreditation & Media Hub ── */}
          <AnimatePresence>
            {showMediaHub && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-50/80 border-t border-gray-200 p-5 sm:p-6"
              >
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 ${isAr ? 'sm:flex-row-reverse text-right' : ''}`}>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-gray-900">
                      {isAr ? 'ملفات التوثيق والوسائط لاعتماد المؤسسة' : 'Accreditation Media & Verification Dossier'}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isAr
                        ? 'ارفع صور الشيخ المشرف، الفصول، الطلاب في الحلقة، وفيديو تعريفي لسرعة الاعتماد.'
                        : 'Upload teacher photo, classroom premises, students in session, and intro video to accelerate committee verification.'}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    AWS S3: institutions/{institution.name.replace(/\s+/g, '_')}/
                  </span>
                </div>

                {/* 5-Slot Media Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  
                  {/* 1. Official Document */}
                  <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex flex-col justify-between hover:border-emerald-500/50 shadow-sm transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">📄</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${institution.document_url ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                          {institution.document_url ? 'Uploaded ✓' : 'Pending'}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-gray-900">Official Certificate</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Madrasa / SUPKEM Doc</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5">
                      <label className="btn-secondary !py-1 !px-2 text-[10px] flex-1 text-center cursor-pointer hover:bg-emerald-50 hover:text-emerald-800">
                        {uploadingType === 'document' ? 'Uploading…' : (institution.document_url ? 'Replace' : 'Upload')}
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*" className="hidden" disabled={uploadingType !== null} onChange={(e) => handleMediaUpload('document', e)} />
                      </label>
                      {institution.document_url && (
                        <a href={institution.document_url} target="_blank" rel="noopener noreferrer" className="p-1 text-emerald-700 hover:text-emerald-900 text-xs font-bold">↗</a>
                      )}
                    </div>
                  </div>

                  {/* 2. Head Ustadh Photo */}
                  <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex flex-col justify-between hover:border-sky-500/50 shadow-sm transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-xs">👨‍🏫</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${institution.teacher_photo_url ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                          {institution.teacher_photo_url ? 'Uploaded ✓' : 'Pending'}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-gray-900">Head Ustadh Photo</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Lead Teacher / Imam</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5">
                      <label className="btn-secondary !py-1 !px-2 text-[10px] flex-1 text-center cursor-pointer hover:bg-sky-50 hover:text-sky-800">
                        {uploadingType === 'teacher' ? 'Uploading…' : (institution.teacher_photo_url ? 'Replace' : 'Upload')}
                        <input type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" disabled={uploadingType !== null} onChange={(e) => handleMediaUpload('teacher', e)} />
                      </label>
                      {institution.teacher_photo_url && (
                        <a href={institution.teacher_photo_url} target="_blank" rel="noopener noreferrer" className="p-1 text-sky-700 hover:text-sky-900 text-xs font-bold">↗</a>
                      )}
                    </div>
                  </div>

                  {/* 3. Classroom Premises Photo */}
                  <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex flex-col justify-between hover:border-amber-500/50 shadow-sm transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">🏫</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${institution.classroom_photo_url ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                          {institution.classroom_photo_url ? 'Uploaded ✓' : 'Pending'}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-gray-900">Classroom Premises</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Halaqa / Building Photo</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5">
                      <label className="btn-secondary !py-1 !px-2 text-[10px] flex-1 text-center cursor-pointer hover:bg-amber-50 hover:text-amber-800">
                        {uploadingType === 'classroom' ? 'Uploading…' : (institution.classroom_photo_url ? 'Replace' : 'Upload')}
                        <input type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" disabled={uploadingType !== null} onChange={(e) => handleMediaUpload('classroom', e)} />
                      </label>
                      {institution.classroom_photo_url && (
                        <a href={institution.classroom_photo_url} target="_blank" rel="noopener noreferrer" className="p-1 text-amber-700 hover:text-amber-900 text-xs font-bold">↗</a>
                      )}
                    </div>
                  </div>

                  {/* 4. Students in Session */}
                  <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex flex-col justify-between hover:border-emerald-500/50 shadow-sm transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">👥</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${institution.students_photo_url ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                          {institution.students_photo_url ? 'Uploaded ✓' : 'Pending'}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-gray-900">Students in Session</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Madrasa Assembly Photo</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5">
                      <label className="btn-secondary !py-1 !px-2 text-[10px] flex-1 text-center cursor-pointer hover:bg-emerald-50 hover:text-emerald-800">
                        {uploadingType === 'students' ? 'Uploading…' : (institution.students_photo_url ? 'Replace' : 'Upload')}
                        <input type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" disabled={uploadingType !== null} onChange={(e) => handleMediaUpload('students', e)} />
                      </label>
                      {institution.students_photo_url && (
                        <a href={institution.students_photo_url} target="_blank" rel="noopener noreferrer" className="p-1 text-emerald-700 hover:text-emerald-900 text-xs font-bold">↗</a>
                      )}
                    </div>
                  </div>

                  {/* 5. Introduction Video */}
                  <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex flex-col justify-between hover:border-rose-500/50 shadow-sm transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs">🎥</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${institution.video_url ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                          {institution.video_url ? 'Uploaded ✓' : 'Pending'}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-gray-900">Introduction Video</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Tour / Recitation (.mp4)</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5">
                      <label className="btn-secondary !py-1 !px-2 text-[10px] flex-1 text-center cursor-pointer hover:bg-rose-50 hover:text-rose-800">
                        {uploadingType === 'video' ? 'Uploading…' : (institution.video_url ? 'Replace' : 'Upload')}
                        <input type="file" accept="video/mp4,video/quicktime,video/webm,video/*" className="hidden" disabled={uploadingType !== null} onChange={(e) => handleMediaUpload('video', e)} />
                      </label>
                      {institution.video_url && (
                        <a href={institution.video_url} target="_blank" rel="noopener noreferrer" className="p-1 text-rose-700 hover:text-rose-900 text-xs font-bold">▶</a>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── 2. Category Quota & Enrolment Slots (The 4 Pillars) ── */}
      <div>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 ${isAr ? 'sm:flex-row-reverse text-right' : ''}`}>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
              {isAr ? 'قائمة المرشحين والفئات الأربع' : 'Candidate Roster & Category Quotas'}
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              {isAr
                ? `يحق لكل مؤسسة ترشيح طالب واحد لكل فئة (المجموع: ٤ طلاب كحد أقصى). المسجلون حالياً: ${primaryStudents.length} من ٤.`
                : `Each accredited madrasa can enroll 1 candidate per category (Max 4 candidates). Currently enrolled: ${primaryStudents.length} of 4.`}
            </p>
          </div>

          {!atCapacity && (
            <button
              onClick={() => openAddFormForCategory()}
              className="portal-btn-primary self-start sm:self-auto cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t.add_student}
            </button>
          )}
        </div>

        {/* 4 Category Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const student = students.find((s) => s.category_id === cat.id && !s.is_backup)
            const backupStudent = students.find((s) => s.category_id === cat.id && s.is_backup)

            return (
              <div
                key={cat.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 ${
                  student
                    ? 'bg-white border-emerald-300 shadow-sm hover:shadow-md'
                    : 'bg-white/60 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/20'
                }`}
              >
                <div>
                  {/* Top Category Badge */}
                  <div className={`flex items-center justify-between gap-2 mb-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <span className="font-serif font-bold text-xs text-gray-900 truncate">
                      {isAr ? cat.name_ar : cat.name_en}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      student ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {student ? (isAr ? 'مسجل ✓' : 'Enrolled ✓') : (isAr ? 'متاح' : 'Available')}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 font-mono mb-4">
                    {isAr
                      ? `الفئة العمرية: ${cat.min_age ? `${cat.min_age}–` : ''}${cat.max_age} سنة`
                      : `Ages: ${cat.min_age ? `${cat.min_age}–` : 'Up to '}${cat.max_age} Yrs`}
                  </p>

                  {/* Filled Student Card Inside Slot */}
                  {student ? (
                    <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200/80 space-y-2.5">
                      <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {student.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-gray-900 truncate">{student.full_name}</h4>
                          <p className="text-[10px] text-gray-500 font-mono">REF-{String(student.id).padStart(4, '0')}</p>
                        </div>
                      </div>

                      <div className={`flex items-center justify-between text-[11px] pt-2 border-t border-gray-200 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <span className="text-gray-500 font-mono">DOB: {student.dob}</span>
                        {statusBadge(student.review_status, dict)}
                      </div>

                      {backupStudent && (
                        <div className="text-[10px] text-sky-700 bg-sky-50 px-2 py-1 rounded-md border border-sky-200">
                          <strong>{t.backup_badge}:</strong> {backupStudent.full_name}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-gray-400">
                      <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-2 text-gray-400">
                        +
                      </div>
                      <p className="text-xs font-medium text-gray-500">
                        {isAr ? 'لا يوجد مرشح مسجل' : 'No candidate enrolled'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Action for this Slot */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                  {student ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(student)}
                        disabled={downloadingPdfId === student.id}
                        className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1.5 rounded-lg flex-1 transition-colors cursor-pointer"
                      >
                        <span>📄</span>
                        <span>{downloadingPdfId === student.id ? '...' : 'PDF Pass'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditForm(student)}
                        className="inline-flex items-center justify-center text-[11px] font-semibold text-gray-700 hover:text-emerald-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        {t.edit_student}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openAddFormForCategory(cat.id)}
                      className="w-full py-2 text-xs font-bold text-[#006838] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>+</span>
                      <span>{isAr ? 'تسجيل مرشح' : 'Enroll Candidate'}</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 3. Add / Edit Candidate Form Drawer ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            id="student-form"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="admin-card border-2 border-emerald-600/50 shadow-xl bg-gradient-to-b from-white to-gray-50/50 rounded-2xl overflow-hidden"
          >
            <div className="admin-card-header bg-emerald-50/60 border-b border-emerald-100 p-5 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  {editingId ? (isAr ? 'تعديل بيانات المرشح' : 'Edit Candidate Profile') : (isAr ? 'تسجيل مرشح جديد' : 'Register Candidate for Musabaqa')}
                </h3>
                <p className="text-gray-500 text-xs mt-0.5">
                  {isAr ? 'يرجى إدخال البيانات مطابقة لشهادة الميلاد أو الهوية الوطنية' : 'Ensure candidate full name and date of birth match their official identification.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-700 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {serverError && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label className="admin-label">{tf.full_name} *</label>
                    <input
                      {...register('full_name')}
                      type="text"
                      className={`admin-input ${isAr ? 'text-right' : ''}`}
                      placeholder="e.g. Abdurrahman Bilal Othman"
                    />
                    {errors.full_name && <p className="admin-error">{errors.full_name.message}</p>}
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="admin-label">{tf.category} *</label>
                    <select {...register('category_id')} className={`admin-select ${isAr ? 'text-right' : ''}`}>
                      {categories.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {isAr ? c.name_ar : c.name_en} ({c.min_age ? `${c.min_age}–` : ''}{c.max_age} Yrs)
                        </option>
                      ))}
                    </select>
                    {errors.category_id && <p className="admin-error">{errors.category_id.message}</p>}
                  </div>

                  {/* Gender Selection */}
                  <div>
                    <label className="admin-label">{tf.gender} *</label>
                    <select {...register('gender')} className={`admin-select ${isAr ? 'text-right' : ''}`}>
                      <option value="MALE">{tf.gender_male}</option>
                      <option value="FEMALE">{tf.gender_female}</option>
                    </select>
                    {errors.gender && <p className="admin-error">{errors.gender.message}</p>}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="admin-label">{tf.dob} *</label>
                    <input
                      {...register('dob')}
                      type="date"
                      className={`admin-input ${isAr ? 'text-right' : ''}`}
                    />
                    {errors.dob && <p className="admin-error">{errors.dob.message}</p>}
                  </div>

                  {/* National ID / Birth Cert Ref */}
                  <div>
                    <label className="admin-label">{isAr ? 'رقم الهوية / شهادة الميلاد' : 'National ID / Birth Cert No.'} *</label>
                    <input
                      {...register('national_id')}
                      type="text"
                      className={`admin-input ${isAr ? 'text-right' : ''}`}
                      placeholder="e.g. BC-9847294 / ID-3829104"
                    />
                    {errors.national_id && <p className="admin-error">{errors.national_id.message}</p>}
                  </div>

                  {/* Guardian Phone */}
                  <div className="md:col-span-2">
                    <label className="admin-label">{tf.guardian_phone} *</label>
                    <input
                      {...register('guardian_phone')}
                      type="tel"
                      className={`admin-input ${isAr ? 'text-right' : ''}`}
                      placeholder="+254 7XX XXX XXX"
                    />
                    {errors.guardian_phone && <p className="admin-error">{errors.guardian_phone.message}</p>}
                  </div>

                  {/* Backup / Reserve Contestant Toggle */}
                  <div className="md:col-span-2 bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <input
                      {...register('is_backup')}
                      type="checkbox"
                      id="is_backup_check"
                      className="mt-1 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="is_backup_check" className="text-xs text-amber-900 cursor-pointer">
                      <span className="font-bold block">{t.backup_badge} (Reserve Contestant)</span>
                      <span className="text-amber-700">Check this box if this student is a standby replacement contestant for this category.</span>
                    </label>
                  </div>

                </div>

                {/* Form Buttons */}
                <div className={`pt-4 border-t border-gray-200 flex items-center justify-end gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary text-xs px-4 py-2"
                  >
                    {dict.common.cancel}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="portal-btn-primary text-xs px-6 py-2.5 shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? 'Saving Candidate…' : (editingId ? 'Update Candidate Profile' : 'Save & Enroll Candidate')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. Detailed Enrolled Candidates Roster Table ── */}
      {students.length > 0 && (
        <div className="admin-card overflow-hidden p-0 border border-gray-200 shadow-sm">
          <div className="p-5 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h4 className="font-serif font-bold text-base text-gray-900">
                {isAr ? 'كشف بيانات المرشحين وبطاقات الامتحان' : 'Enrolled Candidates Dossier & Examination Passes'}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {isAr ? 'يمكنك تنزيل بطاقة الامتحان الرسمية (PDF) لكل مرشح معتمد' : 'Download official PDF hall tickets and verify screening statuses below.'}
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              {students.length} {isAr ? 'مرشحين مسجلين' : 'Total Candidates'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className={`w-full text-xs sm:text-sm ${isAr ? 'text-right' : 'text-left'}`}>
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100/70 text-gray-600 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="px-5 py-3.5">#</th>
                  <th className="px-5 py-3.5">{isAr ? 'اسم المرشح' : 'Candidate Name'}</th>
                  <th className="px-5 py-3.5">{isAr ? 'الفئة' : 'Category'}</th>
                  <th className="px-5 py-3.5">{isAr ? 'رقم الهوية' : 'ID / Birth Cert'}</th>
                  <th className="px-5 py-3.5">{isAr ? 'حالة المراجعة' : 'Screening Status'}</th>
                  <th className={`px-5 py-3.5 ${isAr ? 'text-left' : 'text-right'}`}>{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student, idx) => {
                  const cat = categories.find((c) => c.id === student.category_id)
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-mono text-gray-400">
                        {idx + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {student.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{student.full_name}</span>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono mt-0.5">
                              <span>DOB: {student.dob}</span>
                              <span>•</span>
                              <span>{student.gender}</span>
                              {student.is_backup && (
                                <span className="bg-sky-100 text-sky-800 px-1.5 rounded font-bold">RESERVE</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-medium text-gray-700">
                        <span className="inline-block bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          {cat ? (isAr ? cat.name_ar : cat.name_en) : '—'}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-gray-600 text-xs">
                        {student.national_id}
                        <span className="block text-[10px] text-gray-400 font-sans">📞 {student.guardian_phone}</span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {statusBadge(student.review_status, dict)}
                        {student.rejection_reason && (
                          <p className="text-[10px] text-rose-600 mt-1 max-w-xs">{student.rejection_reason}</p>
                        )}
                      </td>

                      <td className={`px-5 py-4 whitespace-nowrap ${isAr ? 'text-left' : 'text-right'}`}>
                        <div className={`inline-flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(student)}
                            disabled={downloadingPdfId === student.id}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                          >
                            <span>📄</span>
                            <span>{downloadingPdfId === student.id ? '...' : 'PDF Dossier'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditForm(student)}
                            className="text-xs font-semibold text-gray-700 hover:text-emerald-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            {t.edit_student}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
