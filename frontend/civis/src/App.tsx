import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { TranslationProvider } from './context/TranslationContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import HowItWorks from './pages/HowItWorks'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ReportComplaint from './pages/ReportComplaint'
import ComplaintDetail from './pages/ComplaintDetail'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <TranslationProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Full-screen pages (no shared Navbar) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/report" element={
              <ProtectedRoute><ReportComplaint /></ProtectedRoute>
            } />
            <Route path="/complaint/:id" element={
              <ProtectedRoute><ComplaintDetail /></ProtectedRoute>
            } />

            {/* Pages with shared Navbar */}
            <Route path="/*" element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                </Routes>
              </>
            } />
          </Routes>
        </BrowserRouter>
        </AuthProvider>
      </TranslationProvider>
    </ThemeProvider>
  )
}

export default App
