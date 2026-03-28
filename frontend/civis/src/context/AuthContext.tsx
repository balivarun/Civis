import { createContext, useContext, useState } from 'react'
import type { User } from '../api/client'

interface AuthContextValue {
  user: User | null
  login: (user: User) => void
  logout: () => void
  isLoggedIn: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoggedIn: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  function login(u: User) {
    setUser(u)
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
