import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { useNotification } from '../../components/NotificationContext'
import jsPDF from 'jspdf'

// Lazy load Chart.js for performance
let Chart = null

export default function AdminReports() {
  const { showNotification } = useNotification()
  const [stats, setStats] = useState(null)
  const [financial, setFinancial] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [chartLoaded, setChartLoaded] = useState(false)
  const chartRef = React.useRef(null)

  useEffect(() => {
    loadData()
    // Lazy load Chart.js
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
      // Stats
      const statsRes = await fetch('/api/admin/reports/admin-analytics', { headers: { Authorization: `Bearer ${token}` } })
      setStats(await statsRes.json())
      // Financial
      const finRes = await fetch('/api/admin/reports/financial-summary', { headers: { Authorization: `Bearer ${token}` } })
      setFinancial(await finRes.json())
      // Activity
      const actRes = await fetch('/api/admin/reports/sponsorship-activity', { headers: { Authorization: `Bearer ${token}` } })
      const actData = await actRes.json()
      setActivity(actData.sponsorships || [])
    } catch (err) {
      showNotification('Failed to load analytics data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/admin/reports/export', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'sponsorships-export.csv'
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

  const handleGenerateCustomReport = async () => {
    try {
      showNotification('Generating PDF report...', 'info')
      
      const token = localStorage.getItem('token')
      
      // Use existing API endpoints to gather data
      const [statsRes, finRes, actRes] = await Promise.all([
        fetch('/api/admin/reports/admin-analytics', { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        fetch('/api/admin/reports/financial-summary', { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        fetch('/api/admin/reports/sponsorship-activity', { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      ])
      
      if (!statsRes.ok || !finRes.ok || !actRes.ok) {
        throw new Error('Failed to fetch report data')
      }
      
      const [statsData, finData, actData] = await Promise.all([
        statsRes.json(),
        finRes.json(),
        actRes.json()
      ])
      
      // Create custom report by combining existing data
      const customReport = {
        generatedAt: new Date().toISOString(),
        reportPeriod: 'Last 30 days',
        summary: {
          totalUsers: statsData.totalUsers || 0,
          totalSponsorships: statsData.totalSponsorships || 0,
          activeSponsorships: statsData.activeSponsorships || 0,
          totalFinancial: finData.total || 0
        },
        financialBreakdown: finData.byStatus || {},
        recentActivity: (actData.sponsorships || []).slice(0, 20), // Last 20 activities
        insights: {
          averageSponsorshipsPerDay: Math.round((actData.sponsorships?.length || 0) / 30 * 10) / 10,
          topSponsorshipTypes: getTopSponsorshipTypes(actData.sponsorships || []),
          financialTrends: analyzeFinancialTrends(finData)
        }
      }
      
      // Generate PDF report
      generatePDFReport(customReport)
      
      showNotification('PDF report generated successfully!', 'success')
      console.log('Custom report generated:', customReport)
      
    } catch (error) {
      console.error('Error generating custom report:', error)
      showNotification('Failed to generate custom report: ' + error.message, 'error')
    }
  }

  // Generate PDF report
  const generatePDFReport = (reportData) => {
    try {
      const doc = new jsPDF()
      
      // Set document properties
      doc.setProperties({
        title: 'Sponsorship System Report',
        subject: 'Custom Analytics Report',
        author: 'Admin System',
        creator: 'Sponsor-Child Bridge System'
      })
      
      // Add header
      doc.setFontSize(24)
      doc.setTextColor(0, 150, 136) // Primary color
      doc.text('Sponsorship System Report', 20, 30)
      
      // Add subtitle
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated on: ${new Date(reportData.generatedAt).toLocaleString()}`, 20, 40)
      doc.text(`Report Period: ${reportData.reportPeriod}`, 20, 47)
      
      // Add summary section
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text('Executive Summary', 20, 65)
      
      doc.setFontSize(10)
      doc.setTextColor(50, 50, 50)
      doc.text(`Total Users: ${reportData.summary.totalUsers.toLocaleString()}`, 20, 80)
      doc.text(`Total Sponsorships: ${reportData.summary.totalSponsorships.toLocaleString()}`, 20, 87)
      doc.text(`Active Sponsorships: ${reportData.summary.activeSponsorships.toLocaleString()}`, 20, 94)
      doc.text(`Total Financial: ${formatCurrency(reportData.summary.totalFinancial)}`, 20, 101)
      
      // Add financial breakdown
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text('Financial Breakdown', 20, 120)
      
      doc.setFontSize(10)
      doc.setTextColor(50, 50, 50)
      let yPos = 135
      Object.entries(reportData.financialBreakdown).forEach(([status, amount]) => {
        const statusText = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
        doc.text(`${statusText}: ${formatCurrency(amount)}`, 20, yPos)
        yPos += 7
      })
      
      // Add insights
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text('Key Insights', 20, yPos + 10)
      
      doc.setFontSize(10)
      doc.setTextColor(50, 50, 50)
      yPos += 25
      doc.text(`Average Sponsorships per Day: ${reportData.insights.averageSponsorshipsPerDay}`, 20, yPos)
      yPos += 7
      doc.text(`Top Sponsorship Type: ${reportData.insights.topSponsorshipTypes[0]?.type || 'N/A'}`, 20, yPos)
      yPos += 7
      doc.text(`Financial Trend: ${getFinancialTrendText(reportData.insights.financialTrends)}`, 20, yPos)
      
      // Add recent activity (first page only)
      if (reportData.recentActivity.length > 0) {
        doc.addPage()
        doc.setFontSize(16)
        doc.setTextColor(0, 0, 0)
        doc.text('Recent Activity (Last 20)', 20, 30)
        
        doc.setFontSize(8)
        doc.setTextColor(50, 50, 50)
        yPos = 45
        reportData.recentActivity.slice(0, 15).forEach((activity, index) => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 30
          }
          const date = new Date(activity.createdAt).toLocaleDateString()
          const type = (activity.type || 'unknown').replace('_', ' ').toUpperCase()
          doc.text(`${index + 1}. ${type} - ${date}`, 20, yPos)
          yPos += 5
        })
      }
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text(`Page ${i} of ${pageCount}`, 190, 280, { align: 'right' })
        doc.text('Sponsor-Child Bridge System', 20, 280)
      }
      
      // Save the PDF
      const fileName = `sponsorship-report-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      showNotification('Failed to generate PDF. Please try again.', 'error')
    }
  }

  // Helper function to get financial trend text
  const getFinancialTrendText = (trends) => {
    const highTrends = Object.values(trends).filter(t => t.status === 'high')
    if (highTrends.length > 0) {
      return `Strong ${highTrends[0].percentage}% in ${Object.keys(trends).find(k => trends[k] === highTrends[0])}`
    }
    return 'Stable across all categories'
  }

  // Helper function to get top sponsorship types
  const getTopSponsorshipTypes = (sponsorships) => {
    const typeCount = {}
    sponsorships.forEach(s => {
      const type = s.type || 'unknown'
      typeCount[type] = (typeCount[type] || 0) + 1
    })
    
    return Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }))
  }

  // Helper function to analyze financial trends
  const analyzeFinancialTrends = (financialData) => {
    if (!financialData.byStatus) return {}
    
    const total = financialData.total || 0
    const trends = {}
    
    Object.entries(financialData.byStatus).forEach(([status, amount]) => {
      const percentage = total > 0 ? Math.round((amount / total) * 100) : 0
      trends[status] = {
        amount,
        percentage,
        status: percentage > 50 ? 'high' : percentage > 20 ? 'medium' : 'low'
      }
    })
    
    return trends
  }

  const handleViewDocumentation = () => {
    // Open documentation in new tab or show modal
    window.open('/admin/documentation', '_blank')
    // Alternative: show a modal with documentation content
    // setShowDocumentationModal(true)
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
          borderColor: '#009688',
          backgroundColor: 'rgba(0, 150, 136, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#009688',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#009688',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false
          }
        },
        scales: {
          x: { 
            title: { 
              display: true, 
              text: 'Date',
              color: '#6b7280',
              font: { weight: '600' }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            ticks: {
              color: '#6b7280'
            }
          },
          y: { 
            title: { 
              display: true, 
              text: 'Number of Sponsorships',
              color: '#6b7280',
              font: { weight: '600' }
            },
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            ticks: {
              color: '#6b7280',
              callback: function(value) {
                return Math.round(value);
              }
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

  const formatCurrency = (amount) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount)

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600 font-medium">Loading analytics...</div>
            <div className="text-sm text-gray-400 mt-2">Please wait while we fetch your data</div>
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
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
                <p className="text-base sm:text-lg text-gray-600 max-w-4xl">
                  Comprehensive overview of sponsorship activity, financial performance, and system statistics
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={loadData}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 hover:shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <button
                  className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {exporting ? 'Exporting...' : 'Export CSV'}
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-blue-600">{stats?.totalUsers?.toLocaleString() ?? '--'}</p>
                  <p className="text-xs text-gray-500 mt-1">Registered accounts</p>
                </div>
                <div className="flex items-center justify-center w-16 h-16 bg-blue-50 rounded-xl">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Sponsorships</p>
                  <p className="text-3xl font-bold text-green-600">{stats?.totalSponsorships?.toLocaleString() ?? '--'}</p>
                  <p className="text-xs text-gray-500 mt-1">All time total</p>
                </div>
                <div className="flex items-center justify-center w-16 h-16 bg-green-50 rounded-xl">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Sponsorships</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats?.activeSponsorships?.toLocaleString() ?? '--'}</p>
                  <p className="text-xs text-gray-500 mt-1">Currently active</p>
                </div>
                <div className="flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-xl">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Financial Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Financial Summary
              </h2>
              <p className="text-sm text-gray-600 mt-1">Overview of all financial contributions and distributions</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700 mb-1">
                    {financial ? formatCurrency(financial.total) : '--'}
                  </div>
                  <div className="text-sm font-medium text-blue-600">Total Donated</div>
                </div>
                {financial && Object.entries(financial.byStatus).map(([status, amount]) => (
                  <div key={status} className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="text-2xl font-bold text-green-700 mb-1">
                      {formatCurrency(amount)}
                    </div>
                    <div className="text-sm font-medium text-green-600 capitalize">
                      {status.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Sponsorship Activity Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Sponsorships Over Time
              </h2>
              <p className="text-sm text-gray-600 mt-1">Track sponsorship creation trends and patterns</p>
            </div>
            <div className="p-6">
              <div className="h-80">
                <canvas ref={chartRef}></canvas>
              </div>
              {activity.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No activity data available</p>
                  <p className="text-sm text-gray-400 mt-1">Activity will appear here as sponsorships are created</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Insights Section */}
          <div className="mt-8 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Need More Insights?</h3>
              <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
                Get detailed reports, custom analytics, and deeper insights into your sponsorship program performance.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg text-sm" onClick={handleGenerateCustomReport}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Generate Custom Report
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-all duration-200 hover:shadow-md text-sm" onClick={handleViewDocumentation}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 