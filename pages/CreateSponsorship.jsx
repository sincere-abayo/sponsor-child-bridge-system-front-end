import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sponsorshipAPI } from '../services/api'
import { useNotification } from '../components/NotificationContext'
import Layout from '../components/Layout'

export default function CreateSponsorship() {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(false)
  const [sponsees, setSponsees] = useState([])
  const [selectedSponsee, setSelectedSponsee] = useState('')
  const [form, setForm] = useState({
    amount: '',
    description: '',
    frequency: 'monthly',
    notes: '',
    type: 'money',
    value: '',
    expectedDeliveryDate: '',
    proofFile: null
  })

  useEffect(() => {
    loadAvailableSponsees()
  }, [])

  const loadAvailableSponsees = async () => {
    try {
      const response = await sponsorshipAPI.getAvailableSponsees()
      if (response.sponsees) {
        setSponsees(response.sponsees)
      }
    } catch (error) {
      console.error('Error loading sponsees:', error)
      showNotification('Failed to load available sponsees', 'error')
    }
  }

  const handleChange = (e) => {
    const { name, value, type: inputType, files } = e.target
    if (inputType === 'file') {
      setForm(prev => ({ ...prev, [name]: files[0] }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedSponsee) {
      showNotification('Please select a sponsee', 'error')
      return
    }
    if (form.type === 'money' && (!form.amount || form.amount <= 0)) {
      showNotification('Please enter a valid amount', 'error')
      return
    }
    setLoading(true)
    try {
      const data = {
        sponseeId: selectedSponsee,
        ...form
      }
      if (!form.proofFile) delete data.proofFile
      const response = await sponsorshipAPI.createSponsorship(data)
      if (response.sponsorship) {
        showNotification('Sponsorship created successfully!', 'success')
        navigate('/my-sponsorships')
      } else {
        showNotification(response.message || 'Failed to create sponsorship', 'error')
      }
    } catch (error) {
      console.error('Error creating sponsorship:', error)
      showNotification('Failed to create sponsorship', 'error')
    } finally {
      setLoading(false)
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Sponsorship</h1>
            <p className="text-gray-600">Select a child to sponsor and set up your sponsorship details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sponsee Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Child to Sponsor *
              </label>
              <select
                value={selectedSponsee}
                onChange={(e) => setSelectedSponsee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                disabled={sponsees.length === 0}
              >
                <option value="">Choose a child...</option>
                {sponsees.map((sponsee) => (
                  <option key={sponsee.id} value={sponsee.user.id}>
                    {sponsee.user.name} - {sponsee.age} years old, {sponsee.gender} - {sponsee.location}
                  </option>
                ))}
              </select>
              {sponsees.length === 0 && (
                <p className="text-sm text-red-500 mt-1">You have no assigned sponsees. Please contact the admin to be assigned before you can sponsor a child.</p>
              )}
            </div>

            {/* Selected Sponsee Details */}
            {selectedSponsee && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Selected Child Details</h3>
                {(() => {
                  const sponsee = sponsees.find(s => s.user.id == selectedSponsee)
                  if (!sponsee) return null
                  return (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {sponsee.user.name}
                      </div>
                      <div>
                        <span className="font-medium">Age:</span> {sponsee.age} years
                      </div>
                      <div>
                        <span className="font-medium">Gender:</span> {sponsee.gender}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {sponsee.location}
                      </div>
                      <div>
                        <span className="font-medium">School:</span> {sponsee.schoolName || 'Not specified'}
                      </div>
                      <div>
                        <span className="font-medium">Grade:</span> {sponsee.grade || 'Not specified'}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Sponsorship Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sponsorship Type *
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
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
            {/* Value (for non-monetary types) */}
            {form.type !== 'money' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value/Description *
                </label>
                <input
                  type="text"
                  name="value"
                  value={form.value}
                  onChange={handleChange}
                  placeholder="e.g., 10 notebooks, 5kg rice"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required={form.type !== 'money'}
                />
              </div>
            )}
            {/* Amount (for money type) */}
            {form.type === 'money' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (RWF) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="50000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required={form.type === 'money'}
                  min="1000"
                />
              </div>
            )}
            {/* Expected Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery Date
              </label>
              <input
                type="date"
                name="expectedDeliveryDate"
                value={form.expectedDeliveryDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            {/* Proof File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Proof (optional)
              </label>
              <input
                type="file"
                name="proofFile"
                accept="image/*,application/pdf"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency *
              </label>
              <select
                name="frequency"
                value={form.frequency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="one_time">One Time</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe what this sponsorship will cover (e.g., school fees, books, uniforms)"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any additional notes or special requirements"
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/my-sponsorships')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold w-full"
                disabled={loading || sponsees.length === 0}
              >
                {loading ? 'Creating...' : 'Create Sponsorship'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
} 