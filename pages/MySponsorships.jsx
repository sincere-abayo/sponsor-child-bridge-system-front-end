import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { sponsorshipAPI } from '../services/api'
import { useNotification } from '../components/NotificationContext'
import Layout from '../components/Layout'

const STATUS_STYLES = {
  active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

const STATUS_DOT = {
  active: 'bg-emerald-500',
  pending: 'bg-amber-500',
  completed: 'bg-blue-500',
  cancelled: 'bg-red-500',
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatCurrency(amount) {
  return `RWF ${Number(amount).toLocaleString('en-US')}`
}

export default function MySponsorships() {
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(true)
  const [sponsorships, setSponsorships] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const userRole = localStorage.getItem('userRole')

  useEffect(() => { loadSponsorships() }, [statusFilter])

  const loadSponsorships = async () => {
    try {
      setLoading(true)
      const filters = statusFilter ? { status: statusFilter } : {}
      const response = await sponsorshipAPI.getMySponsorships(filters)
      if (userRole === 'sponsor') setSponsorships(response.asSponsor?.sponsorships || [])
      else if (userRole === 'sponsee') setSponsorships(response.asSponsee?.sponsorships || [])
      else setSponsorships([])
    } catch {
      showNotification('Failed to load sponsorships', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await sponsorshipAPI.updateSponsorshipStatus(id, { status })
      showNotification('Status updated successfully', 'success')
      loadSponsorships()
    } catch {
      showNotification('Failed to update status', 'error')
    }
  }

  const heading = userRole === 'sponsor' ? 'My Sponsored Children' : 'My Sponsors'

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading sponsorships...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
            <p className="text-sm text-gray-500 mt-1">{sponsorships.length} sponsorship{sponsorships.length !== 1 ? 's' : ''} found</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {userRole === 'sponsor' && (
              <Link to="/create-sponsorship" className="btn-primary text-sm px-4 py-2 whitespace-nowrap">
                + New Sponsorship
              </Link>
            )}
          </div>
        </div>

        {/* Empty state */}
        {sponsorships.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No sponsorships found</h3>
            <p className="text-sm text-gray-500 mb-6">
              {userRole === 'sponsor' ? "You haven't created any sponsorships yet." : "You don't have any sponsorships yet."}
            </p>
            {userRole === 'sponsor' && (
              <Link to="/create-sponsorship" className="btn-primary text-sm px-5 py-2">
                Create Your First Sponsorship
              </Link>
            )}
          </div>
        ) : (
          /* 3-column card grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sponsorships.map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">

                {/* Card top strip — status color accent */}
                <div className={`h-1 rounded-t-xl ${STATUS_DOT[s.status] || 'bg-gray-300'}`} />

                <div className="p-5 flex flex-col flex-1">

                  {/* Header row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                        {userRole === 'sponsor' ? 'Sponsoring' : 'Sponsored by'}
                      </p>
                      <h3 className="text-base font-bold text-gray-900 truncate">
                        {userRole === 'sponsor'
                          ? (s.sponsee?.name || 'Child')
                          : (s.sponsor?.name || 'Sponsor')}
                      </h3>
                    </div>
                    <span className={`ml-3 flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[s.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s.status] || 'bg-gray-400'}`} />
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                  </div>

                  {/* Key info grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Type</p>
                      <p className="text-sm font-semibold text-gray-800 capitalize">{s.type?.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">{s.type === 'money' ? 'Amount' : 'Value'}</p>
                      <p className={`text-sm font-bold ${s.type === 'money' ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {s.type === 'money' ? formatCurrency(s.amount) : (s.value || '—')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Frequency</p>
                      <p className="text-sm font-semibold text-gray-800 capitalize">{s.frequency?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Started</p>
                      <p className="text-sm font-semibold text-gray-800">{formatDate(s.startDate)}</p>
                    </div>
                  </div>

                  {/* Description */}
                  {s.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed border-t border-gray-100 pt-3">
                      {s.description}
                    </p>
                  )}

                  {/* Proof link */}
                  {s.proofFile && (
                    <a
                      href={`http://localhost:5000${s.proofFile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium mb-4"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      View Proof
                    </a>
                  )}

                  {/* Spacer pushes actions to bottom */}
                  <div className="flex-1" />

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                    <Link
                      to={`/sponsorship/${s.id}`}
                      className="w-full text-center text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 border border-primary-200 rounded-lg py-2 transition-colors"
                    >
                      View Details
                    </Link>

                    {userRole === 'sponsor' && s.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleStatusUpdate(s.id, 'active')} className="text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg py-2 transition-colors">
                          Activate
                        </button>
                        <button onClick={() => handleStatusUpdate(s.id, 'cancelled')} className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg py-2 transition-colors">
                          Cancel
                        </button>
                      </div>
                    )}

                    {userRole === 'sponsor' && s.status === 'active' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleStatusUpdate(s.id, 'completed')} className="text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg py-2 transition-colors">
                          Complete
                        </button>
                        <button onClick={() => handleStatusUpdate(s.id, 'cancelled')} className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg py-2 transition-colors">
                          Cancel
                        </button>
                      </div>
                    )}

                    {userRole === 'sponsor' && s.status === 'cancelled' && (
                      <button onClick={() => handleStatusUpdate(s.id, 'active')} className="text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg py-2 transition-colors">
                        Reactivate
                      </button>
                    )}

                    {userRole === 'sponsor' && s.status === 'pending' && (
                      <Link to={`/sponsorship/${s.id}/edit`} className="w-full text-center text-xs font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 border border-amber-200 rounded-lg py-2 transition-colors">
                        Edit
                      </Link>
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
