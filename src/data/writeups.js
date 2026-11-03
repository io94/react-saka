import {
  TREE_WRITEUPS,
  SPECIES_WRITEUPS,
  TOPIC_WRITEUPS,
  PAGE_WRITEUPS,
  TEAM,
  RESOURCES,
} from './writeups.generated.js'
import { getTreeMeta } from './trees.js'

// Tree page body
export function getTreeWriteup(id) {
  const doc = TREE_WRITEUPS[id]
  if (doc?.body) return { body: doc.body, figures: [], isMarkdown: true }
  const meta = getTreeMeta(id)
  if (meta?.body) return { body: meta.body, figures: meta.figures || [], isMarkdown: false }
  return null
}

export function getTopicWriteup(slug) {
  return TOPIC_WRITEUPS[slug]?.body || null
}

export function getPageWriteup(key) {
  return PAGE_WRITEUPS[key] || null
}

export { SPECIES_WRITEUPS, TEAM, RESOURCES }
