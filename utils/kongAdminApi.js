const fetch = require('node-fetch');
require('dotenv').config();

// Kong Admin API base url
const KONG_ADMIN_URL = process.env.KONG_ADMIN_URL || 'http://localhost:8001';
const API_TIMEOUT = 5000;
const { testData } = require('./testData');
const { default: test } = require('@playwright/test');
const RETRY_CONFIG = {
  maxRetries: process.env.API_RETRY_MAX || 5, 
  retryDelay: process.env.API_RETRY_DELAY || 1000 
};


/**
 * user Kong Admin API find service by name
 * @param {string} serviceName - service name
 * @returns {Promise<Object>} service details
 * @throws {Error} error if service not found or API request fails
 */
async function getService(serviceName) {
  try {
    const response = await fetch(`${KONG_ADMIN_URL}/services/${serviceName}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`service not found: ${serviceName} (API返回404)`);
      }
      throw new Error(`API request fail: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`fail on finding service: ${error.message}`);
  }
}
/**
 * use api to all kong admin api
 * @param {string} path - api path
 * @param {string} method - http methods
 * @param {object} data - data
 * @returns {Promise<object>} - response data
 */
async function requestApi(path, method = 'GET', data = null) {
  const url = `${KONG_ADMIN_URL}${path}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    timeout: API_TIMEOUT
  };

  // if data is provided, add to body
  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    // process non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); //any error response may not be json
      const error = new Error(`API request fail [${response.status}]: ${errorData.message || 'unkown error'}`);
      error.status = response.status; // status code
      throw error;
    }

    // 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    return await response.json();
  } catch (error) {
    // timeout or network error
    if (!error.status) {
      error.message = `api connection fail: ${error.message} (url: ${url})`;
    }
    throw error;
  }
}

/**
 * get routes for a given service
 * @param {string} serviceName - service name
 * @returns {Promise<object[]>} - routes array
 */
async function getRoutesForService(serviceName) {
  console.log(`🔍 get route from service: ${serviceName}`);
  try {
    const response = await requestApi(`/services/${serviceName}/routes`);
    //return data array
    return Array.isArray(response) ? response : response.data || [];
  } catch (error) {
    if (error.status === 404) {
      // return empty array if service not found
      console.log(`ℹ️ Service ${serviceName} not found, return empty route list`);
      return [];
    }
    console.warn(`⚠️ fail to get route: ${error.message}`);
    throw error;
  }
}


/**
 * use Kong admin api to delete service
 * @param {string} serviceName - service name
 * @returns {Promise<boolean>} return true if deleted or not exists, false if error
 */
async function deleteService(serviceName) {
  try {
    // check if service exists
    const exists = await serviceExists(serviceName);
    if (!exists) {
      console.log(`service ${serviceName} no longer exists, skip delete.`);
      return true;
    }

    // send delete request
    const response = await fetch(
      `${KONG_ADMIN_URL}/services/${serviceName}`,
      { method: 'DELETE' }
    );

    if (response.ok) {
      console.log(`✅ deleted service: ${serviceName}`);
      return true;
    } else {
      const error = await response.text();
      console.error(`❌ delete service ${serviceName} fail: ${error}`);
      return false;
    }
  } catch (error) {
    console.error(`❌delete service ${serviceName} error:`, error.message);
    return false;
  }
}

/**
 * delete route by ID or name
 * @param {string} routeIdOrName 
 * @returns {Promise<object>} 
 */
async function deleteRoute(routeIdOrName) {
  console.log(`🗑️ delete route: ${routeIdOrName}`);
  try {
    return await requestApi(`/routes/${routeIdOrName}`, 'DELETE');
  } catch (error) {
    if (error.status === 404) {
      console.log(`ℹ️ route ${routeIdOrName} no longer exists.`);
      return { success: true, message: 'route not exist' };
    }
    console.warn(`⚠️ delete route fail: ${error.message}`);
    throw error;
  }
}
/**
 * plugins methods
 */

/**
 * add plugin to a service
 * @param {string} serviceName 
 * @param {number} limit 
 * @param {string} period 
 * @returns {Promise<object>} 
 */
async function createRateLimitingPlugin(serviceName, limit, period = 'minute') {
  console.log(`📝 service ${serviceName} add rate-limiting plugins: ${limit} times/${period}`);
  return requestApi('/plugins', 'POST', {
    name: 'rate-limiting',
    service: { name: serviceName },
    config: {
      minute: period === 'minute' ? limit : undefined,
      hour: period === 'hour' ? limit : undefined,
      second: period === 'second' ? limit : undefined,
      day: period === 'day' ? limit : undefined,
      policy: 'local'
    }
  });
}

/**
 * get plugins for a given service
 * @param {string} serviceName 
 * @returns {Promise<object[]>} 
 */
async function getPluginsForService(serviceName) {
  console.log(`🔍 getr service ${serviceName} related plugins`);
  try {
    const response = await requestApi(`/services/${serviceName}/plugins`);
    return Array.isArray(response) ? response : response.data || [];
  } catch (error) {
    if (error.status === 404) return [];
    console.warn(`⚠️ get plugins fail: ${error.message}`);
    throw error;
  }
}

/**
 * //delete plugin by ID
 * @param {string} pluginId 
 * @returns {Promise<object>} 
 */
async function deletePlugin(pluginId) {
  console.log(`🗑️ delete plugins: ${pluginId}`);
  try {
    return await requestApi(`/plugins/${pluginId}`, 'DELETE');
  } catch (error) {
    if (error.status === 404) {
      console.log(`ℹ️ plugins ${pluginId} no longer exist`);
      return { success: true };
    }
    console.warn(`⚠️ delete plugin fail: ${error.message}`);
    throw error;
  }
}

async function serviceExists(serviceName) {
  try {
    await requestApi(`/services/${serviceName}`);
    return true;
  } catch (error) {
    if (error.status === 404) {
      return false; 
    }
    
    throw new Error(`check service error: ${error.message}`);
  }
}

async function waitForServiceDeleted(name, timeout=5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const exists = await getService(name).catch(() => null);
    if (!exists) return;
    await new Promise(res => setTimeout(res, 500));
  }
  throw new Error(`Service ${name} was not deleted in time`);
}

module.exports = {
  getService,
  deleteService,
  getRoutesForService,
  createRateLimitingPlugin,
  getPluginsForService,
  deleteRoute,
  deletePlugin,
  requestApi,
  waitForServiceDeleted,
};
