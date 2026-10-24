import { allTrees } from './trees.js'

// Some trees carry spelling / formatting variants of the same folk (vernacular)
// name. Map those raw values onto a single canonical display name so each species
// shows up once in the gallery.
const VERNACULAR_ALIAS = {
  'Nyamplung / Camplung': 'Camplung',
  'beringin (Kuwang)': 'Kuwang',
  'Asam / Celagi': 'Asam',
  Asem: 'Asam',
  'randu alas': 'Randu Alas',
  'Kepal/Kepel': 'Kepel',
  'Rambutan Jantan': 'Rambutan',
}

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Curated write-ups per species, keyed by slug. A species with no entry here still
// appears in the gallery — it just falls back to data derived from its trees.
//
//   image   — hero / card photo
//   body    — write-up text, transcribed from the source doc. Blank lines split paragraphs.
//   figures — supporting images shown alongside the write-up, each with a caption.
export const SPECIES_META = {
  kepuh: {
    scientific: 'Sterculia foetida L.',
    image: '/images/species/kepuh/portrait.png',
    body: `Growing up to an impressive 40 meters tall, the kepuh tree is a fixture of many tropical forest canopies. The kepuh offers several ecological benefits but it is best known for its mythical origins, connecting this tree to both the physical and the spiritual in Balinese tradition.

Kepuh trees can be found throughout most of the eastern tropical regions of the Pacific. The wood is not very durable and is only used for some kinds of construction or smaller projects. Its nuts are edible, and its leaves are used to treat various forms of inflammation. As Aini et al.’s scientific review titled “Ethnobotanical Study of Kepuh (Sterculia foetida L.) in Indonesia” reports, kepuh leaves have even been used as a remedy for tuberculosis. In his book Tropical Trees of Indonesia, H.K. Moon describes how the kepuh has historically contributed to traditional art forms. Its seeds have oil used for paints, and the rinds of its fruit have a brown-colored dye often used in dyeing baths for batik textiles.

Its relevance goes beyond the material world, as its origins are often narrated in relation to Dewa Siwa and Dewi Durga, the most prominent couple in the Hindu cosmology, indexing universal duality. Kepuh is associated with Siwa, and thus refers to the male form of the tree, while kepah is his wife, Durga, and therefore refers to the female form of the tree. This mythical history places the kepuh at the heart of Bali’s religious tradition and helps to explain its intense sacrality.

Several locals shared that because of the kepuh’s spiritual weight, the only maintenance it receives is gentle cleaning or sweeping. Rarely would it be pruned. The kepuh can live for hundreds of years, which further cements it as a fixture of its community. One village official described how its roots extended under the asphalt to far-away towns, a perspective of the kepuh’s power and entrenchment in the environment despite urban development that testifies to its spiritual significance.

The kepuh is also ecologically important in Bali, and the same official emphasized that without its water-holding strength, the soil of the local Setra Badung would risk being washed away. It is also known for providing shade and shelter. The combination of the kepuh’s deep connection to religious tradition and its support of the local environment makes it one of the most sacred and integral trees in Balinese culture.`,
    figures: [
      {
        src: '/images/species/kepuh/atlas-illustration.png',
        caption:
          'S.H. Koorders, Atlas der Baumarten von Java (F. P. W. M. Trap, Leiden, 1915), 416.',
      },
    ],
  },
}

// Pick the cleanest / most complete Latin binomial among a species' trees.
function deriveScientific(trees) {
  const counts = {}
  trees.forEach((t) => {
    const s = (t.species || '').trim()
    if (s) counts[s] = (counts[s] || 0) + 1
  })
  const entries = Object.entries(counts)
  if (entries.length === 0) return null
  // Prefer the most frequent; break ties toward the longer (more complete) name.
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
    const meta = SPECIES_META[slug] || {}
    const heroFromTree = trees.find((t) => t.image)?.image || null
    list.push({
      slug,
      name,
      scientific: meta.scientific || deriveScientific(trees),
      image: meta.image || heroFromTree,
      body: meta.body || null,
      figures: meta.figures || [],
      hasWriteup: Boolean(meta.body),
      trees,
      treeCount: trees.length,
    })
  }

  // Written-up species first, then by how many trees are mapped, then alphabetically.
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
