import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useNotification } from '../components/NotificationContext'

let Chart = null

export default function SponsorReports() {
  const { showNotification } = useNotification()
  const [financial, setFinancial] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [chartLoaded, setChartLoaded] = useState(false)
  const chartRef = React.useRef(null)

  useEffect(() => {
    loadData()
    import('chart.js/auto').then(mod => {
      Chart = mod.default
      setChartLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (chartLoaded && activity.length > 0) {
      renderChart()
    }
    // eslint-disable-next-line
  }, [chartLoaded, activity])

  const loadData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      // Financial
      const finRes = await fetch('/api/reports/my-financial-summary', { headers: { Authorization: `Bearer ${token}` } })
      setFinancial(await finRes.json())
      // Activity
      const actRes = await fetch('/api/reports/my-activity', { headers: { Authorization: `Bearer ${token}` } })
      const actData = await actRes.json()
      setActivity(actData.sponsorships || [])
    } catch (err) {
      showNotification('Failed to load reports data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/reports/my-export', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'my-sponsorships-export.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      showNotification('Exported CSV successfully', 'success')
    } catch {
      showNotification('Failed to export CSV', 'error')
    } finally {
      setExporting(false)
    }
  }

  const renderChart = () => {
    if (!chartRef.current) return
    if (chartRef.current.chartInstance) {
      chartRef.current.chartInstance.destroy()
    }
    const grouped = activity.reduce((acc, s) => {
      const date = new Date(s.createdAt).toLocaleDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})
    const labels = Object.keys(grouped).sort()
    const data = labels.map(l => grouped[l])
    chartRef.current.chartInstance = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Sponsorships Created',
          data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { title: { display: true, text: 'Date' } },
          y: { title: { display: true, text: 'Sponsorships' }, beginAtZero: true }
        }
      }
    })
  }

  const formatCurrency = (amount) => `RWF ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0 })}`

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="page-header">
          <div className="page-header-content">
            <div className="page-header-inner">
              <div>
                <h1 className="page-title">My Sponsorship Reports</h1>
                <p className="page-subtitle">Overview of your sponsorship activity and financials</p>
              </div>
              <button
                className="btn-success"
                onClick={handleExport}
                disabled={exporting}
              >{exporting ? 'Exporting...' : 'Export CSV'}</button>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-gray-600">Loading reports...</div>
        ) : (
          <>
            {/* Financial Summary */}
            <div className="mb-8">
              <h2 className="text-heading-2 mb-4">Financial Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total donated */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Total Donated</p>
                  <p className="text-2xl font-bold text-secondary-600">{financial ? formatCurrency(financial.total) : '--'}</p>
                  <p className="text-xs text-gray-400 mt-1">Money sponsorships</p>
                </div>

                {/* By status */}
                {financial && Object.entries(financial.byStatus).map(([status, amount]) => {
                  const colors = {
                    active:    { text: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
                    pending:   { text: 'text-amber-600',   bg: 'bg-amber-50',   dot: 'bg-amber-500' },
                    completed: { text: 'text-blue-600',    bg: 'bg-blue-50',    dot: 'bg-blue-500' },
                    cancelled: { text: 'text-red-600',     bg: 'bg-red-50',     dot: 'bg-red-500' },
                  }
                  const c = colors[status] || { text: 'text-gray-700', bg: 'bg-gray-50', dot: 'bg-gray-400' }
                  return (
                    <div key={status} className={`rounded-xl border border-gray-200 shadow-sm p-5 ${c.bg}`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{status}</p>
                      </div>
                      <p className={`text-2xl font-bold ${c.text}`}>{formatCurrency(amount)}</p>
                      <p className="text-xs text-gray-400 mt-1">Amount by status</p>
                    </div>
                  )
                })}

                {/* In-kind cards */}
                {financial && financial.byType && Object.entries(financial.byType).map(([type, count]) => (
                  <div key={type} className="bg-white rounded-xl border border-primary-100 shadow-sm p-5">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">In-Kind</p>
                    <p className="text-2xl font-bold text-primary-600">{count}</p>
                    <p className="text-sm font-medium text-gray-700 mt-1">{type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                    <p className="text-xs text-gray-400">sponsorship{count !== 1 ? 's' : ''}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Sponsorship Activity Chart */}
            <div className="card mb-8">
              <div className="card-header">
                <h2 className="text-heading-2">Sponsorships Over Time</h2>
              </div>
              <div className="card-body">
                <canvas ref={chartRef} height={120}></canvas>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
} 