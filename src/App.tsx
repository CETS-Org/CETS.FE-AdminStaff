import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Requests from './pages/Requests'
import Reports from './pages/Reports'
import Dev_Dashboard from './pages/Dev_Dashboard'
import StaffHome from './pages/staff/staffHome'
import StaffSchedulePage from './pages/staff/staff_schedule'
import AdminHome from './pages/admin/AdminHome'

// Common pages imports
import Login from './pages/common/Login'
import Register from './pages/common/Register'
import HomePage from './pages/common/HomePage'
import ForgotPassword from './pages/common/ForgotPassword'
import Gateway from './pages/common/Gateway'
import OtpVerification from './pages/common/OtpVerification'
import ResetPassword from './pages/common/ResetPassword'
import ChangePassword from './pages/common/ChangePassword'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Routes>
        {/* Authentication & Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/otpVerification" element={<OtpVerification />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/gateway" element={<Gateway />} />
        <Route path="/homepage" element={<HomePage />} />
        
        {/* Staff Routes */}
        <Route path="/staff/*" element={<StaffHome />} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminHome />} />
        
        {/* Legacy/Other Routes */}
        <Route path="/requests" element={<Requests />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/dev" element={<Dev_Dashboard />} />
        
        {/* Default route - redirect to gateway/login */}
        <Route path="/" element={<Gateway />} />
      </Routes>
    </div>
  )
}
