import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const token = localStorage.getItem('token')

  if (!token) {
    return <div>{children}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 