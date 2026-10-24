import { readdir, stat } from 'node:fs/promises'
import { extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const directory = new URL('../src/media/', import.meta.url)
let inputBytes = 0
let outputBytes = 0
let count = 0

for (const file of await readdir(directory, { withFileTypes: true })) {
  if (!file.isFile() || !/\.(png|jpe?g)$/i.test(file.name)) continue
  const extension = extname(file.name)
  const input = new URL(file.name, directory)
  const outputName = `${basename(file.name, extension)}.webp`
  const output = new URL(outputName, directory)
  const result = await sharp(fileURLToPath(input)).webp({
    lossless: extension.toLowerCase() === '.png',
    quality: 85,
    effort: 6
  }).toFile(fileURLToPath(output))
  inputBytes += (await stat(input)).size
  outputBytes += result.size
  count++
  console.log(`${file.name} → ${outputName}`)
}

console.log(`Generated ${count} WebP copies; originals kept. ${Math.round(inputBytes / 1024)} KiB → ${Math.round(outputBytes / 1024)} KiB`)
