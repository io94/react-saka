// AUTO-SYNC write-ups (standalone)
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

const OUT_JS = path.join(APP, 'src', 'data', 'writeups.generated.js')
const IMG_ROOT = path.join(APP, 'public', 'images', 'writeups') 
const IMG_URL_BASE = '/images/writeups'

const auth = new google.auth.GoogleAuth({
  ...(process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    ? { credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON) }
    : { keyFile: KEY }),
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/documents.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
  ],
})
const sheets = google.sheets({ version: 'v4', auth })
const docs = google.docs({ version: 'v1', auth })

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

// ---- Sheet reading ----
async function readTab(range) {
  try {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range })
    const rows = res.data.values || []
    if (rows.length < 1) return []
    const [header, ...rest] = rows
    return rest
      .filter((r) => r.some((c) => String(c ?? '').trim()))
      .map((r) => Object.fromEntries(header.map((h, i) => [String(h).trim(), r[i] ?? ''])))
  } catch {
    console.warn(`   (tab "${range}" not found — skipping)`)
    return []
  }
}

const docIdFromUrl = (url) => {
  const m = String(url || '').match(/\/d\/([-\w]{25,})/) || String(url || '').match(/[-\w]{25,}/)
  return m ? (m[1] || m[0]) : null
}

function isPlaceholderGray(ts) {
  const c = ts?.foregroundColor?.color?.rgbColor
  if (!c) return false
  const near = (v) => v != null && v > 0.4 && v < 0.55
  return near(c.red) && near(c.green) && near(c.blue) &&
    Math.abs(c.red - c.green) < 0.06 && Math.abs(c.green - c.blue) < 0.06
}

function styleRun(text, ts) {
  let t = text
  if (ts.bold) t = `**${t}**`
  if (ts.italic) t = `_${t}_`
  const url = ts.link?.url
  if (url) t = `[${t}](${url})`
  return t
}

const HEADING_PREFIX = {
  HEADING_1: '# ', HEADING_2: '## ', HEADING_3: '### ',
  HEADING_4: '#### ', HEADING_5: '##### ', HEADING_6: '###### ',
  TITLE: '# ', SUBTITLE: '## ',
}

// A wrapped image's float side, from its horizontal offset vs. the page content width.
function floatSide(doc, po) {
  const ds = doc.documentStyle || {}
  const contentW =
    (ds.pageSize?.width?.magnitude || 612) -
    (ds.marginLeft?.magnitude || 72) -
    (ds.marginRight?.magnitude || 72)
  const pos = po.positionedObjectProperties?.positioning || {}
  const left = pos.leftOffset?.magnitude || 0
  const w = po.positionedObjectProperties?.embeddedObject?.size?.width?.magnitude || 0
  return left + w / 2 >= contentW / 2 ? 'right' : 'left'
}

// One table cell has its image + caption (side-by-side display).
function cellImageAndCaption(cell, inlineObjects) {
  let uri = null
  let italicCaption = ''
  let anyText = ''
  for (const ce of cell.content || []) {
    const para = ce.paragraph
    if (!para) continue
    let text = ''
    let allItalic = true
    let had = false
    for (const pe of para.elements || []) {
      if (pe.inlineObjectElement) {
        const io = inlineObjects[pe.inlineObjectElement.inlineObjectId]
        const u = io?.inlineObjectProperties?.embeddedObject?.imageProperties?.contentUri
        if (u) uri = u
      } else if (pe.textRun) {
        const c = (pe.textRun.content || '').replace(/\n/g, '')
        if (!c) continue
        had = true
        if (!pe.textRun.textStyle?.italic) allItalic = false
        text += c
      }
    }
    if (had) {
      if (allItalic && !italicCaption) italicCaption = text.trim()
      if (!anyText) anyText = text.trim()
    }
  }
  return { uri, caption: italicCaption || anyText }
}

