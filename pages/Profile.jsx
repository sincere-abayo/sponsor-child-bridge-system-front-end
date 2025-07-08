import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../components/NotificationContext'
import { authAPI, profileAPI } from '../services/api'

export default function Profile() {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Simplified form states
  const [sponsorForm, setSponsorForm] = useState({
    occupation: '',
    incomeRange: 'medium',
    preferredSponsorshipType: 'monthly',
    maxAmountPerMonth: '',
    preferredLocation: 'Rwanda',
    bio: ''
  })

  const [sponseeForm, setSponseeForm] = useState({
    age: '',
    gender: 'male',
    location: 'Rwanda',
    familySituation: 'single_parent',
    schoolName: '',
    grade: '',
    monthlyIncome: '',
    bio: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const response = await profileAPI.getMyProfile()
      setUser(response.user)
      setProfile(response.profile)

      // Pre-fill forms if profile exists
      if (response.profile) {
        if (response.user.role === 'sponsor') {
          setSponsorForm({
            occupation: response.profile.occupation || '',
            incomeRange: response.profile.incomeRange || 'medium',
            preferredSponsorshipType: response.profile.preferredSponsorshipType || 'monthly',
            maxAmountPerMonth: response.profile.maxAmountPerMonth || '',
            preferredLocation: response.profile.preferredLocation || 'Rwanda',
            bio: response.profile.bio || ''
          })
        } else if (response.user.role === 'sponsee') {
          setSponseeForm({
            age: response.profile.age || '',
            gender: response.profile.gender || 'male',
            location: response.profile.location || 'Rwanda',
            familySituation: response.profile.familySituation || 'single_parent',
            schoolName: response.profile.schoolName || '',
            grade: response.profile.grade || '',
            monthlyIncome: response.profile.monthlyIncome || '',
            bio: response.profile.bio || ''
          })
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      showNotification('Error loading profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSponsorSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await profileAPI.createSponsorProfile(sponsorForm)
      setProfile(response.profile)
      showNotification('Profile saved successfully!', 'success')
    } catch (error) {
      console.error('Error saving sponsor profile:', error)
      showNotification('Error saving profile. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSponseeSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await profileAPI.createSponseeProfile(sponseeForm)
      setProfile(response.profile)
      showNotification('Profile saved successfully!', 'success')
    } catch (error) {
      console.error('Error saving sponsee profile:', error)
      showNotification('Error saving profile. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSponsorChange = (e) => {
    const { name, value } = e.target
    setSponsorForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSponseeChange = (e) => {
    const { name, value } = e.target
    setSponseeForm(prev => ({ ...prev, [name]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user.role === 'sponsor' ? 'Sponsor Profile' : 'Sponsee Profile'}
          </h1>
          <p className="text-gray-600">
            {user.role === 'sponsor' 
              ? 'Complete your profile to help children in need' 
              : 'Tell us about yourself to connect with sponsors'
            }
          </p>
          <div className="mt-4 inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {user.name} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </div>
        </div>

        {/* Profile Form */}
        {user.role === 'sponsor' ? (
          <SponsorProfileForm
            form={sponsorForm}
            onChange={handleSponsorChange}
            onSubmit={handleSponsorSubmit}
            saving={saving}
          />
        ) : user.role === 'sponsee' ? (
          <SponseeProfileForm
            form={sponseeForm}
            onChange={handleSponseeChange}
            onSubmit={handleSponseeSubmit}
            saving={saving}
          />
        ) : null}
      </div>
    </div>
  )
}

// Simplified Sponsor Profile Form
function SponsorProfileForm({ form, onChange, onSubmit, saving }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Occupation
            </label>
            <input
              type="text"
              name="occupation"
              value={form.occupation}
              onChange={onChange}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              placeholder="e.g., Teacher, Engineer"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Income Level
            </label>
            <select
              name="incomeRange"
              value={form.incomeRange}
              onChange={onChange}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              required
            >
              <option value="low">Low Income</option>
              <option value="medium">Medium Income</option>
              <option value="high">High Income</option>
              <option value="very_high">Very High Income</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Sponsorship Type
            </label>
            <select
              name="preferredSponsorshipType"
              value={form.preferredSponsorshipType}
              onChange={onChange}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              required
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="one_time">One Time</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Max Amount Per Month (RWF)
            </label>
            <input
              type="number"
              name="maxAmountPerMonth"
              value={form.maxAmountPerMonth}
              onChange={onChange}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              placeholder="e.g., 50000"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">
              Preferred Location
            </label>
            <input
              type="text"
              name="preferredLocation"
              value={form.preferredLocation}
              onChange={onChange}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              placeholder="e.g., Kigali, Rwanda"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            About You
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={onChange}
            rows={4}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            placeholder="Tell us about yourself and why you want to help children..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Simplified Sponsee Profile Form
function SponseeProfileForm({ form, onChange, onSubmit, saving }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={onChange}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              placeholder="e.g., 12"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={onChange}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={onChange}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              placeholder="e.g., Kigali, Rwanda"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Family Situation
            </label>
            <select
              name="familySituation"
              value={form.familySituation}
              onChange={onChange}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              required
            >
              <option value="orphan">Orphan</option>
              <option value="single_parent">Single Parent</option>
              <option value="both_parents">Both Parents</option>
              <option value="guardian">Guardian</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              School Name
            </label>
            <input
              type="text"
              name="schoolName"
              value={form.schoolName}
              onChange={onChange}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              placeholder="e.g., G.S. Kigali"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Grade/Class
            </label>
            <input
              type="text"
              name="grade"
              value={form.grade}
              onChange={onChange}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              placeholder="e.g., Primary 5"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">
              Monthly Family Income (RWF)
            </label>
            <input
              type="number"
              name="monthlyIncome"
              value={form.monthlyIncome}
              onChange={onChange}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
              placeholder="e.g., 50000"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            About You
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={onChange}
            rows={4}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            placeholder="Tell us about yourself, your interests, and what you need help with..."
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
} 