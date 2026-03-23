export interface User {
  id: string
  name: string
  mobile: string
  email: string
  authType: 'mobile' | 'gmail'
  createdAt: string
}

export interface Complaint {
  id: string
  userId: string
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
  timeline: { status: string; note: string; date: string }[]
}

type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method: options.method ?? 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

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
  return request<{ otp: string }>('/auth/register/mobile/request-otp', {
    method: 'POST',
    body: { name, mobile },
  })
}

export async function verifyRegisterOtp(name: string, mobile: string, otp: string) {
  return request<User>('/auth/register/mobile/verify', {
    method: 'POST',
    body: { name, mobile, otp },
  })
}

export async function registerWithEmail(name: string, email: string, password: string) {
  return request<User>('/auth/register/email', {
    method: 'POST',
    body: { name, email, password },
  })
}

export async function requestLoginOtp(mobile: string) {
  return request<{ otp: string }>('/auth/login/mobile/request-otp', {
    method: 'POST',
    body: { mobile },
  })
}

export async function verifyLoginOtp(mobile: string, otp: string) {
  return request<User>('/auth/login/mobile/verify', {
    method: 'POST',
    body: { mobile, otp },
  })
}

export async function loginWithEmail(email: string, password: string) {
  return request<User>('/auth/login/email', {
    method: 'POST',
    body: { email, password },
  })
}

export async function getComplaintsByUser(userId: string) {
  return request<Complaint[]>(`/complaints?userId=${encodeURIComponent(userId)}`)
}

export async function getComplaintById(id: string) {
  return request<Complaint>(`/complaints/${encodeURIComponent(id)}`)
}

export async function createComplaint(payload: {
  userId: string
  category: string
  categoryIcon: string
  title: string
  description: string
  location: string
  landmark: string
  priority: 'Low' | 'Medium' | 'High'
}) {
  return request<Complaint>('/complaints', {
    method: 'POST',
    body: payload,
  })
}
