import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isReady } = useAuth()
  if (!isReady) return null
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return <>{children}</>
}
