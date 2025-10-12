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
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🟢'
      case 'pending': return '🟡'
      case 'completed': return '🔵'
      case 'cancelled': return '🔴'
      default: return '⚪'
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
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600 font-medium">Loading sponsorships...</div>
            <div className="text-sm text-gray-400 mt-2">Please wait while we fetch your data</div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="w-full min-h-screen bg-gray-50">
        <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          {/* Enhanced Mobile-First Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-secondary-50">
              <div className="flex flex-col space-y-4">
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{heading}</h1>
                  <p className="text-sm sm:text-base text-gray-600">Manage your sponsorship relationships</p>
                </div>
                {userRole === 'sponsor' && (
                  <div className="flex justify-center sm:justify-start">
                    <Link
                      to="/create-sponsorship"
                      className="inline-flex items-center px-4 py-2 bg-success-500 hover:bg-success-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                    >
                      <span className="mr-2">✨</span>
                      Create New
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile-Optimized Filters */}
            <div className="p-4 sm:p-6">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {sponsorships.length} found
                  </span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="active">🟢 Active</option>
                  <option value="completed">🔵 Completed</option>
                  <option value="cancelled">🔴 Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile-Optimized Sponsorships List */}
          {sponsorships.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="text-5xl sm:text-6xl mb-4">🤝</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No Sponsorships Found</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto text-sm sm:text-base">{emptyMsg}</p>
              {userRole === 'sponsor' && (
                <Link
                  to="/create-sponsorship"
                  className="inline-flex items-center px-6 py-3 bg-success-500 hover:bg-success-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <span className="mr-2">✨</span>
                  Create Your First Sponsorship
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {sponsorships.map((sponsorship) => (
                <div key={sponsorship.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                  {/* Mobile-Optimized Card Header */}
                  <div className="p-4 sm:p-6">
                    {/* Status and Date - Mobile First */}
                    <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(sponsorship.status)}`}>
                        <span className="mr-1">{getStatusIcon(sponsorship.status)}</span>
                        {sponsorship.status.charAt(0).toUpperCase() + sponsorship.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        📅 {formatDate(sponsorship.createdAt)}
                      </span>
                    </div>

                    {/* Main Title - Mobile Optimized */}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 leading-tight">
                      {userRole === 'sponsor'
                        ? `Sponsoring ${sponsorship.sponsee?.name || 'Child'}`
                        : `Sponsored by ${sponsorship.sponsor?.name || 'Sponsor'}`
                      }
                    </h3>

                    {/* Key Details - Mobile Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs font-medium text-gray-600 mb-1">Type</div>
                        <div className="text-sm font-semibold text-gray-900 capitalize">{sponsorship.type?.replace('_', ' ')}</div>
                      </div>
                      
                      {sponsorship.type === 'money' ? (
                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                          <div className="text-xs font-medium text-gray-600 mb-1">Amount</div>
                          <div className="text-base font-bold text-emerald-700">
                            {formatCurrency(sponsorship.amount)}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="text-xs font-medium text-gray-600 mb-1">Value</div>
                          <div className="text-sm font-semibold text-blue-700">{sponsorship.value || 'N/A'}</div>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs font-medium text-gray-600 mb-1">Frequency</div>
                        <div className="text-sm font-semibold text-gray-900 capitalize">{sponsorship.frequency.replace('_', ' ')}</div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs font-medium text-gray-600 mb-1">Start Date</div>
                        <div className="text-sm font-semibold text-gray-900">{formatDate(sponsorship.startDate)}</div>
                      </div>
                    </div>

                    {/* Additional Dates - Conditional Mobile Layout */}
                    {(sponsorship.nextPaymentDate || sponsorship.expectedDeliveryDate) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {sponsorship.nextPaymentDate && (
                          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                            <div className="text-xs font-medium text-gray-600 mb-1">Next Payment</div>
                            <div className="text-sm font-semibold text-amber-700">{formatDate(sponsorship.nextPaymentDate)}</div>
                          </div>
                        )}
                        
                        {sponsorship.expectedDeliveryDate && (
                          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                            <div className="text-xs font-medium text-gray-600 mb-1">Expected Delivery</div>
                            <div className="text-sm font-semibold text-purple-700">{formatDate(sponsorship.expectedDeliveryDate)}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description and Notes - Mobile Optimized */}
                    {(sponsorship.description || sponsorship.notes) && (
                      <div className="space-y-3 mb-4">
                        {sponsorship.description && (
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <div className="text-xs font-medium text-blue-800 mb-1">📝 Description</div>
                            <p className="text-blue-900 text-sm leading-relaxed">{sponsorship.description}</p>
                          </div>
                        )}
                        {sponsorship.notes && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs font-medium text-gray-800 mb-1">📌 Notes</div>
                            <p className="text-gray-900 text-sm leading-relaxed">{sponsorship.notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Proof File - Mobile Optimized */}
                    {sponsorship.proofFile && (
                      <div className="mb-4">
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="text-xs font-medium text-green-800 mb-1">📎 Proof Document</div>
                          <a 
                            href={`http://localhost:5000${sponsorship.proofFile}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center text-green-700 hover:text-green-800 font-medium transition-colors duration-200 text-sm"
                          >
                            <span className="mr-1">🔗</span>
                            View File
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Participant Details - Mobile Optimized */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 mb-4">
                      <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">
                          {userRole === 'sponsor' ? '👶' : '🤝'}
                        </span>
                        {userRole === 'sponsor' ? 'Child Details' : 'Sponsor Details'}
                      </h4>
                      {userRole === 'sponsor' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-white p-3 rounded-lg">
                            <span className="text-xs font-medium text-gray-600">Name:</span>
                            <div className="font-semibold text-gray-900 text-sm">{sponsorship.sponsee?.name || 'N/A'}</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <span className="text-xs font-medium text-gray-600">Age:</span>
                            <div className="font-semibold text-gray-900 text-sm">{sponsorship.sponsee?.sponseeProfile?.age || 'N/A'} years</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <span className="text-xs font-medium text-gray-600">Location:</span>
                            <div className="font-semibold text-gray-900 text-sm">{sponsorship.sponsee?.sponseeProfile?.location || 'N/A'}</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <span className="text-xs font-medium text-gray-600">School:</span>
                            <div className="font-semibold text-gray-900 text-sm">{sponsorship.sponsee?.sponseeProfile?.schoolName || 'Not specified'}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-white p-3 rounded-lg">
                            <span className="text-xs font-medium text-gray-600">Name:</span>
                            <div className="font-semibold text-gray-900 text-sm">{sponsorship.sponsor?.name || 'N/A'}</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <span className="text-xs font-medium text-gray-600">Occupation:</span>
                            <div className="font-semibold text-gray-900 text-sm">{sponsorship.sponsor?.sponsorProfile?.occupation || 'Not specified'}</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <span className="text-xs font-medium text-gray-600">Location:</span>
                            <div className="font-semibold text-gray-900 text-sm">{sponsorship.sponsor?.sponsorProfile?.preferredLocation || 'Not specified'}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mobile-Optimized Action Buttons */}
                    <div className="flex flex-col space-y-2">
                      <Link
                        to={`/sponsorship/${sponsorship.id}`}
                        className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-center text-sm"
                      >
                        👁️ View Details
                      </Link>
                      
                      {userRole === 'sponsor' && sponsorship.status === 'pending' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleStatusUpdate(sponsorship.id, 'active')}
                            className="bg-success-500 hover:bg-success-600 text-white font-medium py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm"
                          >
                            ✅ Activate
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(sponsorship.id, 'cancelled')}
                            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm"
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      )}
                      
                      {userRole === 'sponsor' && sponsorship.status === 'active' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleStatusUpdate(sponsorship.id, 'completed')}
                            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm"
                          >
                            🎓 Complete
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(sponsorship.id, 'cancelled')}
                            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm"
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      )}
                      
                      {userRole === 'sponsor' && sponsorship.status === 'cancelled' && (
                        <button
                          onClick={() => handleStatusUpdate(sponsorship.id, 'active')}
                          className="w-full bg-success-500 hover:bg-success-600 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm"
                        >
                          🔄 Reactivate
                        </button>
                      )}
                      
                      {userRole === 'sponsor' && sponsorship.status === 'pending' && (
                        <Link
                          to={`/sponsorship/${sponsorship.id}/edit`}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-center text-sm"
                        >
                          ✏️ Edit
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
} 