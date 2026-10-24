import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 4,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: ['chromium', 'webkit'].flatMap(browserName =>
    ['desktop', 'mobile'].flatMap(size =>
      ['light', 'dark'].map(colorScheme => ({
        name: `${browserName}-${size}-${colorScheme}`,
        use: {
          browserName,
          colorScheme,
          viewport: size === 'desktop' ? { width: 1440, height: 1000 } : { width: 390, height: 844 },
          isMobile: size === 'mobile',
          hasTouch: size === 'mobile'
        }
      }))
    )
  ),
  webServer: {
    command: 'npx domstack serve --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 60000
  }
})
