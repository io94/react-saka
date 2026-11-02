import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { google } from 'googleapis'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const KEY =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, '..', '..', 'keys', 'sacred-canopy-505117-fa064c556d60.json')
const SHEET_ID = '1w-BNQ2QL8kDA5YDB-lcgRV_a5qzU0N97aONyR7-wi9s'
const FOLDER_ID = '17fcu4dgpTR6ro6UVKD56gbHCOGJp0zJ4'

const auth = new google.auth.GoogleAuth({
  keyFile: KEY,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
  ],
})

const sheets = google.sheets({ version: 'v4', auth })
const drive = google.drive({ version: 'v3', auth })

async function inspectSheet() {
  console.log('===== SHEET =====')
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID })
  console.log('Title:', meta.data.properties.title)
  const tabs = meta.data.sheets.map((s) => s.properties.title)
  console.log('Tabs:', tabs.join(', '))
  const tab = tabs[0]
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A1:AZ4`,
  })
  const rows = res.data.values || []
  console.log(`\nFirst tab "${tab}" — header + sample:`)
  rows.forEach((r, i) => console.log(`  r${i + 1}: ${r.join(' | ')}`))
  // total data rows
  const all = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A1:A100000`,
  })
  console.log(`\nApprox rows in column A: ${(all.data.values || []).length}`)
}

async function inspectFolder() {
  console.log('\n===== DRIVE FOLDER =====')
  const res = await drive.files.list({
    q: `'${FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
    pageSize: 200,
    orderBy: 'name',
  })
  const subs = res.data.files || []
  console.log(`Sub-folders (trees): ${subs.length}`)
  console.log('  sample:', subs.slice(0, 6).map((f) => f.name).join(', '))
  // count images in first non-empty sub-folder
  for (const sub of subs) {
    const imgs = await drive.files.list({
      q: `'${sub.id}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name)',
      pageSize: 100,
    })
    const n = (imgs.data.files || []).length
    if (n > 0) {
      console.log(`  e.g. ${sub.name}: ${n} images (first: ${imgs.data.files[0].name})`)
      break
    }
  }
}

try {
  await inspectSheet()
  await inspectFolder()
  console.log('\n✅ Google API connection works.')
} catch (e) {
  console.error('\n❌ Failed:', e.message)
  if (String(e).includes('403') || String(e.message).includes('permission'))
    console.error('   → Likely: Sheet/folder not shared with saka-service@sacred-canopy-505117.iam.gserviceaccount.com')
  process.exit(1)
}
