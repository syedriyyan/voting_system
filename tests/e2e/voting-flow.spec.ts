import { test, expect } from '@playwright/test';

test.describe('Complete Voting Flow', () => {
  test('should complete entire voting process', async ({ page }) => {
    // Admin login and election creation
    await test.step('Admin creates election', async () => {
      await page.goto('/login');
      await page.fill('[name="email"]', 'admin@example.com');
      await page.fill('[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      
      await page.goto('/admin/create-election');
      await page.fill('[name="title"]', 'Test Election');
      await page.fill('[name="description"]', 'Test Description');
      await page.click('button:has-text("Create Election")');
      
      await expect(page.locator('.toast')).toContainText('Election created');
    });

    // Voter registration
    await test.step('Voter registers and connects wallet', async () => {
      await page.goto('/register');
      await page.fill('[name="email"]', 'voter@example.com');
      await page.fill('[name="password"]', 'voter123');
      await page.fill('[name="name"]', 'Test Voter');
      await page.click('button[type="submit"]');
      
      await page.click('button:has-text("Connect Wallet")');
      // Mock wallet connection...
      
      await expect(page.locator('.wallet-status')).toContainText('Connected');
    });

    // Cast vote
    await test.step('Voter casts vote', async () => {
      await page.goto('/elections');
      await page.click('a:has-text("Test Election")');
      
      await page.click('input[name="choice"]');
      await page.click('button:has-text("Cast Vote")');
      
      await expect(page.locator('.vote-receipt')).toBeVisible();
      await expect(page.locator('.transaction-hash')).not.toBeEmpty();
    });

    // Verify vote
    await test.step('Verify vote on blockchain', async () => {
      await page.goto('/vote/verify');
      const txHash = await page.locator('.transaction-hash').textContent();
      await page.fill('[name="transactionHash"]', txHash || '');
      await page.click('button:has-text("Verify")');
      
      await expect(page.locator('.verification-status')).toContainText('Verified');
    });
  });
});