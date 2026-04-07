import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/',       label: 'Главная' },
  { to: '/events', label: 'Мероприятия' },
  { to: '/about',  label: 'О нас' },
]

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const location  = useLocation()
  const menuRef   = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 56)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Always close when route changes
  useEffect(() => setMenuOpen(false), [location.pathname])

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} ref={menuRef}>
      <div className="container">
        <div className="navbar__inner">
          <Link to="/" className="navbar__logo" onClick={close}>
            Фестиваль Бизнес Игр
          </Link>

          <ul className="navbar__links">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className={location.pathname === to ? 'active' : ''}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <Link to="/events" className="navbar__cta" onClick={close}>Занять место</Link>

          <button
            className={`navbar__hamburger${menuOpen ? ' is-open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Меню"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Dropdown panel */}
      <div className={`nav-dropdown${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <div className="nav-dropdown__links">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-dropdown__link${location.pathname === to ? ' active' : ''}`}
              onClick={close}
            >
              <span className="nav-dropdown__link-dot" />
              {label}
              {location.pathname === to && <span className="nav-dropdown__link-badge">•</span>}
            </Link>
          ))}
        </div>
        <Link to="/events" className="btn btn-gold nav-dropdown__cta" onClick={close}>
          Занять место →
        </Link>
      </div>
    </nav>
  )
}
