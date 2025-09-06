const { expect } = require('@playwright/test');

class BasePage {
  constructor(page) {
    this.page = page;
    this.loader = page.locator('.loading-indicator');
    this.notification = page.locator('.notification');
  }

  /**
   * 导航到指定路径
   * @param {string} path - 相对路径
   */
  async navigate(path) {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  /**
   * 等待页面加载完成
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.loader.waitFor({ state: 'hidden', timeout: 10000 });
  }

  /**
   * 点击元素
   * @param {Locator} element - 要点击的元素定位器
   * @param {Object} options - 点击选项
   */
  async click(element, options = {}) {
    await element.click(options);
    await this.waitForPageLoad();
  }

  /**
   * 填写输入框
   * @param {Locator} input - 输入框定位器
   * @param {string} text - 要输入的文本
   */
  async fillInput(input, text) {
    await input.fill(text);
  }

  /**
   * 选择下拉选项
   * @param {Locator} select - 下拉框定位器
   * @param {string} option - 选项文本
   */
  async selectOption(select, option) {
    await select.selectOption({ label: option });
    await this.waitForPageLoad();
  }

  /**
   * 验证通知消息
   * @param {string} message - 预期消息
   * @param {string} type - 消息类型，如 'success', 'error'
   */
  async verifyNotification(message, type = 'success') {
    const notification = this.notification.filter({ hasText: message });
    await expect(notification).toBeVisible();
    await expect(notification).toHaveClass(new RegExp(type));
  }

  /**
   * 等待元素出现
   * @param {Locator} element - 元素定位器
   * @param {number} timeout - 超时时间
   */
  async waitForElement(element, timeout = 10000) {
    await element.waitFor({ state: 'visible', timeout });
  }

  /**
   * 验证元素文本
   * @param {Locator} element - 元素定位器
   * @param {string} text - 预期文本
   */
  async verifyElementText(element, text) {
    await expect(element).toHaveText(text);
  }

  /**
   * 验证元素是否可见
   * @param {Locator} element - 元素定位器
   */
  async verifyElementVisible(element) {
    await expect(element).toBeVisible();
  }

  /**
   * 验证元素是否隐藏
   * @param {Locator} element - 元素定位器
   */
  async verifyElementHidden(element) {
    await expect(element).toBeHidden();
  }

  /**
   * 获取当前URL
   * @returns {Promise<string>} 当前页面URL
   */
  async getCurrentUrl() {
    return this.page.url();
  }

  /**
   * 刷新页面
   */
  async refreshPage() {
    await this.page.reload();
    await this.waitForPageLoad();
  }
}

module.exports = { BasePage };