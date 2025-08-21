import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Dev_Dashboard from './pages/Dev_Dashboard'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Dev_Dashboard />
        </div>
      </main>
      <Footer />
    </div>
  )
}
