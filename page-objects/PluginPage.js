const { BasePage } = require('./basePage');

class PluginPage extends BasePage {
  constructor(page) {
    super(page);
    // 插件页面元素定位器
    this.pluginsTab = page.locator('xpath=//a[text()="Plugins"]');
    this.plugintabfromservice = page.locator('xpath = //div[@id="service-plugins"]')
    this.addpluginButton = page.locator('xpath=//a[@data-testid="empty-state-action"]');
    this.limitInputMinute = page.locator('xpath=//input[@id="config-minute"]');
    this.submitButton = page.locator('xpath=//button[text()="Save"]');
    this.pluginRateLimitging = page.locator('xpath=//a[@data-testid="rate-limiting-card"]');
    this.successMessage = page.locator('xpath=//div[contains(@class, "alert-success")]');
  }

  /**
   * navigate to the Plugins tab of the selected service
   */
  async navigateToServicePluginsfromservice() {
    await this.plugintabfromservice.click();
    await this.addpluginButton.click()
    await this.pluginRateLimitging.waitFor({ state: 'visible' });
  }

  /**
   * add rate limiting plugin to the service
   * @param {number} limit - limit per minute
   */
  async addRateLimitingPlugin(limit) {
    await this.pluginRateLimitging.click();
    
    // fill limit
    await this.limitInputMinute.fill(limit.toString());
    
    // submit
    await this.submitButton.click();
  }

  /**
   * verify the plugin is added successfully
   * @param {string} pluginName 
   * @returns {Promise<boolean>} 
   */
  async verifyPluginAdded(pluginName) {
    const pluginRow = this.page.locator(`xpath=//tr[@data-testid="${pluginName}"]`);
    await pluginRow.waitFor({ state: 'visible' });
    return pluginRow.isVisible();
  }

}

module.exports = { PluginPage };
