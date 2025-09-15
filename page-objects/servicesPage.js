const { BasePage } = require('./basePage');
const { expect } = require('@playwright/test');
const { getService, deleteService,waitForServiceDeleted} = require('../utils/kongAdminApi'); 

class ServicesPage extends BasePage {
  constructor(page) {
    super(page);
    this.pageTitle = page.locator('xpath=//span[@class="title" and text()="Gateway Services"]');
    this.addServiceButton = page.locator('xpath=//a[@data-testid="toolbar-add-gateway-service"]');
    this.serviceNameInput = page.locator('input[name="name"]');
    this.serviceUrlInput = page.locator('input[name="url"]');
    this.servicehostInput = page.locator('input[name="host"]');
    this.saveServiceButton = page.locator('button:has-text("Save")');
    this.serviceList = page.locator('.service-list');
    this.configureName = page.locator('xpath=//*[@data-testid="name-property-value"]');
    this.configureHost = page.locator('xpath=//*[@data-testid="host-property-value"]');
    this.RoutesTab = page.locator('xpath=//div[@data-testid="service-routes"]');
    this.PluginsTab = page.locator('xpath=//div[@data-testid="service-plugins"]');
    this.actionButton = page.locator('xpath=//button[@data-testid="header-actions"]');
    this.editButton = page.locator('xpath=//button[@data-testaction="action-edit"]');
    this.deleteButton = page.locator('xpath=//button[@data-testaction="action-delete"]');
    this.confirmInput = page.locator('xpath=//input[@data-testid="confirmation-input"]');
    this.confirmButton = page.locator('xpath=//button[@data-testid="modal-action-button"]');
  }

  /**
   * 验证服务页面是否加载
   */
  async verifyServicePageLoaded() {
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
    await this.serviceUrlInput.fill('');
    await this.fillInput(this.serviceUrlInput, url);
    await this.click(this.saveServiceButton);
  }

  async editService(newHost,newName) {
    // Click on the service to edit
    await this.click(this.actionButton);
    await this.click(this.editButton);
    // clear existing host and name
    await this.servicehostInput.fill('');
    await this.serviceNameInput.fill('');
    // Fill in new host and name
    if (newHost) {
      await this.fillInput(this.servicehostInput, newHost);
    }
    if (newName) {
      await this.fillInput(this.serviceNameInput, newName);
    }
    // save changes
    await this.click(this.saveServiceButton);
  }
  /**
   * verify service created successfully
   * @param {string} serviceName - 服务名称
   * @param {string} servicehost - 服务主机
   */
  async verifyServiceCreated(serviceName,servicehost) {
    await this.verifyElementText(this.configureName, serviceName);
    await this.verifyElementText(this.configureHost, servicehost);
  }
  
  async verifyServiceviaApi(serviceName, servicehost) {
    const serviceDetails = await getService(serviceName);
    expect(serviceDetails.name).toBe(serviceName);
    expect(serviceDetails.host).toBe(servicehost);
    expect(serviceDetails.created_at).toBeDefined();
  }

  /**
   * 删除服务
   * @param {string} serviceName - 服务名称
   */
  async deleteService(serviceName) {

    await this.click(this.actionButton);
    
    await this.click(this.deleteButton);
    //enter service name to confirm deletion
    await this.fillInput(this.confirmInput, serviceName);
    // 确认删除对话框
    await this.click(this.confirmButton);
    //confirm deletion
    const serviceItem = this.page.locator(`xpath=//tr[data-testid="${serviceName}"]`);
    await expect(serviceItem).toHaveCount(0);
  }


 
}
module.exports = { ServicesPage };