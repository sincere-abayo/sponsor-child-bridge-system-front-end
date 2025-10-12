import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { useNotification } from '../../components/NotificationContext'

export default function AdminDashboard() {
  const { showNotification } = useNotification()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSponsorships: 0,
    activeSponsorships: 0,
    pendingSponsorships: 0,
    completedSponsorships: 0,
    totalAmount: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Load system stats
      const statsResponse = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Load recent activity
      const activityResponse = await fetch('/api/admin/recent-activity', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setRecentActivity(activityData)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      showNotification('Failed to load dashboard data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF'
    }).format(amount)
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
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-base sm:text-lg text-gray-600 max-w-4xl">
                  Comprehensive overview of system performance, user management, and sponsorship monitoring
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={loadDashboardData}
                  className="inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Data
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Registered accounts</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-blue-50 rounded-xl ml-3">
                  <svg className="w-6 h-6 lg:w-8 lg:h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Sponsorships</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.activeSponsorships.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">Currently active</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-green-50 rounded-xl ml-3">
                  <svg className="w-6 h-6 lg:w-8 lg:h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.pendingSponsorships.toLocaleString()}</p>
                  <p className="text-xs text-yellow-600 mt-1">Awaiting approval</p>
          </div>
                <div className="flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-yellow-50 rounded-xl ml-3">
                  <svg className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
              </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Amount</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
                  <p className="text-xs text-purple-600 mt-1">Total contributions</p>
          </div>
                <div className="flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-purple-50 rounded-xl ml-3">
                  <svg className="w-6 h-6 lg:w-8 lg:h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
              </div>
            </div>
          </div>
        </div>

          {/* Enhanced Quick Actions and Recent Activity */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-8">
        {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 lg:px-6 py-4 lg:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Actions
                </h2>
                <p className="text-sm text-gray-600 mt-1">Access frequently used administrative functions</p>
              </div>
              <div className="p-4 lg:p-6">
                <div className="space-y-3 lg:space-y-4">
              <Link
                to="/admin/users"
                    className="group flex items-center p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-blue-50 hover:to-blue-100 transition-all duration-300 hover:shadow-md border border-gray-100 hover:border-blue-200"
                  >
                    <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl mr-3 lg:mr-4 transition-colors duration-300">
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300 text-sm lg:text-base">Manage Users</div>
                      <div className="text-xs lg:text-sm text-gray-600 mt-1">View, edit, and manage user accounts</div>
                </div>
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
              </Link>
              
              <Link
                to="/admin/sponsorships"
                    className="group flex items-center p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:shadow-md border border-gray-100 hover:border-green-200"
                  >
                    <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-green-100 group-hover:bg-green-200 rounded-xl mr-3 lg:mr-4 transition-colors duration-300">
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-300 text-sm lg:text-base">Monitor Sponsorships</div>
                      <div className="text-xs lg:text-sm text-gray-600 mt-1">View and manage all sponsorships</div>
                    </div>
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
          </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 lg:px-6 py-4 lg:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Recent Activity
                </h2>
                <p className="text-sm text-gray-600 mt-1">Latest system events and updates</p>
              </div>
              <div className="p-4 lg:p-6">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 lg:py-12">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium text-sm lg:text-base">No recent activity</p>
                    <p className="text-xs lg:text-sm text-gray-400 mt-1">Activity will appear here as it happens</p>
                  </div>
                ) : (
                  <div className="space-y-3 lg:space-y-4">
                    {recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 lg:space-x-4 p-3 lg:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex-shrink-0 w-6 h-6 lg:w-8 lg:h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 lg:w-4 lg:h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs lg:text-sm font-medium text-gray-900 leading-5">{activity.message}</div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(activity.timestamp).toLocaleString()}
                          </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 lg:p-8 border border-primary-100">
            <div className="text-center">
              <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-3">Need Help?</h3>
              <p className="text-sm lg:text-base text-gray-600 mb-6 max-w-4xl mx-auto">
                Our admin support team is here to help you manage the system effectively. 
                Contact us for any questions or assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg text-sm lg:text-base">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Documentation
                </button>
                <button className="inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-all duration-200 hover:shadow-md text-sm lg:text-base">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 