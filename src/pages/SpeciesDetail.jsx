import { useParams, Link, Navigate } from 'react-router-dom'
import { getSpeciesBySlug } from '../data/species.js'
import { formatSites } from '../data/trees.js'

const PLACEHOLDER = '/saka-logo.svg'

function DocumentedTree({ tree }) {
  const photo = tree.image || tree.images?.[0] || null
  return (
    <Link
      to={`/map?focus=${tree.id}`}
      className="group block shrink-0 w-56"
      title="View on map"
    >
      <div className="relative overflow-hidden bg-forest-900 aspect-[4/3] flex items-center justify-center rounded-lg">
        {photo ? (
          <img src={photo} alt={tree.vernacular} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <img src={PLACEHOLDER} alt="Sacred Canopy" className="w-16 opacity-30" />
        )}
        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          View on map →
        </span>
      </div>
      <p className="text-bark-700 text-sm font-medium mt-2">{tree.title || tree.vernacular || tree.id}</p>
      <p className="text-bark-400 text-sm leading-tight">{tree.desa_adat}</p>
    </Link>
  )
}

export default function SpeciesDetail() {
  const { slug } = useParams()
  const item = getSpeciesBySlug(slug)

  if (!item) return <Navigate to="/species" replace />

  const paragraphs = item.body ? item.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) : []

  return (
    <div className="min-h-screen bg-white font-sans">

      <div className="bg-sand-50 border-b border-sand-200 pt-24 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/species" className="text-bark-400 hover:text-forest-700 text-sm uppercase tracking-wider flex items-center gap-1.5 transition-colors mb-4">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Species
          </Link>
          <h1 className="text-forest-800 text-5xl font-bold">{item.name}</h1>
          {item.scientific && <p className="text-bark-400 text-lg italic mt-2">{item.scientific}</p>}
          <p className="text-bark-400 text-base mt-1">
            {item.treeCount} {item.treeCount === 1 ? 'tree' : 'trees'} documented in {formatSites(item.trees)}, Bali
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        <div className="flex flex-col gap-6 self-start">
          <div className="relative overflow-hidden bg-forest-900 aspect-[3/4] flex items-center justify-center border border-sand-200">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <img src={PLACEHOLDER} alt="Sacred Canopy" className="w-24 opacity-30" />
            )}
          </div>
          {item.figures.map((fig) => (
            <figure key={fig.src} className="border border-sand-200 bg-sand-50">
              <img src={fig.src} alt={fig.caption} className="w-full object-contain bg-white" />
              {fig.caption && (
                <figcaption className="text-bark-400 text-xs leading-snug px-3 py-2 border-t border-sand-200">
                  {fig.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-forest-800 font-bold text-2xl mb-4">About this species</h2>
          {paragraphs.length > 0 ? (
            <div className="flex flex-col gap-5">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-bark-600 text-lg leading-relaxed">{p}</p>
              ))}
            </div>
          ) : (
            <p className="text-bark-400 text-lg italic">Write-up coming soon.</p>
          )}
        </div>
      </div>

      <div className="border-t border-sand-200 bg-sand-50">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h2 className="text-forest-800 font-bold text-sm uppercase tracking-widest mb-5">
            {item.name} trees we&rsquo;ve documented
          </h2>
          <div className="flex gap-5 overflow-x-auto pb-3 -mx-6 px-6">
            {item.trees.map((tree) => (
              <DocumentedTree key={tree.id} tree={tree} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
