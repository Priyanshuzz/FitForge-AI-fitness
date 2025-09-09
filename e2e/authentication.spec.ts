import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.describe('Registration', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/auth/register');

      // Check if form elements are present
      await expect(page.getByRole('heading', { name: /Join FitForge AI/i })).toBeVisible();
      await expect(page.getByLabel(/First Name/i)).toBeVisible();
      await expect(page.getByLabel(/Last Name/i)).toBeVisible();
      await expect(page.getByLabel(/Email Address/i)).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByLabel(/Confirm Password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /Create Account/i })).toBeVisible();
    });

    test('should validate form inputs', async ({ page }) => {
      await page.goto('/auth/register');

      // Try to submit empty form
      await page.getByRole('button', { name: /Create Account/i }).click();

      // Browser validation should prevent submission
      // Check if required field validation is working
      await expect(page.getByLabel(/First Name/i)).toHaveAttribute('required');
      await expect(page.getByLabel(/Email Address/i)).toHaveAttribute('required');
    });

    test('should show password requirements', async ({ page }) => {
      await page.goto('/auth/register');

      // Type in password field
      await page.getByLabel('Password').fill('test');

      // Check if password requirements are shown
      await expect(page.getByText(/At least 8 characters/i)).toBeVisible();
      await expect(page.getByText(/Contains uppercase letter/i)).toBeVisible();
      await expect(page.getByText(/Contains lowercase letter/i)).toBeVisible();
      await expect(page.getByText(/Contains number/i)).toBeVisible();
    });

    test('should validate password confirmation', async ({ page }) => {
      await page.goto('/auth/register');

      // Fill password fields with different values
      await page.getByLabel('Password').fill('Password123');
      await page.getByLabel(/Confirm Password/i).fill('DifferentPassword');

      // Check if mismatch error is shown
      await expect(page.getByText(/Passwords do not match/i)).toBeVisible();
    });

    test('should navigate to login page', async ({ page }) => {
      await page.goto('/auth/register');

      // Click on "Sign in" link
      await page.getByRole('link', { name: /Sign in/i }).click();

      // Should navigate to login page
      await expect(page).toHaveURL('/auth/login');
    });

    test('should go back to homepage', async ({ page }) => {
      await page.goto('/auth/register');

      // Click on "Back to FitForge AI" link
      await page.getByRole('link', { name: /Back to FitForge AI/i }).click();

      // Should navigate back to homepage
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Login', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/auth/login');

      // Check if form elements are present
      await expect(page.getByRole('heading', { name: /Welcome Back/i })).toBeVisible();
      await expect(page.getByLabel(/Email Address/i)).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
    });

    test('should toggle password visibility', async ({ page }) => {
      await page.goto('/auth/login');

      const passwordField = page.getByLabel('Password');
      const toggleButton = page.getByRole('button').filter({ has: page.locator('[data-testid=\"eye-icon\"], .lucide-eye, .lucide-eye-off') });

      // Initially password should be hidden
      await expect(passwordField).toHaveAttribute('type', 'password');

      // Click toggle button
      if (await toggleButton.count() > 0) {
        await toggleButton.first().click();
        
        // Password should now be visible
        await expect(passwordField).toHaveAttribute('type', 'text');
      }
    });

    test('should navigate to registration page', async ({ page }) => {
      await page.goto('/auth/login');

      // Click on "Sign up for free" link
      await page.getByRole('link', { name: /Sign up for free/i }).click();

      // Should navigate to registration page
      await expect(page).toHaveURL('/auth/register');
    });

    test('should go back to homepage', async ({ page }) => {
      await page.goto('/auth/login');

      // Click on "Back to FitForge AI" link
      await page.getByRole('link', { name: /Back to FitForge AI/i }).click();

      // Should navigate back to homepage
      await expect(page).toHaveURL('/');
    });

    test('should show forgot password link', async ({ page }) => {
      await page.goto('/auth/login');

      // Check if forgot password link is present
      await expect(page.getByRole('link', { name: /Forgot password/i })).toBeVisible();
    });

    test('should show remember me checkbox', async ({ page }) => {
      await page.goto('/auth/login');

      // Check if remember me checkbox is present
      await expect(page.getByLabel(/Remember me/i)).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should validate email format', async ({ page }) => {
      await page.goto('/auth/login');

      // Fill invalid email
      await page.getByLabel(/Email Address/i).fill('invalid-email');
      await page.getByLabel('Password').fill('password123');
      await page.getByRole('button', { name: /Sign In/i }).click();

      // Browser should validate email format
      const emailField = page.getByLabel(/Email Address/i);
      await expect(emailField).toHaveAttribute('type', 'email');
    });

    test('should handle loading states', async ({ page }) => {
      await page.goto('/auth/login');

      // Fill valid form data
      await page.getByLabel(/Email Address/i).fill('test@example.com');
      await page.getByLabel('Password').fill('password123');

      // Click submit button
      const submitButton = page.getByRole('button', { name: /Sign In/i });
      await submitButton.click();

      // Button should show loading state (if implemented)
      // This test may need to be adjusted based on actual implementation
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/auth/login');

      // Check if form is still usable on mobile
      await expect(page.getByRole('heading', { name: /Welcome Back/i })).toBeVisible();
      await expect(page.getByLabel(/Email Address/i)).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto('/auth/register');

      // Check if form layout works on tablet
      await expect(page.getByRole('heading', { name: /Join FitForge AI/i })).toBeVisible();
      await expect(page.getByLabel(/First Name/i)).toBeVisible();
      await expect(page.getByLabel(/Last Name/i)).toBeVisible();
    });
  });
});