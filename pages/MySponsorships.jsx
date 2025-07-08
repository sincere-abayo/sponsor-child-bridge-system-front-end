import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { sponsorshipAPI } from '../services/api'
import { useNotification } from '../components/NotificationContext'
import Layout from '../components/Layout'

export default function MySponsorships() {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(true)
  const [sponsorships, setSponsorships] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const userRole = localStorage.getItem('userRole')

  useEffect(() => {
    loadSponsorships()
  }, [statusFilter])

  const loadSponsorships = async () => {
    try {
      setLoading(true)
      const filters = statusFilter ? { status: statusFilter } : {}
      const response = await sponsorshipAPI.getMySponsorships(filters)
      // Only show relevant sponsorships for the user's role
      if (userRole === 'sponsor') {
        setSponsorships(response.asSponsor?.sponsorships || [])
      } else if (userRole === 'sponsee') {
        setSponsorships(response.asSponsee?.sponsorships || [])
      } else {
        setSponsorships([])
      }
    } catch (error) {
      console.error('Error loading sponsorships:', error)
      showNotification('Failed to load sponsorships', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (sponsorshipId, newStatus) => {
    try {
      const response = await sponsorshipAPI.updateSponsorshipStatus(sponsorshipId, {
        status: newStatus
      })
      
      if (response.message) {
        showNotification('Sponsorship status updated successfully', 'success')
        loadSponsorships() // Reload to get updated data
      } else {
        showNotification(response.message || 'Failed to update status', 'error')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      showNotification('Failed to update sponsorship status', 'error')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '✅'
      case 'pending': return '⏳'
      case 'completed': return '🎓'
      case 'cancelled': return '❌'
      default: return '❓'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF'
    }).format(amount)
  }

  // Role-specific heading and empty state
  const heading = userRole === 'sponsor' ? 'My Sponsored Children' : 'My Sponsors'
  const emptyMsg = userRole === 'sponsor'
    ? "You haven't created any sponsorships yet."
    : "You don't have any sponsorships yet."

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading sponsorships...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
              <p className="text-gray-600">Manage your sponsorship relationships</p>
            </div>
            {userRole === 'sponsor' && (
              <Link
                to="/create-sponsorship"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create New Sponsorship
              </Link>
            )}
          </div>

          {/* Filters */}
          <div className="mt-4 flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Sponsorships List */}
        {sponsorships.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sponsorships Found</h3>
            <p className="text-gray-600 mb-4">{emptyMsg}</p>
            {userRole === 'sponsor' && (
              <Link
                to="/create-sponsorship"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Your First Sponsorship
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {sponsorships.map((sponsorship) => (
              <div key={sponsorship.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sponsorship.status)}`}>
                        <span className="mr-1">{getStatusIcon(sponsorship.status)}</span>
                        {sponsorship.status.charAt(0).toUpperCase() + sponsorship.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Created {formatDate(sponsorship.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {userRole === 'sponsor'
                        ? `Sponsoring ${sponsorship.sponsee?.name}`
                        : `Sponsored by ${sponsorship.sponsor?.name}`
                      }
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Amount:</span>
                        <div className="text-lg font-semibold text-green-600">
                          {formatCurrency(sponsorship.amount)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Frequency:</span>
                        <div className="capitalize">{sponsorship.frequency.replace('_', ' ')}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Start Date:</span>
                        <div>{formatDate(sponsorship.startDate)}</div>
                      </div>
                      {sponsorship.nextPaymentDate && (
                        <div>
                          <span className="font-medium text-gray-600">Next Payment:</span>
                          <div>{formatDate(sponsorship.nextPaymentDate)}</div>
                        </div>
                      )}
                    </div>
                    {sponsorship.description && (
                      <div className="mt-3">
                        <span className="font-medium text-gray-600">Description:</span>
                        <p className="text-gray-700 mt-1">{sponsorship.description}</p>
                      </div>
                    )}
                    {/* Sponsee/Sponsor Details */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {userRole === 'sponsor' ? 'Child Details:' : 'Sponsor Details:'}
                      </h4>
                      {userRole === 'sponsor' ? (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="font-medium">Name:</span> {sponsorship.sponsee?.name}</div>
                          <div><span className="font-medium">Age:</span> {sponsorship.sponsee?.sponseeProfile?.age} years</div>
                          <div><span className="font-medium">Location:</span> {sponsorship.sponsee?.sponseeProfile?.location}</div>
                          <div><span className="font-medium">School:</span> {sponsorship.sponsee?.sponseeProfile?.schoolName || 'Not specified'}</div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="font-medium">Name:</span> {sponsorship.sponsor?.name}</div>
                          <div><span className="font-medium">Occupation:</span> {sponsorship.sponsor?.sponsorProfile?.occupation || 'Not specified'}</div>
                          <div><span className="font-medium">Location:</span> {sponsorship.sponsor?.sponsorProfile?.preferredLocation || 'Not specified'}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Link
                      to={`/sponsorship/${sponsorship.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Details
                    </Link>
                    {userRole === 'sponsor' && sponsorship.status === 'pending' && (
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleStatusUpdate(sponsorship.id, 'active')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Activate
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(sponsorship.id, 'cancelled')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {userRole === 'sponsor' && sponsorship.status === 'active' && (
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleStatusUpdate(sponsorship.id, 'completed')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(sponsorship.id, 'cancelled')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {userRole === 'sponsor' && sponsorship.status === 'cancelled' && (
                      <button
                        onClick={() => handleStatusUpdate(sponsorship.id, 'active')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
} 