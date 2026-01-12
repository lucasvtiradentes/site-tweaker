import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const iconsDir = path.join(rootDir, 'public/icons')

const sizes = [16, 32, 48, 128]

type IconState = 'active' | 'outline' | 'disabled'

function createSvg(size: number, state: IconState): string {
  const shieldPath = 'M12 2L4 6v6c0 5.25 3.4 10.15 8 11.25C16.6 22.15 20 17.25 20 12V6l-8-4z'

  if (state === 'active') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="${shieldPath}" fill="#4ade80" stroke="#22c55e" stroke-width="1"/>
  <path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  }

  if (state === 'outline') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="${shieldPath}" fill="none" stroke="#4ade80" stroke-width="2"/>
  <path d="M9 12l2 2 4-4" stroke="#4ade80" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="${shieldPath}" fill="#666" stroke="#444" stroke-width="1"/>
  <path d="M9 9l6 6M15 9l-6 6" stroke="#444" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
}

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

for (const size of sizes) {
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.svg`), createSvg(size, 'active'))
  fs.writeFileSync(path.join(iconsDir, `icon-${size}-outline.svg`), createSvg(size, 'outline'))
  fs.writeFileSync(path.join(iconsDir, `icon-${size}-disabled.svg`), createSvg(size, 'disabled'))
}

console.log('SVG icons generated! Convert to PNG using:')
console.log('for f in public/icons/*.svg; do convert -background none "$f" "${f%.svg}.png"; done')
