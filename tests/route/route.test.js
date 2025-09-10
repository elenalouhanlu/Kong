const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../../page-objects/dashboardPage');
const { ServicesPage } = require('../../page-objects/servicesPage');
const { RoutePage } = require('../../page-objects/routePage');
const { generateServiceName, generateRandomUrl,generateRouteName,generateRandomString } = require('../../utils/testHelper');
const { getRoutesForService, deleteRoute, deleteService } = require('../../utils/kongAdminApi');

test.describe('Route test', () => {
  let dashboardPage;
  let servicePage;
  let routePage;
  const serviceName = generateServiceName();
  const NewserviceName = generateServiceName();
  const serviceUrl = generateRandomUrl();
  const newServiceUrl = generateRandomUrl();
  const servicehost = serviceUrl.replace('http://', '').replace('https://', '');
  const newServicehost = newServiceUrl.replace('http://', '').replace('https://', '');
  const routeName = generateRouteName();    
  const routePath = `/api/${generateRandomString()}`; //
  const newRoutePath = `/api/${generateRandomString()}`;
  const testMethods = ['GET', 'POST', 'PUT'];

  test.beforeEach(async ({ page }) => {
    await page.goto('/default/services');
    dashboardPage = new DashboardPage(page);
    servicePage = new ServicesPage(page);
    routePage = new RoutePage(page);
  });


  test('Add/Edit Service and Route and verify', async () => { 
    // verify service page loaded
    await servicePage.verifyServicePageLoaded(); 
    // create new service
    await servicePage.clickAddService();
    await servicePage.createService(serviceName, serviceUrl);
    // verify service created
    await servicePage.verifyServiceCreated(serviceName, servicehost);
    //create new route for the created service
    await routePage.addRoutefromService(routeName,routePath,testMethods);
    //verify route created
    await routePage.verifyRouteExists(routeName);
    //verify via api
    await routePage.verifyRouteViaApi(routeName, testMethods, routePath);
    //edit the created route
    await routePage.editRoute(routeName, newRoutePath);
    //verify route edited in ui
    await routePage.editRouteVerify(routeName,newRoutePath);
    await routePage.verifyRouteViaApi(routeName, testMethods, newRoutePath);
  });

   test.afterEach(async () => {
    // cleanup created service and route via API calls to Kong Admin API
    if (serviceName) {
      try {
        // fetch routes associated with the service
        const routes = await getRoutesForService(serviceName);
        
        if (routes && routes.length > 0) {
          // delete each route
          for (const route of routes) {
            await deleteRoute(route.id); 
            console.log(`✅ delete route: ${route.name} (ID: ${route.id})`);
          }
        } else {
          console.log(`ℹ️ service ${serviceName} has not routes to delete.`);
        }
      } catch (error) {
        console.warn(`⚠️ fetch/delete route fail: ${error.message}`);
      }
    }

    // cleanup service
    if (serviceName) {
      try {
        await deleteService(serviceName);
        console.log(`✅ deleted service: ${serviceName}`);
      } catch (error) {
        console.warn(`⚠️ delete service ${serviceName} fail: ${error.message}`);
      }
    }

    // cleanup extra route if created separately
    if (routeName && routeName !== serviceName) {
      try {
        await deleteRoute(routeName);
        console.log(`✅ deleted: ${routeName}`);
      } catch (error) {
        // ignore other errors except 404
        if (error.status !== 404) {
          console.warn(`⚠️ delete ${routeName} fail: ${error.message}`);
        }
      }
    }
  });
});
