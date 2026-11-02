import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-sand-50 pt-24 pb-16 px-6 font-sans flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <img src="/saka-logo.svg" alt="Sacred Canopy" className="w-20 h-20 mx-auto opacity-40 mb-6" />
        <p className="text-forest-800 text-6xl font-bold">404</p>
        <h1 className="text-forest-800 text-2xl font-bold mt-2 mb-3">Page not found</h1>
        <p className="text-bark-500 text-base mb-8">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2 rounded-full bg-forest-700 text-white text-sm font-semibold hover:bg-forest-600 transition-colors"
          >
            Go home
          </Link>
          <Link
            to="/map"
            className="px-5 py-2 rounded-full border border-forest-300 text-forest-700 text-sm font-semibold hover:border-forest-500 transition-colors"
          >
            Explore the map
          </Link>
        </div>
      </div>
    </div>
  )
}
