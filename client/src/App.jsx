import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Onboarding from './components/Onboarding'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import AdminDashboard from './components/AdminDashboard'
import PublicProfileView from './components/PublicProfileView'

function App() {
  const [userRole, setUserRole] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check for existing authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('codec_token');
    const user = localStorage.getItem('codec_user');

    if (token && user) {
      try {
        setIsAuthenticated(true);
        setUserRole(JSON.parse(user).role || 'user');
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('codec_token');
        localStorage.removeItem('codec_user');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setUserRole(userData.role || 'user')
  }

  const handleSignup = (userData) => {
    setIsAuthenticated(true)
    setUserRole(userData.role || 'user')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserRole(null)
    // Clear localStorage
    localStorage.removeItem('codec_token')
    localStorage.removeItem('codec_user')
  }

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('codec_token');
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen relative">
        {/* Fixed background with mesh gradient */}
        <div className="fixed inset-0 bg-[#050505]">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#1a1a2e] rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 right-0 w-125 h-125 bg-[#16213e] rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-1/3 w-100 h-100 bg-[#1a1a2e] rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Content layer */}
        <div className="relative z-10">
          <Routes>
            {/* Default route - redirect to Onboarding */}
            <Route path="/" element={<Navigate to="/onboarding" replace />} />

            {/* Onboarding route */}
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Login route */}
            <Route path="/login" element={<Login onLogin={handleLogin} />} />

            {/* Signup route */}
            <Route path="/signup" element={<Signup onSignup={handleSignup} />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard userRole={userRole} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute>
                  <PublicProfileView />
                </ProtectedRoute>
              }
            />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
