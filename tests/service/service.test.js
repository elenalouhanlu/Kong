const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../../page-objects/dashboardPage');
const { ServicesPage } = require('../../page-objects/servicesPage');
const { RoutePage } = require('../../page-objects/routePage');
const { generateServiceName, generateRandomUrl,generateRouteName,generateRandomString } = require('../../utils/testHelper');

test.describe('Gateway Service test', () => {
  let dashboardPage;
  let servicePage;
  let routePage;
  const serviceName = generateServiceName();
  const NewserviceName = generateServiceName();
  const serviceUrl = generateRandomUrl();
  const newServiceUrl = generateRandomUrl();
  const servicehost = serviceUrl.replace('http://', '').replace('https://', '');
  const newServicehost = newServiceUrl.replace('http://', '').replace('https://', '');
  const routeName = generateRouteName();    // 生成随机路由名称
  const routePath = `/api/${generateRandomString()}`; //
  const testMethods = ['GET', 'POST', 'PUT'];

  test.beforeEach(async ({ page }) => {
    // 直接导航到仪表盘，无需登录
    await page.goto('/default/services');
    dashboardPage = new DashboardPage(page);
    servicePage = new ServicesPage(page);
    routePage = new RoutePage(page);
  });

  test('Add/Edit/Delete Service', async () => { 
    // 验证服务页面加载
    await servicePage.verifyServicePageLoaded();
    
    // 创建服务
    await servicePage.clickAddService();
    await servicePage.createService(serviceName, serviceUrl);
    
    // 验证创建成功
    await servicePage.verifyServiceCreated(serviceName, servicehost);
    //edit service
    await servicePage.editService(newServicehost,NewserviceName);
    //verify service edited
    await servicePage.verifyServiceCreated(NewserviceName,newServicehost);
    //delete
    await servicePage.deleteService(NewserviceName);

  });

  test('Add Service and Route', async () => { 
    // 验证服务页面加载
    await servicePage.verifyServicePageLoaded();
    
    // 创建服务
    await servicePage.clickAddService();
    await servicePage.createService(serviceName, serviceUrl);
    
    // 验证创建成功
    await servicePage.verifyServiceCreated(serviceName, servicehost);
    //create new route for the created service
    await routePage.addRoutefromService(routeName,routePath,testMethods);
    //verify route created
    await routePage.verifyRouteExists(routeName);

        // 3. API验证（核心新增步骤）
    await routePage.verifyRouteViaApi(routeName, testMethods, routePath);
    // //delete
    // await servicePage.deleteService(serviceName);

  });
  // test('Create new route for new service', async () => {
  //   //navigate to route page
  //   await servicePage.verifyServicePageLoaded();
  //   await dashboardPage.goToRoutes();
  //   await routePage.verifyRoutePageLoaded();
    
  //   // 点击添加路由
  //   await routePage.clickAddRoute();
    
  //   // 创建新路由（关联到提前创建的服务）
  //   await routePage.createRoute(routeName, routePath, serviceName);
    
  //   // 验证路由创建成功
  //   await routePage.verifyRouteExists(routeName);
  //   // await expect(routePage.successMessage).toBeVisible();
  //   });

  // test('delete service', async () => {
  //   //delete the created service
  //   //navigate to service page
  //   await dashboardPage.goToServices();
  //   await servicePage.verifyServicePageLoaded();
  //   //delete service
  //   await servicePage.deleteService(serviceName);
  //   //verify service deleted - this can be done by checking the service no longer exists in the list
  //   const serviceItem = this.page.locator(`xpath=//tr[data-testid="${serviceName}"]`);
  //   await expect(serviceItem).toHaveCount(0);

  // })
});
