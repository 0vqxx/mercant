const fs = require('fs')
const path = require('path')

const openNextDir = path.join(__dirname, '..', '.open-next')
const assetsDir = path.join(openNextDir, 'assets')

// 1. Copy all static files from .open-next/assets to .open-next root
if (fs.existsSync(assetsDir)) {
  fs.cpSync(assetsDir, openNextDir, { recursive: true })
  console.log('Copied static assets to .open-next root.')
}

// 2. Rename worker.js to _worker.js in .open-next root so it sits next to its chunks
const workerSrc = path.join(openNextDir, 'worker.js')
const workerDest = path.join(openNextDir, '_worker.js')
if (fs.existsSync(workerSrc)) {
  fs.copyFileSync(workerSrc, workerDest)
  console.log('Created .open-next/_worker.js')
}

console.log('Successfully prepared .open-next bundle for Cloudflare Pages!')
