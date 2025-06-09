import React, { useState } from 'react'
import Navbar from '../../components/Navbar'

const MOCK_USERS = [
  { id: 1, name: 'Sponsor One', email: 'sponsor1@email.com', role: 'sponsor' },
  { id: 2, name: 'Sponsee One', email: 'sponsee1@email.com', role: 'sponsee' },
]
const MOCK_SPONSEES = [
  { id: 2, name: 'Sponsee One', assignedTo: null },
  { id: 3, name: 'Sponsee Two', assignedTo: 1 },
]
const MOCK_TRANSACTIONS = [
  { id: 1, sponsor: 'Sponsor One', sponsee: 'Sponsee Two', amount: '$50', date: '2024-06-01', status: 'Delivered' },
]
const MOCK_STATS = {
  sponsors: 10,
  sponsees: 20,
  transactions: 5,
  delivered: 3,
}

export default function AdminDashboard() {
  const [users, setUsers] = useState(MOCK_USERS)
  const [sponsees, setSponsees] = useState(MOCK_SPONSEES)
  const [transactions] = useState(MOCK_TRANSACTIONS)
  const [stats] = useState(MOCK_STATS)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'sponsor' })
  const [notif, setNotif] = useState('')
  const [assignSponsorId, setAssignSponsorId] = useState('')
  const [assignSponseeId, setAssignSponseeId] = useState('')

  // User CRUD
  const handleUserChange = (e) => setNewUser({ ...newUser, [e.target.name]: e.target.value })
  const handleAddUser = (e) => {
    e.preventDefault()
    if (!newUser.name || !newUser.email) return
    setUsers([...users, { ...newUser, id: users.length + 1 }])
    setNewUser({ name: '', email: '', role: 'sponsor' })
    setNotif('User added! (mock)')
    setTimeout(() => setNotif(''), 2000)
  }
  const handleDeleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id))
    setNotif('User deleted! (mock)')
    setTimeout(() => setNotif(''), 2000)
  }

  // Assign sponsee to sponsor
  const handleAssign = (e) => {
    e.preventDefault()
    if (!assignSponsorId || !assignSponseeId) return
    setSponsees(sponsees.map(s =>
      s.id === Number(assignSponseeId) ? { ...s, assignedTo: Number(assignSponsorId) } : s
    ))
    setNotif('Sponsee assigned! (mock)')
    setAssignSponsorId('')
    setAssignSponseeId('')
    setTimeout(() => setNotif(''), 2000)
  }

  // Export reports (mock)
  const handleExport = (period) => {
    setNotif(`Exported ${period} report! (mock)`)
    setTimeout(() => setNotif(''), 2000)
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Admin Dashboard</h1>
        {notif && <div className="mb-4 text-green-700 text-center">{notif}</div>}

        {/* Real-time Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded shadow p-6 text-center">
            <div className="text-2xl font-bold text-blue-700 mb-2">{stats.sponsors}</div>
            <div className="text-gray-600">Sponsors</div>
          </div>
          <div className="bg-white rounded shadow p-6 text-center">
            <div className="text-2xl font-bold text-blue-700 mb-2">{stats.sponsees}</div>
            <div className="text-gray-600">Sponsees</div>
          </div>
          <div className="bg-white rounded shadow p-6 text-center">
            <div className="text-2xl font-bold text-blue-700 mb-2">{stats.transactions}</div>
            <div className="text-gray-600">Transactions</div>
          </div>
          <div className="bg-white rounded shadow p-6 text-center">
            <div className="text-2xl font-bold text-blue-700 mb-2">{stats.delivered}</div>
            <div className="text-gray-600">Delivered</div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-2 mb-4">
            <input
              name="name"
              className="border rounded px-3 py-2"
              placeholder="Name"
              value={newUser.name}
              onChange={handleUserChange}
            />
            <input
              name="email"
              className="border rounded px-3 py-2"
              placeholder="Email"
              value={newUser.email}
              onChange={handleUserChange}
            />
            <select
              name="role"
              className="border rounded px-3 py-2"
              value={newUser.role}
              onChange={handleUserChange}
            >
              <option value="sponsor">Sponsor</option>
              <option value="sponsee">Sponsee</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              Add User
            </button>
          </form>
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="py-2">{u.name}</td>
                  <td className="py-2">{u.email}</td>
                  <td className="py-2 capitalize">{u.role}</td>
                  <td className="py-2">
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDeleteUser(u.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Assign Sponsees */}
        <div className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Assign Sponsees to Sponsors</h2>
          <form onSubmit={handleAssign} className="flex flex-col md:flex-row gap-2 mb-4">
            <select
              className="border rounded px-3 py-2"
              value={assignSponsorId}
              onChange={e => setAssignSponsorId(e.target.value)}
            >
              <option value="">Select Sponsor</option>
              {users.filter(u => u.role === 'sponsor').map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <select
              className="border rounded px-3 py-2"
              value={assignSponseeId}
              onChange={e => setAssignSponseeId(e.target.value)}
            >
              <option value="">Select Sponsee</option>
              {sponsees.filter(s => !s.assignedTo).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              Assign
            </button>
          </form>
          <ul>
            {sponsees.map(s => (
              <li key={s.id} className="mb-2">
                <span className="font-semibold">{s.name}</span> - Assigned to: {s.assignedTo
                  ? users.find(u => u.id === s.assignedTo)?.name || 'Unknown'
                  : <span className="text-gray-500">None</span>}
              </li>
            ))}
          </ul>
        </div>

        {/* Transactions Management */}
        <div className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Sponsorship Transactions</h2>
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2">Sponsor</th>
                <th className="py-2">Sponsee</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Date</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="border-t">
                  <td className="py-2">{t.sponsor}</td>
                  <td className="py-2">{t.sponsee}</td>
                  <td className="py-2">{t.amount}</td>
                  <td className="py-2">{t.date}</td>
                  <td className="py-2">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Export Reports */}
        <div className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Export Reports</h2>
          <div className="flex gap-4">
            <button
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
              onClick={() => handleExport('daily')}
            >
              Export Daily
            </button>
            <button
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
              onClick={() => handleExport('monthly')}
            >
              Export Monthly
            </button>
            <button
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
              onClick={() => handleExport('yearly')}
            >
              Export Yearly
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}