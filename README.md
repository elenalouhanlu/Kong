Kong API Gateway Automation Test Framework
Project Overview
This framework is built on Playwright and focuses on automated testing for core functionalities of the Kong API Gateway. It covers key modules including Services, Routes, and Plugins (e.g., Rate Limiting). Designed with the Page Object Model (POM) pattern, the framework supports dual verification (UI operations + Kong Admin API) and automatic resource cleanup to ensure a clean test environment and stable, reusable test cases.
Core Features
Module	Supported Functionalities
Service Management	Create, query, update, delete services; verify service configuration consistency via API
Route Management	Create (service association + HTTP method selection), query, delete routes; validate route matching rules
Plugin Management	Add/remove rate-limiting plugins for services; verify plugin effectiveness (429 responses)
Dual Verification	Combine UI verification (display/alerts) and Admin API verification (actual configurations) for reliability
Auto Cleanup	Automatically delete associated plugins → routes → services after tests to avoid residual data impacting subsequent runs
Environment Adaptation	Configure Kong addresses for different environments (dev/test/prod) via .env for flexible switching
Retry Mechanism	Auto-retry for resource loading delays (e.g., initial 404 errors) to reduce flaky failures
Prerequisites
Kong Gateway: Version 2.x or higher (ensure Kong UI and Admin API are accessible)
Node.js: Version 16.x or higher (required for Playwright support)
Package Manager: npm 8.x+ or yarn 1.x+
Browsers: Playwright-supported browsers (Chrome, Firefox, Safari; automatically installed by Playwright)
Quick Start
1. Clone the Project & Install Dependencies
bash
# Clone the repository (replace with your actual repo URL)
git clone https://github.com/your-org/kong-automation-test.git
cd kong-automation-test

# Install core dependencies
npm install

# Install Playwright browsers (required for first-time execution)
npx playwright install
2. Environment Configuration
Create a .env file in the project root directory and configure Kong addresses and test parameters (refer to .env.example):

ini
# ---------------- Kong Basic Configuration ----------------
# Kong UI access URL (e.g., http://localhost:8002)
KONG_UI_URL=http://localhost:8002
# Kong Admin API URL (default: http://localhost:8001)
KONG_ADMIN_URL=http://localhost:8001
# Kong Gateway proxy URL (for validating routes/plugins; default: http://localhost:8000)
KONG_GATEWAY_URL=http://localhost:8000

# ---------------- Test Configuration ----------------
# Global timeout (milliseconds; default: 60000)
TIMEOUT=60000
# API retry count (resolves initial 404; default: 5)
API_RETRY_MAX=5
# API retry interval (milliseconds; default: 1000)
API_RETRY_DELAY=1000
3. Run Tests
Tests are organized by module. You can run tests for a specific module or all tests:
3.1 Run Tests by Module
bash
# 1. Run Service Management tests
npx playwright test tests/services/

# 2. Run Route Management tests
npx playwright test tests/routes/

# 3. Run Rate Limiting Plugin tests
npx playwright test tests/plugins/rate-limiting.test.js
3.2 Run All Tests
bash
npx playwright test
3.3 Run Tests in Debug Mode (Pause & Inspect Pages)
bash
# Debug Route tests
npx playwright test tests/routes/ --debug
4. View Test Reports
After test execution, an HTML report is automatically generated. Open it with:

bash
npx playwright show-report

The report includes:

Test results (passed/failed/skipped)
Screenshots and videos for failed cases (for troubleshooting)
Execution time and logs for each step
Project Directory Structure
plaintext
kong-automation-test/
├── .env                # Environment configuration file (create manually)
├── .env.example        # Example environment configuration
├── package.json        # Project dependencies and script configurations
├── playwright.config.js# Playwright global config (timeout, browsers, etc.)
├── README.md           # Project documentation (this file)
├── page-objects/       # Page Object Model (POM) files
│   ├── basePage.js     # Base page object (encapsulates common operations: click, input, etc.)
│   ├── DashboardPage.js# Dashboard page object (navigate to Services/Routes, etc.)
│   ├── ServicePage.js  # Service page object (create/update/delete services)
│   ├── RoutePage.js    # Route page object (create/associate services/select methods)
│   └── PluginPage.js   # Plugin page object (add/verify rate-limiting)
├── tests/              # Test cases (organized by module)
│   ├── services/       # Service Management test cases
│   ├── routes/         # Route Management test cases
│   └── plugins/        # Plugin Management test cases
│       └── rate-limiting.test.js # Rate Limiting Plugin tests
└── utils/              # Utility functions
    ├── kongAdminApi.js # Kong Admin API wrapper (service/route/plugin operations)
    └── testHelpers.js  # Test helpers (generate random names, data, etc.)
Key Module Usage Guide
1. Page Object Model (POM)
All UI operations are encapsulated in the page-objects/ directory. Examples:

Create a service: ServicePage.createService(serviceName, serviceUrl)
Add a rate-limiting plugin: PluginPage.addRateLimitingPlugin(limitCount)
Verify plugin existence: PluginPage.verifyPluginExists('rate-limiting')
2. Kong Admin API Utilities
utils/kongAdminApi.js wraps core Kong API operations, supporting:

Services: createService, deleteService, serviceExists
Routes: getRoutesForService, deleteRoute, verifyRouteConfig
Plugins: getPluginsForService, deletePlugin, verifyPluginExists
3. Automatic Cleanup Mechanism
Test cases use test.afterEach to automatically clean up resources in the following order:

Delete all plugins associated with the service → 2. Delete all routes associated with the service → 3. Delete the service
No manual intervention is required, and residual data is prevented from impacting subsequent tests.
Framework Extension Guide
Add a New Plugin Test (e.g., CORS Plugin)
In page-objects/PluginPage.js, add an addCorsPlugin method to encapsulate UI operations for adding the CORS plugin.
In utils/kongAdminApi.js, add a verifyCorsPlugin method to encapsulate API verification for the CORS plugin.
Create cors.test.js in the tests/plugins/ directory and write test cases (refer to rate-limiting.test.js).
Customize Test Data
Modify the random generation functions in utils/testHelpers.js, e.g.:

generateServiceName(): Customize the prefix for service names
generateRoutePath(): Adjust the format of route paths
Notes
Kong Admin API Permissions: Ensure the KONG_ADMIN_URL has read/write permissions (to avoid 403 errors).
Browser Compatibility: Tests run on Chromium by default. To switch browsers, modify the BROWSER variable in .env (options: chromium/firefox/webkit).
Timeout Adjustment: If your test environment is slow, increase timeout or actionTimeout in playwright.config.js.
Data Isolation: Test cases use random names (e.g., service-THOrN8qh-5078) to avoid conflicts with manually created resources.
Frequently Asked Questions (FAQs)
Initial test run returns 404:
Cause: Asynchronous delay when Kong resources (services/routes) take effect after creation.
Solution: The framework includes a built-in retry mechanism. Adjust API_RETRY_MAX in .env to increase retry attempts.
Service deletion fails (error: "has associated routes"):
Cause: Incomplete cleanup of associated resources.
Solution: The deleteService method automatically cleans up plugins → routes before deleting the service. Ensure the cleanup order is correct.
No screenshots/videos in test reports:
Cause: Screenshots/videos are only generated for failed cases by default.
Solution: Modify the screenshot and video configurations in playwright.config.js to 'on'.
Dependency Versions
Dependency	Version Requirement
@playwright/test	^1.38.0
node-fetch	^2.6.7
dotenv	^16.3.1
cross-env	^7.0.3

To update dependencies, run npm update.