import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to CETS Admin/Staff portal.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
