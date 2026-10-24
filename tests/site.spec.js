import { test, expect } from '@playwright/test'

const pages = [
  { name: 'home', path: '/', heading: 'HifiWi.fi' },
  { name: 'blog', path: '/blog/', heading: 'Recent Blog Posts' },
  { name: 'archive-2023', path: '/blog/2023/', heading: '2023 Blog Posts' },
  { name: 'archive-2025', path: '/blog/2025/', heading: '2025 Blog Posts' },
  { name: 'introduction', path: '/blog/2023/introducing-hifiwifi/' },
  { name: 'gumcast', path: '/blog/2025/gumcast-ceases-operation/' }
]

for (const entry of pages) {
  test(entry.name, async ({ page, baseURL, colorScheme, browserName }, testInfo) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text())
    })
    page.on('response', response => {
      if (response.url().startsWith(baseURL) && response.status() >= 400) {
        errors.push(`${response.status()} ${response.url()}`)
      }
    })
    // Keep local verification deterministic and avoid recording analytics visits.
    await page.route('**/*', route => {
      if (new URL(route.request().url()).origin === baseURL) return route.continue()
      return route.fulfill({ status: 200, body: '', contentType: 'text/plain' })
    })

    const response = await page.goto(entry.path)
    expect(response.status()).toBe(200)
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('h1')).toHaveCount(1)
    if (entry.heading) await expect(page.locator('h1')).toHaveAccessibleName(entry.heading)
    if (entry.name === 'home') {
      await expect(page.locator('h1 .site-logo img')).toHaveAttribute('alt', 'HifiWi.fi')
      await expect(page.locator('h1')).toHaveText('')
      await expect(page.locator('h1 + p')).toHaveText('High-fidelity internet products. Welcome.')
      const mark = page.locator('.site-logo')
      if (colorScheme === 'dark') {
        const textColor = await page.locator('body').evaluate(element => window.getComputedStyle(element).color)
        await expect(mark).toHaveCSS('background-color', textColor)
        expect(await mark.evaluate(element => window.getComputedStyle(element).maskImage)).toContain('hifiwifi-logo-white-ink-alpha.png')
        await expect(mark.locator('img')).toHaveCSS('opacity', '0')
      } else {
        await expect(mark).toHaveCSS('mask-image', 'none')
        await expect(mark.locator('img')).toHaveCSS('opacity', '1')
      }
    }
    await expect(page.locator('body > footer')).toBeVisible()
    await expect(page.locator('link[rel="stylesheet"][href*="globals/global-"]')).toHaveCount(1)
    await expect(page.locator('link[href*="domstack-defaults"]')).toHaveCount(0)
    await page.evaluate(() => document.fonts.ready)

    const layout = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      brokenImages: [...document.images].filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src),
      dark: window.matchMedia('(prefers-color-scheme: dark)').matches,
      background: window.getComputedStyle(document.body).getPropertyValue('--background').trim(),
      expectedBackground: window.getComputedStyle(document.body).getPropertyValue(
        window.matchMedia('(prefers-color-scheme: dark)').matches ? '--dark-background' : '--light-background'
      ).trim()
    }))
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width)
    expect(layout.brokenImages).toEqual([])
    expect(layout.dark).toBe(colorScheme === 'dark')
    expect(layout.background).not.toBe('')
    expect(layout.background).toBe(layout.expectedBackground)
    expect(errors).toEqual([])
    expect(await page.locator('html').evaluate(element => window.getComputedStyle(element).backgroundImage)).not.toBe('none')
    await expect(page.locator('html')).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')

    const logo = page.locator('.site-logo img, .author-info img')
    if (await logo.count()) {
      const ink = colorScheme === 'dark' ? 'white' : 'blue'
      expect(await logo.evaluate(image => image.currentSrc)).toContain(`hifiwifi-logo-${ink}-ink-alpha.png`)
    }

    await page.screenshot({ path: testInfo.outputPath(`${entry.name}.png`), fullPage: true })
    await testInfo.attach(entry.name, { path: testInfo.outputPath(`${entry.name}.png`), contentType: 'image/png' })

    // WebKit on macOS uses Option-Tab to include links in keyboard navigation.
    await page.keyboard.press(browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab')
    await expect(page.locator(':focus')).toBeVisible()
    const focusVisible = await page.locator(':focus').evaluate(element => {
      const style = window.getComputedStyle(element)
      return element.matches(':focus-visible') && style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
    })
    expect(focusVisible).toBe(true)

    if (entry.name === 'home') {
      const oppositeScheme = colorScheme === 'dark' ? 'light' : 'dark'
      await page.emulateMedia({ colorScheme: oppositeScheme })
      const oppositeInk = oppositeScheme === 'dark' ? 'white' : 'blue'
      await expect.poll(() => logo.evaluate(image => image.currentSrc)).toContain(`hifiwifi-logo-${oppositeInk}-ink-alpha.png`)

      await page.emulateMedia({ media: 'print', colorScheme: 'dark' })
      await expect(logo).toHaveCSS('filter', 'brightness(0)')
      await expect(logo).toHaveCSS('opacity', '1')
      await expect(page.locator('.site-logo')).toHaveCSS('mask-image', 'none')
      await expect(page.locator('html')).toHaveCSS('background-image', 'none')
      await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
      await expect(page.locator('body')).toHaveCSS('background-image', 'none')
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    }
  })
}
