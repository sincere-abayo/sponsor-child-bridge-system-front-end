import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useNotification } from './NotificationContext'

export default function Header() {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading] = useState(false)
  const notifDropdownRef = useRef(null)
  
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')
  const userData = JSON.parse(localStorage.getItem('userData') || '{}')

  // Fetch notifications
  useEffect(() => {
    if (!token) return;
    setNotifLoading(true);
    fetch('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]))
      .finally(() => setNotifLoading(false));
  }, [token, showNotifDropdown])

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark notification as read
  const handleMarkAsRead = async (notifId) => {
    try {
      await fetch(`/api/notifications/${notifId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications => notifications.map(n => n.id === notifId ? { ...n, read: true } : n));
    } catch {}
  };

  // Mark notification as read and optionally navigate
  const handleNotificationClick = async (notif) => {
    await handleMarkAsRead(notif.id)
    if (notif.data && notif.data.link) {
      setShowNotifDropdown(false)
      navigate(notif.data.link)
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    if (showNotifDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifDropdown]);

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userData')
    showNotification('Logged out successfully', 'success')
    navigate('/')
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'sponsor': return 'bg-[#009688] text-white'
      case 'sponsee': return 'bg-[#2196f3] text-white'
      case 'admin': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'sponsor': return '🤝'
      case 'sponsee': return '👨‍🎓'
      case 'admin': return '⚙️'
      default: return '👤'
    }
  }

  if (!token) {
    return (
      <header className="page-header">
        <div className="page-header-content">
          <div className="page-header-inner">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl">🇷</div>
              <span className="text-heading-1">SponsorBridge</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-muted hover:text-gray-900 font-medium">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="page-header">
      <div className="page-header-content">
        <div className="page-header-inner">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl">🇷</div>
            <span className="text-heading-1">SponsorBridge</span>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                className="relative p-2 text-gray-600 hover:text-gray-900"
                onClick={() => setShowNotifDropdown(v => !v)}
                aria-label="Notifications"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-[#ef4444] text-white text-xs flex items-center justify-center font-bold">{unreadCount}</span>
                )}
              </button>
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto card-lg z-50 animate-fade-in">
                  <div className="card-header flex items-center justify-between">
                    <span className="text-heading-3">Notifications</span>
                    {notifLoading && <span className="text-caption text-muted ml-2">Loading...</span>}
                  </div>
                  {notifications.length === 0 && !notifLoading && (
                    <div className="px-4 py-6 text-muted text-body text-center">No notifications</div>
                  )}
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 flex items-start gap-2 ${notif.read ? '' : 'bg-[#2196f3]/10'}`}
                      onClick={() => handleNotificationClick(notif)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={e => { if (e.key === 'Enter') handleNotificationClick(notif) }}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-body">{notif.message}</div>
                        <div className="text-caption text-muted mt-1">{notif.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} • {new Date(notif.createdAt).toLocaleString()}</div>
                      </div>
                      {!notif.read && <span className="mt-1 ml-2 w-2 h-2 rounded-full bg-[#2196f3] inline-block"></span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#009688] to-[#2196f3] rounded-full flex items-center justify-center text-white font-semibold">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{userData.name}</p>
                  <div className="flex items-center space-x-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(userRole)}`}>
                      <span className="mr-1">{getRoleIcon(userRole)}</span>
                      {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
                    </span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 card z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-body text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a3 3 0 00-3-3z" />
                      </svg>
                      <span>My Profile</span>
                    </div>
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-body text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Settings</span>
                    </div>
                  </Link>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-body text-[#ef4444] hover:bg-[#ef4444]/10"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 