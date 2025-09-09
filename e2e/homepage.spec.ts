import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load and display main content', async ({ page }) => {
    await page.goto('/');

    // Check if the main title is present
    await expect(page.getByRole('heading', { name: /Your Personal AI Fitness Coach/i })).toBeVisible();

    // Check if the FitForge AI logo/brand is present
    await expect(page.getByText('FitForge AI')).toBeVisible();

    // Check if main CTA buttons are present
    await expect(page.getByRole('button', { name: /Start Your Transformation/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Watch Demo/i })).toBeVisible();

    // Check if navigation links are present
    await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Get Started Free/i })).toBeVisible();
  });

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/');

    // Click on the "Get Started Free" button
    await page.getByRole('link', { name: /Get Started Free/i }).click();

    // Should navigate to registration page
    await expect(page).toHaveURL('/auth/register');
    await expect(page.getByRole('heading', { name: /Join FitForge AI/i })).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    // Click on the "Sign In" button
    await page.getByRole('link', { name: /Sign In/i }).click();

    // Should navigate to login page
    await expect(page).toHaveURL('/auth/login');
    await expect(page.getByRole('heading', { name: /Welcome Back/i })).toBeVisible();
  });

  test('should display features section', async ({ page }) => {
    await page.goto('/');

    // Check if features section is present
    await expect(page.getByText('Why Choose FitForge AI?')).toBeVisible();
    
    // Check if feature cards are present
    await expect(page.getByText('AI-Powered Plans')).toBeVisible();
    await expect(page.getByText('Progress Tracking')).toBeVisible();
    await expect(page.getByText('Expert Coaching')).toBeVisible();
    await expect(page.getByText('Goal Achievement')).toBeVisible();
  });

  test('should display stats section', async ({ page }) => {
    await page.goto('/');

    // Check if stats are displayed
    await expect(page.getByText('50K+')).toBeVisible();
    await expect(page.getByText('Active Users')).toBeVisible();
    await expect(page.getByText('1M+')).toBeVisible();
    await expect(page.getByText('Workouts Completed')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check if main content is still visible on mobile
    await expect(page.getByRole('heading', { name: /Your Personal AI Fitness Coach/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Start Your Transformation/i })).toBeVisible();
    
    // Check if navigation is responsive
    await expect(page.getByText('FitForge AI')).toBeVisible();
  });

  test('should scroll to features section smoothly', async ({ page }) => {
    await page.goto('/');

    // If there's a features link in navigation, test smooth scrolling
    const featuresLink = page.getByRole('link', { name: /features/i }).first();
    if (await featuresLink.isVisible()) {
      await featuresLink.click();
      
      // Check if we scrolled to features section
      await expect(page.getByText('Why Choose FitForge AI?')).toBeInViewport();
    }
  });
});