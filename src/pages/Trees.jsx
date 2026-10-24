import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { allTrees as trees, allSitesLabel } from '../data/trees.js'
import { topics } from '../data/topics.js'
import Pagination from '../components/Pagination.jsx'
import { usePagination } from '../hooks/usePagination.js'

const allSpecies = [...new Set(trees.map((t) => t.species))].sort()
const allDesaAdat = [...new Set(trees.map((t) => t.desa_adat))].sort()

function TreeCard({ tree }) {
  return (
    <Link
      to={`/tree/${tree.id}`}
      className="group block rounded-2xl overflow-hidden border-2 border-sand-50 hover:border-sand-200 transition-colors duration-300 hover:shadow-md"
    >
      <div className="relative overflow-hidden bg-forest-900" style={{ aspectRatio: '4/3' }}>
        {tree.image ? (
          <img
            src={tree.image}
            alt={tree.vernacular}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img src="/saka-logo.svg" alt="Sacred Canopy" className="w-24 opacity-30" />
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-slate-50">
        <p className="text-slate-900 text-base font-bold leading-snug">{tree.species}</p>
        <p className="text-forest-800 text-sm font-light mt-1 leading-tight">{tree.vernacular}</p>
        <p className="text-forest-900 text-sm font-light mt-0.5 leading-tight">{tree.desa_adat}</p>
      </div>
    </Link>
  )
}

export default function Trees() {
  const [search, setSearch] = useState('')
  const [activeTopic, setActiveTopic] = useState(null)
  const [species, setSpecies] = useState('')
  const [desaAdat, setDesaAdat] = useState('')

  const filtered = useMemo(() => {
    let result = trees
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((t) =>
        t.vernacular.toLowerCase().includes(q) ||
        t.species.toLowerCase().includes(q) ||
        t.desa_adat.toLowerCase().includes(q)
      )
    }
    if (activeTopic) {
      const topic = topics.find((t) => t.slug === activeTopic)
      if (topic) result = result.filter((tree) => tree.subjects.some((s) => topic.tags.includes(s)))
    }
    if (species) result = result.filter((t) => t.species === species)
    if (desaAdat) result = result.filter((t) => t.desa_adat === desaAdat)
    return result
  }, [search, activeTopic, species, desaAdat])

  const { page, setPage, pageSize, setPageSize, totalPages, totalItems, paged } =
    usePagination(filtered, [search, activeTopic, species, desaAdat])

  const clearFilters = () => {
    setSearch('')
    setActiveTopic(null)
    setSpecies('')
    setDesaAdat('')
  }
  const hasFilters = search || activeTopic || species || desaAdat

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="bg-sand-50 border-b border-sand-200 pt-24 pb-6 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-bark-900 mb-1">Trees</h1>
          <p className="text-bark-400 text-sm">{trees.length} sacred trees documented in {allSitesLabel}, Bali</p>
        </div>
      </div>

      <div className="sticky top-16 z-30 bg-white border-b border-sand-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex flex-wrap items-center gap-3">

          {/* Search bar */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-bark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trees..."
              className="pl-8 pr-3 py-1.5 text-xs border border-sand-300 bg-white text-bark-700 focus:outline-none focus:border-forest-400 w-48"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic.slug}
                onClick={() => setActiveTopic(activeTopic === topic.slug ? null : topic.slug)}
                className={`tag-pill border transition-colors text-xs ${
                  activeTopic === topic.slug
                    ? 'text-white border-transparent'
                    : 'text-bark-600 border-sand-300 hover:border-forest-400 bg-white'
                }`}
                style={activeTopic === topic.slug ? { backgroundColor: topic.color, borderColor: topic.color } : {}}
              >
                {topic.title}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 ml-auto">
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="text-xs border border-sand-300 px-3 py-1.5 text-bark-600 bg-white focus:outline-none focus:border-forest-400"
            >
              <option value="">All species</option>
              {allSpecies.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={desaAdat}
              onChange={(e) => setDesaAdat(e.target.value)}
              className="text-xs border border-sand-300 px-3 py-1.5 text-bark-600 bg-white focus:outline-none focus:border-forest-400"
            >
              <option value="">All Desa Adat</option>
              {allDesaAdat.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-bark-400 hover:text-bark-700 underline transition-colors px-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-bark-400">
            <p className="text-lg">No trees match the selected filters.</p>
            <button onClick={clearFilters} className="mt-4 text-sm text-forest-600 underline">
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paged.map((tree) => (
                <TreeCard key={tree.id} tree={tree} />
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
