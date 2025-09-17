const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../../page-objects/dashboardPage');
const { ServicesPage } = require('../../page-objects/servicesPage');
const { RoutePage } = require('../../page-objects/routePage');
const { PluginPage } = require('../../page-objects/PluginPage');
const testMethods = ['GET', 'POST', 'PUT'];
const { generateServiceName, generateRouteName, generateRandomUrl,generateRandomString } = require('../../utils/testHelper');
const { 
  createRateLimitingPlugin, 
  getPluginsForService,
  deletePlugin,
  getRoutesForService,
  deleteRoute,
  deleteService,
} = require('../../utils/kongAdminApi');

test.describe('rate-limiting plugins test', () => {
  let dashboardPage;
  let servicePage;
  let routePage;
  let pluginPage;
  let serviceName;
  let routeName;
  const rateLimit = 5; 
  const routePath = `/api/${generateRandomString()}`;

  test.beforeEach(async ({ page }) => {
    // navigate to dashboard
    await page.goto('/default/overview');
    dashboardPage = new DashboardPage(page);
    servicePage = new ServicesPage(page);
    routePage = new RoutePage(page);
    pluginPage = new PluginPage(page);

    // generate unique names for service and route
    serviceName = generateServiceName();
    routeName = generateRouteName();

    // generate service and route
    await dashboardPage.goToServices();
    await servicePage.verifyServicePageLoaded();
    await servicePage.clickAddService();
    await servicePage.createService(serviceName, 'http://httpbin.org');
    await routePage.addRoutefromService(routeName, `/${routeName}`, testMethods);
  });

  test('add rate-limiting plugins adn verify', async ({ page }) => {
    // create rate limiting plugin for the service
    await pluginPage.navigateToServicePluginsfromservice();
    await pluginPage.addRateLimitingPlugin(rateLimit);
    
    // verify in UI
    await expect(pluginPage.verifyPluginAdded('rate-limiting')).resolves.toBe(true);
    
    //add plugin
    const plugins = await getPluginsForService(serviceName);
    const ratePlugin = plugins.find(p => p.name === 'rate-limiting');
    expect(ratePlugin).toBeTruthy();
    expect(ratePlugin.config.minute).toBe(rateLimit);

    // verify the plugin is working as expected
    const gatewayUrl = process.env.KONG_GATEWAY_URL || 'http://localhost:8000';
    const testUrl = `${gatewayUrl}/${routeName}/get`;
    console.log('Test URL:', testUrl);
    
     // wait for a short period to ensure the plugin is fully applied
    // await waitForPluginReady(testUrl, 200);

    for (let attempt = 0; attempt <= 5; attempt++) {
      const response = await page.request.get(testUrl);
      if (response.status() === 200) {
        console.log(`Plugin is active after ${attempt} attempts.`);
        break;

      }
      console.log(`Plugin not active yet (status: ${response.status()}), retrying...`);
      await page.waitForTimeout(1000); // wait 1 second before retrying
    }
      
    //send 5 requests should be successful
    for (let i = 0; i < rateLimit; i++) {
      const response = await page.request.get(testUrl);
      console.log('Status:', response.status());
      console.log('Body:', await response.text());
      expect(response.ok()).toBeTruthy();
    }
    
    // return 429 Too Many Requests
    const limitedResponse = await page.request.get(testUrl);
    expect(limitedResponse.status()).toBe(429);
  });

  // cleanup: cleanup created service, route and plugin via API calls to Kong Admin API
  test.afterEach(async () => {
    if (serviceName) {
      // 1. cleanup all plugins associated with the service
      const plugins = await getPluginsForService(serviceName);
      for (const plugin of plugins) {
        await deletePlugin(plugin.id);
      }

      // 2. cleanup all routes associated with the service
      const routes = await getRoutesForService(serviceName);
      for (const route of routes) {
        await deleteRoute(route.id);
      }

    // 3. cleanup the service
    try {
      await deleteService(serviceName);
      console.log('Service deleted:', serviceName);
    } catch (e) {
      console.error('Failed to delete service:', e.message);
    }
  
    }
  });
});
