const { BasePage } = require('./basePage');

class RoutePage extends BasePage {
  constructor(page) {
    super(page);
    this.pageTitle = page.locator('xpath=//span[@class="title" and text()="Routes"]');
    this.addRouteButton = page.locator('xpath=//a[@data-testid="toolbar-add-route"]');
    this.addRoutefromServiceButton = page.locator('xpath=//a[@data-testid="empty-state-action"]');
    this.routeNameInput = page.locator('xpath=//input[@data-testid="route-form-name"]');
    this.pathInput = page.locator('xpath=//input[@data-testid="route-form-paths-input-1"]');
    this.serviceSelect = page.locator('xpath=//select[@name="service.id"]');
    this.submitButton = page.locator('xpath=//button[@data-testid="route-create-form-submit"]');
    this.methodsDropdown = page.locator('xpath=//div[contains(text(), "Select methods")]');
    this.methodOption = (method) => page.locator(`xpath=//button[@value="${method}"]`);
    this.successMessage = page.locator('xpath=//div[contains(text(), "Route created successfully")]');
    this.RoutesTab = page.locator('xpath=//div[@data-testid="service-routes"]');
    this.RouteActionbutton= page.locator(`xpath=//button[@data-testid="header-actions"]`);
    this.RouteName= (routeName) => page.locator(`xpath=//tr[@data-testid="${routeName}"]//td[@data-testid="name"]`);
    this.editRouteButton =  page.locator('xpath=//button[@data-testaction="action-edit"]');
    this.editsubmitButton = page.locator('xpath=//button[@data-testid="route-edit-form-submit"]');
    this.deleteRouteButton =  page.locator('xpath=//button[@data-testaction="action-delete"]');
    this.configurationName = page.locator('xpath=//*[@data-testid="name-property-value"]');
    this.configurationpath = page.locator('xpath=//*[@data-testid="paths-copy-uuid-0"]//div//div[@class="copy-text"]');
  }

    async verifyRoutePageLoaded() {
        await this.verifyElementVisible(this.pageTitle);
        await this.verifyElementVisible(this.addRouteButton);
  }

    async selectMethods(methods) {
    // select dropdown
    await this.click(this.methodsDropdown);
    
    // select each method
    for (const method of methods) {
      const option = this.methodOption(method);
      await this.click(option);
    }
    
    // close dropdown by clicking outside
    await this.page.click('xpath=//body');
  }
  /**
   * add route in service page
//   @param {string} serviceName 
   * @param {string} routeName 
   * @param {string} path 
   * @param {string} method-
   */
  async addRoutefromService(routeName,path,method) {

    await this.click(this.RoutesTab);
    
    await this.click(this.addRoutefromServiceButton);
    // fill route name
    await this.routeNameInput.fill(routeName);
    
    // fill path
    await this.pathInput.fill(path);
    //add methods 
    await this.selectMethods(method);

    await this.click(this.submitButton);
  }
async clickAddRoute() {
    await this.click(this.addRouteButton);
    // verify the add route form is displayed
    await this.verifyElementVisible(this.routeNameInput);
  }

  /**
   * create new route
   * @param {string} routeName 
   * @param {string} path  
   * @param {string} serviceName 
   * @param {string} method
   */
  async createRoute(routeName, path, serviceName) {
    // fill route name
    await this.routeNameInput.fill(routeName);
    
    //  fill path
    await this.pathInput.fill(path);
    
    //    select service
    await this.serviceSelect.selectOption({ label: serviceName });

    //add methods 
    await this.selectMethods(method);
    
    // submit
    await this.click(this.submitButton);
  }

    /**
   * edit existing route
    * @param {string} routeName\
    * @param {string} newPath
   */
  async editRoute(routeName, newPath) {
    // locate the action button for the specific route
    const NameClick = this.RouteName(routeName);
    await this.click(NameClick);
    await this.click(this.RouteActionbutton)
    await this.click(this.editRouteButton);
    
    // wait for the edit form to be visible
    await this.verifyElementVisible(this.pathInput);
    // clear and fill new path
    await this.pathInput.fill('');
    await this.pathInput.fill(newPath);
    
    // submit the form
    await this.click(this.editsubmitButton);

  
  }

    /**
   * edit existing route
    * @param {string} routeName\
    * @param {string} newPath
   */
  async editRouteVerify(routeName, newPath) {
    //verify name locator return namevalue
    await this.verifyElementText(this.configurationName, routeName);
    await this.verifyElementText(this.configurationpath, newPath);
  
  }

  /**
   * verify if route exists in the list
   * @param {string} routeName 
   */
  async verifyRouteExists(routeName) {
    const routeRow = this.page.locator(`xpath=//tr[@data-testid="${routeName}"]//td[@data-testid="actions"]`);
    await this.verifyElementVisible(routeRow);
  }

  /**
   * use kong admin api to verify route configuration
   * @param {string} routeName 
   * @param {string[]} expectedMethods 
   * @param {string} expectedPath 
   * @returns {Promise<boolean>} 
   */
  async verifyRouteViaApi(routeName, expectedMethods, expectedPath) {
    // call kong admin api to get route details
    const adminApiUrl = process.env.KONG_ADMIN_URL || 'http://localhost:8001';
    
    try {
      // use fetch to call kong admin api
      const response = await fetch(`${adminApiUrl}/routes`);
      const data = await response.json();

      // find the route by name
      const targetRoute = data.data.find(route => route.name === routeName);
      if (!targetRoute) {
        throw new Error(`api fail：not found${routeName}`);
      }

      // verify path and methods
      if (!targetRoute.paths.includes(expectedPath)) {
        throw new Error(`api fail：route not match，actual: ${targetRoute.paths}, expected: ${expectedPath}`);
      }

      if (!expectedMethods.every(method => targetRoute.methods.includes(method))) {
        throw new Error(`api fail：HTTP method not match，actual: ${targetRoute.methods}, expected: ${expectedMethods}`);
      }

      console.log(`API success：route ${routeName}correct`);
      return true;
    } catch (error) {
      console.error(`API verify fail：${error.message}`);
      throw error;
    }
  }

}

module.exports = { RoutePage };

