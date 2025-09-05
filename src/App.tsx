import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Reports from './pages/Reports'
import Dev_Dashboard from './pages/Dev_Dashboard'
import StaffHome from './pages/staff/staffHome'
import Home from './pages/home/Home'
import Chat from './pages/Chat'
import ChatButton from './components/ui/ChatButton'


export default function App() {
  return (

      <div className="min-h-screen flex flex-col bg-neutral-50">
      
        <Header />
        <main className="flex-1">
          <div className="">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/dev" element={<Dev_Dashboard />} />
              <Route path="/staff/*" element={<StaffHome />} />
            </Routes>
          </div>

        </main>
     
       
        {/* <Footer /> */}
        
        {/* Global Chat Button */}
        <ChatButton />
      </div>
 
  )
}
