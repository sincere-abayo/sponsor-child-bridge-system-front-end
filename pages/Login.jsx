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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#009688]/10 to-[#2196f3]/10 py-8">
        <div className="card-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-heading-1 text-[#009688] mb-1">Welcome Back</h1>
            <p className="text-muted">Sign in to continue your journey</p>
          </div>
          {(formError) && (
            <div className="badge-error mb-4 text-center">{formError}</div>
          )}
          {showSuccess && (
            <div className="badge-success mb-4 text-center">
              Login successful! Redirecting to your dashboard...
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
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
              className="btn-primary w-full"
            >
              Sign In
            </button>
          </form>
          <div className="text-center mt-4 text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#2196f3] font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}