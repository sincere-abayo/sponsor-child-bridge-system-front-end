import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { sponseeAPI } from '../../services/api'
import { useNotification } from '../../components/NotificationContext'
import { messageAPI } from '../../services/api'
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'sw', label: 'Swahili' },
  { code: 'fr', label: 'French' },
]

export default function Dashboard() {
  // Sponsor profile state
  const [profile, setProfile] = useState({
    name: 'Sponsor Name',
    email: 'sponsor@email.com',
    country: 'Kenya',
    bio: 'I want to make a difference.',
  })
  const [editingProfile, setEditingProfile] = useState(false)

  // Sponsee/adoption state
  const [adopted, setAdopted] = useState([])
  const [availableSponsees, setAvailableSponsees] = useState([])
  const [showAdoptModal, setShowAdoptModal] = useState(false)
  const [selectedSponsee, setSelectedSponsee] = useState(null)

  // Support form
  const [supportForm, setSupportForm] = useState({ sponsee: '', type: '', amount: '' })
  const [supportMsg, setSupportMsg] = useState('')

  // Messaging
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [selectedLang, setSelectedLang] = useState('en')
  const [msgSuccess, setMsgSuccess] = useState('')
const [activeSponsee, setActiveSponsee] = useState(null)

  // History
  const [history, setHistory] = useState([])

  // Notification
  const [notif, setNotif] = useState('')
  const { showNotification } = useNotification()

  // Fetch sponsees from backend
  useEffect(() => {
     if (activeSponsee) {
    messageAPI.getMessages(activeSponsee.id).then(setMessages)
  }
    async function fetchSponsees() {
      try {
        const [adoptedRes, availableRes] = await Promise.all([
          sponseeAPI.getAdopted(),
          sponseeAPI.getAvailable(),
        ])
        setAdopted(adoptedRes)
        setAvailableSponsees(availableRes)
      } catch {
        showNotification('Failed to load sponsees', 'error')
      }
    }
    fetchSponsees()
  }, [showNotification,activeSponsee])

  // Profile handlers (still mock)
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }
  const handleProfileSave = () => {
    setEditingProfile(false)
    setNotif('Profile updated! (mock)')
    setTimeout(() => setNotif(''), 2000)
  }

  // Adopt sponsee (real API)
  const handleAdopt = async (sponsee) => {
    try {
      const res = await sponseeAPI.adopt(sponsee.id)
      if (res.message === 'Sponsee adopted') {
        setAdopted([...adopted, sponsee])
        setAvailableSponsees(availableSponsees.filter(s => s.id !== sponsee.id))
        setShowAdoptModal(false)
        showNotification(`You adopted ${sponsee.name}!`, 'success')
      } else {
        showNotification(res.message || 'Adoption failed', 'error')
      }
    } catch {
      showNotification('Adoption failed', 'error')
    }
  }

  // View sponsee profile
  const handleViewProfile = (sponsee) => {
    setSelectedSponsee(sponsee)
  }

  // Support form (still mock)
  const handleSupportChange = (e) => {
    setSupportForm({ ...supportForm, [e.target.name]: e.target.value })
  }
  const handleSupportSubmit = (e) => {
    e.preventDefault()
    if (!supportForm.sponsee || !supportForm.type || !supportForm.amount) {
      setSupportMsg('Fill all fields.')
      return
    }
    setHistory([
      ...history,
      {
        id: history.length + 1,
        sponsee: supportForm.sponsee,
        type: supportForm.type,
        amount: supportForm.amount,
        date: new Date().toISOString().slice(0, 10),
        status: 'Pending',
      },
    ])
    setSupportMsg('Support submitted! (mock)')
    setSupportForm({ sponsee: '', type: '', amount: '' })
    setTimeout(() => setSupportMsg(''), 2000)
  }

  // Messaging 
