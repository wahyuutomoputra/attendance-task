import { test, expect } from '@playwright/test';

test.describe('Attendance', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByLabel('Email').fill('employee@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    // Wait for dashboard to load
    await expect(page.getByText('Employee Attendance System')).toBeVisible();
  });

  test('should show attendance form', async ({ page }) => {
    await expect(page.getByText('Attendance')).toBeVisible();
    await expect(page.getByText('Location')).toBeVisible();
    await expect(page.getByText('IP Address')).toBeVisible();
  });

  test('should show attendance report', async ({ page }) => {
    await expect(page.getByText('Attendance Report')).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should show profile section', async ({ page }) => {
    await expect(page.getByText('Profile')).toBeVisible();
    await expect(page.getByText('employee@example.com')).toBeVisible();
  });
}); 