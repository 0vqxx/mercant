const fs = require('fs')
const path = require('path')

const rootDir = path.join(__dirname, '..')
const openNextDir = path.join(rootDir, '.open-next')
const assetsDir = path.join(openNextDir, 'assets')
const publicDir = path.join(rootDir, 'public')

// 1. Copy all static files from .open-next/assets to .open-next root
if (fs.existsSync(assetsDir)) {
  fs.cpSync(assetsDir, openNextDir, { recursive: true })
  console.log('Copied static assets from .open-next/assets to .open-next root.')
}

// 2. Copy public directory assets directly into .open-next root
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, openNextDir, { recursive: true })
  console.log('Copied public folder files to .open-next root.')
}

// 3. Rename worker.js to _worker.js in .open-next root so it sits next to its chunks
const workerSrc = path.join(openNextDir, 'worker.js')
const workerDest = path.join(openNextDir, '_worker.js')
if (fs.existsSync(workerSrc)) {
  fs.copyFileSync(workerSrc, workerDest)
  console.log('Created .open-next/_worker.js')
}

// 4. Create _routes.json so Cloudflare Pages serves CSS, JS, and images as pure static assets
const routesConfig = {
  version: 1,
  include: ['/*'],
  exclude: [
    '/_next/static/*',
    '/favicon.ico',
    '/*.png',
    '/*.jpg',
    '/*.jpeg',
    '/*.svg',
    '/*.webp',
    '/*.gif',
    '/*.ico',
    '/*.txt',
    '/*.woff',
    '/*.woff2',
  ],
}
fs.writeFileSync(
  path.join(openNextDir, '_routes.json'),
  JSON.stringify(routesConfig, null, 2),
  'utf8',
)
console.log('Created .open-next/_routes.json for static asset routing.')

// 5. Patch any unresolvable node:sqlite references in bundled files
function patchFiles(dir) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      patchFiles(fullPath)
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) {
      let content = fs.readFileSync(fullPath, 'utf8')
      if (content.includes('node:sqlite')) {
        content = content.replace(/require\(["']node:sqlite["']\)/g, '{}')
        fs.writeFileSync(fullPath, content, 'utf8')
        console.log('Patched node:sqlite in ' + entry.name)
      }
    }
  }
}

patchFiles(openNextDir)

console.log('Successfully prepared .open-next bundle for Cloudflare Pages!')
