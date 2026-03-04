import { Navigate, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import AdminLoginPage from './pages/AdminLoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import { ADMIN_LOGIN_PATH } from './config/adminRoute'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path={ADMIN_LOGIN_PATH} element={<AdminLoginPage />} />
        <Route path="/admin-login" element={<Navigate to="/" replace />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </>
  )
}

export default App
