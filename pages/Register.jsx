import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'sponsor', // Default role
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (formError) setFormError('')
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Name is required')
      return false
    }
    if (!formData.email.trim()) {
      setFormError('Email is required')
      return false
    }
    if (!formData.password) {
      setFormError('Password is required')
      return false
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match')
      return false
    }
    if (!formData.role) {
      setFormError('Please select a role')
      return false
    }
    return true
  }

const handleSubmit = async (e) => {
  e.preventDefault()
  setFormError('')
  if (!validateForm()) return

  try {
    const res = await authAPI.register(formData)
    if (res.message === 'Registered successfully') {
      setShowSuccess(true)
      setTimeout(() => navigate('/login'), 1500)
    } else {
      setFormError(res.message || 'Registration failed')
    }
  } catch {
    setFormError('Registration failed')
  }
}

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
        <div className="card-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-heading-1 text-[#009688] mb-1">Create Your Account</h1>
            <p className="text-muted">Join our community and start making a difference</p>
          </div>
          {formError && (
            <div className="badge-error mb-4 text-center">{formError}</div>
          )}
          {showSuccess && (
            <div className="badge-success mb-4 text-center">
              Account created successfully! Redirecting...
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="input"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
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
                autoComplete="username"
              />
            </div>
            <div className="flex gap-2">
              <div className="w-1/2">
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
                      autoComplete="new-password"
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
              </div>
              <div className="w-1/2">
                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="input"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 text-gray-500"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="input"
                value={formData.phone}
                onChange={handleChange}
                required
                autoComplete="tel"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="role">
                I want to be a
              </label>
              <select
                id="role"
                name="role"
                className="select"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Select your role</option>
                <option value="sponsor">Sponsor</option>
                <option value="sponsee">Sponsee</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
            >
              Create Account
            </button>
          </form>
          <div className="text-center mt-4">
            <p className="text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-[#009688] font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}