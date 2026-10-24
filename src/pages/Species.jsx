import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { species } from '../data/species.js'
import { allSitesLabel } from '../data/trees.js'
import Pagination from '../components/Pagination.jsx'
import { usePagination } from '../hooks/usePagination.js'

function SpeciesCard({ item }) {
  return (
    <Link
      to={`/species/${item.slug}`}
      className="group block rounded-2xl overflow-hiddentransition-colors duration-300 hover:shadow-xl"
    >

      <div className="relative overflow-hidden bg-forest-900" style={{ aspectRatio: '4/3' }}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img src="/saka-logo.svg" alt="Sacred Canopy" className="w-24 opacity-30" />
          </div>
        )}
        {item.hasWriteup && (
          <span className="absolute top-3 left-3 bg-sand-100 text-forest-900 text-xs font-semibold px-2.5 py-1 rounded-full">
            Featured
          </span>
        )}
      </div>

      <div className="px-4 py-3 bg-slate-50">
        <p className="ttext-slate-900 text-base font-bold leading-snug">{item.name}</p>
        <p className="text-forest-800 text-sm italic font-light mt-1 leading-tight">{item.scientific}</p>
        <p className="text-forest-900 text-sm font-light mt-0.5 leading-tight">
          {item.treeCount} {item.treeCount === 1 ? 'tree' : 'trees'} documented
        </p>
      </div>
    </Link>
  )
}

export default function Species() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return species
    const q = search.toLowerCase()
    return species.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.scientific || '').toLowerCase().includes(q),
    )
  }, [search])

  const { page, setPage, pageSize, setPageSize, totalPages, totalItems, paged } =
    usePagination(filtered, [search])

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="bg-sand-50 border-b border-sand-200 pt-24 pb-6 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-bark-900 mb-1">Species</h1>
          <p className="text-bark-400 text-sm">{species.length} tree species documented in {allSitesLabel}, Bali</p>
        </div>
      </div>

      <div className="sticky top-16 z-30 bg-white border-b border-sand-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex flex-wrap items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-bark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search species..."
              className="pl-8 pr-3 py-1.5 text-xs border border-sand-300 bg-white text-bark-700 focus:outline-none focus:border-forest-400 w-48"
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-bark-400 hover:text-bark-700 underline transition-colors px-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-bark-400">
            <p className="text-lg">No species match your search.</p>
            <button onClick={() => setSearch('')} className="mt-4 text-sm text-forest-600 underline">
              Clear search
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paged.map((item) => (
                <SpeciesCard key={item.slug} item={item} />
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </div>
    </div>
  )
}
