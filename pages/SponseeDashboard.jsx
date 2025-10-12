import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useNotification } from '../components/NotificationContext'

export default function SponseeDashboard() {
  const { showNotification } = useNotification()
  const [stats, setStats] = useState(null)
  const [statsError, setStatsError] = useState(null)
  const [sponsorships, setSponsorships] = useState([])
  const [sponsorshipsError, setSponsorshipsError] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [notificationsError, setNotificationsError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    let allFailed = true
    
    // Quick stats
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/sponsorships/quick-stats', { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to load stats')
      setStats(await res.json())
      setStatsError(null)
      allFailed = false
    } catch (err) {
      setStats(null)
      setStatsError('Failed to load stats')
    }
    
    // Sponsorships
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/sponsorships', { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to load sponsorships')
      const data = await res.json()
      setSponsorships((data.asSponsee && Array.isArray(data.asSponsee.sponsorships)) ? data.asSponsee.sponsorships : [])
      setSponsorshipsError(null)
      allFailed = false
    } catch (err) {
      setSponsorships([])
      setSponsorshipsError('Failed to load sponsorships')
    }
    
    // Notifications
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to load notifications')
      const data = await res.json()
      setNotifications(data.notifications || [])
      setNotificationsError(null)
      allFailed = false
    } catch (err) {
      setNotifications([])
      setNotificationsError('Failed to load notifications')
    }
    
    setLoading(false)
    if (allFailed) {
      showNotification('Failed to load dashboard data', 'error')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600 font-medium">Loading dashboard...</div>
            <div className="text-sm text-gray-400 mt-2">Please wait while we fetch your data</div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="w-full min-h-screen bg-gray-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-6 sm:mb-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Sponsee Dashboard</h1>
                <p className="text-base sm:text-lg text-gray-600 max-w-4xl">
                  Track your support, manage sponsorships, and stay updated on your journey
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={loadDashboard}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 hover:shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>
          
          {/* Enhanced Stats Section */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Sponsors</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalSponsors?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">People supporting you</p>
                  </div>
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-50 rounded-xl">
                    <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Active Sponsorships</p>
                    <p className="text-3xl font-bold text-green-600">{stats.activeSponsorships?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Currently active</p>
                  </div>
                  <div className="flex items-center justify-center w-16 h-16 bg-green-50 rounded-xl">
                    <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Received</p>
                    <p className="text-3xl font-bold text-primary-600">${stats.totalReceived?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">All time total</p>
                  </div>
                  <div className="flex items-center justify-center w-16 h-16 bg-primary-50 rounded-xl">
                    <svg className="w-8 h-8 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">This Month</p>
                    <p className="text-3xl font-bold text-emerald-600">${stats.thisMonth?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Current month</p>
                  </div>
                  <div className="flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-xl">
                    <svg className="w-8 h-8 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Sponsorships Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                My Sponsorships
              </h2>
              <p className="text-sm text-gray-600 mt-1">Support you're currently receiving from your sponsors</p>
            </div>
            <div className="p-6">
              {sponsorshipsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 font-medium">{sponsorshipsError}</span>
            </div>
          </div>
              )}
              
              {sponsorships && sponsorships.length > 0 ? (
                <div className="space-y-4">
                  {sponsorships.map((sponsorship) => (
                    <div key={sponsorship.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                              {sponsorship.sponsor?.name?.charAt(0).toUpperCase() || 'S'}
                            </div>
                      <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Supported by {sponsorship.sponsor?.name || 'Sponsor'}
                              </h3>
                              <p className="text-sm text-gray-500">{sponsorship.sponsor?.email || 'No email'}</p>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3">{sponsorship.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              ${sponsorship.amount}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {sponsorship.frequency}
                            </span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          sponsorship.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                          sponsorship.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {sponsorship.status.charAt(0).toUpperCase() + sponsorship.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Sponsorships</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Your assigned sponsors can start sponsoring you to provide support. 
                    Check back soon for updates!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Notifications Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Recent Notifications
              </h2>
              <p className="text-sm text-gray-600 mt-1">Stay updated with the latest information</p>
            </div>
            <div className="p-6">
              {notificationsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 font-medium">{notificationsError}</span>
                  </div>
                </div>
              )}
              
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex-shrink-0 w-3 h-3 bg-primary-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-gray-900">{notification.message}</p>
                        <p className="text-sm text-gray-500 mt-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(notification.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No notifications</p>
                  <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 