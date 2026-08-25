import { test } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const out = 'preview'
mkdirSync(out, { recursive: true })

test.setTimeout(60_000)

test('capture product surfaces', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('heading', { name: /start with what you have/i }).waitFor()
  await page.screenshot({ path: `${out}/01-welcome.png`, fullPage: true })

  await page.getByRole('button', { name: /load a demo week/i }).click()
  await page.getByText('Demo week loaded').waitFor()
  await page.getByRole('heading', { name: /your money, skills, and next hour/i }).waitFor()
  await page.screenshot({ path: `${out}/02-today.png`, fullPage: true })

  await page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Money' }).click()
  await page.getByRole('heading', { name: /cash, debt/i }).waitFor()
  await page.screenshot({ path: `${out}/03-map.png`, fullPage: true })

  await page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Work' }).click()
  await page.getByRole('heading', { name: /ranked, feasible work/i }).waitFor()
  await page.screenshot({ path: `${out}/04-capital.png`, fullPage: true })

  await page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Proof' }).click()
  await page.getByRole('heading', { name: /receipts and chain/i }).waitFor()
  await page.screenshot({ path: `${out}/05-proof.png`, fullPage: true })

  await page.goto('/studio')
  await page.getByRole('heading', { name: 'Studio', level: 1 }).waitFor()
  await page.screenshot({ path: `${out}/06-studio.png`, fullPage: true })

  await page.goto('/verify')
  await page.getByRole('heading', { name: /verify a receipt/i }).waitFor()
  await page.screenshot({ path: `${out}/07-verify.png`, fullPage: true })
})
