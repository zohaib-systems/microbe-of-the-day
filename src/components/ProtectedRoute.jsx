import { Navigate } from 'react-router-dom'
import { ADMIN_LOGIN_PATH } from '../config/adminRoute'

function ProtectedRoute({ children }) {
  const isAdmin = localStorage.getItem('microbe_admin_auth') === 'true'

  if (!isAdmin) {
    return <Navigate to={ADMIN_LOGIN_PATH} replace />
  }

  return children
}

export default ProtectedRoute
