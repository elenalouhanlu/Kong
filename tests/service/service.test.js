const { test, expect } = require('@playwright/test');
// const { DashboardPage } = require('../../page-objects/dashboardPage');
const { ServicePage } = require('../../page-objects/servicesPage');
const { generateServiceName, generateRandomUrl } = require('../../utils/testHelper');

test.describe('Gateway Service test', () => {
  let dashboardPage;
  let servicePage;
  const serviceName = generateServiceName();
  const serviceUrl = generateRandomUrl();

  test.beforeEach(async ({ page }) => {
    // 直接导航到仪表盘，无需登录
    await page.goto('/default/services');
    dashboardPage = new DashboardPage(page);
    servicePage = new ServicePage(page);
  });

  test('Create New Service', async () => {
    // // 从仪表盘导航到服务页面
    // await dashboardPage.verifyDashboardLoaded();
    // await dashboardPage.goToServices();
    
    // 验证服务页面加载
    await servicePage.verifyServicePageLoaded();
    
    // 创建服务
    await servicePage.clickAddService();
    await servicePage.createService(serviceName, serviceUrl);
    
    // 验证创建成功
    await servicePage.verifyServiceCreated();
    await expect(page.locator(`xpath=//td[text()="${serviceName}"]`)).toBeVisible();
  });
});
