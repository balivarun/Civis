import type { User } from '../api/client'

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

// ── Users ──────────────────────────────────────────────
export function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem('civis_users') || '[]')
  } catch {
    return []
  }
}

export function saveUser(user: User): void {
  const users = getUsers()
  const existing = users.findIndex((u) => u.id === user.id)
  if (existing >= 0) {
    users[existing] = user
  } else {
    users.push(user)
  }
  localStorage.setItem('civis_users', JSON.stringify(users))
}

export function findUserByMobile(mobile: string): User | undefined {
  return getUsers().find((u) => u.mobile === mobile)
}

export function findUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
}

// Passwords stored separately (frontend-only demo)
export function savePassword(userId: string, password: string): void {
  const map: Record<string, string> = JSON.parse(
    localStorage.getItem('civis_passwords') || '{}'
  )
  map[userId] = password
  localStorage.setItem('civis_passwords', JSON.stringify(map))
}

export function checkPassword(userId: string, password: string): boolean {
  const map: Record<string, string> = JSON.parse(
    localStorage.getItem('civis_passwords') || '{}'
  )
  return map[userId] === password
}

// ── Complaints ─────────────────────────────────────────
export function getComplaints(): Complaint[] {
  try {
    return JSON.parse(localStorage.getItem('civis_complaints') || '[]')
  } catch {
    return []
  }
}

export function getComplaintsByUser(userId: string): Complaint[] {
  return getComplaints().filter((c) => c.userId === userId)
}

export function getComplaintById(id: string): Complaint | undefined {
  return getComplaints().find((c) => c.id === id)
}

export function saveComplaint(complaint: Complaint): void {
  const list = getComplaints()
  const existing = list.findIndex((c) => c.id === complaint.id)
  if (existing >= 0) {
    list[existing] = complaint
  } else {
    list.push(complaint)
  }
  localStorage.setItem('civis_complaints', JSON.stringify(list))
}

export function generateComplaintId(): string {
  const num = (getComplaints().length + 1).toString().padStart(4, '0')
  return `CIV-${num}`
}

export function generateUserId(): string {
  return 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
