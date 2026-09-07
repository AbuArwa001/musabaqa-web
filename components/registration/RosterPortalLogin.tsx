'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Search,
  KeyRound,
  ShieldCheck,
  Send,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import {
  requestInstitutionOtp,
  verifyInstitutionOtp,
  type InstitutionDirectoryItem,
  ApiError,
} from '@/lib/api'
import type en from '@/dictionaries/en.json'

type Dict = typeof en

interface RosterPortalLoginProps {
  institutions: InstitutionDirectoryItem[]
  dict: Dict
  lang: string
}

export default function RosterPortalLogin({
  institutions,
  dict,
  lang,
}: RosterPortalLoginProps) {
  const router = useRouter()
  const t = dict.registration_options
  const isAr = lang === 'ar'

  const [selectedInst, setSelectedInst] = useState<InstitutionDirectoryItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [channel, setChannel] = useState<'SMS' | 'EMAIL'>('SMS')
  const [contactInput, setContactInput] = useState('')
  const [step, setStep] = useState<'SELECT' | 'CONFIRM_IDENTITY' | 'VERIFY_OTP'>('SELECT')

  const [otpCode, setOtpCode] = useState('')
  const [targetMasked, setTargetMasked] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Filter institutions list
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

  // Step 1: Select Institution & Move to Identity Confirmation
  function handleSelectInstitution(inst: InstitutionDirectoryItem) {
    setSelectedInst(inst)
    setContactInput('')
    setErrorMessage('')
    setStep('CONFIRM_IDENTITY')
  }

  // Step 2: Confirm Identity & Send OTP
  async function handleSendOtp() {
    if (!selectedInst || !contactInput.trim()) {
      setErrorMessage(
        isAr
          ? 'يرجى إدخال رقم الهاتف أو البريد الإلكتروني كاملاً'
          : 'Please enter your full registered phone or email address.'
      )
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const res = await requestInstitutionOtp({
        institution_id: selectedInst.id,
        channel,
        contact_input: contactInput.trim(),
      })
      setTargetMasked(res.target_masked)
      setStep('VERIFY_OTP')
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof ApiError ? err.message : t.contact_mismatch
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Verify OTP & Auto-Login
  async function handleVerifyOtp() {
    if (!selectedInst || !otpCode.trim()) return
    setIsLoading(true)
    setErrorMessage('')

    try {
      const res = await verifyInstitutionOtp({
        institution_id: selectedInst.id,
        code: otpCode.trim(),
        channel,
        contact_input: contactInput.trim() || undefined,
      })

      // Establish session cookie
      const sessionRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: res.access_token }),
      })

      if (!sessionRes.ok) throw new Error('Session establishment failed')

      router.push(`/${lang}/portal/students`)
      router.refresh()
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof ApiError ? err.message : 'Invalid OTP code. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card p-6 sm:p-10 shadow-2xl border-sky-500/20 bg-gradient-to-b from-[#0b1723]/90 via-[#120e0c]/95 to-black/95 relative overflow-hidden">
      {/* Background ambient blue glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="mb-6 space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles size={13} />
          <span>{t.option3_badge}</span>
        </div>
        <h3 className="font-serif text-2xl font-bold text-white">
          {t.option3_title}
        </h3>
        <p className="text-xs text-stone-400">
          {t.option3_desc}
        </p>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0 text-rose-400" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STEP 1: SELECT INSTITUTION
         ═══════════════════════════════════════════════════════════ */}
      {step === 'SELECT' && (
        <div className="space-y-6">
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
              className={`w-full bg-black/50 border border-white/15 text-white rounded-xl py-3 text-sm focus:outline-none focus:border-sky-500 transition-all ${
                isAr ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'
              }`}
            />
          </div>

          {/* Institutions list */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredInstitutions.length === 0 ? (
              <div className="p-8 text-center bg-white/[0.02] border border-white/5 rounded-xl text-stone-400 text-xs">
                <Building2 size={28} className="mx-auto mb-2 text-stone-600" />
                <p>{t.no_institutions_found}</p>
              </div>
            ) : (
              filteredInstitutions.map((inst) => (
                <button
                  key={inst.id}
                  type="button"
                  onClick={() => handleSelectInstitution(inst)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer bg-white/[0.03] border-white/10 hover:border-sky-500 hover:bg-sky-950/30 text-stone-300 ${
                    isAr ? 'text-right flex-row-reverse' : 'text-left'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white leading-snug">
                        {inst.name}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        {inst.county_name || inst.region_name_en || 'Kenya'} · Contact: {inst.contact_person}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-400 font-mono">
                      {inst.obscured_phone || inst.masked_phone}
                    </span>
                    <ArrowRight size={14} className="text-sky-400" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STEP 2: CONFIRM IDENTITY (COMPLETE OBSCURED PHONE/EMAIL)
         ═══════════════════════════════════════════════════════════ */}
      {step === 'CONFIRM_IDENTITY' && selectedInst && (
        <div className="space-y-6">
          {/* Selected Institution Banner */}
          <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <div>
                <p className="font-serif text-base font-bold text-white leading-tight">
                  {selectedInst.name}
                </p>
                <p className="text-xs text-stone-400">
                  {selectedInst.contact_person}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep('SELECT')}
              className="text-xs text-sky-400 hover:text-sky-300 underline cursor-pointer"
            >
              {t.change_institution}
            </button>
          </div>

          {/* Masked Info Reference */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
            <p className="text-stone-400 font-medium">
              {t.complete_identity_hint}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-stone-300">
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-sky-400" />
                <span>Phone: {selectedInst.obscured_phone || selectedInst.masked_phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-sky-400" />
                <span>Email: {selectedInst.obscured_email || selectedInst.masked_email}</span>
              </div>
            </div>
          </div>

          {/* Channel selector */}
          <div className="space-y-2">
            <label className="label text-xs">{t.channel_select}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setChannel('SMS')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  channel === 'SMS'
                    ? 'bg-sky-600 text-white border-sky-500 shadow-md'
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
                    ? 'bg-sky-600 text-white border-sky-500 shadow-md'
                    : 'bg-black/40 text-stone-400 border-white/10 hover:bg-black/60'
                }`}
              >
                <Mail size={14} />
                <span>{t.send_to_email}</span>
              </button>
            </div>
          </div>

          {/* Complete full contact input */}
          <div>
            <label className="label text-xs">
              {t.contact_input_label} *
            </label>
            <input
              type="text"
              required
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
              placeholder={channel === 'SMS' ? 'e.g. 0712345678 or +254712345678' : 'e.g. mudir@madrasa.org'}
              className="input-field"
            />
          </div>

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isLoading || !contactInput.trim()}
            className="btn-primary w-full !bg-gradient-to-r !from-sky-600 !to-sky-800 hover:!from-sky-500 hover:!to-sky-700 !border-sky-500/40 flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(14,165,233,0.3)]"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Verifying & Sending OTP...</span>
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

      {/* ═══════════════════════════════════════════════════════════
          STEP 3: ENTER 6-DIGIT OTP & ENTER PORTAL
         ═══════════════════════════════════════════════════════════ */}
      {step === 'VERIFY_OTP' && (
        <div className="space-y-6 max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 mx-auto">
            <KeyRound size={28} />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-bold text-white">
              {t.enter_otp_label}
            </h3>
            <p className="text-xs text-stone-300">
              {t.otp_sent_to.replace('{target}', targetMasked || contactInput)}
            </p>
          </div>

          <div>
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="w-48 mx-auto text-center font-mono text-2xl tracking-[0.5em] bg-black/60 border border-sky-500/50 text-sky-300 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isLoading || otpCode.length < 6}
              className="btn-primary w-full !bg-gradient-to-r !from-sky-600 !to-sky-800 hover:!from-sky-500 hover:!to-sky-700 !border-sky-500/40 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Entering Portal...</span>
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
                className="hover:text-sky-400 underline cursor-pointer"
              >
                {t.resend_otp}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('CONFIRM_IDENTITY')
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
    </div>
  )
}
