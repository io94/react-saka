import { allTrees } from './trees.js'
import { SPECIES_WRITEUPS, SPECIES_SLUGS } from './writeups.generated.js'

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

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
    const name = (tree.vernacular || '').trim()
    if (!name) continue
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name).push(tree)
  }

  const list = []
  for (const [name, trees] of groups) {
    const slug = SPECIES_SLUGS[name] || slugify(name)
    if (!slug) continue
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
