import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Requests from './pages/Requests'
import Reports from './pages/Reports'
import Dev_Dashboard from './pages/Dev_Dashboard'
import StaffHome from './pages/staff/staffHome'
import StaffSchedulePage from './pages/staff/staff_schedule'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
{/*       
      <Header />
      <main className="flex-1">
        <div className="">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/dev" element={<Dev_Dashboard />} />
            <Route path="/staff/*" element={<StaffHome />} />
          </Routes>
        </div>

      </main>
   
     
      <Footer /> */}
      <StaffHome/>
    </div>
  )
}
