const API_URL = 'http://localhost:5000/api'

export const authAPI = {
  register: (data) =>
    fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),

  login: (data) =>
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
}

// Profile API functions
export const profileAPI = {
  createSponsorProfile: (data) => {
    const token = localStorage.getItem('token')
    return fetch(`${API_URL}/profiles/sponsor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).then(res => res.json())
  },

  createSponseeProfile: (data) => {
    const token = localStorage.getItem('token')
    return fetch(`${API_URL}/profiles/sponsee`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).then(res => res.json())
  },

  getMyProfile: () => {
    const token = localStorage.getItem('token')
    return fetch(`${API_URL}/profiles/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(res => res.json())
  },

  getSponsorProfiles: (filters = {}) => {
    const params = new URLSearchParams(filters)
    return fetch(`${API_URL}/profiles/sponsors?${params}`).then(res => res.json())
  },

  getSponseeProfiles: (filters = {}) => {
    const params = new URLSearchParams(filters)
    return fetch(`${API_URL}/profiles/sponsees?${params}`).then(res => res.json())
  },
}

// Sponsorship API functions
export const sponsorshipAPI = {
  createSponsorship: (data) => {
    const token = localStorage.getItem('token')
    const formData = new FormData()
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key])
      }
    }
    return fetch(`${API_URL}/sponsorships`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }).then(res => res.json())
  },

  getMySponsorships: (filters = {}) => {
    const token = localStorage.getItem('token')
    const params = new URLSearchParams(filters)
    return fetch(`${API_URL}/sponsorships?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(res => res.json())
  },

  getSponsorship: (id) => {
    const token = localStorage.getItem('token')
    return fetch(`${API_URL}/sponsorships/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(res => res.json())
  },

  updateSponsorshipStatus: (id, data) => {
    const token = localStorage.getItem('token')
    return fetch(`${API_URL}/sponsorships/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).then(res => res.json())
  },

  getSponsorshipHistory: (period = 'all') => {
    const token = localStorage.getItem('token')
    return fetch(`${API_URL}/sponsorships/history?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(res => res.json())
  },

  getAvailableSponsees: (filters = {}) => {
    const token = localStorage.getItem('token')
    const params = new URLSearchParams(filters)
    return fetch(`${API_URL}/sponsorships/available-sponsees?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(res => res.json())
  },
}

// Confirmation API functions
export const confirmationAPI = {
  createConfirmation: (data) => {
    const token = localStorage.getItem('token')
    const formData = new FormData()
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key])
      }
    }
    return fetch(`${API_URL}/confirmations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }).then(res => res.json())
  },

  getConfirmations: (sponsorshipId) => {
    const token = localStorage.getItem('token')
    return fetch(`${API_URL}/confirmations/${sponsorshipId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(res => res.json())
  },

  updateConfirmationStatus: (id, data) => {
    const token = localStorage.getItem('token')
    return fetch(`${API_URL}/confirmations/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).then(res => res.json())
  },
}