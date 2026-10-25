import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.removeItem('hypotrophy-tasks')
    localStorage.removeItem('hypotrophy-insights')
  })
  await page.reload()
  await expect(page.getByRole('heading', { name: /a life, built by showing up/i })).toBeVisible()
})

test('create and complete a practice and visit field notes', async ({ page }) => {
  const title = 'Walk 20 minutes today'

  await page.getByRole('textbox', { name: /describe a promise/i }).fill(title)
  await page.getByRole('button', { name: /add this practice/i }).click()
  await expect(page.getByRole('heading', { name: title })).toBeVisible()

  await page.getByRole('button', { name: `Complete ${title}` }).click()
  await expect(page.getByRole('button', { name: `Reopen ${title}` })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText('Overall Progress')).toBeVisible()

  await page.getByRole('button', { name: /field notes/i }).click()
  await expect(page.getByRole('heading', { name: 'Field notes' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /notes from biscuit/i })).toBeVisible()
})

test('renders the editorial workspace without horizontal overflow', async ({ page }, testInfo) => {
  await expect(page.getByRole('navigation', { name: 'Your workspace' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: /describe a promise/i })).toBeVisible()
  await expect(page.getByRole('complementary', { name: /your progress and companion/i })).toBeVisible()

  const sizes = testInfo.project.name.startsWith('mobile')
    ? [{ width: 375, height: 812 }, { width: 320, height: 720 }]
    : [{ width: 1440, height: 1000 }, { width: 768, height: 1024 }]

  for (const size of sizes) {
    await page.setViewportSize(size)
    const widths = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(widths.content, `No horizontal overflow at ${size.width}px`).toBeLessThanOrEqual(widths.viewport)
    await page.screenshot({
      path: `test-results/design-review-${testInfo.project.name}-${size.width}px.png`,
      fullPage: true,
    })
  }
})

test('shows disabled submit clearly and with readable contrast', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Add this practice' })
  await expect(button).toBeDisabled()

  const state = await button.evaluate(element => {
    const style = getComputedStyle(element)
    const channels = (value: string) => value.match(/[\d.]+/g)!.map(Number)
    const luminance = (rgb: number[]) => {
      const linear = rgb.map(value => {
        const channel = value / 255
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
    }
    const foreground = luminance(channels(style.color))
    const background = luminance(channels(style.backgroundColor))
    return {
      cursor: style.cursor,
      contrast: (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05),
    }
  })

  expect(state.cursor).toBe('not-allowed')
  expect(state.contrast).toBeGreaterThanOrEqual(4.5)
})

test('makes the primary action readable and available once the practice has text', async ({ page }) => {
  const textarea = page.getByRole('textbox', { name: /describe a promise/i })
  const button = page.getByRole('button', { name: 'Add this practice' })
  await textarea.fill('Take a short walk')
  await expect(button).toBeEnabled()

  const getStyleAndContrast = () => button.evaluate(element => {
    const style = getComputedStyle(element)
    const channels = (value: string) => value.match(/[\d.]+/g)!.map(Number)
    const luminance = (rgb: number[]) => rgb.reduce((total, value, index) => {
      const channel = value / 255
      const linear = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
      return total + linear * [0.2126, 0.7152, 0.0722][index]
    }, 0)
    const foreground = luminance(channels(style.color))
    const background = luminance(channels(style.backgroundColor))
    return {
      backgroundColor: style.backgroundColor,
      color: style.color,
      contrast: (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05),
    }
  })

  await expect.poll(async () => (await getStyleAndContrast()).contrast).toBeGreaterThanOrEqual(4.5)
  const style = await getStyleAndContrast()
  expect(style.contrast, JSON.stringify(style)).toBeGreaterThanOrEqual(4.5)
})