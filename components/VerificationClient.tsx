'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { uploadInstitutionMedia } from '@/lib/api'
import type en from '@/dictionaries/en.json'

type Dict = typeof en

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

interface VerificationClientProps {
  institution: Institution
  dict: Dict
  lang: string
  token: string
}

export default function VerificationClient({
  institution: initialInst,
  dict,
  lang,
  token,
}: VerificationClientProps) {
  const isAr = lang === 'ar'
  const [institution, setInstitution] = useState<Institution>(initialInst)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null)
  const [activeImageModal, setActiveImageModal] = useState<{ title: string; url: string } | null>(null)
  const [mediaMsg, setMediaMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isApproved = institution.status === 'APPROVED'
  const isRejected = institution.status === 'REJECTED'
  const isPending = institution.status === 'PENDING'

  const mediaSlots = [
    {
      id: 'document' as const,
      title: isAr ? 'شهادة تسجيل المؤسسة' : 'Official Accreditation Certificate',
      subtitle: isAr ? 'شهادة المجلس الأعلى أو المسجد أو وثيقة الاعتماد' : 'SUPKEM / CIPK Certificate or Madrasa Registration',
      field: 'document_url' as keyof Institution,
      accept: '.pdf,.jpg,.jpeg,.png,application/pdf,image/*',
      icon: '📄',
      color: 'emerald',
      formatHint: 'PDF, JPG, PNG (Max 15MB)',
    },
    {
      id: 'teacher' as const,
      title: isAr ? 'صورة الشيخ المشرف / المعلم' : 'Head Ustadh / Lead Teacher Photo',
      subtitle: isAr ? 'صورة شخصية واضحة للشيخ أو المحفّظ' : 'Formal portrait of the supervising Ustadh / Imam',
      field: 'teacher_photo_url' as keyof Institution,
      accept: 'image/jpeg,image/png,image/jpg',
      icon: '👨‍🏫',
      color: 'sky',
      formatHint: 'JPG, PNG (Max 10MB)',
    },
    {
      id: 'classroom' as const,
      title: isAr ? 'صورة مبنى وفصول المدرسة' : 'Classroom & Madrasa Premises',
      subtitle: isAr ? 'صورة واضحة للمبنى أو قاعة الحفظ' : 'Photograph of the learning premises or Quran hall',
      field: 'classroom_photo_url' as keyof Institution,
      accept: 'image/jpeg,image/png,image/jpg',
      icon: '🏫',
      color: 'amber',
      formatHint: 'JPG, PNG (Max 10MB)',
    },
    {
      id: 'students' as const,
      title: isAr ? 'صورة الطلاب في حلقة التحفيظ' : 'Students in Session / Halaqa',
      subtitle: isAr ? 'صورة جماعية للمتسابقين أثناء الحفظ' : 'Photo of student cohort in daily memorization circle',
      field: 'students_photo_url' as keyof Institution,
      accept: 'image/jpeg,image/png,image/jpg',
      icon: '👥',
      color: 'emerald',
      formatHint: 'JPG, PNG (Max 10MB)',
    },
    {
      id: 'video' as const,
      title: isAr ? 'فيديو تعريفي / تلاوة نموذجية' : 'Introduction & Recitation Video',
      subtitle: isAr ? 'مقطع فيديو قصير لجولة في المدرسة أو تلاوة' : 'Short video showcasing madrasa overview or student recitation',
      field: 'video_url' as keyof Institution,
      accept: 'video/mp4,video/quicktime,video/webm,video/*',
      icon: '🎥',
      color: 'rose',
      formatHint: 'MP4, MOV, WEBM (Max 50MB)',
    },
  ]

  const uploadedCount = mediaSlots.filter((slot) => Boolean(institution[slot.field])).length
  const completionPercentage = Math.round((uploadedCount / mediaSlots.length) * 100)

  const handleFileUpload = async (slotId: 'document' | 'teacher' | 'classroom' | 'students' | 'video', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    const file = e.target.files[0]
    setUploadingType(slotId)
    setUploadProgress(30)
    setMediaMsg(null)

    try {
      setUploadProgress(60)
      const res = await uploadInstitutionMedia(institution.id, slotId, file)
      setUploadProgress(100)

      setInstitution((prev) => {
        const fieldMap: Record<string, keyof Institution> = {
          document: 'document_url',
          teacher: 'teacher_photo_url',
          classroom: 'classroom_photo_url',
          students: 'students_photo_url',
          video: 'video_url',
        }
        return { ...prev, [fieldMap[slotId]]: res.url }
      })

      setMediaMsg({
        type: 'success',
        text: isAr ? 'تم رفع الملف وحفظه بنجاح في السحابة' : 'File uploaded and secured successfully in AWS S3.',
      })
    } catch (err: any) {
      setMediaMsg({
        type: 'error',
        text: err.message || (isAr ? 'فشل رفع الملف' : 'Failed to upload media file.'),
      })
    } finally {
      setUploadingType(null)
      setUploadProgress(0)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-sans select-none" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* ── 1. Master Accreditation Status Plaque ── */}
      <div className={`admin-card overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-md relative transition-all ${
        isApproved
          ? 'bg-gradient-to-br from-emerald-950/90 via-[#120e0c] to-emerald-950/80 text-white border-emerald-500/40'
          : isRejected
          ? 'bg-gradient-to-br from-rose-950/90 via-[#120e0c] to-rose-950/80 text-white border-rose-500/40'
          : 'bg-gradient-to-br from-amber-950/90 via-[#120e0c] to-amber-950/80 text-white border-[#c99335]/40'
      }`}>
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c99335]/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className={`relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${isAr ? 'text-right' : 'text-left'}`}>
          
          <div className={`flex items-start gap-5 ${isAr ? 'flex-row-reverse' : ''}`}>
            {/* Status Seal Icon */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl border ${
              isApproved
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                : isRejected
                ? 'bg-rose-500/20 text-rose-300 border-rose-400/50'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/50'
            }`}>
              {isApproved ? (
                <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ) : isRejected ? (
                <svg className="w-10 h-10 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-amber-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            <div>
              <div className={`flex items-center gap-3 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
                  {institution.name}
                </h1>
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  isApproved
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                    : isRejected
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-400/50'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                }`}>
                  {isApproved
                    ? (isAr ? '✓ مؤسسة معتمدة وموثقة' : '✓ Verified & Accredited')
                    : isRejected
                    ? (isAr ? '✗ طلب الاعتماد مرفوض' : '✗ Accreditation Rejected')
                    : (isAr ? '⏳ قيد المراجعة والتدقيق' : '⏳ Verification Underway')}
                </span>
              </div>

              <p className="text-stone-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
                {isApproved
                  ? (isAr
                      ? 'تهانينا! تم اعتماد مؤسستكم رسميًا من قبل لجنة مسجد جامع نيروبي للمشاركة في مسابقة القرآن الكريم ٢٠٢٦. تم فتح تسجيل المرشحين بالكامل.'
                      : 'Congratulations! Your institution has been officially audited and approved by the Jamia Mosque Screening Committee for the 2026 Musabaqa.')
                  : isRejected
                  ? (isAr
                      ? `تم رفض الطلب: ${institution.rejection_reason || 'بيانات غير مستوفية'}. يرجى استكمال الوثائق المطلوبة أدناه للتحديث.`
                      : `Application not approved: ${institution.rejection_reason || 'Incomplete details'}. Please update your verification dossier below.`)
                  : (isAr
                      ? 'يقوم فريق التدقيق في لجنة مسجد جامع نيروبي بمراجعة بيانات المؤسسة والوثائق المرفوعة. يرجى استكمال كافة الوسائط الخمس لتسريع عملية الاعتماد.'
                      : 'The Jamia Mosque Committee is currently reviewing your accreditation submission. Please complete all 5 media slots below to expedite formal approval.')}
              </p>

              {/* Progress Bar */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-4">
                <div className="flex-1 bg-white/10 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isApproved ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-400 to-[#c99335]'
                    }`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-stone-300 font-semibold whitespace-nowrap">
                  {uploadedCount}/5 {isAr ? 'مكتمل' : 'Uploaded'} ({completionPercentage}%)
                </span>
              </div>
            </div>

          </div>

          {/* Right Action: Next step CTA */}
          <div className={`flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0 ${isAr ? 'lg:items-start' : ''}`}>
            <span className="text-xs font-mono text-stone-300 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
              REF: INST-{String(institution.id).padStart(4, '0')}
            </span>

            {isApproved ? (
              <Link
                href={`/${lang}/portal/students`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all"
              >
                <span>👥</span>
                <span>{isAr ? 'الانتقال لتسجيل المرشحين ←' : 'Manage Student Candidates →'}</span>
              </Link>
            ) : (
              <div className="text-xs text-amber-200 bg-amber-950/60 border border-amber-500/40 px-4 py-2 rounded-xl">
                🔒 {isAr ? 'المرشحون مقفلون حتى الاعتماد' : 'Candidate roster unlocks on approval'}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── 2. Media Feedback Alert ── */}
      {mediaMsg && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-3 shadow-sm ${
          mediaMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
            : 'bg-rose-50 text-rose-900 border border-rose-300'
        }`}>
          <span className="text-lg">{mediaMsg.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{mediaMsg.text}</span>
        </div>
      )}

      {/* ── 3. The 5-Slot Media Dossier Studio ── */}
      <div>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 ${isAr ? 'sm:flex-row-reverse text-right' : ''}`}>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
              {isAr ? 'ملف التوثيق والوسائط الخمس' : '5-Asset Accreditation & Verification Dossier'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {isAr
                ? 'ارفع الوثيقة الرسمية، صورة الشيخ المشرف، الفصول، الطلاب في الحلقة، وفيديو تعريفي.'
                : 'Upload each verification requirement below to be reviewed directly by the Jamia Mosque Committee.'}
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            S3: institutions/{institution.name.replace(/\s+/g, '_')}/
          </span>
        </div>

        {/* 5-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mediaSlots.map((slot, index) => {
            const fileUrl = institution[slot.field] as string | undefined
            const isUploaded = Boolean(fileUrl)
            const isUploadingThis = uploadingType === slot.id

            return (
              <div
                key={slot.id}
                className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md ${
                  isUploaded ? 'border-emerald-300/80 bg-white' : 'border-gray-200 bg-gray-50/50'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className={`flex items-center justify-between gap-3 mb-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-lg shadow-sm">
                        {slot.icon}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 font-mono">REQUIREMENT 0{index + 1}</span>
                        <h3 className="font-serif font-bold text-sm text-gray-900 leading-tight">{slot.title}</h3>
                      </div>
                    </div>
                    
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase font-mono ${
                      isUploaded
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      {isUploaded ? (isAr ? 'مكتمل ✓' : 'Uploaded ✓') : (isAr ? 'مطلوب' : 'Pending')}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">{slot.subtitle}</p>

                  {/* Preview Container */}
                  <div className="relative rounded-xl border border-gray-200/80 bg-gray-50 h-40 flex items-center justify-center overflow-hidden group">
                    {fileUrl ? (
                      slot.id === 'video' ? (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                          <video src={fileUrl} className="w-full h-full object-cover opacity-75" />
                          <button
                            type="button"
                            onClick={() => setActiveVideoModal(fileUrl)}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-all text-white text-3xl cursor-pointer"
                          >
                            ▶
                          </button>
                        </div>
                      ) : slot.id === 'document' && fileUrl.endsWith('.pdf') ? (
                        <div className="text-center p-4">
                          <span className="text-3xl block mb-1">📄</span>
                          <span className="text-xs font-bold text-emerald-800 block">PDF Document Secured</span>
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-emerald-600 hover:underline mt-1 inline-block"
                          >
                            {isAr ? 'عرض الملف في نافذة جديدة ↗' : 'Open Document ↗'}
                          </a>
                        </div>
                      ) : (
                        <div className="relative w-full h-full">
                          <Image
                            src={fileUrl}
                            alt={slot.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setActiveImageModal({ title: slot.title, url: fileUrl })}
                            className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 cursor-pointer"
                          >
                            🔍 {isAr ? 'تكبير الصورة' : 'View Full Image'}
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="text-center p-4 text-gray-400">
                        <span className="text-2xl block mb-1 opacity-60">{slot.icon}</span>
                        <span className="text-xs font-medium block text-gray-500">{isAr ? 'لم يتم الرفع بعد' : 'No file uploaded yet'}</span>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">{slot.formatHint}</span>
                      </div>
                    )}

                    {isUploadingThis && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
                        <span className="text-xs font-bold text-emerald-900">Uploading to AWS S3…</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Action Trigger */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <label className="portal-btn-primary flex-1 !py-2 text-center text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
                    <span>{isUploaded ? '🔄' : '⬆️'}</span>
                    <span>{isUploadingThis ? 'Uploading…' : (isUploaded ? (isAr ? 'استبدال الملف' : 'Replace File') : (isAr ? 'رفع الملف' : 'Upload File'))}</span>
                    <input
                      type="file"
                      accept={slot.accept}
                      className="hidden"
                      disabled={uploadingType !== null}
                      onChange={(e) => handleFileUpload(slot.id, e)}
                    />
                  </label>

                  {isUploaded && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-emerald-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-xs font-bold"
                      title="Open Original in New Tab"
                    >
                      ↗
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 4. Video Player Modal ── */}
      <AnimatePresence>
        {activeVideoModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1512] rounded-3xl overflow-hidden max-w-3xl w-full border border-white/20 shadow-2xl"
            >
              <div className="p-4 bg-[#120e0c] border-b border-white/10 flex items-center justify-between text-white">
                <span className="font-serif font-bold text-sm">🎥 Introduction & Recitation Video</span>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="text-stone-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="p-2 bg-black aspect-video flex items-center justify-center">
                <video src={activeVideoModal} controls autoPlay className="w-full h-full" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 5. Image Lightbox Modal ── */}
      <AnimatePresence>
        {activeImageModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1512] rounded-3xl overflow-hidden max-w-4xl w-full border border-white/20 shadow-2xl"
            >
              <div className="p-4 bg-[#120e0c] border-b border-white/10 flex items-center justify-between text-white">
                <span className="font-serif font-bold text-sm">🔍 {activeImageModal.title}</span>
                <button
                  onClick={() => setActiveImageModal(null)}
                  className="text-stone-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="relative w-full h-[70vh] bg-black">
                <Image
                  src={activeImageModal.url}
                  alt={activeImageModal.title}
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
