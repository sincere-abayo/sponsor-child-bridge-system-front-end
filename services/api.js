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