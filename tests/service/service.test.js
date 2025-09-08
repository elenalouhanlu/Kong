const { test, expect } = require('@playwright/test');
// const { LoginPage } = require('../../page-objects/loginPage');
const { DashboardPage } = require('../../page-objects/dashboardPage');
const { ServicesPage } = require('../../page-objects/servicesPage');

test.describe('Services Tests', () => {
  let loginPage;
//   let dashboardPage;
  let servicesPage;
//   const username = process.env.KONG_USERNAME || 'admin';
//   const password = process.env.KONG_PASSWORD || 'password';
  const testServiceName = `test-service-${Date.now()}`;
  const testServiceUrl = 'https://httpbin.org';

  test.beforeEach(async ({ page }) => {
    // 初始化页面对象
    // loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    servicesPage = new ServicesPage(page);

    // 登录并导航到服务页面
    // await loginPage.navigate();
    // await loginPage.login(username, password);
    await dashboardPage.verifyDashboardLoaded();
    // await dashboardPage.goToServices();
    // await servicesPage.verifyServicesPageLoaded();
  });

//   test('should create a new service successfully', async () => {
//     await servicesPage.clickAddService();
//     await servicesPage.createService(testServiceName, testServiceUrl);
//     await servicesPage.verifyNotification('Service created successfully');
//     await servicesPage.verifyServiceExists(testServiceName);
//   });

//   test('should delete a service successfully', async () => {
//     // 先创建一个服务用于删除测试
//     await servicesPage.clickAddService();
//     await servicesPage.createService(testServiceName, testServiceUrl);
//     await servicesPage.verifyServiceExists(testServiceName);
    
//     // 删除服务
//     await servicesPage.deleteService(testServiceName);
//     await servicesPage.verifyNotification('Service deleted successfully');
//   });
});
