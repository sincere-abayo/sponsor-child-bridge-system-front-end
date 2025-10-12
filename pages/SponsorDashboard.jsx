import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useNotification } from '../components/NotificationContext'

export default function SponsorDashboard() {
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
      setSponsorships((data.asSponsor && Array.isArray(data.asSponsor.sponsorships)) ? data.asSponsor.sponsorships : [])
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
        <div className="flex items-center justify-center h-64">
          <div className="loading-skeleton w-32 h-8"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-content">
            <div className="page-header-inner">
              <div>
                <h1 className="page-title">Sponsor Dashboard</h1>
                <p className="page-subtitle">Manage your sponsorships and track your impact</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        {stats && (
          <div className="stats-grid mb-8">
            <div className="stat-card">
              <div className="flex items-center">
                <div className="stat-icon text-[#009688]">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="stat-value text-[#009688]">{stats.totalSponsees || 0}</div>
                  <div className="stat-label">Total Sponsees</div>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex items-center">
                <div className="stat-icon text-[#2196f3]">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="stat-value text-[#2196f3]">{stats.activeSponsorships || 0}</div>
                  <div className="stat-label">Active Sponsorships</div>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex items-center">
                <div className="stat-icon text-[#22c55e]">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="stat-value text-[#22c55e]">${stats.totalSpent || 0}</div>
                  <div className="stat-label">Total Spent</div>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex items-center">
                <div className="stat-icon text-[#009688]">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="stat-value text-[#009688]">${stats.thisMonth || 0}</div>
                  <div className="stat-label">This Month</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sponsorships Section */}
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="text-heading-2">My Sponsorships</h2>
            <p className="text-muted">Your ongoing support commitments</p>
          </div>
          <div className="card-body">
            {sponsorshipsError && (
              <div className="badge-error mb-4">{sponsorshipsError}</div>
            )}
            {sponsorships && sponsorships.length > 0 ? (
              <div className="space-y-4">
                {sponsorships.map((sponsorship) => (
                  <div key={sponsorship.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-heading-3">
                          Supporting {sponsorship.sponsee?.name || 'Sponsee'}
                        </h3>
                        <p className="text-body">{sponsorship.description}</p>
                        <p className="text-caption">
                          Amount: ${sponsorship.amount} | Frequency: {sponsorship.frequency}
                        </p>
                      </div>
                      <span className={`badge ${
                        sponsorship.status === 'active' ? 'badge-success' :
                        sponsorship.status === 'pending' ? 'badge-warning' :
                        'badge-gray'
                      }`}>
                        {sponsorship.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">💝</div>
                <h3 className="text-heading-2 mb-2">No Active Sponsorships</h3>
                <p className="text-muted">Start sponsoring children in need to make a difference.</p>
              </div>
            )}
          </div>
        </div>

        {/* Notifications Section */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-heading-2">Recent Notifications</h2>
          </div>
          <div className="card-body">
            {notificationsError && (
              <div className="badge-error mb-4">{notificationsError}</div>
            )}
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-[#2196f3] rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-body">{notification.message}</p>
                      <p className="text-caption mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center py-4">No notifications</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
} 