import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'

test.describe('Auth Flow', () => {
  test.describe('Login Page', () => {
    test('menampilkan form login', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`)
      await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible()
      await expect(page.getByPlaceholder('nama@email.com')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible()
      await expect(page.getByRole('button', { name: /Google/i })).toBeVisible()
    })

    test('menampilkan error untuk email tidak valid', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`)
      await page.getByPlaceholder('nama@email.com').fill('bukan-email')
      await page.getByPlaceholder('Kata sandi').fill('password123')
      await page.getByRole('button', { name: 'Masuk' }).click()
      await expect(page.getByText(/format email/i)).toBeVisible()
    })

    test('menampilkan error untuk kata sandi kurang dari 6 karakter', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`)
      await page.getByPlaceholder('nama@email.com').fill('test@example.com')
      await page.getByPlaceholder('Kata sandi').fill('abc')
      await page.getByRole('button', { name: 'Masuk' }).click()
      await expect(page.getByText(/minimal 6/i)).toBeVisible()
    })

    test('ada link ke halaman daftar', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`)
      await expect(page.getByRole('link', { name: /daftar sekarang/i })).toBeVisible()
    })

    test('ada link lupa kata sandi', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`)
      await expect(page.getByRole('link', { name: /lupa kata sandi/i })).toBeVisible()
    })
  })

  test.describe('Register Page', () => {
    test('menampilkan form registrasi', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/register`)
      await expect(page.getByRole('heading', { name: 'Daftar' })).toBeVisible()
      await expect(page.getByPlaceholder(/nama lengkap/i)).toBeVisible()
      await expect(page.getByRole('button', { name: 'Daftar' })).toBeVisible()
    })

    test('menampilkan error jika kata sandi tidak cocok', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/register`)
      await page.getByPlaceholder(/nama lengkap/i).fill('Budi Santoso')
      await page.getByPlaceholder('nama@email.com').fill('budi@example.com')
      await page.getByPlaceholder('Minimal 6 karakter').fill('password123')
      await page.getByPlaceholder('Ulangi kata sandi').fill('berbeda456')
      await page.getByRole('button', { name: 'Daftar' }).click()
      await expect(page.getByText(/tidak cocok/i)).toBeVisible()
    })
  })

  test.describe('Protected Routes', () => {
    test('redirect ke login jika belum auth', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`)
      await expect(page).toHaveURL(/\/auth\/login/)
    })

    test('redirect ke login dari settings jika belum auth', async ({ page }) => {
      await page.goto(`${BASE_URL}/settings`)
      await expect(page).toHaveURL(/\/auth\/login/)
    })
  })

  test.describe('Landing Page', () => {
    test('menampilkan landing page dengan CTA', async ({ page }) => {
      await page.goto(BASE_URL)
      await expect(page.getByRole('heading', { name: 'Trah' })).toBeVisible()
      await expect(page.getByRole('link', { name: /mulai sekarang/i })).toBeVisible()
    })
  })
})
