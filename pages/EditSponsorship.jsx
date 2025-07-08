import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { sponsorshipAPI } from '../services/api'
import { useNotification } from '../components/NotificationContext'
import Layout from '../components/Layout'

export default function EditSponsorship() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(true)
  const [sponsorship, setSponsorship] = useState(null)
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
    loadSponsorship()
  }, [id])

  const loadSponsorship = async () => {
    try {
      setLoading(true)
      const response = await sponsorshipAPI.getSponsorship(id)
      if (response.sponsorship) {
        setSponsorship(response.sponsorship)
        setForm({
          amount: response.sponsorship.amount || '',
          description: response.sponsorship.description || '',
          frequency: response.sponsorship.frequency || 'monthly',
          notes: response.sponsorship.notes || '',
          type: response.sponsorship.type || 'money',
          value: response.sponsorship.value || '',
          expectedDeliveryDate: response.sponsorship.expectedDeliveryDate ? response.sponsorship.expectedDeliveryDate.split('T')[0] : '',
          proofFile: null
        })
      } else {
        showNotification('Sponsorship not found', 'error')
        navigate('/my-sponsorships')
      }
    } catch (error) {
      showNotification('Failed to load sponsorship', 'error')
      navigate('/my-sponsorships')
    } finally {
      setLoading(false)
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
    if (sponsorship.status !== 'pending') {
      showNotification('Only pending sponsorships can be edited', 'error')
      return
    }
    if (form.type === 'money' && (!form.amount || form.amount <= 0)) {
      showNotification('Please enter a valid amount', 'error')
      return
    }
    setLoading(true)
    try {
      const data = { ...form }
      if (!form.proofFile) delete data.proofFile
      // Use FormData for file upload
      const token = localStorage.getItem('token')
      const formData = new FormData()
      for (const key in data) {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key])
        }
      }
      const response = await fetch(`http://localhost:5000/api/sponsorships/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      const result = await response.json()
      if (result.sponsorship) {
        showNotification('Sponsorship updated successfully!', 'success')
        navigate(`/sponsorship/${id}`)
      } else {
        showNotification(result.message || 'Failed to update sponsorship', 'error')
      }
    } catch (error) {
      showNotification('Failed to update sponsorship', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading sponsorship...</div>
        </div>
      </Layout>
    )
  }

  if (!sponsorship) {
    return (
      <Layout>
        <div className="text-center py-8">
          <div className="text-xl text-gray-600">Sponsorship not found</div>
        </div>
      </Layout>
    )
  }

  if (sponsorship.status !== 'pending') {
    return (
      <Layout>
        <div className="text-center py-8">
          <div className="text-xl text-gray-600">Only pending sponsorships can be edited.</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Sponsorship</h1>
            <p className="text-gray-600">You can only edit sponsorships that are still pending.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                onClick={() => navigate(`/sponsorship/${id}`)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
} 