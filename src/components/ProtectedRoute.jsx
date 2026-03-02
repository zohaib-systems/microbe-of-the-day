import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const isAdmin = localStorage.getItem('microbe_admin_auth') === 'true'

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />
  }

  return children
}

export default ProtectedRoute
