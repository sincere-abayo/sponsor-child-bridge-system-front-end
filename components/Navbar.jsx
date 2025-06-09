import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useNotification } from '../components/NotificationContext'

export default function Navbar() {
  const location = useLocation()
  const { showNotification } = useNotification()

  return (
    <nav className="flex items-center justify-between py-4 px-8 bg-white shadow">
      <Link to="/" className="text-2xl font-bold text-blue-700">SponsorBridge</Link>
      <div className="flex gap-4">
        {location.pathname !== '/login' && (
          <Link to="/login" className="text-blue-700 font-semibold hover:underline">Sign In</Link>
        )}
        {location.pathname !== '/register' && (
          <Link to="/register" className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 font-semibold">Get Started</Link>
        )}
      </div>
    </nav>
  )
}