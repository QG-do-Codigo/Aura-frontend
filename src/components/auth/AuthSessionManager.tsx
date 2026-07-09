import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ToastAlert } from '../../utils/toastAlert'
import {
  AUTH_LOGOUT_EVENT,
  getAuthToken,
  getTokenExpiryMs,
  isTokenExpired,
  logoutAndNotify,
} from '../../services/auth/authSession'

const SESSION_EXPIRY_WARNING_MS = 60_000

export function AuthSessionManager() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = getAuthToken()

  useEffect(() => {
    const handleLogout = () => {
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true })
      }
    }

    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout)

    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout)
    }
  }, [location.pathname, navigate])

  useEffect(() => {
    if (!token) return

    if (isTokenExpired(token)) {
      ToastAlert('Sua sessão expirou. Faça login novamente.', 'info')
      logoutAndNotify()
      return
    }

    const expiresAt = getTokenExpiryMs(token)
    if (!expiresAt) return

    const timeUntilExpiry = Math.max(expiresAt - Date.now(), 0)
    const warningDelay = Math.max(timeUntilExpiry - SESSION_EXPIRY_WARNING_MS, 0)

    const warningTimeout = window.setTimeout(() => {
      ToastAlert('Sua sessão vai expirar em breve. Faça login novamente.', 'info')
    }, warningDelay)

    const logoutTimeout = window.setTimeout(() => {
      logoutAndNotify()
    }, timeUntilExpiry)

    return () => {
      window.clearTimeout(warningTimeout)
      window.clearTimeout(logoutTimeout)
    }
  }, [token])

  return null
}
