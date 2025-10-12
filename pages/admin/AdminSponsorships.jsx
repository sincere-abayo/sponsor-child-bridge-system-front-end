import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { useNotification } from '../../components/NotificationContext'

export default function AdminSponsorships() {
  const { showNotification } = useNotification()
  const [sponsorships, setSponsorships] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedSponsorship, setSelectedSponsorship] = useState(null)
  const [statusForm, setStatusForm] = useState({ status: '', notes: '' })

  useEffect(() => {
    loadSponsorships()
  }, [currentPage, statusFilter, typeFilter])

  const loadSponsorships = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      })
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('type', typeFilter)
      
      const response = await fetch(`/api/sponsorships/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setSponsorships(data.sponsorships)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Error loading sponsorships:', error)
      showNotification('Failed to load sponsorships', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/sponsorships/admin/${selectedSponsorship.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(statusForm)
      })
      
      if (response.ok) {
        showNotification('Sponsorship status updated successfully', 'success')
        setShowStatusModal(false)
        setSelectedSponsorship(null)
        setStatusForm({ status: '', notes: '' })
        loadSponsorships()
      } else {
        const error = await response.json()
        showNotification(error.message || 'Failed to update status', 'error')
      }
    } catch (error) {
      showNotification('Failed to update sponsorship status', 'error')
    }
  }

  const handleDeleteSponsorship = async (sponsorshipId) => {
    if (!window.confirm('Are you sure you want to delete this sponsorship?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/sponsorships/admin/${sponsorshipId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        showNotification('Sponsorship deleted successfully', 'success')
        loadSponsorships()
      } else {
        showNotification('Failed to delete sponsorship', 'error')
      }
    } catch (error) {
      showNotification('Failed to delete sponsorship', 'error')
    }
  }

  const handleStatusChange = (sponsorship) => {
    setSelectedSponsorship(sponsorship)
    setStatusForm({ status: sponsorship.status, notes: '' })
    setShowStatusModal(true)
  }

  const filteredSponsorships = sponsorships.filter(sponsorship => {
    const sponsorName = sponsorship.sponsor?.name || ''
    const sponseeName = sponsorship.sponsee?.name || ''
    const description = sponsorship.description || ''
    
    return sponsorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           sponseeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           description.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'pending': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'completed': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'cancelled': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default: 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600 font-medium">Loading sponsorships...</div>
            <div className="text-sm text-gray-400 mt-2">Please wait while we fetch sponsorship data</div>
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
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Sponsorship Monitoring</h1>
                <p className="text-base sm:text-lg text-gray-600 max-w-4xl">
                  Monitor and manage all sponsorships, track status updates, and oversee the sponsorship process
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={loadSponsorships}
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

          {/* Enhanced Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search sponsorships..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                >
                  <option value="">All Types</option>
                  <option value="money">Money</option>
                  <option value="school_supplies">School Supplies</option>
                  <option value="food">Food</option>
                  <option value="clothing">Clothing</option>
                  <option value="medical">Medical</option>
                  <option value="transport">Transport</option>
                  <option value="technology">Technology</option>
                  <option value="books">Books</option>
                  <option value="uniforms">Uniforms</option>
                  <option value="meals">Meals</option>
                  <option value="tuition">Tuition</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="hygiene">Hygiene</option>
                  <option value="other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Pagination */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{((currentPage - 1) * 20) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * 20, sponsorships.length)}</span> of{' '}
                <span className="font-medium">{sponsorships.length}</span> sponsorships
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Sponsorships Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sponsorship Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sponsor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sponsee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredSponsorships.map((sponsorship) => (
                    <tr key={sponsorship.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 mb-1">
                            {sponsorship.type.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs">
                            {sponsorship.description?.substring(0, 60) || 'No description'}
                            {sponsorship.description?.length > 60 && '...'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-3">
                            {sponsorship.sponsor?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {sponsorship.sponsor?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {sponsorship.sponsor?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-3">
                            {sponsorship.sponsee?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {sponsorship.sponsee?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {sponsorship.sponsee?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(sponsorship.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(sponsorship.status)}`}>
                          <span className="mr-1.5">{getStatusIcon(sponsorship.status)}</span>
                          {sponsorship.status.charAt(0).toUpperCase() + sponsorship.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(sponsorship.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusChange(sponsorship)}
                            className="inline-flex items-center p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Update status"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteSponsorship(sponsorship.id)}
                            className="inline-flex items-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete sponsorship"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSponsorships.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No sponsorships found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Status Update Modal */}
          {showStatusModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Update Sponsorship Status</h2>
                    <button
                      onClick={() => setShowStatusModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <form onSubmit={handleStatusUpdate} className="px-6 py-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Status
                      </label>
                      <select
                        value={statusForm.status}
                        onChange={(e) => setStatusForm({...statusForm, status: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Notes (Optional)
                      </label>
                      <textarea
                        value={statusForm.notes}
                        onChange={(e) => setStatusForm({...statusForm, notes: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        rows="3"
                        placeholder="Add any notes about this status change..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-8">
                    <button
                      type="button"
                      onClick={() => setShowStatusModal(false)}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg"
                    >
                      Update Status
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
} 