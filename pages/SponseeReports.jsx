import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useNotification } from '../components/NotificationContext'

let Chart = null

export default function SponseeReports() {
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
          label: 'Sponsorships Received',
          data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.1)',
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

  const formatCurrency = (amount) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount)

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Sponsorship Reports</h1>
            <p className="text-gray-600">Overview of your received sponsorships and financials</p>
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
            onClick={handleExport}
            disabled={exporting}
          >{exporting ? 'Exporting...' : 'Export CSV'}</button>
        </div>
        {loading ? (
          <div className="text-gray-600">Loading reports...</div>
        ) : (
          <>
            {/* Financial Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h2 className="text-lg font-semibold mb-2">Financial Summary</h2>
              <div className="flex flex-wrap gap-8">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Support Received</div>
                  <div className="text-xl font-bold text-blue-700">{financial ? formatCurrency(financial.total) : '--'}</div>
                </div>
                {financial && Object.entries(financial.byStatus).map(([status, amount]) => (
                  <div key={status}>
                    <div className="text-sm text-gray-500 mb-1">{status.charAt(0).toUpperCase() + status.slice(1)}</div>
                    <div className="text-xl font-bold text-green-700">{formatCurrency(amount)}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Sponsorship Activity Chart */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Sponsorships Received Over Time</h2>
              <canvas ref={chartRef} height={120}></canvas>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
} 