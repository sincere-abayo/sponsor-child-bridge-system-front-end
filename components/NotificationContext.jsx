import React, { createContext, useContext, useState } from 'react'

const NotificationContext = createContext()

export function useNotification() {
  return useContext(NotificationContext)
}

export function NotificationProvider({ children }) {
  const [notif, setNotif] = useState({ open: false, message: '', type: 'info' })

  const showNotification = (message, type = 'info') => {
    setNotif({ open: true, message, type })
    setTimeout(() => setNotif({ ...notif, open: false }), 2500)
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notif.open && (
        <div
          className={`
            fixed top-6 left-1/2 transform -translate-x-1/2 z-50
            px-6 py-3 rounded shadow-lg text-white
            ${notif.type === 'success' ? 'bg-green-600' : notif.type === 'error' ? 'bg-red-600' : 'bg-blue-700'}
            animate-fade-in
          `}
        >
          {notif.message}
        </div>
      )}
    </NotificationContext.Provider>
  )
}