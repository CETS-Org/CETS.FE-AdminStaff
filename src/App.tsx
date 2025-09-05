import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Requests from './pages/Requests'
import Reports from './pages/Reports'
import Dev_Dashboard from './pages/Dev_Dashboard'
import StaffHome from './pages/staff/staffHome'
import AdminHome from './pages/admin/AdminHome'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Routes>
        {/* Default route - redirect to staff */}
        <Route path="/" element={<StaffHome />} />
        
        Staff routes
        <Route path="/staff/*" element={<StaffHome />} />
        
        {/* Admin routes - completely separate */}
        <Route path="/admin/*" element={<AdminHome />} />
        
        {/* Other standalone routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/dev" element={<Dev_Dashboard />} />
      </Routes>
    </div>
  )
}
