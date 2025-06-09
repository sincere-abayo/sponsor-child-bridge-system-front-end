import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from '../pages/Landing'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/sponsor/Dashboard'
import SponseeDashboard from '../pages/sponsee/Dashboard' 
import AdminDashboard from '../pages/admin/Dashboard' 
import { NotificationProvider } from '../components/NotificationContext'


function App() {
  return (
        <NotificationProvider>

    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="sponsor/dashboard" element={<Dashboard />} />
        <Route path="sponsee/dashboard" element={<SponseeDashboard />} />
        <Route path="admin/dashboard" element={<AdminDashboard />} />

      </Routes>
    </Router>
        </NotificationProvider>

  )
}

export default App