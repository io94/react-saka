import {
  TREE_WRITEUPS,
  SPECIES_WRITEUPS,
} from './writeups.generated.js'

export function getTreeWriteup(id) {
  const doc = TREE_WRITEUPS[id]
  if (doc?.body) return { body: doc.body, figures: [], isMarkdown: true }
  return null
}

export { SPECIES_WRITEUPS, }
