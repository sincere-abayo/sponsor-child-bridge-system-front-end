import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNotification } from '../../components/NotificationContext'

// You should implement these API calls in services/api.js
import { sponseeAPI } from '../../services/api'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'sw', label: 'Swahili' },
  { code: 'fr', label: 'French' },
]

export default function SponseeDashboard() {
  const [sponsor, setSponsor] = useState(null)
  const [support, setSupport] = useState([])
  const [messages, setMessages] = useState([])
  const [photo, setPhoto] = useState(null)
  const [uploadMsg, setUploadMsg] = useState('')
  const [reply, setReply] = useState('')
  const [replyMsg, setReplyMsg] = useState('')
  const [selectedLang, setSelectedLang] = useState('en')
  const { showNotification } = useNotification()

  // Fetch sponsor info, support, and messages on mount
  useEffect(() => {
    async function fetchData() {
      try {
        // These endpoints should be implemented in your backend
        const sponsorRes = await sponseeAPI.getSponsor()
        setSponsor(sponsorRes)

        const supportRes = await sponseeAPI.getSupport()
        setSupport(supportRes)

        const messagesRes = await sponseeAPI.getMessages()
        setMessages(messagesRes)
      } catch (err) {
        showNotification('Failed to load dashboard data', 'error')
      }
    }
    fetchData()
  }, [])

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0])
    setUploadMsg('')
  }

  const handlePhotoUpload = async (e) => {
    e.preventDefault()
    if (!photo) {
      setUploadMsg('Please select a photo to upload.')
      return
    }
    // Replace with real upload API call
    setUploadMsg('Photo uploaded! (mock)')
    setPhoto(null)
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!reply.trim()) {
      setReplyMsg('Please enter a reply.')
      return
    }
    // Replace with real send message API call
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        from: 'You',
        message: reply,
        date: new Date().toISOString().slice(0, 10),
        translated: '',
      },
    ])
    setReply('')
    setReplyMsg('Reply sent! (mock)')
    setTimeout(() => setReplyMsg(''), 2000)
  }

  // Mock translation: just append [Translated] for demo
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
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Sponsee Dashboard</h1>

        {/* Sponsor Info */}
        <div className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2">Your Sponsor</h2>
          {sponsor ? (
            <>
              <div className="mb-2"><span className="font-semibold">Name:</span> {sponsor.name}</div>
              <div className="mb-2"><span className="font-semibold">Email:</span> {sponsor.email}</div>
              <div><span className="font-semibold">Country:</span> {sponsor.country}</div>
            </>
          ) : (
            <div className="text-gray-500">No sponsor assigned yet.</div>
          )}
        </div>

        {/* Support Received */}
        <div className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Support Received</h2>
          {support.length === 0 ? (
            <div className="text-gray-500">No support received yet.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2">Type</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {support.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="py-2">{s.type}</td>
                    <td className="py-2">{s.amount}</td>
                    <td className="py-2">{s.date}</td>
                    <td className="py-2">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Upload Confirmation Photo */}
        <div className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload Confirmation Photo</h2>
          <form onSubmit={handlePhotoUpload} className="flex flex-col md:flex-row items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="border rounded px-3 py-2"
            />
            <button
              type="submit"
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              Upload
            </button>
          </form>
          {uploadMsg && <div className="mt-2 text-green-600">{uploadMsg}</div>}
        </div>

        {/* Messaging UI */}
        <div className="bg-white rounded shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <h2 className="text-xl font-semibold">Messages with Sponsor</h2>
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
          {messages.length === 0 ? (
            <div className="text-gray-500">No messages yet.</div>
          ) : (
            <ul>
              {messages.map((msg) => (
                <li key={msg.id} className="mb-4">
                  <div>
                    <span className="font-semibold">{msg.from}:</span> {msg.message}
                    <span className="ml-2 text-gray-400 text-xs">{msg.date}</span>
                  </div>
                  {msg.from !== 'You' && (
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
          {/* Reply Form */}
          <form onSubmit={handleReply} className="mt-4 flex flex-col md:flex-row gap-2">
            <input
              type="text"
              className="border rounded px-3 py-2 flex-1"
              placeholder="Type your reply to your sponsor..."
              value={reply}
              onChange={e => setReply(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              Send
            </button>
          </form>
          {replyMsg && <div className="mt-2 text-green-600">{replyMsg}</div>}
        </div>
      </div>
    </div>
  )
}