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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sponsor-Sponsee Assignments</h1>
            <p className="text-gray-600">Manage which sponsors are assigned to which sponsees</p>
          </div>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold"
            onClick={() => setShowCreateModal(true)}
          >Assign Sponsee</button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <select
            value={filterSponsor}
            onChange={e => { setFilterSponsor(e.target.value); setTimeout(loadAssignments, 0) }}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Sponsors</option>
            {sponsors.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
            ))}
          </select>
          <select
            value={filterSponsee}
            onChange={e => { setFilterSponsee(e.target.value); setTimeout(loadAssignments, 0) }}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Sponsees</option>
            {sponsees.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
            ))}
          </select>
        </div>

        {/* Assignment Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading assignments...</td></tr>
              ) : assignments.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No assignments found.</td></tr>
              ) : assignments.map(a => (
                <tr key={a.id || `${a.sponsor?.id}-${a.sponsee?.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap">{a.sponsor?.name} <div className="text-xs text-gray-500">{a.sponsor?.email}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap">{a.sponsee?.name} <div className="text-xs text-gray-500">{a.sponsee?.email}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap">{a.admin?.name || 'Admin'} <div className="text-xs text-gray-500">{a.admin?.email || ''}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleRemoveAssignment(a.id)}
                    >Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Assignment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Assign Sponsee to Sponsor</h2>
              <form onSubmit={handleCreateAssignment}>
                <div className="space-y-4">
                  <select
                    value={selectedSponsor}
                    onChange={e => setSelectedSponsor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select Sponsor...</option>
                    {sponsors.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                    ))}
                  </select>
                  <select
                    multiple
                    value={selectedSponsees}
                    onChange={e => setSelectedSponsees(Array.from(e.target.selectedOptions, o => o.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32"
                    required
                  >
                    {sponsees.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >Cancel</button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >Assign</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
} 