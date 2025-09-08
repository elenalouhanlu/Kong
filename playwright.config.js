// @ts-check
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();
// 从.env文件获取浏览器配置，默认运行所有浏览器
const selectedBrowser = process.env.BROWSER?.toLowerCase();
const validBrowsers = ['chromium', 'firefox', 'webkit'];
const isBrowserValid = selectedBrowser && validBrowsers.includes(selectedBrowser);

const projects = isBrowserValid 
  ? [
      {
        name: selectedBrowser,
        use: { ...devices[`Desktop ${selectedBrowser.charAt(0).toUpperCase() + selectedBrowser.slice(1)}`] },
      }
    ]
  : [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      },
    ];

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.KONG_BASE_URL || 'http://localhost:8002',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  
  /* Configure projects for major browsers */
//   projects: [
//     {
//       name: 'chromium',
//       use: { ...devices['Desktop Chrome'] },
//     },

//     {
//       name: 'firefox',
//       use: { ...devices['Desktop Firefox'] },
//     },

//     {
//       name: 'webkit',
//       use: { ...devices['Desktop Safari'] },
//     },

//     /* Test against mobile viewports. */
//     // {
//     //   name: 'Mobile Chrome',
//     //   use: { ...devices['Pixel 5'] },
//     // },
//     // {
//     //   name: 'Mobile Safari',
//     //   use: { ...devices['iPhone 12'] },
//     // },

//     /* Test against branded browsers. */
//     // {
//     //   name: 'Microsoft Edge',
//     //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
//     // },
//     // {
//     //   name: 'Google Chrome',
//     //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
//     // },
//   ],

  

//   /* Run your local dev server before starting the tests */
//   // webServer: {
//   //   command: 'npm run start',
//   //   url: 'http://127.0.0.1:3000',
//   //   reuseExistingServer: !process.env.CI,
//   // },
});
