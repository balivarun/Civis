import { createContext, useContext, useEffect, useState } from 'react'
import { logoutSession, refreshSession, setAuthToken, type User } from '../api/client'

interface AuthContextValue {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => Promise<void>
  isLoggedIn: boolean
  isReady: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  login: () => {},
  logout: async () => {},
  isLoggedIn: false,
  isReady: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  function login(u: User, t: string) {
    setUser(u)
    setToken(t)
    setAuthToken(t)
  }

  useEffect(() => {
    let active = true
    async function restoreSession() {
      try {
        const response = await refreshSession()
        if (!active) return
        setUser(response.user)
        setToken(response.token)
        setAuthToken(response.token)
      } catch {
        if (!active) return
        setUser(null)
        setToken(null)
        setAuthToken(null)
      } finally {
        if (active) setIsReady(true)
      }
    }

    void restoreSession()
    return () => {
      active = false
    }
  }, [])

  async function logout() {
    try {
      await logoutSession()
    } catch {
      // Always clear local auth state even if server logout fails.
    } finally {
      setUser(null)
      setToken(null)
      setAuthToken(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!user && !!token, isReady }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
