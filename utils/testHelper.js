/**
 * 生成随机字符串
 * @param {number} length - 字符串长度
 * @returns {string} 随机字符串
 */
function generateRandomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成随机服务名称
 * @returns {string} 随机服务名称
 */
function generateServiceName() {
  return `service-${generateRandomString()}-${Date.now().toString().slice(-4)}`;
}

/**
 * 生成随机路由名称
 * @returns {string} 随机路由名称
 */
function generateRouteName() {
  return `route-${generateRandomString()}-${Date.now().toString().slice(-4)}`;
}

/**
 * 等待指定时间
 * @param {number} ms - 毫秒数
 * @returns {Promise} 等待Promise
 */
function waitFor(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  generateRandomString,
  generateServiceName,
  generateRouteName,
  waitFor
};