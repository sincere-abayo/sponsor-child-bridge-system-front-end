import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const token = localStorage.getItem('token')

  if (!token) {
    return <div>{children}</div>
  }

  return (
    <div className="page-container min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
} 