const handleSendMessage = async (e) => {
  e.preventDefault()
  if (!messageText.trim() || !activeSponsee) return
  await messageAPI.sendMessage(activeSponsee.id, messageText)
  setMessageText('')
  // Refresh messages
  messageAPI.getMessages(activeSponsee.id).then(setMessages)
}
  const handleTranslate = (msgId) => {
    setMessages(messages.map(msg =>
      msg.id === msgId
        ? { ...msg, translated: `[${LANGUAGES.find(l => l.code === selectedLang).label}] ${msg.message}` }
        : msg
    ))
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Sponsor Dashboard</h1>
        {notif && <div className="mb-4 text-green-700 text-center">{notif}</div>}

        {/* Profile Section */}
        <div className="bg-white rounded shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Your Profile</h2>
            <button
              className="text-blue-700 hover:underline"
              onClick={() => setEditingProfile((v) => !v)}
            >
              {editingProfile ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {editingProfile ? (
            <div className="space-y-2">
              <input
                className="border rounded px-3 py-2 w-full"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                placeholder="Name"
              />
              <input
                className="border rounded px-3 py-2 w-full"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                placeholder="Email"
              />
              <input
                className="border rounded px-3 py-2 w-full"
                name="country"
                value={profile.country}
                onChange={handleProfileChange}
                placeholder="Country"
              />
              <textarea
                className="border rounded px-3 py-2 w-full"
                name="bio"
                value={profile.bio}
                onChange={handleProfileChange}
                placeholder="Bio"
              />
              <button
                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 mt-2"
                onClick={handleProfileSave}
              >
                Save
              </button>
            </div>
          ) : (
            <div>
              <div><span className="font-semibold">Name:</span> {profile.name}</div>
              <div><span className="font-semibold">Email:</span> {profile.email}</div>
              <div><span className="font-semibold">Country:</span> {profile.country}</div>
              <div><span className="font-semibold">Bio:</span> {profile.bio}</div>
            </div>
          )}
        </div>

        {/* Adopt Sponsee Section */}
        <div className="bg-white rounded shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Adopted Sponsees</h2>
            <button
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
              onClick={() => setShowAdoptModal(true)}
            >
              Adopt Sponsee
            </button>
          </div>
          {adopted.length === 0 ? (
            <div className="text-gray-500">No sponsees adopted yet.</div>
          ) : (
            <ul>
              {adopted.map((s) => (
                <li key={s.id} className="mb-2 flex items-center justify-between">
                  <span>
                    <span className="font-semibold">{s.name}</span>
                    {s.SponseeProfile && (
                      <> ({s.SponseeProfile.age || 'N/A'} yrs, {s.SponseeProfile.gender || 'N/A'})</>
                    )}
                  </span>
                  <button
                    className="text-blue-700 hover:underline ml-2"
                    onClick={() => handleViewProfile(s)}
                  >
                    View Profile
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sponsee Profile Modal */}
        {selectedSponsee && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-2">{selectedSponsee.name}'s Profile</h3>
              <div><span className="font-semibold">Age:</span> {selectedSponsee.SponseeProfile?.age || 'N/A'}</div>
              <div><span className="font-semibold">Gender:</span> {selectedSponsee.SponseeProfile?.gender || 'N/A'}</div>
              <div><span className="font-semibold">Bio:</span> {selectedSponsee.SponseeProfile?.bio || 'N/A'}</div>
              <button
                className="mt-4 text-blue-700 hover:underline"
                onClick={() => setSelectedSponsee(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Adopt Sponsee Modal */}
        {showAdoptModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Available Sponsees</h3>
              <ul>
                {availableSponsees.map((s) => (
                  <li key={s.id} className="flex items-center justify-between mb-2">
                    <span>
                      {s.name}
                      {s.SponseeProfile && (
                        <> ({s.SponseeProfile.age || 'N/A'} yrs, {s.SponseeProfile.gender || 'N/A'})</>
                      )}
                    </span>
                    <button
                      className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800"
                      onClick={() => handleAdopt(s)}
                    >
                      Adopt
                    </button>
                  </li>
                ))}
              </ul>
              <button
                className="mt-4 text-blue-700 hover:underline"
                onClick={() => setShowAdoptModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Support Form */}
        <div className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Submit Sponsorship Support</h2>
          <form onSubmit={handleSupportSubmit} className="flex flex-col md:flex-row gap-2 items-end">
            <select
              name="sponsee"
              className="border rounded px-3 py-2"
              value={supportForm.sponsee}
              onChange={handleSupportChange}
            >
              <option value="">Select Sponsee</option>
              {adopted.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
            <select
              name="type"
              className="border rounded px-3 py-2"
              value={supportForm.type}
              onChange={handleSupportChange}
            >
              <option value="">Type</option>
              <option value="Financial">Financial</option>
              <option value="Material">Material</option>
              <option value="Other">Other</option>
            </select>
            <input
              name="amount"
              type="text"
              className="border rounded px-3 py-2"
              placeholder="Amount/Value"
              value={supportForm.amount}
              onChange={handleSupportChange}
            />
            <button
              type="submit"
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              Submit
            </button>
          </form>
          {supportMsg && <div className="mt-2 text-green-700">{supportMsg}</div>}
        </div>

        {/* Support History Section */}
        <div className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Support History</h2>
          {history.length === 0 ? (
            <div className="text-gray-500">No support history yet.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2">Sponsee</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t">
                    <td className="py-2">{h.sponsee}</td>
                    <td className="py-2">{h.type}</td>
                    <td className="py-2">{h.amount}</td>
                    <td className="py-2">{h.date}</td>
                    <td className="py-2">{h.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

       {/* Messaging UI Section */}
<div className="bg-white rounded shadow p-6">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
    <h2 className="text-xl font-semibold">Messages with Sponsees</h2>
    <div className="flex items-center gap-2">
      <label htmlFor="lang" className="text-gray-600">Translate to:</label>
      <select
        id="lang"
        className="border rounded px-2 py-1"
        value={selectedLang}
        onChange={e => setSelectedLang(e.target.value)}
      >
        {LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </div>
  </div>
  {/* Sponsee selector */}
  <div className="mb-4">
    <label className="font-semibold mr-2">Select Sponsee:</label>
    <select
      className="border rounded px-2 py-1"
      value={activeSponsee?.id || ''}
      onChange={e => {
        const sponsee = adopted.find(s => s.id === Number(e.target.value))
        setActiveSponsee(sponsee)
      }}
    >
      <option value="">-- Choose --</option>
      {adopted.map(s => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  </div>
  {activeSponsee ? (
    <>
      {messages.length === 0 ? (
        <div className="text-gray-500">No messages yet.</div>
      ) : (
        <ul>
          {messages.map((msg) => (
            <li key={msg.id} className="mb-4">
              <div>
                <span className="font-semibold">
                  {msg.from_id === activeSponsee.id ? activeSponsee.name : 'You'}:
                </span> {msg.content}
                <span className="ml-2 text-gray-400 text-xs">
                  {new Date(msg.date).toLocaleDateString()}
                </span>
              </div>
              {/* Optionally, translation button */}
              {msg.from_id === activeSponsee.id && (
                <button
                  className="text-blue-700 text-xs mt-1 hover:underline"
                  onClick={() => handleTranslate(msg.id)}
                >
                  Translate
                </button>
              )}
              {msg.translated && (
                <div className="text-green-700 text-xs mt-1">{msg.translated}</div>
              )}
            </li>
          ))}
        </ul>
      )}
      {/* Send Message Form */}
      <form onSubmit={handleSendMessage} className="mt-4 flex flex-col md:flex-row gap-2">
        <input
          type="text"
          className="border rounded px-3 py-2 flex-1"
          placeholder={`Type your message to ${activeSponsee.name}...`}
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
        >
          Send
        </button>
      </form>
      {msgSuccess && <div className="mt-2 text-green-600">{msgSuccess}</div>}
    </>
  ) : (
    <div className="text-gray-500">Select a sponsee to view and send messages.</div>
  )}
</div>
      </div>
    </div>
  )
}