function docToBlocks(doc) {
  const content = doc.body?.content || []
  const inlineObjects = doc.inlineObjects || {}
  const positioned = doc.positionedObjects || {}
  const blocks = []
  for (const el of content) {
    // Setup a table of images → 
    if (el.table) {
      for (const row of el.table.tableRows || []) {
        for (const cell of row.tableCells || []) {
          const { uri, caption } = cellImageAndCaption(cell, inlineObjects)
          if (uri) blocks.push({ type: 'image', uri, group: true, caption })
        }
      }
      continue
    }
    const p = el.paragraph
    if (!p) continue
    for (const poId of p.positionedObjectIds || []) {
      const po = positioned[poId]
      const uri = po?.positionedObjectProperties?.embeddedObject?.imageProperties?.contentUri
      if (!uri) continue
      const layout = po.positionedObjectProperties?.positioning?.layout
      const floatable = layout === 'WRAP_TEXT' || layout === 'BREAK_LEFT' || layout === 'BREAK_RIGHT'
      blocks.push({ type: 'image', uri, float: floatable ? floatSide(doc, po) : null })
    }
    const named = p.paragraphStyle?.namedStyleType || 'NORMAL_TEXT'
    let md = ''
    let plain = ''
    let hadText = false
    let allItalic = true
    let imageUri = null

    for (const pe of p.elements || []) {
      if (pe.textRun) {
        const ts = pe.textRun.textStyle || {}
        if (isPlaceholderGray(ts)) continue // skip starter-template hint text
        const clean = (pe.textRun.content || '').replace(/\n/g, '')
        if (!clean) continue
        hadText = true
        if (!ts.italic) allItalic = false
        md += styleRun(clean, ts)
        plain += clean
      } else if (pe.inlineObjectElement) {
        const io = inlineObjects[pe.inlineObjectElement.inlineObjectId]
        const uri = io?.inlineObjectProperties?.embeddedObject?.imageProperties?.contentUri
        if (uri) imageUri = uri
      }
    }

    if (imageUri) {
      blocks.push({ type: 'image', uri: imageUri })
      continue
    }
    if (!hadText) continue
    if (named === 'TITLE' || named === 'SUBTITLE') continue
    const trimmed = plain.trim()
    blocks.push({
      type: 'para',
      md,
      plain: trimmed,
      heading: HEADING_PREFIX[named] || null,
      italicOnly: allItalic,
      bullet: !!p.bullet,
      isMarker: /^\[\[\s*INSERT IMAGE/i.test(trimmed),
    })
  }
  return blocks
}

// A Doc counts as written only if it has real content
function hasRealContent(blocks) {
  return blocks.some(
    (b) =>
      b.type === 'image' ||
      (b.type === 'para' && !b.heading && !b.italicOnly && !b.isMarker && b.plain),
  )
}

async function downloadFigure(uri, kind, slug, n) {
  const res = await fetch(uri)
  if (!res.ok) throw new Error(`figure fetch ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const ct = res.headers.get('content-type') || ''
  const ext = ct.includes('png') ? 'png'
    : ct.includes('gif') ? 'gif'
    : ct.includes('webp') ? 'webp'
    : 'jpg'
  const dir = path.join(IMG_ROOT, kind, slug)
  fs.mkdirSync(dir, { recursive: true })
  const name = `fig-${String(n).padStart(2, '0')}.${ext}`
  const dest = path.join(dir, name)
  fs.writeFileSync(dest, buf)
  await optimizeImage(dest)
  return `${IMG_URL_BASE}/${kind}/${slug}/${name}`
}

async function blocksToMarkdown(blocks, kind, slug) {
  let lastImg = null
  for (const b of blocks) {
    if (b.type === 'image') {
      if (!b.caption) b.caption = '' 
      lastImg = b
      continue
    }
    if (b.type !== 'para') continue
    if (b.isMarker) {
      b.consumed = true
      continue
    }
    if (b.italicOnly && !b.heading && lastImg && !lastImg.caption) {
      lastImg.caption = b.plain.replace(/\s+/g, ' ').trim()
      b.consumed = true
      lastImg = null
    }
  }

  const lines = []
  let figN = 0
  for (const b of blocks) {
    if (b.type === 'image') {
      try {
        const src = await downloadFigure(b.uri, kind, slug, ++figN)
        const hint = b.group ? 'group' : b.float ? `float-${b.float}` : ''
        const title = hint ? ` "${hint}"` : ''
        lines.push(`![${(b.caption || '').replace(/[\[\]]/g, '')}](${src}${title})`)
      } catch (e) {
        console.warn(`   figure skipped (${kind}/${slug}): ${e.message}`)
      }
      continue
    }
    if (b.consumed || b.isMarker) continue
    if (b.heading) lines.push(b.heading + b.md)
    else if (b.bullet) lines.push('- ' + b.md)
    else lines.push(b.md)
  }
  return lines.join('\n\n').trim()
}

async function docUrlToMarkdown(url, kind, slug) {
  const id = docIdFromUrl(url)
  if (!id) return null
  fs.rmSync(path.join(IMG_ROOT, kind, slug), { recursive: true, force: true })
  const { data } = await docs.documents.get({ documentId: id })
  const blocks = docToBlocks(data)
  if (!hasRealContent(blocks)) return null 
  const md = await blocksToMarkdown(blocks, kind, slug)
  return md || null
}

// ---- main ----
async function main() {
  fs.rmSync(IMG_ROOT, { recursive: true, force: true })
  fs.mkdirSync(IMG_ROOT, { recursive: true })

  const trees = await readTab('Sheet1')

  const TREE_WRITEUPS = {}
  const SPECIES_WRITEUPS = {}

  let count = 0
  for (const t of trees) {
    const id = String(t.id).trim()
    if (!id || !t.writeup_doc) continue
    const body = await docUrlToMarkdown(t.writeup_doc, 'trees', id)
    if (body) { TREE_WRITEUPS[id] = { body }; count++ }
  }
  for (const s of species) {
    if (!s.slug || !s.doc_url) continue
    const body = await docUrlToMarkdown(s.doc_url, 'species', String(s.slug).trim())
    if (body) { SPECIES_WRITEUPS[String(s.slug).trim()] = { body }; count++ }
  }
  for (const t of topics) {
    if (!t.slug || !t.doc_url) continue
    const body = await docUrlToMarkdown(t.doc_url, 'topics', String(t.slug).trim())
    if (body) { TOPIC_WRITEUPS[String(t.slug).trim()] = { body }; count++ }
  }
  for (const p of pages) {
    const key = String(p.page || '').trim()
    if (!key || !p.doc_url) continue
    const body = await docUrlToMarkdown(p.doc_url, 'pages', key)
    if (body) { PAGE_WRITEUPS[key] = body; count++ }
  }

  const TEAM = teamRows
    .filter((r) => String(r.name || '').trim())
    .map((r) => ({
      name: String(r.name).trim(),
      role: String(r.role || '').trim(),
      photo: String(r.photo || '').trim() || null,
      bio: String(r.bio || '').trim(),
    }))

  const RESOURCES = resourceRows
    .filter((r) => String(r.title || '').trim())
    .map((r) => ({
      title: String(r.title).trim(),
      url: String(r.url || '').trim(),
      description: String(r.description || '').trim(),
    }))


  const SPECIES_SLUGS = {}
  for (const s of species) {
    const name = String(s.name || '').trim()
    const slug = String(s.slug || '').trim()
    if (name && slug) SPECIES_SLUGS[name] = slug
  }

  const banner = '// AUTO-GENERATED by scripts/sync_writeups.mjs — do not hand-edit.\n\n'
  const out = banner +
    `export const TREE_WRITEUPS = ${JSON.stringify(TREE_WRITEUPS, null, 2)}\n\n` +
    `export const SPECIES_WRITEUPS = ${JSON.stringify(SPECIES_WRITEUPS, null, 2)}\n\n` +
    `export const SPECIES_SLUGS = ${JSON.stringify(SPECIES_SLUGS, null, 2)}\n`
  fs.writeFileSync(OUT_JS, out)
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
