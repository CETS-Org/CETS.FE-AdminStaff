import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Requests from './pages/Requests'
import Reports from './pages/Reports'
import Dev_Dashboard from './pages/Dev_Dashboard'
import StaffHome from './pages/staff/staffHome'
import AdminHome from './pages/admin/AdminHome'

// Common pages imports
import Login from './pages/common/Login'
import HomePage from './pages/common/HomePage'
import ForgotPassword from './pages/common/ForgotPassword'
import Gateway from './pages/common/Gateway'
import OtpVerification from './pages/common/OtpVerification'
import ResetPassword from './pages/common/ResetPassword'
import ChangePassword from './pages/common/ChangePassword'
import ProtectedRoute from './components/auth/ProtectedRoute'


export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Routes>
        {/* Authentication & Public Routes */}
        <Route path="/login" element={
          <ProtectedRoute requireAuth={false}>
            <Login />
          </ProtectedRoute>
        } />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/otpVerification" element={<OtpVerification />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/change-password" element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        } />
        <Route path="/gateway" element={<Gateway />} />
        <Route path="/homepage" element={<HomePage />} />
        
        {/* Staff Routes - protected with Staff roles */}
        <Route path="/staff/*" element={
          <ProtectedRoute allowedRoles={['AcademicStaff', 'AccountantStaff']}>
            <StaffHome />
          </ProtectedRoute>
        } />
        
        
        {/* Admin Routes - protected with Admin role */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminHome />
          </ProtectedRoute>
        } />
        
        {/* Legacy/Other Routes */}
        <Route path="/requests" element={<Requests />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/dev" element={<Dev_Dashboard />} />
        
        {/* Default route - redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}
