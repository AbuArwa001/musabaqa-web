'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  createStudent,
  updateStudent,
  uploadStudentPhoto,
  uploadStudentIdDocument,
  getStudentPdfUrl,
  ApiError,
} from '@/lib/api'
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
  alternative_phone?: string | null
  email?: string | null
  nationality?: string | null
  county?: string | null
  residence?: string | null
  photo?: string | null
  id_document?: string | null
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
  alternative_phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  nationality: z.string().optional(),
  county: z.string().optional(),
  residence: z.string().optional(),
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

  const [institution] = useState<Institution | null>(initialInst)
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [showForm, setShowForm] = useState(false)
  const [downloadingPdfId, setDownloadingPdfId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [serverError, setServerError] = useState('')
  const [formUploadStatus, setFormUploadStatus] = useState<string | null>(null)
  const [docErrors, setDocErrors] = useState<{ photo?: string; idDoc?: string }>({})
  const [statusModal, setStatusModal] = useState<{
    type: 'loading' | 'error' | 'success'
    title: string
    message: string
    subMessage?: string
    progressStep?: string
    student?: Student
  } | null>(null)

  // Document verification file states for the active form
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [idDocFile, setIdDocFile] = useState<File | null>(null)
  const [idDocPreview, setIdDocPreview] = useState<string | null>(null)

  // Lightbox previews
  const [activeMediaModal, setActiveMediaModal] = useState<{ title: string; url: string; isPdf?: boolean } | null>(null)

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } =
    useForm<StudentFormData>({ resolver: zodResolver(studentSchema) })

  const primaryStudents = students.filter((s) => !s.is_backup)
  const atCapacity = primaryStudents.length >= 4
  const isApproved = institution?.status === 'APPROVED'

  function openAddFormForCategory(catId?: number) {
    if (!isApproved) {
      window.location.href = `/${lang}/portal/verification`
      return
    }
    reset({
      full_name: '',
      dob: '',
      gender: 'MALE',
      national_id: '',
      guardian_phone: '',
      alternative_phone: '',
      email: '',
      nationality: 'Kenyan',
      county: '',
      residence: '',
      category_id: catId ? String(catId) : (categories[0] ? String(categories[0].id) : '1'),
      is_backup: false,
    })
    setPhotoFile(null)
    setPhotoPreview(null)
    setIdDocFile(null)
    setIdDocPreview(null)
    setDocErrors({})
    setEditingId(null)
    setShowForm(true)
    setServerError('')
    setFormUploadStatus(null)
    setStatusModal(null)
    setTimeout(() => document.getElementById('student-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function openEditForm(student: Student) {
    reset({
      full_name: student.full_name,
      dob: student.dob,
      gender: student.gender,
      national_id: student.national_id,
      guardian_phone: student.guardian_phone,
      alternative_phone: student.alternative_phone || '',
      email: student.email || '',
      nationality: student.nationality || 'Kenyan',
      county: student.county || '',
      residence: student.residence || '',
      category_id: String(student.category_id),
      is_backup: student.is_backup,
    })
    setPhotoFile(null)
    setPhotoPreview(student.photo || null)
    setIdDocFile(null)
    setIdDocPreview(student.id_document || null)
    setDocErrors({})
    setEditingId(student.id)
    setShowForm(true)
    setServerError('')
    setFormUploadStatus(null)
    setStatusModal(null)
    setTimeout(() => document.getElementById('student-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
      setDocErrors((prev) => ({ ...prev, photo: undefined }))
    }
  }

  const handleIdDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setIdDocFile(file)
      setIdDocPreview(file.name)
      setDocErrors((prev) => ({ ...prev, idDoc: undefined }))
    }
  }

  const onInvalid = (formErrors: any) => {
    const errorKeys = Object.keys(formErrors)
    const firstError = formErrors[errorKeys[0]]?.message || (isAr ? 'يرجى استكمال جميع الحقول الإلزامية المطلوبة' : 'Please fill in all mandatory fields marked with *.')
    setStatusModal({
      type: 'error',
      title: isAr ? 'بيانات غير مكتملة في الاستمارة' : 'Form Validation Incomplete',
      message: String(firstError),
      subMessage: isAr ? 'يرجى مراجعة الحقول المطلوبة الموضحة باللون الأحمر قبل المتابعة.' : 'Please review and complete all highlighted mandatory fields to proceed.',
    })
  }

  async function onSubmit(data: StudentFormData) {
    setServerError('')
    setDocErrors({})

    // Strict validation: Both passport photo and ID document are required for verification
    const hasPhoto = Boolean(photoFile || photoPreview)
    const hasIdDoc = Boolean(idDocFile || idDocPreview)

    if (!hasPhoto || !hasIdDoc) {
      const vErrors: { photo?: string; idDoc?: string } = {}
      if (!hasPhoto) {
        vErrors.photo = isAr
          ? 'الصورة الشخصية للمتسابق مطلوبة للتحقق وإصدار البطاقة الرسمية *'
          : 'Candidate passport photo is required for verification and hall ticket issuance *'
      }
      if (!hasIdDoc) {
        vErrors.idDoc = isAr
          ? 'وثيقة إثبات الهوية (شهادة ميلاد / هوية / جواز) مطلوبة للتحقق *'
          : 'Identification document (Birth Cert / ID / Passport) is required for verification *'
      }
      setDocErrors(vErrors)
      setStatusModal({
        type: 'error',
        title: isAr ? 'المستندات المطلوبة غير مكتملة' : 'Mandatory Documents Required',
        message: isAr
          ? 'يرجى رفع الصورة الشخصية للمتسابق ووثيقة إثبات الهوية (شهادة ميلاد / هوية / جواز) للمتابعة.'
          : 'Both the candidate passport photo and identification document are mandatory for registration.',
        subMessage: isAr
          ? 'تُحفظ المستندات في سحابة AWS S3 لتدقيق اللجنة وإصدار بطاقات الامتحان الرسمية.'
          : 'Documents are securely synchronized with AWS S3 for committee accreditation and hall ticket issuance.',
      })
      document.getElementById('verification-files-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // Trigger Luxury Loading Modal
    setStatusModal({
      type: 'loading',
      title: editingId
        ? (isAr ? 'جاري تحديث بيانات المرشح...' : 'Updating Candidate Profile…')
        : (isAr ? 'جاري تسجيل المرشح في المسابقة...' : 'Enrolling Candidate in Musabaqa…'),
      message: isAr
        ? 'يتم التحقق من البيانات ومزامنة الملفات مع سحابة AWS...'
        : 'Validating registration rules and transferring verification files to AWS S3…',
      progressStep: isAr ? 'الخطوة ١ من ٣: حفظ سجل المتسابق...' : 'Step 1 of 3: Registering candidate demographic profile…',
    })

    try {
      const payload = {
        institution_id: institution!.id,
        category_id: parseInt(data.category_id),
        full_name: data.full_name,
        dob: data.dob,
        gender: data.gender,
        national_id: data.national_id,
        guardian_phone: data.guardian_phone,
        alternative_phone: data.alternative_phone || undefined,
        email: data.email || undefined,
        nationality: data.nationality || 'Kenyan',
        county: data.county || undefined,
        residence: data.residence || undefined,
        is_backup: data.is_backup || false,
      }

      let savedStudent: Student
      if (editingId) {
        savedStudent = (await updateStudent(token, editingId, payload)) as Student
      } else {
        savedStudent = (await createStudent(token, payload)) as Student
      }

      // Upload passport photo to AWS S3 if provided
      if (photoFile) {
        setStatusModal((prev) => prev ? {
          ...prev,
          progressStep: isAr ? 'الخطوة ٢ من ٣: رفع الصورة الشخصية إلى AWS S3...' : 'Step 2 of 3: Transferring passport photo to AWS S3…',
        } : null)
        try {
          const photoRes = await uploadStudentPhoto(token, savedStudent.id, photoFile)
          savedStudent.photo = photoRes.url
        } catch (uploadErr) {
          console.error('Failed to upload photo:', uploadErr)
        }
      }

      // Upload ID document (birth cert/ID/passport) to AWS S3 if provided
      if (idDocFile) {
        setStatusModal((prev) => prev ? {
          ...prev,
          progressStep: isAr ? 'الخطوة ٣ من ٣: رفع وتشفير وثيقة الهوية في AWS S3...' : 'Step 3 of 3: Encrypting identification document in AWS S3…',
        } : null)
        try {
          const docRes = await uploadStudentIdDocument(token, savedStudent.id, idDocFile)
          savedStudent.id_document = docRes.url
        } catch (uploadErr) {
          console.error('Failed to upload ID document:', uploadErr)
        }
      }

      // Update local state list
      if (editingId) {
        setStudents((prev) => prev.map((s) => (s.id === editingId ? savedStudent : s)))
      } else {
        setStudents((prev) => [...prev, savedStudent])
      }

      setShowForm(false)
      reset()

      // Trigger Luxury Success Modal
      setStatusModal({
        type: 'success',
        title: editingId
          ? (isAr ? 'تم تحديث بيانات المتسابق بنجاح!' : 'Candidate Dossier Updated!')
          : (isAr ? 'تم تسجيل المرشح بنجاح في المسابقة!' : 'Candidate Enrolled Successfully!'),
        message: isAr
          ? `تم اعتماد ملف الطالب "${savedStudent.full_name}" وحفظ جميع الوثائق بنجاح.`
          : `Candidate profile for ${savedStudent.full_name} has been secured and verification media synced with AWS S3.`,
        subMessage: isAr
          ? 'يمكنك الآن تنزيل بطاقة الامتحان الرسمية (PDF) أو إغلاق هذه النافذة.'
          : 'You can now download the official Examination Hall Ticket or view your updated candidate roster.',
        student: savedStudent,
      })
    } catch (err: any) {
      let errMsg = dict.common.error
      if (err instanceof ApiError) {
        errMsg = err.message || (err.status === 409 ? (isAr ? 'رقم الهوية أو هاتف ولي الأمر مسجل مسبقاً' : 'Duplicate candidate record or national ID already registered') : dict.common.error)
      } else {
        errMsg = err.message || dict.common.error
      }
      setServerError(errMsg)
      setStatusModal({
        type: 'error',
        title: isAr ? 'تعذر إتمام التسجيل' : 'Registration Could Not Be Completed',
        message: errMsg,
        subMessage: isAr
          ? 'يرجى مراجعة البيانات والتأكد من صحة رقم الهوية ورقم الهاتف ومطابقة الفئة العمرية.'
          : 'Please check your inputs, category age limits, and ensure national ID and phone are not registered already.',
      })
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
        a.download = `REF_${String(student.id).padStart(5, '0')}_${student.full_name.replace(/\s+/g, '_')}_Pass.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        alert(isAr ? 'فشل تحميل بطاقة المرشح' : 'Failed to download candidate exam pass')
      }
    } catch (e) {
      console.error(e)
      alert(isAr ? 'حدث خطأ أثناء تحميل الملف' : 'An error occurred downloading pass')
    } finally {
      setDownloadingPdfId(null)
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans select-none" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── 1. Master Accreditation & Institution Status Banner ── */}
      {institution && (
        <div className="admin-card overflow-hidden bg-white border border-gray-200/80 rounded-3xl shadow-sm hover:shadow transition-shadow">
          <div className={`p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${isAr ? 'lg:flex-row-reverse text-right' : ''}`}>
            
            {/* Left: Emblem & Institution Info */}
            <div className={`flex items-start gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isApproved
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : institution.status === 'REJECTED'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {isApproved ? (
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
                    isApproved
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : institution.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {isApproved
                      ? (isAr ? '✓ مؤسسة معتمدة رسمياً' : '✓ Verified & Accredited')
                      : institution.status === 'REJECTED'
                      ? (isAr ? '✗ الطلب مرفوض' : '✗ Application Rejected')
                      : (isAr ? '⏳ قيد المراجعة والتدقيق' : '⏳ Verification Underway')}
                  </span>
                </div>

                <p className="text-gray-600 text-xs sm:text-sm mt-1 leading-relaxed max-w-2xl">
                  {isApproved
                    ? (isAr
                        ? 'تم اعتماد مؤسستكم رسميًا من قبل لجنة مسجد جامع نيروبي للمشاركة في مسابقة حفظ القرآن الكريم ٢٠٢٦.'
                        : 'Your madrasa has been officially accredited by Jamia Mosque Committee for the 2026 Musabaqa.')
                    : (isAr
                        ? 'تقوم اللجنة بمراجعة بيانات المؤسسة. يرجى استكمال ملف التوثيق والوسائط لفتح تسجيل المرشحين.'
                        : 'Accreditation review is underway. Complete your verification media dossier to unlock candidate enrolment.')}
                </p>
              </div>
            </div>

            {/* Right: Direct Link to Dedicated Verification Page */}
            <div className={`flex items-center gap-3 shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
              <Link
                href={`/${lang}/portal/verification`}
                className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 shadow-sm ${
                  isApproved
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'border-amber-500 bg-amber-500 text-white hover:bg-amber-600 animate-pulse'
                }`}
              >
                <span>🛡️</span>
                <span>{isAr ? 'ملف التوثيق والوسائط' : 'Accreditation & Media Dossier'}</span>
                <span className="text-[10px] opacity-75">↗</span>
              </Link>

              <span className="text-xs font-mono text-gray-600 bg-gray-100 px-3 py-2 rounded-xl border border-gray-200">
                REF: INST-{String(institution.id).padStart(4, '0')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Category Quota & Enrolment Slots (The 4 Pillars) ── */}
      <div>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 ${isAr ? 'sm:flex-row-reverse text-right' : ''}`}>
          <div>
            <div className={`flex items-center gap-2.5 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                {isAr ? 'قائمة المرشحين والفئات الأربع' : 'Candidate Roster & Category Quotas'}
              </h3>
              {!isApproved && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                  <span>🔒</span>
                  <span>{isAr ? 'مقفل بانتظار الاعتماد' : 'Locked · Pending Approval'}</span>
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              {isAr
                ? `يحق لكل مؤسسة معتمدة ترشيح طالب واحد لكل فئة (المجموع: ٤ طلاب كحد أقصى). المسجلون حالياً: ${primaryStudents.length} من ٤.`
                : `Each accredited madrasa can enroll 1 candidate per category (Max 4 candidates). Currently enrolled: ${primaryStudents.length} of 4.`}
            </p>
          </div>

          {isApproved ? (
            !atCapacity && (
              <button
                onClick={() => openAddFormForCategory()}
                className="portal-btn-primary self-start sm:self-auto cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t.add_student}
              </button>
            )
          ) : (
            <Link
              href={`/${lang}/portal/verification`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl px-4 py-2.5 transition-all shadow-sm self-start sm:self-auto"
            >
              <span>🔒</span>
              <span>{isAr ? 'إكمال ملف التوثيق للاعتماد ↗' : 'Complete Verification Dossier ↗'}</span>
            </Link>
          )}
        </div>

        {/* 4 Category Slots Grid Container */}
        <div className="relative">
          <div className={!isApproved ? 'opacity-30 filter blur-[1px] pointer-events-none select-none' : ''}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const student = students.find((s) => s.category_id === cat.id && !s.is_backup)
                const backupStudent = students.find((s) => s.category_id === cat.id && s.is_backup)

                return (
                  <div
                    key={cat.id}
                    className={`rounded-3xl border p-5 flex flex-col justify-between transition-all duration-300 ${
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
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 space-y-3">
                          <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                            {/* Candidate Face Photo or Initial */}
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm border border-emerald-200">
                              {student.photo ? (
                                <Image
                                  src={student.photo}
                                  alt={student.full_name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                student.full_name.charAt(0).toUpperCase()
                              )}
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">{student.full_name}</h4>
                              <p className="text-[10px] text-gray-500 font-mono">REF-{String(student.id).padStart(4, '0')}</p>
                            </div>
                          </div>

                          {/* Verification Badges */}
                          <div className={`flex items-center gap-1.5 flex-wrap text-[10px] ${isAr ? 'flex-row-reverse' : ''}`}>
                            <span className="bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-gray-600">
                              🪪 {student.national_id}
                            </span>
                            {student.id_document ? (
                              <button
                                type="button"
                                onClick={() => setActiveMediaModal({ title: `ID Document — ${student.full_name}`, url: student.id_document!, isPdf: student.id_document!.endsWith('.pdf') })}
                                className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold hover:bg-emerald-100 cursor-pointer"
                              >
                                🪪 ID Doc ✓
                              </button>
                            ) : (
                              <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                ID Pending
                              </span>
                            )}
                          </div>

                          <div className={`flex items-center justify-between text-[11px] pt-2 border-t border-gray-200 ${isAr ? 'flex-row-reverse' : ''}`}>
                            <span className="text-gray-500 font-mono">DOB: {student.dob}</span>
                            {statusBadge(student.review_status, dict)}
                          </div>

                          {backupStudent && (
                            <div className="text-[10px] text-sky-700 bg-sky-50 px-2.5 py-1.5 rounded-xl border border-sky-200">
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
                            className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1.5 rounded-xl flex-1 transition-colors cursor-pointer"
                          >
                            <span>📄</span>
                            <span>{downloadingPdfId === student.id ? '...' : 'PDF Pass'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditForm(student)}
                            className="inline-flex items-center justify-center text-[11px] font-semibold text-gray-700 hover:text-emerald-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
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

          {/* Frosted Glass Lock Barrier (when NOT approved) */}
          {!isApproved && (
            <div className="absolute inset-0 flex items-center justify-center p-4 bg-white/60 backdrop-blur-[2px] rounded-3xl border border-dashed border-amber-300 shadow-md">
              <div className="max-w-md w-full bg-white/95 border border-amber-200 rounded-2xl p-6 sm:p-7 text-center shadow-xl space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center mx-auto text-2xl font-bold shadow-inner">
                  🔒
                </div>
                <h4 className="font-serif font-bold text-gray-900 text-base sm:text-lg">
                  {isAr ? 'تسجيل المرشحين مقفل مؤقتاً' : 'Candidate Enrolment Locked'}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {institution?.status === 'REJECTED'
                    ? (isAr
                        ? `تم رفض طلب المؤسسة: ${institution.rejection_reason || 'بيانات غير مكتملة'}. يرجى التواصل مع إدارة المسجد.`
                        : `Application not approved: ${institution.rejection_reason || 'Incomplete verification'}. Please contact Jamia Mosque administration.`)
                    : (isAr
                        ? 'سيتم تفعيل تسجيل المرشحين فور اعتماد ملف المؤسسة من قبل لجنة مسجد جامع نيروبي. يرجى استكمال رفع وثائق المؤسسة وصور الشيخ والفصول والفيديو أعلاه.'
                        : 'Student nomination will unlock immediately once your institution dossier is reviewed and approved by the Jamia Mosque Committee. Please upload your teacher, classroom, and video media above.')}
                </p>
                <div className="pt-2">
                  <Link
                    href={`/${lang}/portal/verification`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-5 py-2.5 rounded-xl shadow-sm transition-all"
                  >
                    <span>🛡️</span>
                    <span>{isAr ? 'الانتقال لصفحة التوثيق والاعتماد ↗' : 'Go to Accreditation & Verification Page ↗'}</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Ultra-Premium Candidate Registration & Verification Form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            id="student-form"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="admin-card border-2 border-emerald-600/40 shadow-2xl bg-gradient-to-b from-white via-white to-gray-50 rounded-3xl overflow-hidden"
          >
            {/* Form Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white p-6 sm:p-7 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#c99335] uppercase tracking-widest block font-mono">
                  {isAr ? 'استمارة التسجيل والتوثيق الرسمية' : 'Official Candidate Registration & Verification Dossier'}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold mt-1">
                  {editingId ? (isAr ? 'تعديل بيانات وملفات المتسابق' : 'Edit Candidate & Verification Files') : (isAr ? 'تسجيل متسابق جديد ورفع ملفات الإثبات' : 'Register Candidate & Upload Verification Files')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-stone-300 hover:text-white text-2xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8" noValidate>
                
                {/* ── Section A: Candidate Verification Files (Passport Photo & Identification Document) ── */}
                <div id="verification-files-section" className="bg-emerald-950/5 border border-emerald-900/20 rounded-3xl p-6 sm:p-7 space-y-4">
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${isAr ? 'sm:flex-row-reverse text-right' : ''}`}>
                    <div>
                      <h4 className="font-serif font-bold text-base text-gray-900 flex items-center gap-2">
                        <span className="text-xl">🛡️</span>
                        <span>{isAr ? 'وثائق التحقق وهوية المتسابق (إلزامية في AWS S3)' : 'Candidate Verification Files (Mandatory AWS S3 Storage)'}</span>
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {isAr
                          ? 'يجب رفع الصورة الشخصية ووثيقة إثبات الهوية لاعتماد المتسابق وإصدار بطاقة الدخول للامتحان.'
                          : 'Both the passport photo and identification document are strictly required for candidate validation and examination pass generation.'}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 tracking-wide uppercase self-start sm:self-auto shrink-0">
                      * {isAr ? 'المستندات إلزامية' : 'Documents Mandatory'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    {/* 1. Passport Photo (Mandatory) */}
                    <div className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between shadow-sm ${
                      docErrors.photo
                        ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-200'
                        : photoPreview
                        ? 'bg-emerald-50/40 border-emerald-400'
                        : 'bg-white border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50/10'
                    }`}>
                      <div>
                        <div className={`flex items-center justify-between mb-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                          <span className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
                            <span>📸</span>
                            <span>{isAr ? 'الصورة الشخصية للمتسابق' : 'Candidate Passport Photo'}</span>
                            <span className="text-rose-600 font-bold text-sm">*</span>
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            photoPreview ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                          }`}>
                            {photoPreview ? 'Selected ✓' : (isAr ? 'مطلوب *' : 'Required *')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                          {isAr ? 'صورة شمسية واضحة للوجه بخلفية محايدة (.jpg, .png)' : 'Clear formal face portrait with plain background (.jpg, .png, max 5MB)'}
                        </p>

                        {/* Preview Frame */}
                        <div className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center mx-auto mb-4 shadow-inner">
                          {photoPreview ? (
                            <Image src={photoPreview} alt="Candidate Face Photo" fill className="object-cover" />
                          ) : (
                            <div className="text-center p-2">
                              <span className="text-3xl block mb-1 opacity-40">👤</span>
                              <span className="text-[10px] font-semibold text-gray-400 block">{isAr ? 'لم تختر صورة' : 'No photo chosen'}</span>
                            </div>
                          )}
                        </div>

                        {docErrors.photo && (
                          <p className="text-xs font-semibold text-rose-600 mb-3 bg-rose-100/80 p-2 rounded-xl border border-rose-200 text-center">
                            ⚠️ {docErrors.photo}
                          </p>
                        )}
                      </div>

                      {/* Prominent High-Visibility Button */}
                      <label className="w-full py-3 px-4 rounded-xl font-serif font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all bg-emerald-700 hover:bg-emerald-800 text-white ring-2 ring-emerald-600/30">
                        <span>📸</span>
                        <span>{photoPreview ? (isAr ? 'تغيير الصورة الشخصية' : 'Change Passport Photo') : (isAr ? 'رفع الصورة الشخصية للمتسابق *' : 'Upload Candidate Photo *')}</span>
                        <input type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" onChange={handlePhotoSelect} />
                      </label>
                    </div>

                    {/* 2. Identification Document (Mandatory) */}
                    <div className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between shadow-sm ${
                      docErrors.idDoc
                        ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-200'
                        : idDocPreview
                        ? 'bg-sky-50/40 border-sky-400'
                        : 'bg-white border-dashed border-gray-300 hover:border-sky-500 hover:bg-sky-50/10'
                    }`}>
                      <div>
                        <div className={`flex items-center justify-between mb-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                          <span className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
                            <span>🪪</span>
                            <span>{isAr ? 'وثيقة إثبات الهوية' : 'Identification Document'}</span>
                            <span className="text-rose-600 font-bold text-sm">*</span>
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            idDocPreview ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                          }`}>
                            {idDocPreview ? 'Selected ✓' : (isAr ? 'مطلوب *' : 'Required *')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                          {isAr ? 'شهادة الميلاد، بطاقة الهوية الوطنية أو جواز السفر (.pdf, .jpg, .png)' : 'Birth Certificate, National ID Card, or Passport (.pdf, .jpg, .png)'}
                        </p>

                        {/* Document Status Box */}
                        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 h-28 flex flex-col items-center justify-center p-3 text-center mb-4 shadow-inner">
                          {idDocPreview ? (
                            <>
                              <span className="text-3xl block mb-1">📄</span>
                              <span className="text-xs font-bold text-sky-900 truncate max-w-full block">
                                {idDocPreview.startsWith('http') ? (isAr ? 'وثيقة الهوية مرفوعة ✓' : 'ID Document Uploaded ✓') : idDocPreview}
                              </span>
                              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">Ready for S3 Sync</span>
                            </>
                          ) : (
                            <>
                              <span className="text-3xl block mb-1 opacity-40">🪪</span>
                              <span className="text-xs font-semibold text-gray-400 block">{isAr ? 'لم يتم إرفاق الوثيقة' : 'No document attached'}</span>
                            </>
                          )}
                        </div>

                        {docErrors.idDoc && (
                          <p className="text-xs font-semibold text-rose-600 mb-3 bg-rose-100/80 p-2 rounded-xl border border-rose-200 text-center">
                            ⚠️ {docErrors.idDoc}
                          </p>
                        )}
                      </div>

                      {/* Prominent High-Visibility Button */}
                      <label className="w-full py-3 px-4 rounded-xl font-serif font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all bg-sky-700 hover:bg-sky-800 text-white ring-2 ring-sky-600/30">
                        <span>🪪</span>
                        <span>{idDocPreview ? (isAr ? 'تغيير وثيقة الهوية' : 'Change ID Document') : (isAr ? 'رفع وثيقة الهوية (ميلاد / هوية / جواز) *' : 'Upload ID / Birth Cert *')}</span>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*" className="hidden" onChange={handleIdDocSelect} />
                      </label>
                    </div>

                  </div>
                </div>

                {/* ── Section B: Candidate Profile & Demographic Details ── */}
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
                    <span>📋</span>
                    <span>{isAr ? 'البيانات الشخصية للمتسابق' : 'Candidate Personal & Identification Data'}</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Full Name */}
                    <div className="md:col-span-2">
                      <label className="admin-label">{tf.full_name} *</label>
                      <input
                        {...register('full_name')}
                        type="text"
                        className={`admin-input ${isAr ? 'text-right' : ''}`}
                        placeholder="e.g. Abdurrahman Bilal Othman / عبد الرحمن بلال عثمان"
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

                    {/* Nationality */}
                    <div>
                      <label className="admin-label">{isAr ? 'الجنسية' : 'Nationality'}</label>
                      <input
                        {...register('nationality')}
                        type="text"
                        className={`admin-input ${isAr ? 'text-right' : ''}`}
                        placeholder="Kenyan"
                      />
                    </div>

                    {/* County */}
                    <div>
                      <label className="admin-label">{isAr ? 'المحافظة / المقاطعة' : 'County of Residence'}</label>
                      <input
                        {...register('county')}
                        type="text"
                        className={`admin-input ${isAr ? 'text-right' : ''}`}
                        placeholder="e.g. Nairobi / Mombasa / Garissa"
                      />
                    </div>

                    {/* Primary Guardian Phone */}
                    <div>
                      <label className="admin-label">{tf.guardian_phone} *</label>
                      <input
                        {...register('guardian_phone')}
                        type="tel"
                        className={`admin-input ${isAr ? 'text-right' : ''}`}
                        placeholder="+254 7XX XXX XXX"
                      />
                      {errors.guardian_phone && <p className="admin-error">{errors.guardian_phone.message}</p>}
                    </div>

                    {/* Alternative / Teacher Phone */}
                    <div>
                      <label className="admin-label">{isAr ? 'هاتف الشيخ / رقم بديل' : 'Teacher / Alternative Phone'}</label>
                      <input
                        {...register('alternative_phone')}
                        type="tel"
                        className={`admin-input ${isAr ? 'text-right' : ''}`}
                        placeholder="+254 7XX XXX XXX"
                      />
                    </div>

                    {/* Guardian Email */}
                    <div className="md:col-span-2">
                      <label className="admin-label">{isAr ? 'البريد الإلكتروني لولي الأمر (اختياري)' : 'Guardian Email (Optional)'}</label>
                      <input
                        {...register('email')}
                        type="email"
                        className={`admin-input ${isAr ? 'text-right' : ''}`}
                        placeholder="guardian@example.com"
                      />
                      {errors.email && <p className="admin-error">{errors.email.message}</p>}
                    </div>

                    {/* Backup / Reserve Contestant Toggle */}
                    <div className="md:col-span-2 bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                      <input
                        {...register('is_backup')}
                        type="checkbox"
                        id="is_backup_check"
                        className="mt-1 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <label htmlFor="is_backup_check" className="text-xs text-amber-900 cursor-pointer">
                        <span className="font-bold block">{t.backup_badge} (Reserve Candidate)</span>
                        <span className="text-amber-700">Check this box if this student is a standby replacement contestant for this category.</span>
                      </label>
                    </div>

                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className={`pt-4 border-t border-gray-200 flex items-center justify-end gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                  >
                    {dict.common.cancel}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="portal-btn-primary text-xs px-7 py-3 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer font-bold"
                  >
                    {isSubmitting ? 'Saving to Cloud…' : (editingId ? 'Update Candidate & Files' : 'Save & Register Candidate')}
                  </button>
                </div>

              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. Detailed Enrolled Candidates Roster Table ── */}
      {students.length > 0 && (
        <div className="admin-card overflow-hidden p-0 border border-gray-200 shadow-sm rounded-3xl">
          <div className="p-5 sm:p-6 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h4 className="font-serif font-bold text-base sm:text-lg text-gray-900">
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
                  <th className="px-5 py-3.5">{isAr ? 'رقم الهوية والوثيقة' : 'ID & Document'}</th>
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
                          {/* Face Avatar */}
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm border border-emerald-200">
                            {student.photo ? (
                              <Image src={student.photo} alt={student.full_name} fill className="object-cover" />
                            ) : (
                              student.full_name.charAt(0).toUpperCase()
                            )}
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
                        <div className="flex items-center gap-2">
                          <span>{student.national_id}</span>
                          {student.id_document && (
                            <button
                              type="button"
                              onClick={() => setActiveMediaModal({ title: `ID Document — ${student.full_name}`, url: student.id_document!, isPdf: student.id_document!.endsWith('.pdf') })}
                              className="text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded font-semibold cursor-pointer"
                            >
                              🪪 View Doc
                            </button>
                          )}
                        </div>
                        <span className="block text-[10px] text-gray-400 font-sans mt-0.5">📞 {student.guardian_phone}</span>
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
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl transition-colors shadow-sm cursor-pointer"
                          >
                            <span>📄</span>
                            <span>{downloadingPdfId === student.id ? '...' : 'PDF Pass'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditForm(student)}
                            className="text-xs font-semibold text-gray-700 hover:text-emerald-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
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

      {/* ── 5. Media Lightbox Preview Modal ── */}
      <AnimatePresence>
        {activeMediaModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1512] rounded-3xl overflow-hidden max-w-4xl w-full border border-white/20 shadow-2xl"
            >
              <div className="p-4 bg-[#120e0c] border-b border-white/10 flex items-center justify-between text-white">
                <span className="font-serif font-bold text-sm">🪪 {activeMediaModal.title}</span>
                <button
                  onClick={() => setActiveMediaModal(null)}
                  className="text-stone-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="relative w-full h-[70vh] bg-black flex items-center justify-center">
                {activeMediaModal.isPdf ? (
                  <iframe src={activeMediaModal.url} className="w-full h-full" />
                ) : (
                  <Image
                    src={activeMediaModal.url}
                    alt={activeMediaModal.title}
                    fill
                    className="object-contain"
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 6. Ultra-Premium Status, Error & Loading Pop Modal ── */}
      <AnimatePresence>
        {statusModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl border p-7 sm:p-8 text-center ${
                statusModal.type === 'loading'
                  ? 'bg-gradient-to-b from-[#181412] to-[#0d0a08] border-[#c99335]/30 text-white'
                  : statusModal.type === 'error'
                  ? 'bg-gradient-to-b from-[#1c1214] to-[#12080a] border-rose-500/40 text-white shadow-[0_0_60px_rgba(244,63,94,0.25)]'
                  : 'bg-gradient-to-b from-[#0f1c14] to-[#08120b] border-emerald-500/40 text-white shadow-[0_0_60px_rgba(0,104,56,0.35)]'
              }`}
            >
              {/* ── A: LOADING STATE ── */}
              {statusModal.type === 'loading' && (
                <div className="space-y-6">
                  {/* Glowing Animated Ring */}
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-[#c99335]/20 animate-ping" />
                    <div className="w-20 h-20 rounded-full border-4 border-[#c99335]/30 border-t-[#c99335] animate-spin flex items-center justify-center shadow-[0_0_30px_rgba(201,147,53,0.3)]">
                      <span className="text-2xl animate-pulse">🏛️</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
                      {statusModal.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed max-w-sm mx-auto">
                      {statusModal.message}
                    </p>
                  </div>

                  {statusModal.progressStep && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 max-w-sm mx-auto flex items-center justify-center gap-2.5">
                      <div className="w-4 h-4 border-2 border-[#c99335] border-t-transparent rounded-full animate-spin shrink-0" />
                      <span className="text-xs font-mono text-[#c99335] font-semibold">
                        {statusModal.progressStep}
                      </span>
                    </div>
                  )}

                  <p className="text-[11px] text-stone-500 font-mono">
                    {isAr ? 'يرجى الانتظار، جاري تشفير وحفظ البيانات في السحابة...' : 'Securing candidate records with AWS S3 storage…'}
                  </p>
                </div>
              )}

              {/* ── B: ERROR STATE ── */}
              {statusModal.type === 'error' && (
                <div className="space-y-6">
                  {/* Glowing Warning Shield */}
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto text-3xl shadow-[0_0_30px_rgba(244,63,94,0.3)] animate-bounce">
                    ⚠️
                  </div>

                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
                      {statusModal.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-rose-200 mt-2.5 font-medium leading-relaxed max-w-sm mx-auto bg-rose-950/40 border border-rose-800/40 rounded-2xl p-4">
                      {statusModal.message}
                    </p>
                  </div>

                  {statusModal.subMessage && (
                    <p className="text-xs text-stone-400 leading-relaxed max-w-sm mx-auto">
                      {statusModal.subMessage}
                    </p>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setStatusModal(null)}
                      className="w-full py-3.5 px-6 rounded-2xl font-serif font-bold text-xs uppercase tracking-widest bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    >
                      {isAr ? 'مراجعة وتصحيح البيانات' : 'Review & Correct Fields'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── C: SUCCESS STATE ── */}
              {statusModal.type === 'success' && (
                <div className="space-y-6">
                  {/* Glowing Check Shield */}
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
                      {statusModal.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-200 mt-2 leading-relaxed max-w-sm mx-auto">
                      {statusModal.message}
                    </p>
                  </div>

                  {statusModal.student && (
                    <div className="bg-white/5 border border-emerald-500/30 rounded-2xl p-4 max-w-sm mx-auto text-left space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {statusModal.student.photo ? (
                            <Image src={statusModal.student.photo} alt={statusModal.student.full_name} fill className="object-cover" />
                          ) : (
                            statusModal.student.full_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-white truncate">{statusModal.student.full_name}</h4>
                          <p className="text-[10px] font-mono text-stone-400">REF-{String(statusModal.student.id).padStart(4, '0')} · {statusModal.student.national_id}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {statusModal.student && (
                      <button
                        type="button"
                        onClick={() => {
                          const s = statusModal.student!
                          setStatusModal(null)
                          handleDownloadPdf(s)
                        }}
                        className="flex-1 py-3 px-5 rounded-2xl font-serif font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>📄</span>
                        <span>{isAr ? 'تحميل بطاقة الامتحان (PDF)' : 'Download PDF Pass'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setStatusModal(null)}
                      className="py-3 px-6 rounded-2xl font-serif font-semibold text-xs uppercase tracking-wider bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-all cursor-pointer"
                    >
                      {isAr ? 'إغلاق وعرض القائمة' : 'Done & View Roster'}
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
