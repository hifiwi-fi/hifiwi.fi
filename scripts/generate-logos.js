import { readFile, writeFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const css = await readFile(new URL('../src/globals/global.css', import.meta.url), 'utf8')
const source = await readFile(new URL('../src/media/hifiwifi-logo-white-ink-alpha.png', import.meta.url))
const browser = await chromium.launch()

try {
  const page = await browser.newPage()
  await page.addStyleTag({ content: css.replace(/^@import .*;$/gm, '') })
  for (const [mode, variable] of [['light', '--light-link-text'], ['dark', '--dark-text']]) {
    const { png, color, socialPng, background } = await page.evaluate(async ({ source, variable, mode }) => {
      const swatch = document.createElement('span')
      swatch.style.color = `var(${variable})`
      swatch.style.backgroundColor = `var(--${mode}-background)`
      document.body.append(swatch)
      const color = window.getComputedStyle(swatch).color
      const background = window.getComputedStyle(swatch).backgroundColor
      swatch.remove()

      const image = new window.Image()
      image.src = source
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext('2d')
      context.drawImage(image, 0, 0)
      context.globalCompositeOperation = 'source-in'
      context.fillStyle = color
      context.fillRect(0, 0, canvas.width, canvas.height)
      const social = document.createElement('canvas')
      social.width = 1080
      social.height = 1080
      const socialContext = social.getContext('2d', { alpha: false })
      socialContext.fillStyle = background
      socialContext.fillRect(0, 0, social.width, social.height)
      socialContext.imageSmoothingQuality = 'high'
      const scale = 900 / Math.max(canvas.width, canvas.height)
      const width = canvas.width * scale
      const height = canvas.height * scale
      socialContext.drawImage(canvas, (1080 - width) / 2, (1080 - height) / 2, width, height)
      return { png: canvas.toDataURL('image/png'), color, socialPng: social.toDataURL('image/png'), background }
    }, { source: `data:image/png;base64,${source.toString('base64')}`, variable, mode })

    const filename = `hifiwifi-logo-theme-${mode}.png`
    await writeFile(new URL(`../src/media/${filename}`, import.meta.url), Buffer.from(png.split(',')[1], 'base64'))
    console.log(`${filename}: ${variable} = ${color}`)

    const socialFilename = `hifiwifi-social-${mode}.png`
    await writeFile(new URL(`../src/media/${socialFilename}`, import.meta.url), Buffer.from(socialPng.split(',')[1], 'base64'))
    console.log(`${socialFilename}: 1080×1080, ${color} on ${background}, opaque`)
  }
} finally {
  await browser.close()
}
