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
function authHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

export const sponseeAPI = {
  getAvailable: () =>
    fetch(`${API_URL}/sponsees/available`, {
      headers: authHeaders(),
    }).then(res => res.json()),

  adopt: (id) =>
    fetch(`${API_URL}/sponsees/${id}/adopt`, {
      method: 'POST',
      headers: authHeaders(),
    }).then(res => res.json()),

  getAdopted: () =>
    fetch(`${API_URL}/sponsees/adopted`, {
      headers: authHeaders(),
    }).then(res => res.json()),
    
}

export const messageAPI = {
  getMessages: (sponseeId) =>
    fetch(`${API_URL}/messages?sponseeId=${sponseeId}`, {
      headers: authHeaders(),
    }).then(res => res.json()),

  sendMessage: (to_id, content) =>
    fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ to_id, content }),
    }).then(res => res.json()),
}