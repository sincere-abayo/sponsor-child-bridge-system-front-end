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
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Sponsorships Received',
          data,
          backgroundColor: 'rgba(0, 150, 136, 0.8)',
          borderColor: '#009688',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: 'rgba(0, 150, 136, 1)',
          hoverBorderColor: '#00796b',
          hoverBorderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            display: false 
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#009688',
            borderWidth: 2,
            cornerRadius: 12,
            displayColors: false,
            padding: 16,
            titleFont: { size: 14, weight: '600' },
            bodyFont: { size: 13 },
            callbacks: {
              title: function(context) {
                return `📅 ${context[0].label}`;
              },
              label: function(context) {
                return `📊 ${context.parsed.y} sponsorship${context.parsed.y !== 1 ? 's' : ''}`;
              }
            }
          }
        },
        scales: {
          x: { 
            title: { 
              display: true, 
              text: '📅 Date',
              color: '#374151',
              font: { size: 14, weight: '600' }
            },
            grid: {
              color: 'rgba(229, 231, 235, 0.6)',
              drawBorder: false,
              lineWidth: 1
            },
            ticks: {
              color: '#6b7280',
              font: { size: 12, weight: '500' }
            }
          },
          y: { 
            title: { 
              display: true, 
              text: '📊 Number of Sponsorships',
              color: '#374151',
              font: { size: 14, weight: '600' }
            },
            grid: {
              color: 'rgba(229, 231, 235, 0.6)',
              drawBorder: false,
              lineWidth: 1
            },
            ticks: {
              color: '#6b7280',
              font: { size: 12, weight: '500' },
              beginAtZero: true,
              stepSize: 1
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    })
  }

  const formatCurrency = (amount) => `RWF ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0 })}`

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-emerald-600'
      case 'pending': return 'text-amber-600'
      case 'completed': return 'text-blue-600'
      case 'cancelled': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return '🟢'
      case 'pending': return '🟡'
      case 'completed': return '🔵'
      case 'cancelled': return '🔴'
      default: return '⚪'
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-100 border-t-primary-500 mx-auto mb-6"></div>
            <div className="text-xl text-gray-700 font-semibold mb-2">Loading Reports</div>
            <div className="text-gray-500">Please wait while we gather your data...</div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="w-full px-[2%] py-8">
          {/* Enhanced Header with Glassmorphism Effect */}
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-xl blur-md"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg mb-2 lg:mb-0 lg:mr-3">
                    <span className="text-xl">📊</span>
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">
                      My Sponsorship Reports
                    </h1>
                    <p className="text-sm text-gray-600 max-w-lg leading-relaxed">
                      Comprehensive overview of your received sponsorships and financial analytics
                    </p>
                  </div>
                </div>
                <button
                  className="group relative inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:from-primary-600 hover:to-secondary-600"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  <div className="absolute inset-0 bg-white/20 rounded-lg blur-sm group-hover:blur-md transition-all duration-300"></div>
                  <div className="relative flex items-center">
                    {exporting ? (
                      <>
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <span className="mr-2 text-base">📥</span>
                        Export CSV
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {!loading && (
            <>
              {/* Enhanced Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* Total Support Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg blur-sm opacity-20 group-hover:opacity-30 transition-all duration-300"></div>
                  <div className="relative bg-white rounded-lg shadow-md border border-blue-100 p-3 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">Total Support</div>
                        <div className="text-lg font-bold text-blue-900">
                          {financial ? formatCurrency(financial.total) : '--'}
                        </div>
                        <div className="text-xs text-blue-500 mt-1">All time contributions</div>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <span className="text-base">💎</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Breakdown Cards */}
                {financial && Object.entries(financial.byStatus).map(([status, amount]) => (
                                                                          <div key={status} className="group relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${
                        status === 'active' ? 'from-emerald-500 to-green-600' :
                        status === 'pending' ? 'from-amber-500 to-yellow-600' :
                        status === 'completed' ? 'from-blue-500 to-indigo-600' :
                        'from-gray-500 to-gray-600'
                      } rounded-lg blur-sm opacity-20 group-hover:opacity-30 transition-all duration-300`}></div>
                      <div className="relative bg-white rounded-lg shadow-md border border-gray-100 p-3 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-semibold text-gray-600 mb-1 flex items-center uppercase tracking-wide">
                              <span className="mr-1">{getStatusIcon(status)}</span>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </div>
                            <div className={`text-lg font-bold ${getStatusColor(status)}`}>
                              {formatCurrency(amount)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Current status</div>
                          </div>
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-base">
                              {status === 'active' ? '✅' : 
                               status === 'pending' ? '⏳' : 
                               status === 'completed' ? '🎓' : '❌'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
              </div>

              {/* Enhanced Activity Chart and Data Table */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10 max-w-7xl mx-auto">
                {/* Chart on Left Side */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-all duration-300"></div>
                  <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                          <span className="mr-3 text-3xl">📈</span>
                          Sponsorships Over Time
                        </h2>
                        <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-700">Active Count</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="relative" style={{ height: '400px' }}>
                        <canvas ref={chartRef}></canvas>
                      </div>
                      {activity.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <div className="text-4xl mb-3">📊</div>
                          <p className="text-lg font-medium">No data available</p>
                          <p className="text-sm text-gray-400">Start receiving sponsorships to see your progress</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Data Table on Right Side */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-all duration-300"></div>
                  <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <span className="mr-3 text-3xl">📋</span>
                        Sponsorship Details
                      </h2>
                    </div>
                    <div className="p-6">
                      {activity.length > 0 ? (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                          {activity.slice(0, 10).map((sponsorship, index) => (
                            <div key={sponsorship.id || index} className="group/item bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-gray-600 border border-gray-200 shadow-sm">
                                    📅 {new Date(sponsorship.createdAt).toLocaleDateString()}
                                  </span>
                                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                                    sponsorship.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                    sponsorship.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                    sponsorship.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                    sponsorship.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                                    'bg-gray-100 text-gray-700 border-gray-200'
                                  }`}>
                                    <span className="mr-1.5">
                                      {sponsorship.status === 'active' ? '🟢' :
                                       sponsorship.status === 'pending' ? '🟡' :
                                       sponsorship.status === 'completed' ? '🔵' :
                                       sponsorship.status === 'cancelled' ? '🔴' : '⚪'}
                                    </span>
                                    {sponsorship.status?.charAt(0).toUpperCase() + sponsorship.status?.slice(1) || 'N/A'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                  <div className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Type</div>
                                  <div className="text-sm font-bold text-gray-900 capitalize">
                                    {sponsorship.type?.replace('_', ' ') || 'N/A'}
                                  </div>
                                </div>
                                
                                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                  <div className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Amount/Value</div>
                                  <div className="text-sm font-bold">
                                    {sponsorship.type === 'money' ? (
                                      <span className="text-emerald-600">
                                        {formatCurrency(sponsorship.amount)}
                                      </span>
                                    ) : (
                                      <span className="text-gray-700">
                                        {sponsorship.value || 'N/A'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {sponsorship.description && (
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200">
                                  <div className="text-xs font-semibold text-blue-700 mb-1.5 flex items-center">
                                    <span className="mr-1.5">📝</span>
                                    Description
                                  </div>
                                  <p className="text-blue-800 text-sm leading-relaxed">{sponsorship.description}</p>
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {activity.length > 10 && (
                            <div className="text-center pt-4 border-t border-gray-200">
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                Showing 10 of {activity.length} sponsorships
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <div className="text-4xl mb-3">📋</div>
                          <p className="text-lg font-medium">No sponsorship data available</p>
                          <p className="text-sm text-gray-400">Your sponsorship history will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Quick Stats Summary */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-all duration-300"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
                  <div className="px-8 py-6 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200">
                    <h3 className="text-2xl font-bold text-emerald-800 flex items-center">
                      <span className="mr-3 text-3xl">📋</span>
                      Quick Summary
                    </h3>
                  </div>
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-200 shadow-lg">
                        <div className="text-sm font-semibold text-emerald-700 mb-2 uppercase tracking-wide">Total Sponsorships</div>
                        <div className="text-3xl font-bold text-emerald-800">{activity.length}</div>
                        <div className="text-xs text-emerald-600 mt-2">All time count</div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-200 shadow-lg">
                        <div className="text-sm font-semibold text-emerald-700 mb-2 uppercase tracking-wide">Active Period</div>
                        <div className="text-2xl font-bold text-emerald-800">
                          {activity.length > 0 ? 
                            `${Math.ceil((new Date() - new Date(activity[0]?.createdAt)) / (1000 * 60 * 60 * 24))} days` : 
                            'N/A'
                          }
                        </div>
                        <div className="text-xs text-emerald-600 mt-2">Since first sponsorship</div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-200 shadow-lg">
                        <div className="text-sm font-semibold text-emerald-700 mb-2 uppercase tracking-wide">Average per Day</div>
                        <div className="text-2xl font-bold text-emerald-800">
                          {activity.length > 0 ? 
                            (activity.length / Math.max(1, Math.ceil((new Date() - new Date(activity[0]?.createdAt)) / (1000 * 60 * 60 * 24)))).toFixed(1) : 
                            '0'
                          }
                        </div>
                        <div className="text-xs text-emerald-600 mt-2">Daily average</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </Layout>
  )
} 