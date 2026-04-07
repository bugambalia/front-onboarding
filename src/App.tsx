import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'

import { Header } from '@/components/layout/Header'
import { LoginPage } from '@/pages/LoginPage'
import { HomePage } from '@/pages/HomePage'
import { ActivatePasswordPage } from '@/pages/ActivatePasswordPage'
import './App.css'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function AppContent() {
  const location = useLocation();
  const showHeader = location.pathname !== '/login' && location.pathname !== '/' && location.pathname !== '/activate-password';

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/activate-password" element={<ActivatePasswordPage />} />

        {/* Rutas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/home/equipo" element={<HomePage />} />
          <Route path="/home/mis-solicitudes" element={<HomePage />} />
          <Route path="/home/encargado" element={<HomePage />} />
          <Route path="/home/oficinas" element={<HomePage />} />
          <Route path="/home/rrhh/signup" element={<HomePage />} />
          <Route path="/home/rrhh/onboarding" element={<HomePage />} />
          <Route path="/home/rrhh/solicitudes" element={<HomePage />} />
          <Route path="/home/rrhh/dotacion" element={<HomePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
