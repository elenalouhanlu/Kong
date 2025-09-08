const { BasePage } = require('./basePage');

class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.workspace = page.locator('xpath=//*[@class="title"]');
    this.servicesLink = page.locator('a:has-text("Gateway Services")');
    this.routesLink = page.locator('a:has-text("Routes")');
    this.consumersLink = page.locator('a:has-text("Consumers")');
    this.logoutButton = page.locator('button:has-text("Logout")');
    this.userMenu = page.locator('.user-menu');
  }

  
  /**
   * 验证仪表盘页面是否加载
   */

  
  async verifyDashboardLoaded() {
    await this.verifyElementVisible(this.workspace);
    // await this.verifyElementVisible(this.servicesLink);
    // await this.verifyElementVisible(this.routesLink);
  }

  /**
   * 导航到服务页面
   */
  async goToServices() {
    await this.click(this.servicesLink);
  }

  /**
   * 导航到路由页面
   */
  async goToRoutes() {
    await this.click(this.routesLink);
  }

  /**
   * 执行登出操作
   */
//   async logout() {
//     await this.click(this.userMenu);
//     await this.click(this.logoutButton);
//   }
}

module.exports = { DashboardPage };