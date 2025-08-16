import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useNotification } from '../components/NotificationContext'
import { profileAPI } from '../services/api'

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
  const [composeLanguage, setComposeLanguage] = useState('en')
  const [messageLanguage, setMessageLanguage] = useState('en')
  const [translation, setTranslation] = useState({}) // { [msgId]: { text, loading, error } }
  const [targetLang, setTargetLang] = useState('en')

  // --- NEW STATE FOR PROFESSIONAL MESSAGING UI ---
  const [conversations, setConversations] = useState([]) // Sidebar list
  const [selectedConversation, setSelectedConversation] = useState(null) // Current chat
  const [messages, setMessages] = useState([]) // Messages in current chat
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)

  // Get token for auth
  const token = localStorage.getItem('token')
  const userId = parseInt(localStorage.getItem('userId'))

  // Fetch assigned users for compose dropdown
  useEffect(() => {
    if (!showCompose) return
    const userRole = localStorage.getItem('userRole')
    if (userRole === 'sponsor') {
      import('../services/api').then(({ sponsorshipAPI }) => {
        sponsorshipAPI.getAvailableSponsees().then(res => {
          console.log('DEBUG: getAvailableSponsees response:', res)
          const users = (res.sponsees || []).map(p => p.user)
          console.log('DEBUG: allUsers set to:', users)
          setAllUsers(users)
        }).catch((err) => {
          console.error('DEBUG: Error loading assigned sponsees:', err)
          showNotification('Failed to load assigned sponsees', 'error')
        })
      })
    } else if (userRole === 'sponsee') {
      import('../services/api').then(({ sponsorshipAPI }) => {
        sponsorshipAPI.getAvailableSponsors().then(res => {
          console.log('DEBUG: getAvailableSponsors response:', res)
          const users = (res.sponsors || []).map(p => p.user)
          console.log('DEBUG: allUsers set to:', users)
          setAllUsers(users)
        }).catch((err) => {
          console.error('DEBUG: Error loading assigned sponsors:', err)
          showNotification('Failed to load assigned sponsors', 'error')
        })
      })
    } else {
      setAllUsers([])
    }
  }, [showCompose])

  // Helper to build conversations from inbox/sent
  function buildConversations(inbox, sent, userId) {
    const map = new Map()
    // Inbox: messages received
    inbox.forEach(msg => {
      const other = msg.sender
      if (!map.has(other.id)) map.set(other.id, { user: other, messages: [], unreadCount: 0 })
      map.get(other.id).messages.push(msg)
      if (!msg.read) map.get(other.id).unreadCount += 1
    })
    // Sent: messages sent
    sent.forEach(msg => {
      const other = msg.receiver
      if (!map.has(other.id)) map.set(other.id, { user: other, messages: [], unreadCount: 0 })
      map.get(other.id).messages.push(msg)
    })
    // Build array, sort by latest message
    return Array.from(map.values()).map(conv => ({
      ...conv,
      lastMessage: conv.messages.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b)
    })).sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt))
  }

  // Fetch inbox and sent, then build conversations
  useEffect(() => {
    setLoadingConversations(true)
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
        // Build conversations for sidebar
        setConversations(buildConversations(inboxData, sentData, userId))
      })
      .catch((which) => {
        showNotification(`Failed to load ${which}`, 'error')
      })
      .finally(() => setLoadingConversations(false))
  }, [refresh])

  // When a conversation is selected, load its messages
  useEffect(() => {
    if (!selectedConversation) return
    setLoadingMessages(true)
    setMessages([])
    // Fetch conversation by user id
    fetch(`${API_BASE}/conversation/${selectedConversation.user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setMessages)
      .catch(() => showNotification('Failed to load conversation', 'error'))
      .finally(() => setLoadingMessages(false))
  }, [selectedConversation, refresh])

  // When opening compose modal, reset composeLanguage to 'en'
  useEffect(() => {
    if (showCompose) setComposeLanguage('en')
  }, [showCompose])

  const handleSelect = (msg) => {
    // Select the other user in the conversation
    setSelected(msg.sender?.id === userId ? msg.receiver : msg.sender)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!messageText.trim() || !selected) return
    console.log('Sending message with language:', messageLanguage)
    setSending(true)
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId: selected.id, content: messageText, language: messageLanguage })
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
    console.log('Sending message with language:', composeLanguage)

    try {
      console.log('Sending message with language:', composeLanguage)
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId: composeUser, content: composeText, language: composeLanguage })
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

  // Helper to translate a message
  const handleTranslate = async (msg) => {
    setTranslation(prev => ({ ...prev, [msg.id]: { loading: true } }))
    try {
      const res = await fetch('https://kinyarwanda-translator-api.onrender.com/api/translate', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg.content, source: msg.language || 'en', target: targetLang })
      })
      const data = await res.json()
      if (data.success) {
        setTranslation(prev => ({ ...prev, [msg.id]: { text: data.translatedText, loading: false } }))
      } else {
        setTranslation(prev => ({ ...prev, [msg.id]: { error: data.error || 'Translation failed', loading: false } }))
      }
    } catch (err) {
      setTranslation(prev => ({ ...prev, [msg.id]: { error: err.message || 'Translation failed', loading: false } }))
    }
  }

  return (
    <Layout>
      <div className="flex h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Sidebar: Conversations List */}
        <aside className="w-80 border-r bg-gray-50 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <span className="font-bold text-lg text-gray-800">Conversations</span>
            <button
              className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 text-sm font-semibold"
              onClick={() => setShowCompose(true)}
            >New Message</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="text-gray-500 p-4">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-gray-400 p-4">
                No conversations found.<br />
                <span className="text-xs text-green-700">You can start a new conversation with your assigned users using the "New Message" button.</span>
              </div>
            ) : (
              conversations.map(conv => {
                const isSelected = selectedConversation && conv.user.id === selectedConversation.user.id
                return (
                  <div
                    key={conv.user.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b hover:bg-green-50 transition-all ${isSelected ? 'bg-green-100 border-green-400' : ''}`}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    {/* Avatar/Initial */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                      {conv.user.name ? conv.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{conv.user.name}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{conv.lastMessage.content}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-400">{new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {conv.unreadCount > 0 && (
                        <span className="mt-1 inline-block bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </aside>

        {/* Main Panel: Conversation */}
        <section className="flex-1 flex flex-col relative">
          {/* Header */}
          {selectedConversation ? (
            <div className="flex items-center gap-3 border-b px-6 py-4 bg-white sticky top-0 z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                {selectedConversation.user.name ? selectedConversation.user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 text-lg">{selectedConversation.user.name}</div>
                <div className="text-xs text-gray-500">{selectedConversation.user.email}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-xl">Select a conversation to start messaging</div>
          )}

          {/* Messages List */}
          {selectedConversation && (
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
              {loadingMessages ? (
                <div className="text-gray-500 text-center py-8">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No messages yet.</div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === userId
                  return (
                    <div key={msg.id} className={`mb-4 flex ${isMe ? 'justify-end' : 'justify-start'} items-end`}>
                      {/* Receiver avatar/initial on left */}
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-bold text-base mr-2">
                          {msg.sender?.name ? msg.sender.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div
                        className={`max-w-3xl px-5 py-3 rounded-2xl shadow relative ${isMe ? 'bg-green-500 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}
                        style={{
                          maxWidth: '600px',
                          borderBottomRightRadius: isMe ? '0.5rem' : '1.5rem',
                          borderBottomLeftRadius: !isMe ? '0.5rem' : '1.5rem',
                          marginLeft: isMe ? 'auto' : undefined,
                          marginRight: !isMe ? 'auto' : undefined
                        }}
                      >
                        <div className={`text-xs font-semibold mb-1 opacity-80 ${isMe ? 'text-right' : 'text-left'}`}
                        >
                          {isMe ? 'Me' : (msg.sender?.name || 'User')}
                        </div>
                        <div className="text-base break-words leading-relaxed">{msg.content}</div>
                        <div className={`text-xs mt-1 opacity-70 ${isMe ? 'text-gray-200 text-right' : 'text-gray-500 text-left'}`}
                        >
                          {new Date(msg.createdAt).toLocaleString()}
                        </div>
                        {/* Translate button for received messages */}
                        {!isMe && (
                          <div className="mt-2">
                            <select
                              className="px-2 py-1 border rounded text-xs mr-2"
                              value={targetLang}
                              onChange={e => setTargetLang(e.target.value)}
                            >
                              <option value="en">English</option>
                              <option value="rw">Kinyarwanda</option>
                              <option value="fr">French</option>
                              <option value="sw">Swahili</option>
                            </select>
                            <button
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                              onClick={() => handleTranslate(msg)}
                              disabled={translation[msg.id]?.loading}
                            >
                              {translation[msg.id]?.loading ? 'Translating...' : 'Translate'}
                            </button>
                            {translation[msg.id]?.text && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-900 border border-blue-200">
                                <strong>Translation:</strong> {translation[msg.id].text}
                              </div>
                            )}
                            {translation[msg.id]?.error && (
                              <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-900 border border-red-200">
                                <strong>Error:</strong> {translation[msg.id].error}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Sender avatar/initial on right (optional, can omit for 'Me') */}
                      {isMe && <div className="w-8 h-8 ml-2" />}
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Compose Bar */}
          {selectedConversation && (
            <form className="flex items-center space-x-2 px-6 py-4 border-t bg-white sticky bottom-0" onSubmit={async (e) => {
              e.preventDefault()
              if (!composeText.trim()) return
              setSending(true)
              try {
                const res = await fetch(API_BASE, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({ receiverId: selectedConversation.user.id, content: composeText, language: messageLanguage })
                })
                if (res.ok) {
                  setComposeText('')
                  setRefresh(r => !r)
                  showNotification('Message sent', 'success')
                } else {
                  showNotification('Failed to send message', 'error')
                }
              } finally {
                setSending(false)
              }
            }}>
              <select
                className="px-2 py-2 border rounded-lg"
                value={messageLanguage}
                onChange={e => setMessageLanguage(e.target.value)}
                style={{ maxWidth: 120 }}
              >
                <option value="en">English</option>
                <option value="rw">Kinyarwanda</option>
                <option value="fr">French</option>
                <option value="sw">Swahili</option>
              </select>
              <input
                type="text"
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Type your message..."
                value={composeText}
                onChange={e => setComposeText(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                disabled={sending || !composeText.trim()}
              >Send</button>
            </form>
          )}
        </section>
      </div>
      {/* Compose Modal (keep for now) */}
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
                  disabled={allUsers.length === 0}
                >
                  <option value="">Select recipient...</option>
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                {/* Language selector for compose */}
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={composeLanguage}
                  onChange={e => setComposeLanguage(e.target.value)}
                  required
                  style={{ marginTop: 8 }}
                >
                  <option value="en">English</option>
                  <option value="rw">Kinyarwanda</option>
                  <option value="fr">French</option>
                  <option value="sw">Swahili</option>
                </select>
                {allUsers.length === 0 ? (
                  <div className="text-sm text-red-500">You have no assigned users to message. Please contact the admin if you believe this is an error.</div>
                ) : (
                  <div className="text-xs text-green-700 mb-2">You can start a new conversation with your assigned sponsor or sponsee here.</div>
                )}
                <textarea
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Type your message..."
                  value={composeText}
                  onChange={e => setComposeText(e.target.value)}
                  required
                  disabled={composeSending || allUsers.length === 0}
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold w-full"
                  disabled={composeSending || !composeUser || !composeText.trim() || allUsers.length === 0}
                >Send</button>
              </form>
            </div>
          </div>
        )}
    </Layout>
  )
} 