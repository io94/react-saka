import { useSyncExternalStore } from 'react'

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

function round1(n) {
  const r = Math.round(n * 10) / 10
  return Number.isInteger(r) ? String(r) : r.toFixed(1)
}

export function formatMeasurement(value, field, unitSystem) {
  if (value == null || value === '') return '—'
  if (unitSystem === 'imperial' && field.imperial) {
    return `${round1(value * field.imperial.factor)} ${field.imperial.unit}`
  }
  return `${value}${field.unit ? ' ' + field.unit : ''}`
}
