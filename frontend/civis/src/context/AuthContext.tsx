import { createContext, useContext, useEffect, useState } from 'react'
import { BACKEND_UNAVAILABLE_MESSAGE, logoutSession, refreshSession, setAuthToken, type User } from '../api/client'

interface AuthContextValue {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => Promise<void>
  isLoggedIn: boolean
  isReady: boolean
  backendUnavailable: boolean
  backendMessage: string
  retrySession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  login: () => {},
  logout: async () => {},
  isLoggedIn: false,
  isReady: false,
  backendUnavailable: false,
  backendMessage: '',
  retrySession: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [backendMessage, setBackendMessage] = useState('')

  function login(u: User, t: string) {
    setUser(u)
    setToken(t)
    setAuthToken(t)
    setBackendMessage('')
  }

  useEffect(() => {
    let active = true

    async function restoreSession() {
      if (active) setBackendMessage('')

      try {
        const response = await refreshSession()
        if (!active) return
        setUser(response.user)
        setToken(response.token)
        setAuthToken(response.token)
      } catch (error) {
        if (!active) return
        setUser(null)
        setToken(null)
        setAuthToken(null)
        if (error instanceof Error && error.message === BACKEND_UNAVAILABLE_MESSAGE) {
          setBackendMessage(error.message)
        }
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

  async function retrySession() {
    setIsReady(false)
    setUser(null)
    setToken(null)
    setAuthToken(null)

    try {
      const response = await refreshSession()
      setUser(response.user)
      setToken(response.token)
      setAuthToken(response.token)
      setBackendMessage('')
    } catch (error) {
      if (error instanceof Error && error.message === BACKEND_UNAVAILABLE_MESSAGE) {
        setBackendMessage(error.message)
      } else {
        setBackendMessage('')
      }
    } finally {
      setIsReady(true)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoggedIn: !!user && !!token,
        isReady,
        backendUnavailable: !!backendMessage,
        backendMessage,
        retrySession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
