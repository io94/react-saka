import { useSyncExternalStore } from 'react'

// Site-wide preference for how biometric measurements are shown. The raw data is
// metric (cm / m); "imperial" converts on the fly (in / ft). The choice persists
// in localStorage and stays in sync across components and browser tabs.
const KEY = 'sc.unitSystem'
const listeners = new Set()

function read() {
  try {
    return localStorage.getItem(KEY) === 'imperial' ? 'imperial' : 'metric'
  } catch {
    return 'metric'
  }
}

let current = read()

export function setUnitSystem(value) {
  current = value === 'imperial' ? 'imperial' : 'metric'
  try {
    localStorage.setItem(KEY, current)
  } catch {
    /* ignore write failures (private mode, etc.) */
  }
  listeners.forEach((l) => l())
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      current = read()
      listeners.forEach((l) => l())
    }
  })
}

function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useUnitSystem() {
  const unitSystem = useSyncExternalStore(subscribe, () => current, () => 'metric')
  return [unitSystem, setUnitSystem]
}

// Round to 1 decimal, dropping a trailing ".0" so whole numbers read cleanly.
function round1(n) {
  const r = Math.round(n * 10) / 10
  return Number.isInteger(r) ? String(r) : r.toFixed(1)
}

// Format one measurement in the chosen system. `field` carries the metric `unit`
// and an optional `imperial` descriptor ({ unit, factor }). Non-numeric or
// unit-less values (species, year) are returned as-is; nullish → em dash.
export function formatMeasurement(value, field, unitSystem) {
  if (value == null || value === '') return '—'
  if (unitSystem === 'imperial' && field.imperial) {
    return `${round1(value * field.imperial.factor)} ${field.imperial.unit}`
  }
  return `${value}${field.unit ? ' ' + field.unit : ''}`
}
