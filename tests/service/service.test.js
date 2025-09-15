const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../../page-objects/dashboardPage');
const { ServicesPage } = require('../../page-objects/servicesPage');
const { RoutePage } = require('../../page-objects/routePage');
const { generateServiceName, generateRandomUrl,generateRouteName,generateRandomString } = require('../../utils/testHelper');
const { getService, deleteService,waitForServiceDeleted,verifyServiceviaApi} = require('../../utils/kongAdminApi'); 

test.describe('Gateway Service test', () => {
  let dashboardPage;
  let servicePage;
  let routePage;
  let serviceName,NewServiceName,serviceUrl,newServiceUrl,servicehost,newServicehost,routeName,routePath,testMethods;//make these variables unique in each test run
  serviceName = generateServiceName();
  NewServiceName = generateServiceName();
  serviceUrl = generateRandomUrl();
  newServiceUrl = generateRandomUrl();
  servicehost = serviceUrl.replace('http://', '').replace('https://', '');
  newServicehost = newServiceUrl.replace('http://', '').replace('https://', '');
  routeName = generateRouteName();    
  routePath = `/api/${generateRandomString()}`; 
  testMethods = ['GET', 'POST', 'PUT'];

  test.beforeEach(async ({ page }) => {
    // navigate to dashbord
    await page.goto('/default/services');
    dashboardPage = new DashboardPage(page);
    servicePage = new ServicesPage(page);
    routePage = new RoutePage(page);
  });



  test('Add/Edit/Delete Service', async () => { 
    // service page loading
    await servicePage.verifyServicePageLoaded();
    
    // create service
    await servicePage.clickAddService();
    await servicePage.createService(serviceName, serviceUrl);
    
    // verify in UI
    await servicePage.verifyServiceCreated(serviceName, servicehost);
    //Verify service via API
    await verifyServiceviaApi(serviceName, servicehost);
    //edit service
    await servicePage.editService(newServicehost,NewServiceName);
    //verify service edited in UI
    await servicePage.verifyServiceCreated(NewServiceName,newServicehost);
    //Verify in api
    await verifyServiceviaApi(NewServiceName, newServicehost);
    //delete service
    await servicePage.deleteService(NewServiceName);
    //wait for sometime for deletion to reflect
    await waitForServiceDeleted(NewServiceName);
    //verify service deleted in api
    const deletedServiceDetails = await getService(NewServiceName).catch(e => null);
    expect(deletedServiceDetails).toBeNull();

  });

 test.afterEach(async () => {
    // collet all possible service name
    const servicesToClean = [serviceName, NewServiceName].filter(Boolean);

    // delete via api if exists
    for (const name of servicesToClean) {
      await deleteService(name); 
    }
  });
});
