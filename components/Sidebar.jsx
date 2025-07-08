import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const userRole = localStorage.getItem('userRole')

  const isActive = (path) => location.pathname === path

  const sponsorLinks = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
      description: 'Overview of your sponsorships'
    },
    {
      name: 'Browse Children',
      path: '/browse-sponsees',
      icon: '👨‍🎓',
      description: 'Find children to sponsor'
    },
    {
      name: 'My Sponsorships',
      path: '/my-sponsorships',
      icon: '🤝',
      description: 'Manage your current sponsorships'
    },
    {
      name: 'Messages',
      path: '/messages',
      icon: '💬',
      description: 'Communicate with sponsees'
    },
    {
      name: 'Donations',
      path: '/donations',
      icon: '💰',
      description: 'Track your donations'
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: '👤',
      description: 'Manage your profile'
    }
  ]

  const sponseeLinks = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
      description: 'Overview of your sponsorship'
    },
    {
      name: 'Browse Sponsors',
      path: '/browse-sponsors',
      icon: '🤝',
      description: 'Find potential sponsors'
    },
    {
      name: 'My Sponsorship',
      path: '/my-sponsorship',
      icon: '📚',
      description: 'View your current sponsorship'
    },
    {
      name: 'Messages',
      path: '/messages',
      icon: '💬',
      description: 'Communicate with sponsors'
    },
    {
      name: 'Progress',
      path: '/progress',
      icon: '📈',
      description: 'Track your educational progress'
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: '👤',
      description: 'Manage your profile'
    }
  ]

  const adminLinks = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: '📊',
      description: 'System overview'
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: '👥',
      description: 'Manage all users'
    },
    {
      name: 'Sponsorships',
      path: '/admin/sponsorships',
      icon: '🤝',
      description: 'Monitor sponsorships'
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: '📋',
      description: 'View system reports'
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: '⚙️',
      description: 'System settings'
    }
  ]

  const getLinks = () => {
    switch (userRole) {
      case 'sponsor': return sponsorLinks
      case 'sponsee': return sponseeLinks
      case 'admin': return adminLinks
      default: return []
    }
  }

  const links = getLinks()

  return (
    <div className={`bg-white shadow-lg border-r transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <nav className="px-2 pb-4">
        <div className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive(link.path)
                  ? 'bg-green-100 text-green-700 border-r-2 border-green-500'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg mr-3">{link.icon}</span>
              {!isCollapsed && (
                <div className="flex-1">
                  <div className="font-medium">{link.name}</div>
                  <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {link.description}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Quick Stats */}
      {!isCollapsed && (
        <div className="px-3 pb-4">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick Stats</h3>
            <div className="space-y-2">
              {userRole === 'sponsor' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active Sponsorships</span>
                    <span className="font-semibold text-green-600">3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Donated</span>
                    <span className="font-semibold text-green-600">150,000 RWF</span>
                  </div>
                </>
              )}
              {userRole === 'sponsee' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current Sponsor</span>
                    <span className="font-semibold text-blue-600">1</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Support Received</span>
                    <span className="font-semibold text-blue-600">50,000 RWF</span>
                  </div>
                </>
              )}
              {userRole === 'admin' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Users</span>
                    <span className="font-semibold text-purple-600">1,234</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active Sponsorships</span>
                    <span className="font-semibold text-purple-600">567</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 