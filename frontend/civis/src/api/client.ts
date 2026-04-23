export interface User {
  id: string
  name: string
  mobile: string
  email: string
  authType: 'mobile' | 'gmail'
  admin: boolean
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface Complaint {
  id: string
  userId: string
  category: string
  categoryIcon: string
  title: string
  description: string
  imageDataUrl: string
  location: string
  landmark: string
  status: 'Submitted' | 'Acknowledged' | 'Under Review' | 'In Progress' | 'Resolved'
  priority: 'Low' | 'Medium' | 'High'
  createdAt: string
  updatedAt: string
  timeline: { status: string; note: string; date: string }[]
}

export interface AdminComplaintSummary {
  id: string
  userId: string
  reporterName: string
  reporterMobile: string
  reporterEmail: string
  category: string
  categoryIcon: string
  title: string
  description: string
  location: string
  landmark: string
  status: 'Submitted' | 'Acknowledged' | 'Under Review' | 'In Progress' | 'Resolved'
  priority: 'Low' | 'Medium' | 'High'
  createdAt: string
  updatedAt: string
}

export interface GenerateComplaintDescriptionPayload {
  category?: string
  title?: string
  draftDescription?: string
  location?: string
  landmark?: string
}

export interface GenerateComplaintDescriptionResponse {
  description: string
}

export interface PublicStats {
  total: number
  resolved: number
  locations: number
  resolutionRate: number
  categoryCounts: Record<string, number>
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
}

export interface OtpResponse {
  message: string
  otp: string | null
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const API_TARGET = API_BASE_URL || window.location.origin
export const BACKEND_UNAVAILABLE_MESSAGE = `Backend is unreachable. Check the API server and CORS settings for ${API_TARGET}/api.`
let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (options.body) headers['Content-Type'] = 'application/json'
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, {
      method: options.method ?? 'GET',
      headers: Object.keys(headers).length ? headers : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: 'include',
    })
  } catch {
    throw new Error(BACKEND_UNAVAILABLE_MESSAGE)
  }

  if (!response.ok) {
    let message = 'Something went wrong.'
    try {
      const data = await response.json()
      if (typeof data?.message === 'string') message = data.message
    } catch {
      // Ignore parse errors and fall back to a generic message.
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export async function requestRegisterOtp(name: string, mobile: string) {
  return request<OtpResponse>('/auth/register/mobile/request-otp', {
    method: 'POST',
    body: { name, mobile },
  })
}

export async function verifyRegisterOtp(name: string, mobile: string, otp: string) {
  return request<AuthResponse>('/auth/register/mobile/verify', {
    method: 'POST',
    body: { name, mobile, otp },
  })
}

export async function registerWithEmail(name: string, email: string, password: string, adminAccess = false) {
  return request<AuthResponse>('/auth/register/email', {
    method: 'POST',
    body: { name, email, password, adminAccess },
  })
}

export async function requestLoginOtp(mobile: string) {
  return request<OtpResponse>('/auth/login/mobile/request-otp', {
    method: 'POST',
    body: { mobile },
  })
}

export async function verifyLoginOtp(mobile: string, otp: string) {
  return request<AuthResponse>('/auth/login/mobile/verify', {
    method: 'POST',
    body: { mobile, otp },
  })
}

export async function loginWithEmail(email: string, password: string, adminAccess = false) {
  return request<AuthResponse>('/auth/login/email', {
    method: 'POST',
    body: { email, password, adminAccess },
  })
}

export async function signInWithGoogle(idToken: string, adminAccess = false) {
  return request<AuthResponse>('/auth/google', {
    method: 'POST',
    body: { idToken, adminAccess },
  })
}

export async function refreshSession() {
  return request<AuthResponse>('/auth/refresh', { method: 'POST' })
}

export async function logoutSession() {
  return request<{ message: string }>('/auth/logout', { method: 'POST' })
}

export async function deleteAccountSession() {
  return request<{ message: string }>('/auth/account', { method: 'DELETE' })
}

export async function changePassword(oldPassword: string, newPassword: string, confirmNewPassword: string) {
  return request<{ message: string }>('/auth/change-password', {
    method: 'POST',
    body: { oldPassword, newPassword, confirmNewPassword },
  })
}

export async function getComplaintsByUser() {
  return request<Complaint[]>('/complaints')
}

export async function getPublicStats() {
  return request<PublicStats>('/complaints/stats')
}

export async function getComplaintById(id: string) {
  return request<Complaint>(`/complaints/${encodeURIComponent(id)}`)
}

export async function getAdminComplaints() {
  return request<AdminComplaintSummary[]>('/complaints/admin/all')
}

export async function updateAdminComplaintStatus(id: string, status: Complaint['status']) {
  return request<Complaint>(`/complaints/admin/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { status },
  })
}

export async function createComplaint(payload: {
  category: string
  categoryIcon: string
  title: string
  description: string
  mobileNumber?: string
  imageDataUrl?: string
  location: string
  landmark: string
  priority: 'Low' | 'Medium' | 'High'
}) {
  return request<Complaint>('/complaints', {
    method: 'POST',
    body: payload,
  })
}

export async function generateComplaintDescription(payload: GenerateComplaintDescriptionPayload) {
  return request<GenerateComplaintDescriptionResponse>('/complaints/ai/generate-description', {
    method: 'POST',
    body: payload,
  })
}
