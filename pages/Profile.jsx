import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../components/NotificationContext'
import { authAPI, profileAPI } from '../services/api'
import Layout from '../components/Layout'

export default function Profile() {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [assignedUsers, setAssignedUsers] = useState([])

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

  useEffect(() => {
    if (!user) return
    if (user.role === 'sponsor') {
      profileAPI.getSponseeProfiles().then(res => {
        setAssignedUsers((res.profiles || []).map(p => p.user))
      })
    } else if (user.role === 'sponsee') {
      profileAPI.getSponsorProfiles().then(res => {
        setAssignedUsers((res.profiles || []).map(p => p.user))
      })
    }
  }, [user])

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
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'sponsor' ? 'bg-green-100 text-green-800' :
                  user.role === 'sponsee' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  <span className="mr-1">
                    {user.role === 'sponsor' ? '🤝' : user.role === 'sponsee' ? '👨‍🎓' : '⚙️'}
                  </span>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{user.email}</span>
                {user.phone && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">{user.phone}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Member since</div>
              <div className="font-semibold text-gray-900">2024</div>
            </div>
          </div>
        </div>

        {/* Assigned Users Section */}
        {user.role === 'sponsor' && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-bold mb-2">My Assigned Sponsees</h2>
            {assignedUsers.length === 0 ? (
              <div className="text-gray-500">No assigned sponsees.</div>
            ) : (
              <ul className="list-disc pl-6">
                {assignedUsers.map(u => (
                  <li key={u.id} className="mb-1">{u.name} ({u.email})</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {user.role === 'sponsee' && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-bold mb-2">My Assigned Sponsors</h2>
            {assignedUsers.length === 0 ? (
              <div>
                <div className="text-gray-500">No assigned sponsors.</div>
                <div className="mt-2 text-xs text-red-500">Note: Your profile must be filled out completely and marked as active to be eligible for sponsorship or assignment. Incomplete or inactive profiles will not be assigned sponsors.</div>
              </div>
            ) : (
              <ul className="list-disc pl-6">
                {assignedUsers.map(u => (
                  <li key={u.id} className="mb-1">{u.name} ({u.email})</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Account Settings
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Security
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div>
                {user.role === 'sponsor' ? (
                  <SponsorProfileForm
                    form={sponsorForm}
                    onChange={handleSponsorChange}
                    onSubmit={handleSponsorSubmit}
                    saving={saving}
                    profile={profile}
                  />
                ) : user.role === 'sponsee' ? (
                  <SponseeProfileForm
                    form={sponseeForm}
                    onChange={handleSponseeChange}
                    onSubmit={handleSponseeSubmit}
                    saving={saving}
                    profile={profile}
                  />
                ) : null}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">⚙️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Account Settings</h3>
                <p className="text-gray-600">Settings page coming soon...</p>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔒</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Security Settings</h3>
                <p className="text-gray-600">Security settings coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

// Modern Sponsor Profile Form
function SponsorProfileForm({ form, onChange, onSubmit, saving, profile }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Sponsor Profile</h2>
        <p className="text-gray-600">Complete your profile to help children in need</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Occupation
            </label>
            <input
              type="text"
              name="occupation"
              value={form.occupation}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              placeholder="e.g., Teacher, Engineer, Doctor"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Income Level
            </label>
            <select
              name="incomeRange"
              value={form.incomeRange}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              required
            >
              <option value="low">Low Income</option>
              <option value="medium">Medium Income</option>
              <option value="high">High Income</option>
              <option value="very_high">Very High Income</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Sponsorship Type
            </label>
            <select
              name="preferredSponsorshipType"
              value={form.preferredSponsorshipType}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              required
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="one_time">One Time</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Max Amount Per Month (RWF)
            </label>
            <input
              type="number"
              name="maxAmountPerMonth"
              value={form.maxAmountPerMonth}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              placeholder="e.g., 50000"
              required
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Preferred Location
            </label>
            <input
              type="text"
              name="preferredLocation"
              value={form.preferredLocation}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              placeholder="e.g., Kigali, Rwanda"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            About You
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={onChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            placeholder="Tell us about yourself and why you want to help children..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {saving ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </div>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

// Modern Sponsee Profile Form
function SponseeProfileForm({ form, onChange, onSubmit, saving, profile }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Sponsee Profile</h2>
        <p className="text-gray-600">Tell us about yourself to connect with sponsors</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="e.g., 12"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="e.g., Kigali, Rwanda"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Family Situation
            </label>
            <select
              name="familySituation"
              value={form.familySituation}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            >
              <option value="orphan">Orphan</option>
              <option value="single_parent">Single Parent</option>
              <option value="both_parents">Both Parents</option>
              <option value="guardian">Guardian</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              School Name
            </label>
            <input
              type="text"
              name="schoolName"
              value={form.schoolName}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="e.g., G.S. Kigali"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Grade/Class
            </label>
            <input
              type="text"
              name="grade"
              value={form.grade}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="e.g., Primary 5"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Monthly Family Income (RWF)
            </label>
            <input
              type="number"
              name="monthlyIncome"
              value={form.monthlyIncome}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="e.g., 50000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            About You
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={onChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Tell us about yourself, your interests, and what you need help with..."
            required
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {saving ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </div>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 