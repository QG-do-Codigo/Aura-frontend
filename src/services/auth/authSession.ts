export const AUTH_TOKEN_KEY = 'token'
export const AUTH_LOGOUT_EVENT = 'auth:logout'
const SESSION_EXPIRED_NOTICE_KEY = 'auth:session-expired-notice'

type JwtPayload = {
  exp?: number
  [key: string]: unknown
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  return atob(padded)
}

function readJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    return JSON.parse(decodeBase64Url(parts[1])) as JwtPayload
  } catch {
    return null
  }
}

export function getAuthTokenPayload(token = getAuthToken()) {
  if (!token) return null
  return readJwtPayload(token)
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  sessionStorage.removeItem(SESSION_EXPIRED_NOTICE_KEY)
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function getTokenExpiryMs(token: string) {
  const payload = readJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') return null

  return payload.exp * 1000
}

export function isTokenExpired(token?: string | null) {
  if (!token) return true

  const expiresAt = getTokenExpiryMs(token)
  if (expiresAt === null) return false

  return Date.now() >= expiresAt
}

export function hasValidAuthToken(token?: string | null) {
  return Boolean(token) && !isTokenExpired(token)
}

export function logoutAndNotify() {
  clearAuthToken()
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT))
}

export function notifySessionExpired() {
  if (sessionStorage.getItem(SESSION_EXPIRED_NOTICE_KEY)) return

  sessionStorage.setItem(SESSION_EXPIRED_NOTICE_KEY, '1')

  window.dispatchEvent(
    new CustomEvent('auth:session-expired', {
      detail: {
        message: 'Sua sessão expirou. Faça login novamente.',
      },
    })
  )
}
