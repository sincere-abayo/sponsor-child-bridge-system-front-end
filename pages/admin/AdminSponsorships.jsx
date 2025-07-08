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
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading sponsorships...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sponsorship Monitoring</h1>
              <p className="text-gray-600">Monitor and manage all sponsorships</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search sponsorships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
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
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, sponsorships.length)} of {sponsorships.length} sponsorships
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Sponsorships Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sponsorship
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sponsor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sponsee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSponsorships.map((sponsorship) => (
                  <tr key={sponsorship.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {sponsorship.type.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {sponsorship.description?.substring(0, 50) || 'No description'}
                          {sponsorship.description?.length > 50 && '...'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {sponsorship.sponsor?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {sponsorship.sponsor?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {sponsorship.sponsee?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {sponsorship.sponsee?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(sponsorship.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sponsorship.status)}`}>
                        <span className="mr-1">{getStatusIcon(sponsorship.status)}</span>
                        {sponsorship.status.charAt(0).toUpperCase() + sponsorship.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(sponsorship.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusChange(sponsorship)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Update Status
                        </button>
                        <button
                          onClick={() => handleDeleteSponsorship(sponsorship.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Update Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Update Sponsorship Status</h2>
              <form onSubmit={handleStatusUpdate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Status
                    </label>
                    <select
                      value={statusForm.status}
                      onChange={(e) => setStatusForm({...statusForm, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Notes (optional)
                    </label>
                    <textarea
                      value={statusForm.notes}
                      onChange={(e) => setStatusForm({...statusForm, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows="3"
                      placeholder="Add any notes about this status change..."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
} 