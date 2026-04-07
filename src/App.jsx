import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Events from './pages/Events'
import About from './pages/About'
import Success from './pages/Success'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

// Admin routes don't show the public navbar/footer
function isAdminPath(pathname) {
  return pathname.startsWith('/admin')
}

export default function App() {
  const location = useLocation()
  const admin = isAdminPath(location.pathname)

  return (
    <>
      <ScrollToTop />
      {!admin && <Navbar />}
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/events"         element={<Events />} />
        <Route path="/about"          element={<About />} />
        <Route path="/success"        element={<Success />} />
        <Route path="/admin"          element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
      {!admin && <Footer />}
    </>
  )
}
