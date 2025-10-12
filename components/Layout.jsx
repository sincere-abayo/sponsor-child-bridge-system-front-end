import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const token = localStorage.getItem('token')

  if (!token) {
    return <div>{children}</div>
  }

  return (
    <div className="page-container">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
} 