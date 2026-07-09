import axios from "axios";
import { getAuthToken, logoutAndNotify } from "./auth/authSession";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use(config => {
  config.headers = config.headers ?? {}
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    const status = error?.response?.status
    const requestUrl = String(error?.config?.url ?? '')
    const isAuthEndpoint =
      requestUrl.includes('/auth/signin') || requestUrl.includes('/users')

    if (status === 401 && !isAuthEndpoint) {
      logoutAndNotify()
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)
export default api
