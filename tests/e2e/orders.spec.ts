import { test, expect } from '@playwright/test'

test.describe('Orders Workflow', () => {
  test('should navigate to orders page', async ({ page }) => {
    // This assumes a logged-in state or dev environment where we can bypass auth or seed data
    // For now, we just test the navigation and basic element presence

    // Navigate to dashboard
    await page.goto('/dashboard')

    // Check if we are redirected or on dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Navigate to orders
    await page.click('text=Orders') // Adjust selector based on actual nav item or link
    await expect(page).toHaveURL(/\/dashboard\/orders/)

    // Check for "Create Order" button
    await expect(page.locator('text=Create Order')).toBeVisible()
  })

  test('should show empty state or orders list', async ({ page }) => {
    await page.goto('/dashboard/orders')

    // Either the table has rows or we see "No orders found"
    const tableRows = page.locator('table tbody tr')
    const count = await tableRows.count()

    if (count > 0) {
      // Check if first row has data or is the "No orders" row
      const firstRowText = await tableRows.first().innerText()
      if (!firstRowText.includes('No orders found')) {
        await expect(tableRows.first()).toBeVisible()
      } else {
        await expect(page.locator('text=No orders found')).toBeVisible()
      }
    }
  })
})
