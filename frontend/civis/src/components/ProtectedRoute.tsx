import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  redirectTo = '/login',
}: {
  children: React.ReactNode
  requireAdmin?: boolean
  redirectTo?: string
}) {
  const { isLoggedIn, isReady, user } = useAuth()
  if (!isReady) return null
  if (!isLoggedIn) return <Navigate to={redirectTo} replace />
  if (requireAdmin && !user?.admin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
