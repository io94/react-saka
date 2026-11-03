import { allTrees } from './trees.js'
import { SPECIES_WRITEUPS, VERNACULAR_ALIAS } from './writeups.generated.js'

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function deriveScientific(trees) {
  const counts = {}
  trees.forEach((t) => {
    const s = (t.species || '').trim()
    if (s) counts[s] = (counts[s] || 0) + 1
  })
  const entries = Object.entries(counts)
  if (entries.length === 0) return null
  entries.sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
  return entries[0][0]
}

function buildSpecies() {
  const groups = new Map()
  for (const tree of allTrees) {
    const raw = (tree.vernacular || '').trim()
    if (!raw) continue
    const name = VERNACULAR_ALIAS[raw] || raw
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name).push(tree)
  }

  const list = []
  for (const [name, trees] of groups) {
    const slug = slugify(name)
    const docBody = SPECIES_WRITEUPS[slug]?.body || null
    const heroFromTree = trees.find((t) => t.image)?.image || null
    list.push({
      slug,
      name,
      scientific: deriveScientific(trees),
      image: heroFromTree,
      body: docBody,
      isMarkdown: Boolean(docBody),
      figures: [],
      hasWriteup: Boolean(docBody),
      trees,
      treeCount: trees.length,
    })
  }

  list.sort(
    (a, b) =>
      Number(b.hasWriteup) - Number(a.hasWriteup) ||
      b.treeCount - a.treeCount ||
      a.name.localeCompare(b.name),
  )
  return list
}

export const species = buildSpecies()

export function getSpeciesBySlug(slug) {
  return species.find((s) => s.slug === slug) ?? null
}
