const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../../page-objects/dashboardPage');
const { ServicesPage } = require('../../page-objects/servicesPage');
const { RoutePage } = require('../../page-objects/routePage');
const { generateServiceName, generateRandomUrl,generateRouteName,generateRandomString } = require('../../utils/testHelper');
const { getService, deleteService } = require('../../utils/kongAdminApi'); 

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
  const routeName = generateRouteName();    
  const routePath = `/api/${generateRandomString()}`; 
  const testMethods = ['GET', 'POST', 'PUT'];

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
    //Verify in api
    const serviceDetails = await getService(serviceName);
    expect(serviceDetails.name).toBe(serviceName);
    expect(serviceDetails.host).toBe(servicehost);
    expect(serviceDetails.created_at).toBeDefined();
    //edit service
    await servicePage.editService(newServicehost,NewserviceName);
    //verify service edited in UI
    await servicePage.verifyServiceCreated(NewserviceName,newServicehost);
    //Verify in api
    const editedServiceDetails = await getService(NewserviceName);
    expect(editedServiceDetails.name).toBe(NewserviceName);
    expect(editedServiceDetails.host).toBe(newServicehost);
    expect(editedServiceDetails.created_at).toBeDefined();
    //delete
    await servicePage.deleteService(NewserviceName);
    //wait for sometime for deletion to reflect
   await new Promise(res => setTimeout(res, 2000));
    //verify service deleted in api
    const deletedServiceDetails = await getService(NewserviceName).catch(e => null);
    expect(deletedServiceDetails).toBeNull();

  });

 test.afterEach(async () => {
    // collet all possible service name
    const servicesToClean = [serviceName, NewserviceName].filter(Boolean);
    
    // delete via api if exists
    for (const name of servicesToClean) {
      await deleteService(name); 
    }
  });
});
