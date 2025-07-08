import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { sponsorshipAPI } from '../services/api'
import { useNotification } from '../components/NotificationContext'
import Layout from '../components/Layout'

export default function SponsorshipDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(true)
  const [sponsorship, setSponsorship] = useState(null)
  const [userRole] = useState(localStorage.getItem('userRole'))

  useEffect(() => {
    loadSponsorship()
  }, [id])

  const loadSponsorship = async () => {
    try {
      setLoading(true)
      const response = await sponsorshipAPI.getSponsorship(id)
      if (response.sponsorship) {
        setSponsorship(response.sponsorship)
      } else {
        showNotification('Sponsorship not found', 'error')
        navigate('/my-sponsorships')
      }
    } catch (error) {
      console.error('Error loading sponsorship:', error)
      showNotification('Failed to load sponsorship details', 'error')
      navigate('/my-sponsorships')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await sponsorshipAPI.updateSponsorshipStatus(id, {
        status: newStatus
      })
      
      if (response.message) {
        showNotification('Sponsorship status updated successfully', 'success')
        loadSponsorship() // Reload to get updated data
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
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF'
    }).format(amount)
  }

  const isSponsor = sponsorship?.sponsorId === parseInt(localStorage.getItem('userId'))

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading sponsorship details...</div>
        </div>
      </Layout>
    )
  }

  if (!sponsorship) {
    return (
      <Layout>
        <div className="text-center py-8">
          <div className="text-xl text-gray-600">Sponsorship not found</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sponsorship Details</h1>
              <p className="text-gray-600">Comprehensive view of your sponsorship</p>
            </div>
            <button
              onClick={() => navigate('/my-sponsorships')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Sponsorships
            </button>
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sponsorship.status)}`}>
              <span className="mr-2">{getStatusIcon(sponsorship.status)}</span>
              {sponsorship.status.charAt(0).toUpperCase() + sponsorship.status.slice(1)}
            </span>
            <span className="text-sm text-gray-500">
              Created {formatDate(sponsorship.createdAt)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sponsorship Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sponsorship Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Financial Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-green-600 text-lg">
                        {formatCurrency(sponsorship.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frequency:</span>
                      <span className="capitalize">{sponsorship.frequency.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Paid:</span>
                      <span className="font-semibold">{formatCurrency(sponsorship.totalPaid)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Timeline</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">Start Date:</span>
                      <div className="font-medium">{formatDate(sponsorship.startDate)}</div>
                    </div>
                    {sponsorship.endDate && (
                      <div>
                        <span className="text-gray-600">End Date:</span>
                        <div className="font-medium">{formatDate(sponsorship.endDate)}</div>
                      </div>
                    )}
                    {sponsorship.nextPaymentDate && (
                      <div>
                        <span className="text-gray-600">Next Payment:</span>
                        <div className="font-medium">{formatDate(sponsorship.nextPaymentDate)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {sponsorship.description && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{sponsorship.description}</p>
                </div>
              )}

              {sponsorship.notes && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{sponsorship.notes}</p>
                </div>
              )}
            </div>

            {/* Participant Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Participant Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sponsor Details */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🤝</span>
                    Sponsor
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div><span className="font-medium">Name:</span> {sponsorship.sponsor?.name}</div>
                      <div><span className="font-medium">Email:</span> {sponsorship.sponsor?.email}</div>
                      {sponsorship.sponsor?.sponsorProfile && (
                        <>
                          <div><span className="font-medium">Occupation:</span> {sponsorship.sponsor.sponsorProfile.occupation}</div>
                          <div><span className="font-medium">Income Range:</span> {sponsorship.sponsor.sponsorProfile.incomeRange}</div>
                          <div><span className="font-medium">Location:</span> {sponsorship.sponsor.sponsorProfile.preferredLocation}</div>
                          {sponsorship.sponsor.sponsorProfile.bio && (
                            <div>
                              <span className="font-medium">Bio:</span>
                              <p className="text-sm text-gray-600 mt-1">{sponsorship.sponsor.sponsorProfile.bio}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sponsee Details */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">👨‍🎓</span>
                    Child
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div><span className="font-medium">Name:</span> {sponsorship.sponsee?.name}</div>
                      <div><span className="font-medium">Email:</span> {sponsorship.sponsee?.email}</div>
                      {sponsorship.sponsee?.sponseeProfile && (
                        <>
                          <div><span className="font-medium">Age:</span> {sponsorship.sponsee.sponseeProfile.age} years</div>
                          <div><span className="font-medium">Gender:</span> {sponsorship.sponsee.sponseeProfile.gender}</div>
                          <div><span className="font-medium">Location:</span> {sponsorship.sponsee.sponseeProfile.location}</div>
                          <div><span className="font-medium">School:</span> {sponsorship.sponsee.sponseeProfile.schoolName || 'Not specified'}</div>
                          <div><span className="font-medium">Grade:</span> {sponsorship.sponsee.sponseeProfile.grade || 'Not specified'}</div>
                          {sponsorship.sponsee.sponseeProfile.bio && (
                            <div>
                              <span className="font-medium">Bio:</span>
                              <p className="text-sm text-gray-600 mt-1">{sponsorship.sponsee.sponseeProfile.bio}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            {isSponsor && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Status Management</h3>
                <div className="space-y-3">
                  {sponsorship.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate('active')}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Activate Sponsorship
                      </button>
                      <button
                        onClick={() => handleStatusUpdate('cancelled')}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Cancel Sponsorship
                      </button>
                    </>
                  )}
                  
                  {sponsorship.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate('completed')}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Complete Sponsorship
                      </button>
                      <button
                        onClick={() => handleStatusUpdate('cancelled')}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Cancel Sponsorship
                      </button>
                    </>
                  )}

                  {(sponsorship.status === 'completed' || sponsorship.status === 'cancelled') && (
                    <div className="text-center text-gray-500">
                      <p>This sponsorship is {sponsorship.status}</p>
                      <p className="text-sm mt-1">
                        {sponsorship.endDate && `Ended on ${formatDate(sponsorship.endDate)}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {(() => {
                      const start = new Date(sponsorship.startDate)
                      const end = sponsorship.endDate ? new Date(sponsorship.endDate) : new Date()
                      const diffTime = Math.abs(end - start)
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                      return `${diffDays} days`
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-medium">
                    {sponsorship.totalPaid > 0 
                      ? `${Math.round((sponsorship.totalPaid / sponsorship.amount) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(sponsorship.amount - sponsorship.totalPaid)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 