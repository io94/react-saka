import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const topicLinks = [
  { label: 'All Topics', to: '/topics' },
  { label: 'Sacred Space in Bali', to: '/topics/sacred-space' },
  { label: 'Ritual Experience & Ecology', to: '/topics/ritual-ecology' },
  { label: 'Green Infrastructure', to: '/topics/green-infrastructure' },
]

const primaryLinks = [
  { label: 'Map', to: '/map' },
  { label: 'Trees', to: '/trees' },
  { label: 'Species', to: '/species' },
]

const secondaryLinks = [
  { label: 'Gallery', to: '/gallery' },
  { label: 'Resources', to: '/resources' },
  { label: 'Team', to: '/team' },
  { label: 'About', to: '/about' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [topicsOpen, setTopicsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()

  // Close dropdown on outside click
  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setTopicsOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const [prevPath, setPrevPath] = useState(location.pathname)
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname)
    setMobileOpen(false)
    setTopicsOpen(false)
  }

  const linkBase = 'transition-colors duration-200 text-base font-normal tracking-wide'
  const linkColor = 'text-sand-200 hover:text-sand-400'

  const desktopLink = ({ label, to }) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `${linkBase} ${linkColor} ${isActive ? 'underline underline-offset-4' : ''}`
      }
    >
      {label}
    </NavLink>
  )

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1100] transition-all duration-300 bg-forest-800 shadow-md">
      <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-16">

        <Link to="/" className="shrink-0">
          <div className="h-[50px] w-[50px] rounded-full bg-sand-50 flex items-center justify-center">
            <img src="/saka-logo.svg" alt="Sacred Canopy" className="h-8 w-8 object-contain" />
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {primaryLinks.map(desktopLink)}

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setTopicsOpen((v) => !v)}
              className={`${linkBase} ${linkColor} flex items-center gap-1`}
            >
              Topics
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${topicsOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {topicsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-forest-800 rounded-lg shadow-xl py-1 border border-forest-700 font-sans">
                {topicLinks.map(({ label, to }) => (
                  <Link
                    key={to}
                    to={to}
                    className="block px-4 py-2.5 text-base text-sand-200 hover:bg-forest-700 hover:text-sand-300 transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {secondaryLinks.map(desktopLink)}

          <Link
            to="/contact"
            className="ml-2 px-4 py-1.5 rounded-full bg-sand-500 text-forest-900 text-base font-semibold hover:bg-sand-400 transition-colors"
          >
            Contact
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden p-2 rounded text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-forest-800 border-t border-forest-700 px-5 py-4 flex flex-col gap-1 font-sans">
          {primaryLinks.map(({ label, to }) => (
            <Link key={to} to={to} className="py-2.5 text-sand-200 hover:text-sand-400 text-base font-normal transition-colors border-b border-forest-700">
              {label}
            </Link>
          ))}
          <div>
            <p className="py-2.5 text-sand-400 text-xs uppercase tracking-widest">Topics</p>
            {topicLinks.map(({ label, to }) => (
              <Link key={to} to={to} className="block pl-3 py-2 text-sand-200 hover:text-sand-400 text-base transition-colors">
                {label}
              </Link>
            ))}
          </div>
          {secondaryLinks.map(({ label, to }) => (
            <Link key={to} to={to} className="py-2.5 text-sand-200 hover:text-sand-400 text-base font-normal transition-colors border-t border-forest-700">
              {label}
            </Link>
          ))}
          <Link to="/contact" className="mt-3 py-2.5 text-center rounded-full bg-sand-500 text-forest-900 text-base font-semibold">
            Contact
          </Link>
        </div>
      )}
    </nav>
  )
}
