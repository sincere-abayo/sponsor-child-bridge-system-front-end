import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { useNotification } from '../../components/NotificationContext'

export default function AdminAssignments() {
  const { showNotification } = useNotification()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sponsors, setSponsors] = useState([])
  const [sponsees, setSponsees] = useState([])
  const [selectedSponsor, setSelectedSponsor] = useState('')
  const [selectedSponsees, setSelectedSponsees] = useState([])
  const [filterSponsor, setFilterSponsor] = useState('')
  const [filterSponsee, setFilterSponsee] = useState('')

  useEffect(() => {
    loadAssignments()
    loadUsers()
  }, [])

  const loadAssignments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      let url = '/api/admin/assignments'
      const params = []
      if (filterSponsor) params.push(`sponsorId=${filterSponsor}`)
      if (filterSponsee) params.push(`sponseeId=${filterSponsee}`)
      if (params.length) url += '?' + params.join('&')
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      // Log only the assignment fields, without sponsor/sponsee/admin
      console.log('Raw assignments:', data.map(a => ({
        id: a.id,
        sponsorId: a.sponsorId,
        sponseeId: a.sponseeId,
        assignedBy: a.assignedBy,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt
      })))
      setAssignments(data)
    } catch (err) {
      showNotification('Failed to load assignments', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/profiles/all', { headers: { Authorization: `Bearer ${token}` } })
      const users = await res.json()
      setSponsors(users.filter(u => u.role === 'sponsor'))
      setSponsees(users.filter(u => u.role === 'sponsee'))
    } catch {}
  }

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    if (!selectedSponsor || selectedSponsees.length === 0) {
      showNotification('Select a sponsor and at least one sponsee', 'error')
      return
    }
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sponsorId: selectedSponsor, sponseeIds: selectedSponsees })
      })
      if (res.ok) {
        showNotification('Assignment(s) created', 'success')
        setShowCreateModal(false)
        setSelectedSponsor('')
        setSelectedSponsees([])
        loadAssignments()
      } else {
        const err = await res.json()
        showNotification(err.message || 'Failed to create assignment', 'error')
      }
    } catch {
      showNotification('Failed to create assignment', 'error')
    }
  }

  const handleRemoveAssignment = async (id) => {
    if (!id) {
      showNotification('Invalid assignment ID', 'error')
      return
    }
    if (!window.confirm('Remove this assignment?')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/admin/assignments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        showNotification('Assignment removed', 'success')
        loadAssignments()
      } else {
        showNotification('Failed to remove assignment', 'error')
      }
    } catch {
      showNotification('Failed to remove assignment', 'error')
    }
  }

  if (loading && assignments.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600 font-medium">Loading assignments...</div>
            <div className="text-sm text-gray-400 mt-2">Please wait while we fetch assignment data</div>
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
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Sponsor-Sponsee Assignments</h1>
                <p className="text-base sm:text-lg text-gray-600 max-w-4xl">
                  Manage which sponsors are assigned to which sponsees and monitor assignment relationships
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={loadAssignments}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 hover:shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <button
                  className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
                  onClick={() => setShowCreateModal(true)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Assign Sponsee
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Sponsor</label>
                <select
                  value={filterSponsor}
                  onChange={e => { setFilterSponsor(e.target.value); setTimeout(loadAssignments, 0) }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                >
                  <option value="">All Sponsors</option>
                  {sponsors.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none top-8">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Sponsee</label>
                <select
                  value={filterSponsee}
                  onChange={e => { setFilterSponsee(e.target.value); setTimeout(loadAssignments, 0) }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                >
                  <option value="">All Sponsees</option>
                  {sponsees.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none top-8">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Assignment Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sponsor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sponsee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Assigned By
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
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mr-3"></div>
                          <span className="text-gray-600">Loading assignments...</span>
                        </div>
                      </td>
                    </tr>
                  ) : assignments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium">No assignments found</p>
                          <p className="text-sm text-gray-400 mt-1">Create your first assignment to get started</p>
                        </div>
                      </td>
                    </tr>
                  ) : assignments.map(a => (
                    <tr key={a.id || `${a.sponsor?.id}-${a.sponsee?.id}`} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-3">
                            {a.sponsor?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{a.sponsor?.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{a.sponsor?.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-3">
                            {a.sponsee?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{a.sponsee?.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{a.sponsee?.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-3">
                            {a.admin?.name?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{a.admin?.name || 'Admin'}</div>
                            <div className="text-sm text-gray-500">{a.admin?.email || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(a.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="inline-flex items-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                          onClick={() => handleRemoveAssignment(a.id)}
                          title="Remove assignment"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Create Assignment Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Assign Sponsee to Sponsor</h2>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <form onSubmit={handleCreateAssignment} className="px-6 py-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Sponsor
                      </label>
                      <select
                        value={selectedSponsor}
                        onChange={e => setSelectedSponsor(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="">Select Sponsor...</option>
                        {sponsors.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Sponsees
                      </label>
                      <div className="text-xs text-gray-500 mb-2">
                        Hold Ctrl/Cmd to select multiple sponsees
                      </div>
                      <select
                        multiple
                        value={selectedSponsees}
                        onChange={e => setSelectedSponsees(Array.from(e.target.selectedOptions, o => o.value))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 min-h-[120px]"
                        required
                      >
                        {sponsees.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                        ))}
                      </select>
                      {selectedSponsees.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          Selected: {selectedSponsees.length} sponsee(s)
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-8">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg"
                    >
                      Create Assignment
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