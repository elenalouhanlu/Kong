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
  }

    async verifyRoutePageLoaded() {
        await this.verifyElementVisible(this.pageTitle);
        await this.verifyElementVisible(this.addRouteButton);
  }

    async selectMethods(methods) {
    // 打开方法下拉框
    await this.click(this.methodsDropdown);
    
    // 选择每个方法
    for (const method of methods) {
      const option = this.methodOption(method);
      await this.click(option);
    }
    
    // 点击页面空白处关闭下拉框
    await this.page.click('xpath=//body');
  }
  /**
   * add route in service page
//   @param {string} serviceName - 服务名称
   * @param {string} routeName - 路由名称
   * @param {string} path - 路由路径（如/api/*）
   * @param {string} method- method
   */
  async addRoutefromService(routeName,path,method) {

    await this.click(this.RoutesTab);
    
    await this.click(this.addRoutefromServiceButton);
    // 填写路由名称
    await this.routeNameInput.fill(routeName);
    
    // 填写路由路径
    await this.pathInput.fill(path);
    //add methods 
    // 选择HTTP方法
    await this.selectMethods(method);

    await this.click(this.submitButton);
  }
async clickAddRoute() {
    await this.click(this.addRouteButton);
    // 等待表单加载
    await this.verifyElementVisible(this.routeNameInput);
  }

  /**
   * 创建新路由
   * @param {string} routeName - 路由名称
   * @param {string} path - 路由路径（如/api/*）
   * @param {string} serviceName - 关联的服务名称
   * @param {string} method- method
   */
  async createRoute(routeName, path, serviceName) {
    // 填写路由名称
    await this.routeNameInput.fill(routeName);
    
    // 填写路由路径
    await this.pathInput.fill(path);
    
    // 选择关联服务（通过服务名称筛选选项）
    await this.serviceSelect.selectOption({ label: serviceName });
    
    // 提交表单
    await this.click(this.submitButton);
    
    // // 验证创建成功
    // await this.verifyElementVisible(this.successMessage);
  }

  /**
   * 验证路由是否存在于列表中
   * @param {string} routeName - 路由名称
   */
  async verifyRouteExists(routeName) {
    const routeRow = this.page.locator(`xpath=//tr[@data-testid="${routeName}"]//td[@data-testid="name"]`);
    await this.verifyElementVisible(routeRow);
  }

  /**
   * 通过Kong Admin API验证路由是否创建成功
   * @param {string} routeName - 路由名称
   * @param {string[]} expectedMethods - 预期的HTTP方法
   * @param {string} expectedPath - 预期的路由路径
   * @returns {Promise<boolean>} 验证结果
   */
  async verifyRouteViaApi(routeName, expectedMethods, expectedPath) {
    // 从环境变量获取Admin API地址（默认8001端口）
    const adminApiUrl = process.env.KONG_ADMIN_URL || 'http://localhost:8001';
    
    try {
      // 调用Kong Admin API查询所有路由
      const response = await fetch(`${adminApiUrl}/routes`);
      const data = await response.json();

      // 查找目标路由
      const targetRoute = data.data.find(route => route.name === routeName);
      if (!targetRoute) {
        throw new Error(`API验证失败：未找到名称为${routeName}的路由`);
      }

      // 验证路由核心配置
      if (!targetRoute.paths.includes(expectedPath)) {
        throw new Error(`API验证失败：路由路径不匹配，实际: ${targetRoute.paths}, 预期: ${expectedPath}`);
      }

      if (!expectedMethods.every(method => targetRoute.methods.includes(method))) {
        throw new Error(`API验证失败：HTTP方法不匹配，实际: ${targetRoute.methods}, 预期: ${expectedMethods}`);
      }

      console.log(`API验证成功：路由${routeName}配置正确`);
      return true;
    } catch (error) {
      console.error(`API验证出错：${error.message}`);
      throw error; // 抛出错误使测试失败
    }
  }

}

module.exports = { RoutePage };

