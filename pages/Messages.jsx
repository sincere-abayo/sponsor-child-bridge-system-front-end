import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useNotification } from '../components/NotificationContext'

const API_BASE = '/api/messages'
const USERS_API = '/api/profiles/all' // Adjust if needed

export default function Messages() {
  const { showNotification } = useNotification()
  const [tab, setTab] = useState('inbox')
  const [inbox, setInbox] = useState([])
  const [sent, setSent] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [conversation, setConversation] = useState([])
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [refresh, setRefresh] = useState(false)
  // Compose modal state
  const [showCompose, setShowCompose] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [composeUser, setComposeUser] = useState('')
  const [composeText, setComposeText] = useState('')
  const [composeSending, setComposeSending] = useState(false)

  // Get token for auth
  const token = localStorage.getItem('token')
  const userId = parseInt(localStorage.getItem('userId'))

  // Fetch all users for compose dropdown
  useEffect(() => {
    if (!showCompose) return
    fetch(USERS_API, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(users => setAllUsers(users.filter(u => u.id !== userId)))
      .catch(() => showNotification('Failed to load users', 'error'))
  }, [showCompose])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(API_BASE + '/inbox', { headers: { Authorization: `Bearer ${token}` } })
        .then(async r => {
          if (!r.ok) throw 'inbox';
          const text = await r.text();
          try { return JSON.parse(text); } catch { throw 'inbox (invalid JSON)'; }
        }),
      fetch(API_BASE + '/sent', { headers: { Authorization: `Bearer ${token}` } })
        .then(async r => {
          if (!r.ok) throw 'sent';
          const text = await r.text();
          try { return JSON.parse(text); } catch { throw 'sent (invalid JSON)'; }
        })
    ])
      .then(([inboxData, sentData]) => {
        setInbox(inboxData)
        setSent(sentData)
      })
      .catch((which) => {
        showNotification(`Failed to load ${which}`, 'error')
      })
      .finally(() => setLoading(false))
  }, [refresh])

  // Load conversation when selected
  useEffect(() => {
    if (!selected) return
    setConversation([])
    fetch(`${API_BASE}/conversation/${selected.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setConversation).catch(() => showNotification('Failed to load conversation', 'error'))
  }, [selected, refresh])

  const handleSelect = (msg) => {
    // Select the other user in the conversation
    setSelected(msg.sender?.id === userId ? msg.receiver : msg.sender)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!messageText.trim() || !selected) return
    setSending(true)
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId: selected.id, content: messageText })
      })
      if (res.ok) {
        setMessageText('')
        setRefresh(r => !r)
        showNotification('Message sent', 'success')
      } else {
        showNotification('Failed to send message', 'error')
      }
    } finally {
      setSending(false)
    }
  }

  // Compose modal send handler
  const handleComposeSend = async (e) => {
    e.preventDefault()
    if (!composeUser || !composeText.trim()) return
    setComposeSending(true)
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId: composeUser, content: composeText })
      })
      if (res.ok) {
        setShowCompose(false)
        setComposeUser('')
        setComposeText('')
        setRefresh(r => !r)
        showNotification('Message sent', 'success')
      } else {
        showNotification('Failed to send message', 'error')
      }
    } finally {
      setComposeSending(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold"
              onClick={() => setShowCompose(true)}
            >Compose</button>
          </div>
          <div className="flex space-x-4 mb-4">
            <button
              className={`px-4 py-2 rounded-lg font-semibold ${tab === 'inbox' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setTab('inbox')}
            >Inbox</button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold ${tab === 'sent' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setTab('sent')}
            >Sent</button>
          </div>
          {loading ? (
            <div className="text-gray-600">Loading messages...</div>
          ) : (
            <div className="grid gap-4">
              {(tab === 'inbox' ? inbox : sent).length === 0 ? (
                <div className="text-gray-500 text-center py-8">No messages found.</div>
              ) : (
                (tab === 'inbox' ? inbox : sent).map(msg => (
                  <div
                    key={msg.id}
                    className={`bg-gray-50 rounded-lg p-4 shadow flex items-center justify-between cursor-pointer hover:bg-green-50 border ${selected && ((msg.sender?.id === selected.id) || (msg.receiver?.id === selected.id)) ? 'border-green-400' : 'border-transparent'}`}
                    onClick={() => handleSelect(msg)}
                  >
                    <div>
                      <div className="font-semibold text-gray-900">
                        {tab === 'inbox' ? msg.sender?.name : msg.receiver?.name}
                      </div>
                      <div className="text-gray-600 text-sm truncate max-w-xs">{msg.content}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-xl" onClick={() => setShowCompose(false)}>&times;</button>
              <h2 className="text-xl font-bold mb-4">New Message</h2>
              <form onSubmit={handleComposeSend} className="space-y-4">
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={composeUser}
                  onChange={e => setComposeUser(e.target.value)}
                  required
                >
                  <option value="">Select recipient...</option>
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Type your message..."
                  value={composeText}
                  onChange={e => setComposeText(e.target.value)}
                  required
                  disabled={composeSending}
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold w-full"
                  disabled={composeSending || !composeUser || !composeText.trim()}
                >Send</button>
              </form>
            </div>
          </div>
        )}

        {/* Conversation Panel */}
        {selected && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <button className="mr-4 text-gray-500 hover:text-red-600" onClick={() => setSelected(null)}>&larr; Back</button>
              <h2 className="text-xl font-bold text-gray-900">Conversation with {selected.name}</h2>
            </div>
            <div className="h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50 mb-4">
              {conversation.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No messages yet.</div>
              ) : (
                conversation.map(msg => {
                  const isMe = msg.senderId === userId;
                  return (
                    <div key={msg.id} className={`mb-4 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl shadow relative ${isMe ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-900'}`}
                        style={{ borderBottomRightRadius: isMe ? '0.5rem' : '1rem', borderBottomLeftRadius: !isMe ? '0.5rem' : '1rem' }}>
                        <div className={`text-xs font-semibold mb-1 opacity-80 ${isMe ? 'text-right' : 'text-left'}`}>
                          {isMe ? 'Me' : (msg.sender?.name || 'User')}
                        </div>
                        <div className="text-sm break-words">{msg.content}</div>
                        <div className={`text-xs mt-1 opacity-70 ${isMe ? 'text-gray-200 text-right' : 'text-gray-500 text-left'}`}
                        >
                          {new Date(msg.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <form className="flex items-center space-x-2" onSubmit={handleSend}>
              <input
                type="text"
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Type your message..."
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                disabled={sending || !messageText.trim()}
              >Send</button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  )
} 