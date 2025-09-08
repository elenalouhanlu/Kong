const { BasePage } = require('./basePage');

class ServicesPage extends BasePage {
  constructor(page) {
    super(page);
    this.pageTitle = page.locator('h1:has-text("Gateway Services")');
    this.addServiceButton = page.locator('button:has-text(" New gateway service")');
    this.serviceNameInput = page.locator('input[name="name"]');
    this.serviceUrlInput = page.locator('input[name="url"]');
    this.saveServiceButton = page.locator('button:has-text("Save")');
    this.serviceList = page.locator('.service-list');
  }

  /**
   * 验证服务页面是否加载
   */
  async verifyServicesPageLoaded() {
    await this.verifyElementVisible(this.pageTitle);
    await this.verifyElementVisible(this.addServiceButton);
  }

  /**
   * 点击添加服务按钮
   */
  async clickAddService() {
    await this.click(this.addServiceButton);
  }

  /**
   * 创建新服务
   * @param {string} name - 服务名称
   * @param {string} url - 服务URL
   */
  async createService(name, url) {
    await this.fillInput(this.serviceNameInput, name);
    await this.fillInput(this.serviceUrlInput, url);
    await this.click(this.saveServiceButton);
  }

  /**
   * 验证服务是否存在
   * @param {string} serviceName - 服务名称
   */
  async verifyServiceExists(serviceName) {
    const serviceItem = this.serviceList.locator(`.service-item:has-text("${serviceName}")`);
    await this.verifyElementVisible(serviceItem);
  }

  /**
   * 删除服务
   * @param {string} serviceName - 服务名称
   */
  async deleteService(serviceName) {
    const serviceItem = this.serviceList.locator(`.service-item:has-text("${serviceName}")`);
    const deleteButton = serviceItem.locator('.delete-button');
    
    await this.click(deleteButton);
    // 确认删除对话框
    const confirmButton = this.page.locator('button:has-text("Confirm")');
    await this.click(confirmButton);
  }
}

module.exports = { ServicesPage };