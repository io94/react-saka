export default function Footer() {
  return (
    <footer className="bg-sand-50 border-t border-sand-200 text-forest-800 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs">&copy; {new Date().getFullYear()} Sacred Canopy</p>
        <p className="text-xs">Location Details</p>
      </div>
    </footer>
  )
}
