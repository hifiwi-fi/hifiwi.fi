import { mkdir, writeFile, copyFile } from 'node:fs/promises'
import { join } from 'node:path'
import { favicons } from 'favicons'
import config from '../favicon-config.js'

const result = await favicons(config.source, config.faviconConfig)
await mkdir(config.dest, { recursive: true })
await Promise.all([
  ...result.images.map(image => writeFile(join(config.dest, image.name), image.contents)),
  ...result.files.map(file => writeFile(join(config.dest, file.name), file.contents)),
  writeFile(join(config.dest, 'snippets.html'), result.html.join('\n') + '\n')
])
await copyFile(join(config.dest, 'favicon.ico'), './src/favicon.ico')
console.log(`Generated ${result.images.length} icons from ${config.source}`)
