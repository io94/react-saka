import { useEffect, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { allTrees as trees, allSites } from '../data/trees.js'
import { topics } from '../data/topics.js'
import { useUnitSystem, formatMeasurement } from '../hooks/useUnitSystem.js'
import { MagnifyingGlassIcon, Cog6ToothIcon, Bars3Icon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

const CENTER = [-8.629, 115.199]
const DEFAULT_ZOOM = 14

const LAYERS = {
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
  },
  natgeo: {
    label: 'NatGeo',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
  },
}

const DEFAULT_COLOR = '#2d5a27'
const ACTIVE_COLOR = '#f97316'

function makeIcon(color = DEFAULT_COLOR, active = false) {
  const size = active ? 38 : 28
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
    html: `
      <div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};
        border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.4);
        display:flex;align-items:center;justify-content:center;
      ">
        <svg width="${size / 2}" height="${size / 2}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a9 9 0 0 0-9 9c0 5 9 13 9 13s9-8 9-13a9 9 0 0 0-9-9z"/>
          <circle cx="12" cy="11" r="3"/>
        </svg>
      </div>
    `,
  })
}

export default function MapPage() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const tileLayerRef = useRef(null)
  const markersRef = useRef({})
  const [activeLayer, setActiveLayer] = useState('satellite')
  const [unitSystem, setUnitSystem] = useUnitSystem()
  const [search, setSearch] = useState('')
  const [mobileListOpen, setMobileListOpen] = useState(false)
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false)
  const settingsRef = useRef(null)
  const [searchParams] = useSearchParams()
  const [selectedTree, setSelectedTree] = useState(() => {
    const focusId = searchParams.get('focus')
    return focusId ? trees.find((tr) => tr.id === focusId) ?? null : null
  })

  useEffect(() => {
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    })
    mapInstanceRef.current = map

    L.control.zoom({ position: 'topright' }).addTo(map)

    tileLayerRef.current = L.tileLayer(LAYERS.satellite.url, {
      attribution: LAYERS.satellite.attribution,
      maxZoom: 19,
    }).addTo(map)

    trees.forEach((tree) => {
      if (tree.latitude == null || tree.longitude == null) return
      const marker = L.marker([tree.latitude, tree.longitude], {
        icon: makeIcon(DEFAULT_COLOR),
      })
      marker.addTo(map)
      marker.on('click', () => setSelectedTree(tree))
      markersRef.current[tree.id] = marker
    })

    if (selectedTree && selectedTree.latitude != null && selectedTree.longitude != null) {
      map.setView([selectedTree.latitude, selectedTree.longitude], 17)
    }

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps


  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current)
    }
    const layer = LAYERS[activeLayer]
    tileLayerRef.current = L.tileLayer(layer.url, {
      attribution: layer.attribution,
      maxZoom: 19,
    }).addTo(map)
  }, [activeLayer])

  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const active = id === selectedTree?.id
      marker.setIcon(makeIcon(active ? ACTIVE_COLOR : DEFAULT_COLOR, active))
      if (active) marker.setZIndexOffset(1000)
      else marker.setZIndexOffset(0)
    })
  }, [selectedTree])

  useEffect(() => {
    if (!mobileSettingsOpen) return
    const onDown = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setMobileSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [mobileSettingsOpen])

  function flyToTree(tree) {
    setSelectedTree(tree)
    setMobileListOpen(false)
    mapInstanceRef.current?.flyTo([tree.latitude, tree.longitude], 17, { duration: 1 })
  }

  const q = search.trim().toLowerCase()
  const visibleTrees = q
    ? trees.filter(
        (t) =>
          (t.vernacular || '').toLowerCase().includes(q) ||
          (t.species || '').toLowerCase().includes(q) ||
          (t.desa_adat || '').toLowerCase().includes(q),
      )
    : trees

  const renderTreeItem = (tree) => (
    <button
      key={tree.id}
      onClick={() => flyToTree(tree)}
      className={`w-full text-left px-4 py-3 border-b border-sand-100 transition-colors hover:bg-sand-100 ${
        selectedTree?.id === tree.id ? 'bg-forest-50 border-l-2 border-l-forest-500' : ''
      }`}
    >
      <p className="font-sans text-forest-800 text-sm font-semibold leading-tight">{tree.vernacular}</p>
      <p className="font-sans text-bark-400 text-xs italic mt-0.5">{tree.species}</p>
      <p className="font-sans text-bark-300 text-xs mt-0.5">{tree.desa_adat}</p>
    </button>
  )

  const searchInput = (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-bark-400" strokeWidth={2} />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search trees..."
        className="w-full pl-8 pr-3 py-2 text-xs border border-sand-300 bg-white text-bark-700 focus:outline-none focus:border-forest-400 rounded"
      />
    </div>
  )

  const unitSwitcher = (
    <div className="flex items-center gap-1 bg-forest-900 rounded-full p-0.5">
      {['metric', 'imperial'].map((u) => (
        <button
          key={u}
          onClick={() => setUnitSystem(u)}
          aria-pressed={unitSystem === u}
          className={`font-sans text-xs px-3 py-1.5 rounded-full capitalize transition-colors ${
            unitSystem === u ? 'bg-sand-500 text-forest-900 font-semibold' : 'text-sand-300 hover:text-white'
          }`}
        >
          {u}
        </button>
      ))}
    </div>
  )

  const layerSwitcher = (
    <div className="flex items-center gap-1 bg-forest-900 rounded-full p-0.5">
      {Object.entries(LAYERS).map(([key, { label }]) => (
        <button
          key={key}
          onClick={() => setActiveLayer(key)}
          className={`font-sans text-xs px-3 py-1.5 rounded-full transition-colors ${
            activeLayer === key ? 'bg-sand-500 text-forest-900 font-semibold' : 'text-sand-300 hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col" style={{ height: '100dvh', paddingTop: '4rem' }}>
      <div className="relative bg-sand-50 border-b border-sand-200 px-4 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 shrink-0 z-20 shadow">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <h1 className="font-sans text-base font-bold text-forest-800 whitespace-nowrap">
            <span className="hidden sm:inline">Sacred Canopy — </span>Map
          </h1>
          <span className="font-sans text-xs text-sand-600 whitespace-nowrap">
            {trees.length} trees · {allSites.length} sites, Bali
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {unitSwitcher}
          {layerSwitcher}
        </div>

        <div className="sm:hidden relative" ref={settingsRef}>
          <button
            onClick={() => setMobileSettingsOpen((v) => !v)}
            aria-label="Map settings"
            aria-expanded={mobileSettingsOpen}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-forest-900 text-sand-200 hover:text-white transition-colors"
          >
            <Cog6ToothIcon className="w-4 h-4" strokeWidth={1.8} />
          </button>
          {mobileSettingsOpen && (
            <div className="absolute right-0 top-full mt-2 w-max bg-white rounded-xl shadow-xl border border-sand-200 p-3 flex flex-col gap-3 z-[1000]">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-bark-400 mb-1.5">Units</p>
                {unitSwitcher}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-bark-400 mb-1.5">Map layer</p>
                {layerSwitcher}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 shrink-0 bg-sand-50 border-r border-sand-200 overflow-y-auto hidden sm:flex flex-col">
          <div className="p-4 border-b border-sand-200 flex flex-col gap-3 sticky top-0 bg-sand-50 z-10">
            <p className="font-sans text-xs text-bark-400 uppercase tracking-widest">Trees · {visibleTrees.length}</p>
            {searchInput}
          </div>
          {visibleTrees.length === 0 ? (
            <p className="px-4 py-6 text-xs text-bark-400">No trees match “{search}”.</p>
          ) : (
            visibleTrees.map(renderTreeItem)
          )}
        </div>

        <div className="flex-1 relative isolate">
          <div ref={mapRef} className="absolute inset-0" />

          <button
            onClick={() => setMobileListOpen(true)}
            className="sm:hidden absolute top-3 left-3 z-[600] flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/95 shadow-lg text-forest-800 text-xs font-semibold hover:bg-white transition-colors"
          >
            <Bars3Icon className="w-4 h-4" strokeWidth={2} />
            List
          </button>

          {selectedTree && (
            <div className="absolute bottom-6 left-1/2 sm:left-auto sm:right-4 -translate-x-1/2 sm:translate-x-0 z-[1000] w-72 bg-white rounded-2xl shadow-2xl border border-sand-200 overflow-hidden">
              <div className="relative aspect-video bg-forest-900">
                {selectedTree.image ? (
                  <img
                    src={selectedTree.image}
                    alt={selectedTree.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img src="/saka-logo.svg" alt="Sacred Canopy" className="w-24 opacity-30" />
                  </div>
                )}
                <button
                  onClick={() => setSelectedTree(null)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-4">
                <p className="font-sans text-forest-800 font-bold text-base leading-tight">{selectedTree.vernacular}</p>
                <p className="font-sans text-bark-400 text-xs italic mt-0.5">{selectedTree.species}</p>
                <p className="font-sans text-bark-400 text-xs mt-0.5">{selectedTree.desa_adat}</p>


                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1">
                  {[
                    { key: 'trunk_circumference', label: 'Circumf.', unit: 'cm', imperial: { unit: 'in', factor: 0.393701 } },
                    { key: 'height', label: 'Height', unit: 'm', imperial: { unit: 'ft', factor: 3.28084 } },
                    { key: 'crown_spread', label: 'Canopy', unit: 'm', imperial: { unit: 'ft', factor: 3.28084 } },
                  ].map((field) => {
                    const val = selectedTree[field.key] ?? null
                    return (
                      <div key={field.label}>
                        <dt className="text-bark-400 text-[10px] uppercase tracking-wide">{field.label}</dt>
                        <dd className={`text-xs font-medium ${val != null ? 'text-bark-700' : 'text-bark-300 italic'}`}>
                          {formatMeasurement(val, field, unitSystem)}
                        </dd>
                      </div>
                    )
                  })}
                </dl>

                <div className="flex flex-wrap gap-1 mt-3">
                  {selectedTree.subjects.map((s) => {
                    const topic = topics.find((t) => t.tags.includes(s))
                    return topic ? (
                      <Link
                        key={s}
                        to={`/topics/${topic.slug}`}
                        className="tag-pill bg-forest-50 text-forest-600 border border-forest-100 text-[10px] hover:bg-forest-100 transition-colors"
                      >{s}</Link>
                    ) : (
                      <span key={s} className="tag-pill bg-forest-50 text-forest-600 border border-forest-100 text-[10px]">{s}</span>
                    )
                  })}
                </div>

                <Link
                  to={`/tree/${selectedTree.id}`}
                  className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-md bg-forest-700 hover:bg-forest-600 text-white text-xs font-semibold transition-colors"
                >
                  View full record
                  <ArrowRightIcon className="w-3.5 h-3.5" strokeWidth={2} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
       {/* Mobile */}
      {mobileListOpen && (
        <div className="sm:hidden fixed inset-0 z-[1200]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileListOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80%] bg-sand-50 rounded-t-2xl shadow-2xl flex flex-col">
            <div className="p-4 border-b border-sand-200 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="font-sans text-xs text-bark-400 uppercase tracking-widest">Trees · {visibleTrees.length}</p>
                <button
                  onClick={() => setMobileListOpen(false)}
                  aria-label="Close list"
                  className="w-7 h-7 -mr-1 flex items-center justify-center text-bark-400 hover:text-bark-700"
                >
                  <XMarkIcon className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
              {searchInput}
            </div>
            <div className="overflow-y-auto">
              {visibleTrees.length === 0 ? (
                <p className="px-4 py-6 text-xs text-bark-400">No trees match “{search}”.</p>
              ) : (
                visibleTrees.map(renderTreeItem)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
