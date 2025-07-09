import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from '../pages/Landing'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Profile from '../pages/Profile'
import CreateSponsorship from '../pages/CreateSponsorship'
import MySponsorships from '../pages/MySponsorships'
import SponsorshipDetails from '../pages/SponsorshipDetails'
import EditSponsorship from '../pages/EditSponsorship'
import { NotificationProvider } from '../components/NotificationContext'
import Layout from '../components/Layout'
import Messages from '../pages/Messages'

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminUsers from '../pages/admin/AdminUsers'
import AdminSponsorships from '../pages/admin/AdminSponsorships'
import AdminAssignments from '../pages/admin/AdminAssignments'

// Placeholder components for sidebar navigation
const Dashboard = () => (
  <Layout>
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-gray-600">Welcome to your dashboard! This page is coming soon.</p>
      </div>
    </div>
  </Layout>
)

const BrowseSponsees = () => (
  <Layout>
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Browse Children</h1>
        <p className="text-gray-600">Find children to sponsor. This feature is coming soon.</p>
      </div>
    </div>
  </Layout>
)

const BrowseSponsors = () => (
  <Layout>
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Browse Sponsors</h1>
        <p className="text-gray-600">Find potential sponsors. This feature is coming soon.</p>
      </div>
    </div>
  </Layout>
)

const MySponsorship = () => (
  <Layout>
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Sponsorship</h1>
        <p className="text-gray-600">View your current sponsorship details. This feature is coming soon.</p>
      </div>
    </div>
  </Layout>
)

const Donations = () => (
  <Layout>
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Donations</h1>
        <p className="text-gray-600">Track your donations. This feature is coming soon.</p>
      </div>
    </div>
  </Layout>
)

const Progress = () => (
  <Layout>
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Progress</h1>
        <p className="text-gray-600">Track your educational progress. This feature is coming soon.</p>
      </div>
    </div>
  </Layout>
)

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes with Layout */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/browse-sponsees" element={<BrowseSponsees />} />
          <Route path="/browse-sponsors" element={<BrowseSponsors />} />
          <Route path="/my-sponsorships" element={<MySponsorships />} />
          <Route path="/my-sponsorship" element={<MySponsorship />} />
          <Route path="/create-sponsorship" element={<CreateSponsorship />} />
          <Route path="/sponsorship/:id" element={<SponsorshipDetails />} />
          <Route path="/sponsorship/:id/edit" element={<EditSponsorship />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/progress" element={<Progress />} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/sponsorships" element={<AdminSponsorships />} />
          <Route path="/admin/assignments" element={<AdminAssignments />} />
        </Routes>
      </Router>
    </NotificationProvider>
  )
}

export default App