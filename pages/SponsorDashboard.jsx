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
      setNotifications(await res.json())
      setNotificationsError(null)
      allFailed = false
    } catch (err) {
      setNotifications([])
      setNotificationsError('Failed to load notifications')
    }
    setLoading(false)
    if (allFailed) showNotification('Failed to load dashboard data', 'error')
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount)
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, Sponsor!</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Active Sponsorships</div>
              <div className="text-3xl font-bold text-green-700">{stats ? stats.activeSponsorships : '--'}</div>
              {statsError && <div className="text-xs text-red-500 mt-1">{statsError}</div>}
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Total Donated</div>
              <div className="text-3xl font-bold text-blue-700">{stats ? formatCurrency(stats.totalDonated) : '--'}</div>
              {statsError && <div className="text-xs text-red-500 mt-1">{statsError}</div>}
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Notifications</div>
              <div className="text-3xl font-bold text-yellow-700">{notifications ? notifications.length : '--'}</div>
              {notificationsError && <div className="text-xs text-red-500 mt-1">{notificationsError}</div>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Recent Sponsorships</h2>
              {sponsorshipsError && <div className="text-xs text-red-500 mb-2">{sponsorshipsError}</div>}
              {sponsorships && sponsorships.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {sponsorships.slice(0, 5).map(s => (
                    <li key={s.id} className="py-2 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">{s.sponsee?.name || 'Sponsee'}</div>
                        <div className="text-xs text-gray-500">{s.type} • {formatDate(s.createdAt)}</div>
                      </div>
                      <div className="font-semibold text-green-700">{formatCurrency(s.amount)}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 text-sm">No sponsorships found.</div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Recent Notifications</h2>
              {notificationsError && <div className="text-xs text-red-500 mb-2">{notificationsError}</div>}
              {notifications && notifications.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {notifications.slice(0, 5).map(n => (
                    <li key={n.id} className="py-2">
                      <div className="font-medium text-gray-900">{n.message}</div>
                      <div className="text-xs text-gray-500">{n.type.replace(/_/g, ' ')} • {formatDate(n.createdAt)}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 text-sm">No notifications found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 