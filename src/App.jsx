import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { TableProvider } from './contexts/TableContext'
import ScanTablePage from './pages/ScanTablePage'
import MenuAppPage from './pages/MenuAppPage'
import DashboardLoginPage from './pages/DashboardLoginPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  const [toast, setToast] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if admin is authenticated (stored in sessionStorage)
    return sessionStorage.getItem('adminAuthenticated') === 'true'
  })

  // Handle admin login
  const handleAdminLogin = () => {
    sessionStorage.setItem('adminAuthenticated', 'true')
    setIsAuthenticated(true)
  }

  // Handle admin logout
  const handleAdminLogout = () => {
    sessionStorage.removeItem('adminAuthenticated')
    setIsAuthenticated(false)
  }

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 5000) // Auto-close after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [toast])

  return (
    <>
      {/* Toast Notification - Global */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`${toast.type === 'error' ? 'bg-red-500' : toast.type === 'success' ? 'bg-green-500' : 'bg-blue-500'} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3 min-w-[300px] max-w-md animate-slide-in`}>
            <div className="flex-shrink-0">
              {toast.type === 'error' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : toast.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <p className="flex-1 font-medium">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <TableProvider setToast={setToast}>
        <Routes>
          {/* Default route redirects to /scantable */}
          <Route path="/" element={<Navigate to="/scantable" replace />} />
          
          {/* Scan table route - for PIN entry and QR scanning */}
          <Route 
            path="/scantable" 
            element={<ScanTablePage setToast={setToast} />} 
          />
          
          {/* Menu route - for main menu, cart, and orders */}
          <Route 
            path="/menu" 
            element={<MenuAppPage setToast={setToast} />} 
          />
          
          {/* Dashboard login route */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <DashboardPage 
                  isAuthenticated={isAuthenticated}
                  onLogout={handleAdminLogout}
                  setToast={setToast}
                />
              ) : (
                <DashboardLoginPage onLogin={handleAdminLogin} />
              )
            } 
          />
        </Routes>
      </TableProvider>
    </>
  )
}

export default App
