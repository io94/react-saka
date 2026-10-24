import { useState } from 'react'

export const PAGE_SIZE_OPTIONS = [15, 30, 60, 90]
export const DEFAULT_PAGE_SIZE = 15

// Client-side pagination for an already-filtered array.
// Pass the current filter values as `deps` so the view snaps back to page 1
// whenever the filters (or page size) change.
export function usePagination(items, deps = []) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // Reset to the first page when filters or page size change.
  // Adjusting state during render (guarded) is the React-recommended
  // alternative to a setState-in-effect.
  const key = JSON.stringify([deps, pageSize])
  const [prevKey, setPrevKey] = useState(key)
  if (key !== prevKey) {
    setPrevKey(key)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const current = Math.min(page, totalPages)
  const paged = items.slice((current - 1) * pageSize, current * pageSize)

  return {
    page: current,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems: items.length,
    paged,
  }
}
