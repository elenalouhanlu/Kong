const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../../page-objects/dashboardPage');
const { ServicesPage } = require('../../page-objects/servicesPage');

test.describe('dashboard test', () => {
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    await page.goto('/default/overview');
    dashboardPage = new DashboardPage(page);
  });

  test('dashboard loading test', async () => {
    await dashboardPage.verifyDashboardLoaded();
  });

 //test other UI pages
});