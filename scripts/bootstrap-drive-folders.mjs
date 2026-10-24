/**
 * bootstrap-drive-folders.mjs
 * ---------------------------------------------------------------------------
 * Creates one Google Drive folder per tree, named by full tree ID
 * (e.g. "BD.KT.KT.01"), under a single parent folder you designate.
 *
 * Scope: ALL trees across ALL sites in src/data/trees.js — including trees
 * that have no photos yet (those folders sit empty, ready for researchers
 * to upload into). Tree IDs are read straight from trees.js so this stays
 * in sync with the dataset; re-running is safe (idempotent — existing
 * folders are detected and skipped, never duplicated).
 *
 * ---------------------------------------------------------------------------
 * ONE-TIME SETUP (done by you, ~5 min):
 *   1. In Google Cloud Console, create a Service Account and download its
 *      JSON key. Enable the "Google Drive API" for that project.
 *   2. In Google Drive (Workspace), create/choose the PARENT folder that will
 *      hold all the per-tree folders, and SHARE it with the service account's
 *      email (…@…​.iam.gserviceaccount.com) as "Editor".
 *   3. Copy the parent folder's ID from its URL:
 *        https://drive.google.com/drive/folders/<THIS_IS_THE_ID>
 *
 * RUN:
 *   npm install googleapis
 *   GOOGLE_APPLICATION_CREDENTIALS=/abs/path/to/key.json \
 *   DRIVE_PARENT_FOLDER_ID=<parent-folder-id> \
 *   node scripts/bootstrap-drive-folders.mjs
 *
 *   Add --dry-run to list what WOULD be created without touching Drive.
 * ---------------------------------------------------------------------------
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
// NOTE: `googleapis` is imported lazily inside getDrive() so that --dry-run
// works before you've run `npm install googleapis`.

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// --- Config -----------------------------------------------------------------
const KEY_FILE = process.env.GOOGLE_APPLICATION_CREDENTIALS
const PARENT_ID = process.env.DRIVE_PARENT_FOLDER_ID
const DRY_RUN = process.argv.includes('--dry-run')
const FOLDER_MIME = 'application/vnd.google-apps.folder'

// --- Read tree IDs from the real dataset ------------------------------------
function readTreeIds() {
  const file = path.join(__dirname, '..', 'src', 'data', 'trees.js')
  const src = fs.readFileSync(file, 'utf8')
  const start = src.indexOf('const _allTrees =')
  const end = src.indexOf('export const allTrees')
  if (start === -1 || end === -1) {
    throw new Error('Could not locate _allTrees array in trees.js')
  }
  const arr = new Function(src.slice(start, end).replace(/^const _allTrees =/, 'return '))()
  // ALL trees, every site, regardless of whether they have photos.
  return arr.map((t) => t.id)
}

// --- Drive helpers ----------------------------------------------------------
async function getDrive() {
  const { google } = await import('googleapis')
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
  return google.drive({ version: 'v3', auth })
}

async function findFolder(drive, name) {
  const q = [
    `name = '${name.replace(/'/g, "\\'")}'`,
    `mimeType = '${FOLDER_MIME}'`,
    `'${PARENT_ID}' in parents`,
    'trashed = false',
  ].join(' and ')
  const res = await drive.files.list({
    q,
    fields: 'files(id, name)',
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  })
  return res.data.files?.[0] ?? null
}

async function createFolder(drive, name) {
  const res = await drive.files.create({
    requestBody: { name, mimeType: FOLDER_MIME, parents: [PARENT_ID] },
    fields: 'id, name',
    supportsAllDrives: true,
  })
  return res.data
}

// --- Main -------------------------------------------------------------------
async function main() {
  const ids = readTreeIds()
  console.log(`Found ${ids.length} trees (all sites) in trees.js`)

  if (DRY_RUN) {
    console.log('\n[dry-run] Folders that would exist under the parent:')
    ids.forEach((id) => console.log(`  /${id}`))
    console.log(`\n[dry-run] ${ids.length} folders. No changes made.`)
    return
  }

  if (!KEY_FILE || !PARENT_ID) {
    console.error(
      'Missing config. Set GOOGLE_APPLICATION_CREDENTIALS and DRIVE_PARENT_FOLDER_ID.\n' +
        'See the setup notes at the top of this file. (Tip: run with --dry-run first.)',
    )
    process.exit(1)
  }

  const drive = await getDrive()
  let created = 0
  let existed = 0

  for (const id of ids) {
    const existing = await findFolder(drive, id)
    if (existing) {
      existed++
      console.log(`= exists   ${id}  (${existing.id})`)
    } else {
      const folder = await createFolder(drive, id)
      created++
      console.log(`+ created  ${id}  (${folder.id})`)
    }
  }

  console.log(`\nDone. ${created} created, ${existed} already existed, ${ids.length} total.`)
}

main().catch((err) => {
  console.error('\nFailed:', err.message)
  process.exit(1)
})
