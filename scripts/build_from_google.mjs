import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { google } from 'googleapis'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const APP = path.join(__dirname, '..')

const KEY =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(APP, '..', 'keys', 'sacred-canopy-505117-fa064c556d60.json')
const SHEET_ID = '1w-BNQ2QL8kDA5YDB-lcgRV_a5qzU0N97aONyR7-wi9s'
const FOLDER_ID = '17fcu4dgpTR6ro6UVKD56gbHCOGJp0zJ4'

const TREES_JS = path.join(APP, 'src', 'data', 'trees.js')
const IMG_ROOT = path.join(APP, 'public', 'images', 'trees')

const auth = new google.auth.GoogleAuth({
  ...(process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    ? { credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON) }
    : { keyFile: KEY }),
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
  ],
})
const sheets = google.sheets({ version: 'v4', auth })
const drive = google.drive({ version: 'v3', auth })

const num = (v) => (v === '' || v == null || isNaN(Number(v)) ? null : Number(v))

const MAX_DIM = 1400
const JPEG_QUALITY = 80

async function optimizeImage(file) {
  const tmp = file + '.tmp'
  const pipeline = sharp(file).resize({
    width: MAX_DIM,
    height: MAX_DIM,
    fit: 'inside',
    withoutEnlargement: true,
  })
  const encoded = /\.png$/i.test(file)
    ? pipeline.png()
    : pipeline.jpeg({ quality: JPEG_QUALITY })
  await encoded.toFile(tmp)
  fs.renameSync(tmp, file)
}

async function readSheet() {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1' })
  const [header, ...rows] = res.data.values
  return rows
    .filter((r) => r[0])
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])))
}

async function listTreeFolders() {
  const res = await drive.files.list({
    q: `'${FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id,name)',
    pageSize: 200,
    orderBy: 'name',
  })
  return (res.data.files || []).filter((f) => !f.name.startsWith('_'))
}

async function listImages(folderId) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
    fields: 'files(id,name)',
    pageSize: 200,
    orderBy: 'name',
  })
  return res.data.files || []
}

async function download(fileId, dest) {
  const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' })
  await new Promise((resolve, reject) => {
    const out = fs.createWriteStream(dest)
    res.data.on('error', reject).pipe(out)
    out.on('finish', resolve).on('error', reject)
  })
}

function loadExisting() {
  const src = fs.readFileSync(TREES_JS, 'utf8')
  const s = src.indexOf('const _allTrees ='),
    e = src.indexOf('export const allTrees')
  const existing = new Function(src.slice(s, e).replace(/^const _allTrees =/, 'return '))()
  const byId = Object.fromEntries(existing.map((t) => [t.id, t]))
  const tail = src.slice(e)
  return { byId, tail, raw: src }
}

async function main() {
  const { byId, tail, raw } = loadExisting()
  fs.writeFileSync(TREES_JS.replace(/\.js$/, `.backup-${Date.now()}.js`), raw)

  const sheet = await readSheet()
  const folders = await listTreeFolders()
  const folderByName = Object.fromEntries(folders.map((f) => [f.name, f.id]))
  console.log(`Sheet rows: ${sheet.length}   Drive tree folders: ${folders.length}`)

  fs.rmSync(IMG_ROOT, { recursive: true, force: true })
  fs.mkdirSync(IMG_ROOT, { recursive: true })

  const records = []
  let withPhotos = 0,
    downloaded = 0
  for (const row of sheet) {
    const id = row.id.trim()
    const prev = byId[id] || {}
    let images = []
    const fid = folderByName[id]
    if (fid) {
      const imgs = await listImages(fid)
      if (imgs.length) {
        const dir = path.join(IMG_ROOT, id)
        fs.mkdirSync(dir, { recursive: true })
        for (const im of imgs) {
          const dest = path.join(dir, im.name)
          await download(im.id, dest)
          await optimizeImage(dest)
          downloaded++
          images.push(`/images/trees/${id}/${im.name}`)
        }
        withPhotos++
      }
    }
    const first = images[0] ?? null
    records.push({
      id,
      title: row.common_name || prev.title || row.vernacular,
      date: prev.date ?? '2026-04-25',
      author: prev.author ?? '',
      site_name: row.site_name,
      location: row.location,
      latitude: num(row.latitude),
      longitude: num(row.longitude),
      desa_adat: row.desa_adat,
      subjects: prev.subjects ?? [],
      description: prev.description ?? '',
      species: row.species,
      vernacular: row.vernacular,
      trunk_circumference: num(row.trunk_circumference_cm),
      height: num(row.height_m),
      crown_spread: num(row.crown_spread_m),
      year_measured: num(row.year_measured),
      image: first,
      image_2013: prev.image_2013 ?? null,
      image_2025: first,
      images,
      biometric_photos: [],
    })
  }

  const out = `// AUTO-GENERATED from Google Sheet + Drive by scripts/build_from_google.mjs\n// Do not hand-edit _allTrees; edit the Google Sheet instead.\nconst _allTrees = ${JSON.stringify(records, null, 2)}\n\n${tail}`
  fs.writeFileSync(TREES_JS, out)

  console.log(`\n✅ Wrote ${records.length} trees to src/data/trees.js`)
  console.log(`   ${withPhotos} trees have photos, ${downloaded} images downloaded`)
  console.log(`   (backup saved next to trees.js; TREE_META narrative preserved)`)
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
