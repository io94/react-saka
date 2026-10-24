import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { getTreeById, getTreeMeta } from '../data/trees.js'
import { useUnitSystem, formatMeasurement } from '../hooks/useUnitSystem.js'

const PLACEHOLDER = '/saka-logo.svg'

function formatRecordDate(value) {
  if (!value) return '—'
  const d = new Date(`${value}T00:00:00`)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const biometricSections = [
  {
    label: 'Physical',
    fields: [
      { key: 'species', label: 'Species' },
      { key: 'vernacular', label: 'Vernacular' },
      { key: 'trunk_circumference', label: 'Trunk Circumference', unit: 'cm', imperial: { unit: 'in', factor: 0.393701 } },
      { key: 'height', label: 'Height', unit: 'm', imperial: { unit: 'ft', factor: 3.28084 } },
      { key: 'crown_spread', label: 'Crown Spread', unit: 'm', imperial: { unit: 'ft', factor: 3.28084 } },
      { key: 'year_measured', label: 'Year Measured' },
    ],
  },
]

function Carousel({ images }) {
  const [idx, setIdx] = useState(0)
  if (images.length === 0) return null
  return (
    <div className="relative overflow-hidden bg-forest-900">
      <div
        className="flex transition-transform duration-300"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={i} className="w-full shrink-0">
            <img src={src} alt={`Photo ${i + 1}`} className="w-full aspect-[4/3] object-cover" />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button
            onClick={() => setIdx((idx - 1 + images.length) % images.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white text-xl flex items-center justify-center transition-colors"
            aria-label="Previous"
          >‹</button>
          <button
            onClick={() => setIdx((idx + 1) % images.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white text-xl flex items-center justify-center transition-colors"
            aria-label="Next"
          >›</button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}


function figureBlocksByParagraph(figures = []) {
  const buckets = new Map()
  figures.forEach((fig) => {
    const key = fig.afterParagraph ?? -1
    if (!buckets.has(key)) buckets.set(key, [])
    const blocks = buckets.get(key)
    const last = blocks[blocks.length - 1]
    if (fig.group && last && last.group === fig.group) last.figures.push(fig)
    else blocks.push({ group: fig.group ?? null, figures: [fig] })
  })
  return buckets
}

function Figure({ fig }) {
  return (
    <figure className="border border-sand-200 bg-sand-50 flex-1 min-w-0">
      <img src={fig.src} alt={fig.caption} className="w-full object-contain bg-white" />
      {fig.caption && (
        <figcaption className="text-bark-400 text-xs italic text-center leading-snug px-3 py-2 border-t border-sand-200">
          {fig.caption}
        </figcaption>
      )}
    </figure>
  )
}


function FigureBlock({ block, float }) {
  if (block.figures.length > 1) {
    return (
      <div className="clear-both flex flex-col sm:flex-row gap-4 my-6">
        {block.figures.map((fig) => <Figure key={fig.src} fig={fig} />)}
      </div>
    )
  }
  return (
    <div className={float ? 'sm:float-right sm:w-2/5 sm:ml-6 mb-4' : 'my-6'}>
      <Figure fig={block.figures[0]} />
    </div>
  )
}

export default function TreeDetail() {
  const { id } = useParams()
  const tree = getTreeById(id)
  const [unitSystem, setUnitSystem] = useUnitSystem()

  if (!tree) return <Navigate to="/trees" replace />

  const allPhotos = [
    ...new Set(
      [...(tree.images || []), tree.image_2013, tree.image_2025, tree.image].filter(Boolean),
    ),
  ]
  const meta = getTreeMeta(tree.id)
  const paragraphs = meta?.body
    ? meta.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : null
  const figureMap = figureBlocksByParagraph(meta?.figures)
  const paraCount = paragraphs?.length ?? 0
  const trailingBlocks = []
  figureMap.forEach((blocks, key) => {
    if (key < 0 || key >= paraCount) trailingBlocks.push(...blocks)
  })

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="bg-sand-50 border-b border-sand-200 pt-24 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/trees" className="text-bark-400 hover:text-forest-700 text-sm uppercase tracking-wider flex items-center gap-1.5 transition-colors mb-4">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Trees
          </Link>
          <h1 className="text-forest-800 text-5xl font-bold">{tree.title || tree.vernacular}</h1>
          <p className="text-bark-400 text-lg italic mt-2">{tree.species}</p>
          <p className="text-bark-400 text-base mt-1">{tree.desa_adat} · {tree.site_name}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        <div className="flex flex-col gap-0 border border-sand-200 bg-sand-50 self-start">

          <div className="bg-forest-800 px-5 py-3.5 flex items-center justify-between gap-3">
            <h2 className="text-sand-100 text-base font-bold uppercase tracking-widest">Biometric Data</h2>
            <div className="flex items-center gap-0.5 bg-forest-900 rounded-full p-0.5 shrink-0">
              {['metric', 'imperial'].map((u) => (
                <button
                  key={u}
                  onClick={() => setUnitSystem(u)}
                  aria-pressed={unitSystem === u}
                  className={`text-[11px] px-2.5 py-1 rounded-full capitalize transition-colors ${
                    unitSystem === u
                      ? 'bg-sand-500 text-forest-900 font-semibold'
                      : 'text-sand-300 hover:text-white'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {biometricSections.map((section, si) => (
            <div key={section.label} className={`px-5 py-5 ${si < biometricSections.length - 1 ? 'border-b border-sand-200' : ''}`}>
              {section.label !== 'Physical' && (
                <p className="text-bark-400 text-sm uppercase tracking-widest mb-3">{section.label}</p>
              )}
              <dl className="flex flex-col gap-2">
                {section.fields.map((field) => {
                  const { key, label } = field
                  const val = tree[key] ?? null
                  const display = formatMeasurement(val, field, unitSystem)
                  return (
                    <div key={key} className="flex justify-between items-baseline gap-2">
                      <dt className="text-bark-400 text-base shrink-0">{label}</dt>
                      <dd className={`text-base font-medium text-right ${val != null ? 'text-bark-700' : 'text-bark-300 italic'}`}>
                        {display}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </div>
          ))}

          <div className="px-5 py-4 border-t border-sand-200">
            <p className="text-bark-400 text-xs uppercase tracking-widest mb-3">Location</p>
            <dl className="flex flex-col gap-1.5">
              <div className="flex justify-between gap-2">
                <dt className="text-bark-400 text-sm">Lat</dt>
                <dd className="text-sm font-mono text-bark-600">{tree.latitude}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-bark-400 text-sm">Long</dt>
                <dd className="text-sm font-mono text-bark-600">{tree.longitude}</dd>
              </div>
              <div className="mt-1.5">
                <dt className="text-bark-400 text-sm">Address</dt>
                <dd className="text-sm text-bark-600 mt-0.5">{tree.location}</dd>
              </div>
              <div className="mt-1.5">
                <dt className="text-bark-400 text-sm">Desa Adat</dt>
                <dd className="text-sm text-bark-600 mt-0.5">{tree.desa_adat}</dd>
              </div>
            </dl>
            <Link to={`/map?focus=${tree.id}`} className="mt-3 text-sm text-forest-600 hover:text-forest-800 font-medium transition-colors block">
              View on map →
            </Link>
          </div>

          <div className="px-5 py-4 border-t border-sand-200">
            <p className="text-bark-400 text-xs uppercase tracking-widest mb-3">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {tree.subjects.map((s) => (
                <span key={s} className="tag-pill bg-forest-100 text-forest-700 border border-forest-200 text-xs">{s}</span>
              ))}
            </div>
          </div>

          <div className="px-5 py-4 border-t border-sand-200 bg-sand-100">
            <p className="text-bark-400 text-xs uppercase tracking-widest mb-3">Data recorded on</p>
            <p className="text-bark-600 text-sm">{formatRecordDate(tree.date)}</p>
            {tree.author && (
              <p className="text-bark-400 text-sm mt-1">Recorded by {tree.author}</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-2">
          <div className="relative overflow-hidden bg-forest-900 aspect-[4/3] flex items-center justify-center">
            {tree.image_2013 ? (
              <img src={tree.image_2013} alt={`${tree.vernacular} 2013`} className="w-full h-full object-cover" />
            ) : (
              <img src={PLACEHOLDER} alt="Sacred Canopy" className="w-20 opacity-30" />
            )}
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-mono px-2 py-0.5">2013</div>
          </div>
          <div className="relative overflow-hidden bg-forest-900 aspect-[4/3] flex items-center justify-center">
            {tree.image_2025 ? (
              <img src={tree.image_2025} alt={`${tree.vernacular} 2025`} className="w-full h-full object-cover" />
            ) : (
              <img src={PLACEHOLDER} alt="Sacred Canopy" className="w-20 opacity-30" />
            )}
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-mono px-2 py-0.5">2025</div>
          </div>
          {/* Vid 1 placeholder */}
          {/* <div className="bg-bark-900 aspect-[4/3] flex items-center justify-center">
            <p className="text-bark-500 text-xs">Video coming soon</p>
          </div> */}
          {/* Vid 2 placeholder */}
          {/* <div className="bg-bark-900 aspect-[4/3] flex items-center justify-center">
            <p className="text-bark-500 text-xs">Video coming soon</p>
          </div> */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16 border-t border-sand-200 pt-10">
        <section>
          <h2 className="text-forest-800 font-bold text-2xl mb-6">About this tree</h2>
          {paragraphs ? (
            <div>
              {paragraphs.map((p, i) => {
                const blocks = figureMap.get(i) || []
                const floatBlocks = blocks.filter((b) => b.figures.length === 1)
                const groupBlocks = blocks.filter((b) => b.figures.length > 1)
                return (
                  <div key={i}>
                    {floatBlocks.map((b, bi) => (
                      <FigureBlock key={`f-${bi}`} block={b} float />
                    ))}
                    <p className="text-bark-600 text-lg leading-relaxed mb-5">{p}</p>
                    {groupBlocks.map((b, bi) => (
                      <FigureBlock key={`g-${bi}`} block={b} />
                    ))}
                  </div>
                )
              })}
              {trailingBlocks.map((b, bi) => (
                <FigureBlock key={`t-${bi}`} block={b} />
              ))}
              <div className="clear-both" />
            </div>
          ) : (
            <>
              <p className="text-bark-600 text-lg leading-relaxed">{tree.description}</p>
              {trailingBlocks.map((b, bi) => (
                <FigureBlock key={`t-${bi}`} block={b} />
              ))}
              <div className="clear-both" />
            </>
          )}
        </section>
      </div>

      {allPhotos.length > 0 && (
        <div className="border-t border-sand-200 bg-sand-50">
          <div className="max-w-4xl mx-auto px-6 py-10">
            <h2 className="text-forest-800 font-bold text-sm uppercase tracking-widest mb-5">All Photos</h2>
            <Carousel images={allPhotos} />
          </div>
        </div>
      )}
    </div>
  )
}
