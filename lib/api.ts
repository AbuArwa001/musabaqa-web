// Typed API client for musabaqa-api
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const url = `${API_URL}${path}`
  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    let detail = res.statusText
    try {
      const text = await res.text()
      try {
        const body = JSON.parse(text)
        detail = body.detail || detail
      } catch (e) {
        console.error(`[API ERROR PARSING !ok] ${res.status} ${url}. Text: ${text.substring(0, 500)}`)
      }
    } catch {}
    throw new ApiError(res.status, detail)
  }

  if (res.status === 204) return undefined as T
  
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch (e) {
    console.error(`[API ERROR PARSING ok] 200 ${url}. Text length: ${text.length}. Snippet: ${text.substring(0, 500)}...${text.substring(text.length - 200)}`)
    throw e
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string
  scope: string
}

export async function loginInstitution(email: string, password: string): Promise<TokenResponse> {
  const body = new URLSearchParams({ username: email, password })
  const res = await fetch(`${API_URL}/api/v1/auth/institution/login`, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new ApiError(res.status, err.detail || 'Login failed')
  }
  return res.json()
}

// ─── Institutions ─────────────────────────────────────────────────────────────

export interface InstitutionCreate {
  name: string
  type: 'MADRASA' | 'SCHOOL' | 'MOSQUE' | 'OTHER'
  contact_person: string
  phone: string
  email: string
  password: string
  region_id: number
  preferred_language: 'EN' | 'AR'
}

export interface InstitutionRead {
  id: number
  name: string
  type: string
  contact_person: string
  phone: string
  email: string
  region_id: number | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejection_reason: string | null
  preferred_language: 'EN' | 'AR'
  created_at: string
}

export async function registerInstitution(data: InstitutionCreate): Promise<InstitutionRead> {
  return request('/api/v1/institutions/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getMyInstitution(token: string): Promise<InstitutionRead> {
  return request('/api/v1/institutions/me', {}, token)
}

// ─── Regions ──────────────────────────────────────────────────────────────────

export interface Region {
  id: number
  name_en: string
  name_ar: string
  county_id: number
}

export async function listRegions(): Promise<Region[]> {
  return request('/api/v1/regions/')
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface Category {
  id: number
  name_en: string
  name_ar: string
  min_age: number | null
  max_age: number
  category_group: string
  display_order: number
}

export async function listCategories(): Promise<Category[]> {
  return request('/api/v1/categories/')
}

// ─── Students ─────────────────────────────────────────────────────────────────

export type ReviewStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'

export interface StudentRead {
  id: number
  institution_id: number
  category_id: number
  full_name: string
  dob: string
  gender: 'MALE' | 'FEMALE'
  national_id: string
  guardian_phone: string
  photo: string | null
  id_document: string | null
  review_status: ReviewStatus
  rejection_reason: string | null
  is_backup: boolean
  is_deleted: boolean
  regret_email_sent: boolean
  created_at: string
}

export interface StudentCreate {
  institution_id: number
  category_id: number
  full_name: string
  dob: string
  gender: 'MALE' | 'FEMALE'
  national_id: string
  guardian_phone: string
  is_backup?: boolean
}

export async function listStudents(token: string): Promise<StudentRead[]> {
  return request('/api/v1/students/', {}, token)
}

export async function createStudent(token: string, data: StudentCreate): Promise<StudentRead> {
  return request('/api/v1/students/', { method: 'POST', body: JSON.stringify(data) }, token)
}

export async function updateStudent(
  token: string, id: number, data: Partial<StudentCreate>
): Promise<StudentRead> {
  return request(`/api/v1/students/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token)
}

export async function getStudent(token: string, id: number): Promise<StudentRead> {
  return request(`/api/v1/students/${id}`, {}, token)
}

export function getStudentPdfUrl(id: number): string {
  return `${API_URL}/api/v1/students/${id}/download_pdf/`
}

// ─── Results ──────────────────────────────────────────────────────────────────

export interface RoundResult {
  id: number
  round_id: number
  student_id: number
  final_score: number
  rank: number | null
  computed_at: string
  consistency_flagged: boolean
}

export async function getStudentResults(token: string, studentId: number): Promise<RoundResult[]> {
  return request(`/api/v1/results/students/${studentId}`, {}, token)
}

// ─── WebSocket URL helper ─────────────────────────────────────────────────────

export function getWsUrl(categoryId: number): string {
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
    .replace(/^http/, 'ws')
  return `${base}/ws/leaderboard/${categoryId}`
}
