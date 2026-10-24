import { PAGE_SIZE_OPTIONS } from '../hooks/usePagination.js'

function pageList(current, total) {
  // Show up to 7 slots with ellipses for long ranges
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current, current - 1, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) out.push('…')
    out.push(p)
    prev = p
  }
  return out
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}) {
  // Nothing to page and no size control to show
  if (totalPages <= 1 && !onPageSizeChange) return null

  const go = (p) => {
    const next = Math.min(Math.max(1, p), totalPages)
    if (next !== currentPage) {
      onPageChange(next)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const btn = 'min-w-[2rem] h-8 px-2 text-xs border transition-colors'

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 mt-10">
      {totalPages > 1 && (
        <nav className="flex items-center gap-1.5" aria-label="Pagination">
          <button
            onClick={() => go(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${btn} border-sand-300 text-bark-600 bg-white hover:border-forest-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-sand-300`}
          >
            Prev
          </button>

          {pageList(currentPage, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`e${i}`} className="px-1 text-bark-400 text-xs select-none">…</span>
            ) : (
              <button
                key={p}
                onClick={() => go(p)}
                aria-current={p === currentPage ? 'page' : undefined}
                className={`${btn} ${
                  p === currentPage
                    ? 'bg-forest-700 border-forest-700 text-white'
                    : 'border-sand-300 text-bark-600 bg-white hover:border-forest-400'
                }`}
              >
                {p}
              </button>
            ),
          )}

          <button
            onClick={() => go(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`${btn} border-sand-300 text-bark-600 bg-white hover:border-forest-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-sand-300`}
          >
            Next
          </button>
        </nav>
      )}

      {onPageSizeChange && (
        <label className="flex items-center gap-2 text-xs text-bark-400">
          Show
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="text-xs border border-sand-300 px-2 py-1.5 text-bark-600 bg-white focus:outline-none focus:border-forest-400"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          per page
          {typeof totalItems === 'number' && <span>· {totalItems} total</span>}
        </label>
      )}
    </div>
  )
}
