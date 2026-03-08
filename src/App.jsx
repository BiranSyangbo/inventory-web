import { useState, useEffect, createContext } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import apiClient from './lib/apiClient'
import './App.css'

export const AuthContext = createContext()

function App() {
  const [username, setUsername] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')

  const token = localStorage.getItem('accessToken')

  useEffect(() => {
    if (token) {
      apiClient.get('/api/auth/me')
        .then(({ data }) => setUsername(data.username))
        .catch(() => {
          localStorage.clear()
          setUsername(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUsername(user)
    setCurrentPage('dashboard')
  }

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    try {
      if (refreshToken) await apiClient.post('/api/auth/logout', { refreshToken })
    } finally {
      localStorage.clear()
      setUsername(null)
      setCurrentPage('dashboard')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-300">Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ username, handleLogin, handleLogout }}>
      {token && username ? (
        <>
          {currentPage === 'dashboard' && <DashboardPage onLogout={handleLogout} onNavigate={setCurrentPage} />}
          {currentPage === 'products' && <ProductsPage onLogout={handleLogout} onNavigate={setCurrentPage} />}
        </>
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </AuthContext.Provider>
  )
}

export default App
