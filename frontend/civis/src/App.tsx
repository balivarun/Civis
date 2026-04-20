import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { TranslationProvider } from './context/TranslationContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import HowItWorks from './pages/HowItWorks'
import FaqPage from './pages/FaqPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import ReportComplaint from './pages/ReportComplaint'
import ComplaintDetail from './pages/ComplaintDetail'
import ProfilePage from './pages/ProfilePage'
import './App.css'
import LanguageModal from './components/LanguageModal'

function BackendStatusBanner() {
  const { backendUnavailable, backendMessage, retrySession, isReady } = useAuth()

  if (!backendUnavailable) return null

  return (
    <div className="backend-banner" role="status" aria-live="polite">
      <div className="backend-banner__content">
        <strong>Backend unavailable</strong>
        <span>{backendMessage}</span>
      </div>
      <button type="button" onClick={() => void retrySession()} disabled={!isReady}>
        Retry connection
      </button>
    </div>
  )
}

function AppRoutes() {
  return (
    <>
      <BackendStatusBanner />
      <BrowserRouter>
        <Routes>
          {/* Full-screen pages (no shared Navbar) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requireAdmin redirectTo="/login"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/report" element={
            <ProtectedRoute><ReportComplaint /></ProtectedRoute>
          } />
          <Route path="/complaint/:id" element={
            <ProtectedRoute><ComplaintDetail /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><><Navbar /><ProfilePage /></></ProtectedRoute>
          } />

          {/* Pages with shared Navbar */}
          <Route path="/*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/faq" element={<FaqPage />} />
              </Routes>
            </>
          } />
        </Routes>
      </BrowserRouter>
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <TranslationProvider>
        <AuthProvider>
          <LanguageModal />
          <AppRoutes />
        </AuthProvider>
      </TranslationProvider>
    </ThemeProvider>
  )
}

export default App
