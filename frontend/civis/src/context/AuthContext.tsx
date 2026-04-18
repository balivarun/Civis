import { createContext, useContext, useEffect, useState } from 'react'
import { BACKEND_UNAVAILABLE_MESSAGE, logoutSession, refreshSession, setAuthToken, type User } from '../api/client'

interface AuthContextValue {
  user: User | null
  token: string | null
  profileImage: string
  login: (user: User, token: string) => void
  logout: () => Promise<void>
  setProfileImage: (image: string) => void
  clearProfileImage: () => void
  isLoggedIn: boolean
  isReady: boolean
  backendUnavailable: boolean
  backendMessage: string
  retrySession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  profileImage: '',
  login: () => {},
  logout: async () => {},
  setProfileImage: () => {},
  clearProfileImage: () => {},
  isLoggedIn: false,
  isReady: false,
  backendUnavailable: false,
  backendMessage: '',
  retrySession: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [profileImage, setProfileImageState] = useState('')
  const [isReady, setIsReady] = useState(false)
  const [backendMessage, setBackendMessage] = useState('')

  function login(u: User, t: string) {
    setUser(u)
    setToken(t)
    setAuthToken(t)
    setBackendMessage('')
  }

  useEffect(() => {
    if (!user) {
      setProfileImageState('')
      return
    }

    const savedImage = window.localStorage.getItem(`civis-profile-image:${user.id}`) ?? ''
    setProfileImageState(savedImage)
  }, [user])

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
      setProfileImageState('')
      setAuthToken(null)
    }
  }

  function setProfileImage(image: string) {
    if (!user) return
    setProfileImageState(image)
    window.localStorage.setItem(`civis-profile-image:${user.id}`, image)
  }

  function clearProfileImage() {
    if (!user) return
    setProfileImageState('')
    window.localStorage.removeItem(`civis-profile-image:${user.id}`)
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
        profileImage,
        login,
        logout,
        setProfileImage,
        clearProfileImage,
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
