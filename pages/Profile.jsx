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
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600 font-medium">Loading profile...</div>
            <div className="text-sm text-gray-400 mt-2">Please wait while we fetch your data</div>
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
      <div className="w-full min-h-screen bg-gray-50">
        <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          {/* Enhanced Mobile-First Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-secondary-50">
              <div className="flex flex-col space-y-4">
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Profile Dashboard</h1>
                  <p className="text-sm sm:text-base text-gray-600">Manage your account and profile information</p>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                      user.role === 'sponsor' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      user.role === 'sponsee' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}>
                      <span className="mr-1">
                        {user.role === 'sponsor' ? '🤝' : user.role === 'sponsee' ? '👨‍🎓' : '⚙️'}
                      </span>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                    <span className="text-gray-400 hidden sm:inline">•</span>
                    <span className="text-sm text-gray-600">{user.email}</span>
                    {user.phone && (
                      <>
                        <span className="text-gray-400 hidden sm:inline">•</span>
                        <span className="text-sm text-gray-600">{user.phone}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Member since 2024</div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Users Section */}
          {user.role === 'sponsor' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                  <span className="mr-2">👶</span>
                  My Assigned Sponsees
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                {assignedUsers.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-3">🤝</div>
                    <p className="text-gray-600">No assigned sponsees yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assignedUsers.map(u => (
                      <div key={u.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {user.role === 'sponsee' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                  <span className="mr-2">🤝</span>
                  My Assigned Sponsors
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                {assignedUsers.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-gray-600 mb-3">No assigned sponsors yet.</p>
                    <div className="text-xs text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">
                      <strong>Note:</strong> Your profile must be filled out completely and marked as active to be eligible for sponsorship or assignment. Incomplete or inactive profiles will not be assigned sponsors.
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assignedUsers.map(u => (
                      <div key={u.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center text-emerald-600 font-semibold">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Tabs Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex flex-col sm:flex-row">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    activeTab === 'profile'
                      ? 'bg-white text-primary-600 border-b-2 border-primary-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">👤</span>
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    activeTab === 'settings'
                      ? 'bg-white text-primary-600 border-b-2 border-primary-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">⚙️</span>
                  Account Settings
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    activeTab === 'security'
                      ? 'bg-white text-primary-600 border-b-2 border-primary-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">🔒</span>
                  Security
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6">
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
      </div>
    </Layout>
  )
}

// Enhanced Sponsor Profile Form
function SponsorProfileForm({ form, onChange, onSubmit, saving, profile }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
          <span className="mr-2">🤝</span>
          Sponsor Profile
        </h2>
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            placeholder="Tell us about yourself and why you want to help children..."
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 bg-success-500 hover:bg-success-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center justify-center space-x-2">
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

// Enhanced Sponsee Profile Form
function SponseeProfileForm({ form, onChange, onSubmit, saving, profile }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
          <span className="mr-2">👨‍🎓</span>
          Sponsee Profile
        </h2>
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            placeholder="Tell us about yourself, your interests, and what you need help with..."
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center justify-center space-x-2">
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