'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserPlus,
  Send,
  KeyRound,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Phone,
  Mail,
  User,
} from 'lucide-react'
import {
  requestInstitutionOtp,
  verifyInstitutionOtp,
  createStudent,
  type InstitutionDirectoryItem,
  type CompetitionRead,
  type Category,
  ApiError,
} from '@/lib/api'
import type en from '@/dictionaries/en.json'

type Dict = typeof en

interface ExpressStudentIntakeProps {
  institutions: InstitutionDirectoryItem[]
  competitions: CompetitionRead[]
  categories: Category[]
  dict: Dict
  lang: string
}

export default function ExpressStudentIntake({
  institutions,
  competitions,
  categories,
  dict,
  lang,
}: ExpressStudentIntakeProps) {
  const router = useRouter()
  const t = dict.registration_options
  const isAr = lang === 'ar'

  // Pre-select the currently active competition edition
  const activeCompetition = useMemo(() => {
    return (
      competitions.find((c) => c.is_current || c.status === 'ACTIVE') ||
      competitions[0] ||
      null
    )
  }, [competitions])

  const [selectedCompId, setSelectedCompId] = useState<number>(
    activeCompetition?.id || 0
  )
  const [selectedInst, setSelectedInst] = useState<InstitutionDirectoryItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [channel, setChannel] = useState<'SMS' | 'EMAIL'>('SMS')

  // Step state: 'SELECT' | 'OTP' | 'CANDIDATE_FORM'
  const [currentStep, setCurrentStep] = useState<'SELECT' | 'OTP' | 'CANDIDATE_FORM'>('SELECT')

  // OTP Verification state
  const [otpCode, setOtpCode] = useState('')
  const [targetMasked, setTargetMasked] = useState('')
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [remainingSpots, setRemainingSpots] = useState<number>(4)

  // Candidate Registration form state
  const [fullName, setFullName] = useState('')
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 1)
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE')
  const [nationalId, setNationalId] = useState('')
  const [guardianPhone, setGuardianPhone] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [lastRegisteredStudent, setLastRegisteredStudent] = useState<{
    name: string
    category: string
  } | null>(null)

  // Filter institutions list based on search
  const filteredInstitutions = useMemo(() => {
    if (!searchQuery.trim()) return institutions
    const q = searchQuery.toLowerCase()
    return institutions.filter(
      (inst) =>
        inst.name.toLowerCase().includes(q) ||
        (inst.county_name && inst.county_name.toLowerCase().includes(q)) ||
        (inst.region_name_en && inst.region_name_en.toLowerCase().includes(q)) ||
        (inst.contact_person && inst.contact_person.toLowerCase().includes(q))
    )
  }, [institutions, searchQuery])

  // Step 1: Send OTP
  async function handleSendOtp() {
    if (!selectedInst) return
    setIsLoading(true)
    setErrorMessage('')

    try {
      const res = await requestInstitutionOtp({
        institution_id: selectedInst.id,
        channel,
      })
      setTargetMasked(res.target_masked)
      setCurrentStep('OTP')
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof ApiError ? err.message : dict.common.error
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify OTP
  async function handleVerifyOtp() {
    if (!selectedInst || !otpCode.trim()) return
    setIsLoading(true)
    setErrorMessage('')

    try {
      const res = await verifyInstitutionOtp({
        institution_id: selectedInst.id,
        code: otpCode.trim(),
        channel,
      })
      setAccessToken(res.access_token)
      setRemainingSpots(res.remaining_spots)
      setCurrentStep('CANDIDATE_FORM')
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof ApiError ? err.message : 'Invalid OTP code. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Register Student Candidate
  async function handleRegisterStudent(e: React.FormEvent) {
    e.preventDefault()
    if (!accessToken || !selectedInst) return

    if (!fullName.trim() || !dob || !nationalId.trim() || !guardianPhone.trim()) {
      setErrorMessage('Please fill in all candidate required fields.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      await createStudent(accessToken, {
        institution_id: selectedInst.id,
        category_id: categoryId,
        full_name: fullName.trim(),
        dob,
        gender,
        national_id: nationalId.trim(),
        guardian_phone: guardianPhone.trim(),
      })

      const selectedCat = categories.find((c) => c.id === categoryId)
      const catName = isAr ? (selectedCat?.name_ar || selectedCat?.name_en || '') : (selectedCat?.name_en || '')
      setLastRegisteredStudent({
        name: fullName.trim(),
        category: catName,
      })

      setRemainingSpots((prev) => Math.max(0, prev - 1))
      // Reset student form fields for next entry
      setFullName('')
      setNationalId('')
      setGuardianPhone('')
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof ApiError ? err.message : dict.common.error
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Proceed to full portal using token
  async function handleProceedToPortal() {
    if (!accessToken) return
    setIsLoading(true)
    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: accessToken }),
      })
      router.push(`/${lang}/portal/students`)
      router.refresh()
    } catch {
      router.push(`/${lang}/portal/students`)
    }
  }

  return (
    <div className="card p-6 sm:p-10 shadow-2xl border-emerald-500/20 bg-gradient-to-b from-[#131c17]/90 via-[#120e0c]/95 to-black/95 relative overflow-hidden">
      {/* Background ambient emerald glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── Active Competition Banner (Auto-Selected) ── */}
      <div className="mb-8 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              {t.active_competition}
            </span>
            <h4 className="font-serif text-base sm:text-lg font-bold text-white leading-tight">
              {isAr
                ? activeCompetition?.title_ar || activeCompetition?.title_en || 'مسابقة جامع نيروبي القرآنية'
                : activeCompetition?.title_en || 'Jamia Mosque Annual Quran Musabaqa'}
            </h4>
          </div>
        </div>

        {competitions.length > 1 && (
          <select
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(Number(e.target.value))}
            className="text-xs bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-stone-300 focus:outline-none focus:border-emerald-500"
          >
            {competitions.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {isAr ? comp.title_ar || comp.title_en : comp.title_en} ({comp.year})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0 text-rose-400" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STEP 1: SELECT INSTITUTION FROM DIRECTORY
         ═══════════════════════════════════════════════════════════ */}
      {currentStep === 'SELECT' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-white">
              {t.select_institution}
            </h3>
            <p className="text-xs text-stone-400">
              {isAr
                ? 'ابحث عن اسم مدرستك المسجلة في قائمة الأمانة العامة للمتابعة'
                : 'Select your madrasa as listed on the intake roster to verify and begin registering candidates.'}
            </p>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search
              size={18}
              className={`absolute top-3.5 text-stone-400 ${
                isAr ? 'right-4' : 'left-4'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search_institution_ph}
              className={`w-full bg-black/50 border border-white/15 text-white rounded-xl py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all ${
                isAr ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'
              }`}
            />
          </div>

          {/* Institution List Scrollable */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredInstitutions.length === 0 ? (
              <div className="p-8 text-center bg-white/[0.02] border border-white/5 rounded-xl text-stone-400 text-xs">
                <Building2 size={28} className="mx-auto mb-2 text-stone-600" />
                <p>{t.no_institutions_found}</p>
              </div>
            ) : (
              filteredInstitutions.map((inst) => {
                const isChosen = selectedInst?.id === inst.id
                return (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => setSelectedInst(inst)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isAr ? 'text-right flex-row-reverse' : 'text-left'
                    } ${
                      isChosen
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isChosen
                            ? 'bg-emerald-500 text-black'
                            : 'bg-white/5 text-stone-400'
                        }`}
                      >
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-white leading-snug">
                          {inst.name}
                        </p>
                        <p className="text-[11px] text-stone-400">
                          {inst.county_name || inst.region_name_en || 'Kenya'} · {inst.contact_person}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {(() => {
                        const spots = inst.available_spots ?? inst.remaining_spots ?? 4
                        return (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              spots > 0
                                ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
                                : 'text-stone-400 bg-stone-500/10 border-stone-500/30'
                            }`}
                          >
                            {spots > 0
                              ? t.remaining_spots_badge.replace('{count}', spots.toString())
                              : t.spots_exhausted}
                          </span>
                        )
                      })()}
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isChosen
                            ? 'border-emerald-500 bg-emerald-500 text-black'
                            : 'border-stone-600'
                        }`}
                      >
                        {isChosen && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Verification Channel & Trigger Button */}
          {selectedInst && (
            <div className="p-5 rounded-2xl bg-emerald-900/20 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 font-semibold">{t.channel_select}</span>
                <span className="text-emerald-400 font-mono text-[11px]">
                  {channel === 'SMS'
                    ? (selectedInst.obscured_phone || selectedInst.masked_phone)
                    : (selectedInst.obscured_email || selectedInst.masked_email)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setChannel('SMS')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    channel === 'SMS'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-black/40 text-stone-400 border-white/10 hover:bg-black/60'
                  }`}
                >
                  <Phone size={14} />
                  <span>{t.send_to_phone}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('EMAIL')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    channel === 'EMAIL'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-black/40 text-stone-400 border-white/10 hover:bg-black/60'
                  }`}
                >
                  <Mail size={14} />
                  <span>{t.send_to_email}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Dispatching OTP...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>{t.send_otp_btn}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STEP 2: OTP VERIFICATION
         ═══════════════════════════════════════════════════════════ */}
      {currentStep === 'OTP' && (
        <div className="space-y-6 max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
            <KeyRound size={28} />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-bold text-white">
              {t.enter_otp_label}
            </h3>
            <p className="text-xs text-stone-300">
              {t.otp_sent_to.replace('{target}', targetMasked || 'registered contact')}
            </p>
          </div>

          <div>
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="w-48 mx-auto text-center font-mono text-2xl tracking-[0.5em] bg-black/60 border border-emerald-500/50 text-emerald-300 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isLoading || otpCode.length < 6}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>{t.verify_otp_btn}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-stone-400 px-2">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="hover:text-emerald-400 underline cursor-pointer"
              >
                {t.resend_otp}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentStep('SELECT')
                  setOtpCode('')
                }}
                className="hover:text-stone-200 cursor-pointer"
              >
                {t.change_institution}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STEP 3: CANDIDATE REGISTRATION (INSTANT ROSTER INTAKE)
         ═══════════════════════════════════════════════════════════ */}
      {currentStep === 'CANDIDATE_FORM' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                {isAr ? 'المؤسسة المعتمدة' : 'Verified Institution'}
              </span>
              <h3 className="font-serif text-xl font-bold text-white">
                {selectedInst?.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                {t.remaining_spots_badge.replace('{count}', remainingSpots.toString())}
              </span>
            </div>
          </div>

          {/* Success Banner if a student was just registered */}
          {lastRegisteredStudent && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-300">
                    {t.student_registered_success}
                  </p>
                  <p className="text-[11px] text-stone-300">
                    {lastRegisteredStudent.name} ({lastRegisteredStudent.category})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToPortal}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 shrink-0"
              >
                <span>{t.finish_and_portal}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {remainingSpots > 0 ? (
            <form onSubmit={handleRegisterStudent} className="space-y-4">
              <div className="space-y-1 mb-2">
                <h4 className="font-serif text-lg font-bold text-white">
                  {t.candidate_intake_title}
                </h4>
                <p className="text-xs text-stone-400">
                  {t.candidate_intake_sub}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="label text-xs">{t.student_name} *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ibrahim Ahmed Mohammed"
                    className="input-field"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="label text-xs">{t.slot_category} *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="input-field bg-black/60"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {isAr ? cat.name_ar : cat.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="label text-xs">{t.student_gender} *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')}
                    className="input-field bg-black/60"
                  >
                    <option value="MALE">{t.student_male}</option>
                    <option value="FEMALE">{t.student_female}</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="label text-xs">{t.student_dob} *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* National ID / Nemis */}
                <div>
                  <label className="label text-xs">{t.student_id_num} *</label>
                  <input
                    type="text"
                    required
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="Birth Cert No. or NEMIS"
                    className="input-field"
                  />
                </div>

                {/* Guardian Phone */}
                <div className="sm:col-span-2">
                  <label className="label text-xs">{t.guardian_phone} *</label>
                  <input
                    type="tel"
                    required
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="e.g. 0712345678"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleProceedToPortal}
                  className="btn-secondary w-full sm:w-auto text-xs"
                >
                  {t.finish_and_portal}
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={15} />
                      <span>{t.submit_student_btn}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center bg-white/[0.02] border border-white/10 rounded-2xl space-y-4">
              <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
              <h4 className="font-serif text-xl font-bold text-white">
                {t.spots_exhausted}
              </h4>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                {isAr
                  ? 'تم تسجيل كافة المقاعد الأربعة المتاحة لهذه المؤسسة بنجاح.'
                  : 'All 4 candidate spots have been successfully registered for this institution.'}
              </p>
              <button
                type="button"
                onClick={handleProceedToPortal}
                className="btn-primary inline-flex items-center gap-2 text-xs"
              >
                <span>{t.finish_and_portal}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
