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

  // test('Service page loading', async () => {
  //   await dashboardPage.verifyDashboardLoaded();
  //   await dashboardPage.goToServices();
  //   // 验证导航成功
  //   await expect(ServicesPage.pageTitl).toBeVisible();
  // });

  // test('从仪表盘导航到路由页面', async () => {
  //   await dashboardPage.verifyDashboardLoaded();
  //   await dashboardPage.goToRoutes();
  //   // 验证导航成功
  //   await expect(page.locator('xpath=//h1[text()="Routes"]')).toBeVisible();
  // });
});