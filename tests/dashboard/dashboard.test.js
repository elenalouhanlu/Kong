const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../../page-objects/dashboardPage');

test.describe('dashboard test', () => {
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    // 直接导航到仪表盘，无需登录步骤
    await page.goto('/default/workspaces');
    dashboardPage = new DashboardPage(page);
  });

  test('验证仪表盘页面加载成功', async () => {
    await dashboardPage.verifyDashboardLoaded();
  });

  test('从仪表盘导航到服务页面', async () => {
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.goToServices();
    // 验证导航成功
    await expect(page.locator('xpath=//h1[text()="Services"]')).toBeVisible();
  });

  test('从仪表盘导航到路由页面', async () => {
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.goToRoutes();
    // 验证导航成功
    await expect(page.locator('xpath=//h1[text()="Routes"]')).toBeVisible();
  });
});