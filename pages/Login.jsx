import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate, Link } from 'react-router-dom'
// import { useDispatch, useSelector } from 'react-redux'
// import { loginStart, loginSuccess, loginFailure, clearError } from '../store/slices/authSlice'
import { authAPI } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  // const dispatch = useDispatch()
  // const { error, loading } = useSelector((state) => state.auth)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  // const [apiError, setApiError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (formError) setFormError('')
    // if (apiError) setApiError('')
    // if (error) dispatch(clearError())
  }

 const handleSubmit = async (e) => {
  e.preventDefault()
  setFormError('')
  try {
    const res = await authAPI.login(formData)
    if (res.token) {
      setShowSuccess(true)
      localStorage.setItem('token', res.token)
      localStorage.setItem('userRole', res.user.role)
      localStorage.setItem('userData', JSON.stringify(res.user))
      
      // Redirect to profile page for now (we'll implement dashboards later)
      setTimeout(() => {
        navigate('/profile')
      }, 1500)
    } else {
      setFormError(res.message || 'Login failed')
    }
  } catch {
    setFormError('Login failed')
  }
}
 
  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-700 mb-1">Welcome Back</h1>
            <p className="text-gray-500">Sign in to continue your journey</p>
          </div>
          {(formError) && (
            <div className="mb-4 text-red-600 text-sm text-center">{formError}</div>
          )}
          {showSuccess && (
            <div className="mb-4 text-green-600 text-sm text-center">
              Login successful! Redirecting to your dashboard...
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-500"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded transition"
            >
              Sign In
            </button>
          </form>
          <div className="text-center mt-4 text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-700 font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}