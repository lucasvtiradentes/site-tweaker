import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const iconsDir = path.join(__dirname, '../public/icons')

const sizes = [16, 32, 48, 128]

function createSvg(size, enabled) {
  const color = enabled ? '#4ade80' : '#666'
  const shieldPath = `
    M12 2L4 6v6c0 5.25 3.4 10.15 8 11.25C16.6 22.15 20 17.25 20 12V6l-8-4z
  `
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="${shieldPath.trim()}" fill="${color}" stroke="${enabled ? '#22c55e' : '#444'}" stroke-width="1"/>
  ${enabled ? '<path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' : '<path d="M9 9l6 6M15 9l-6 6" stroke="#444" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'}
</svg>`
}

function svgToPngDataUrl(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

for (const size of sizes) {
  const enabledSvg = createSvg(size, true)
  const disabledSvg = createSvg(size, false)

  fs.writeFileSync(path.join(iconsDir, `icon-${size}.svg`), enabledSvg)
  fs.writeFileSync(path.join(iconsDir, `icon-${size}-disabled.svg`), disabledSvg)
}

console.log('SVG icons generated! Convert to PNG using:')
console.log('for f in public/icons/*.svg; do convert "$f" "${f%.svg}.png"; done')
