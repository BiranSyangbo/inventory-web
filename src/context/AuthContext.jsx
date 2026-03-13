import { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '../lib/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      apiClient.get('/api/auth/me')
        .then(({ data }) => setUsername(data.username))
        .catch(() => localStorage.clear())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const { data } = await apiClient.post('/api/auth/login', { username, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUsername(username)
  }

  const register = async (username, password) => {
    const { data } = await apiClient.post('/api/auth/register', { username, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUsername(username)
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    try {
      if (refreshToken) await apiClient.post('/api/auth/logout', { refreshToken })
    } finally {
      localStorage.clear()
      setUsername(null)
    }
  }

  return (
    <AuthContext.Provider value={{ username, loading, login, logout, register, isAuthenticated: !!username }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
