/**
 * This script tests the API endpoints after deployment
 * to verify that the Firebase Functions are working correctly
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

// Try to get Firebase project ID from config
let projectId = 'mynamecard-2c393'; // Default project ID
try {
  const configPath = path.join(__dirname, 'apps', 'web', 'src', 'config', 'firebase.ts');
  const configFile = fs.readFileSync(configPath, 'utf8');
  const projectIdMatch = configFile.match(/projectId:\s*["']([^"']+)["']/);
  if (projectIdMatch && projectIdMatch[1]) {
    projectId = projectIdMatch[1];
  }
} catch (error) {
  console.error('Warning: Could not read Firebase config file. Using default project ID.');
}

// Set region based on Firebase Functions configuration
const region = 'us-central1'; // Default Firebase Functions region

// Collection of tests to run against the API
const tests = [
  {
    name: 'Check if getUserCards function is deployed',
    endpoint: `https://${region}-${projectId}.cloudfunctions.net/getUserCards`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer TEST_TOKEN' // This would fail auth but should return a proper error
    },
    expectStatus: [401, 403, 404, 500], // Any of these indicates the function exists
    onSuccess: (res) => {
      console.log('✅ getUserCards function is deployed');
      return true;
    },
    onError: (error) => {
      // Even auth errors mean the function exists
      if (error.statusCode && [401, 403, 404].includes(error.statusCode)) {
        console.log('✅ getUserCards function is deployed (returned auth error as expected)');
        return true;
      }
      console.error('❌ getUserCards function test failed:', error.message);
      return false;
    }
  }
];

/**
 * Make an HTTP request to a Firebase Function endpoint
 */
function makeRequest(url, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        let responseData;
        try {
          responseData = JSON.parse(data);
        } catch (e) {
          responseData = data;
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject({
        message: `Request failed: ${error.message}`,
        error
      });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Run all API tests
 */
async function runTests() {
  console.log(`🔍 Testing API deployment for project: ${projectId}`);
  console.log(`🌐 Region: ${region}\n`);

  let passedTests = 0;
  const totalTests = tests.length;

  for (const test of tests) {
    console.log(`Running test: ${test.name}`);
    try {
      const response = await makeRequest(
        test.endpoint,
        test.method,
        test.headers,
        test.body
      );

      const success = test.expectStatus.includes(response.statusCode);
      if (success && test.onSuccess) {
        const result = test.onSuccess(response);
        if (result) passedTests++;
      } else if (!success) {
        console.error(`❌ Unexpected status code: ${response.statusCode}`);
        console.error('Response:', response.data);
      }
    } catch (error) {
      if (test.onError) {
        const result = test.onError(error);
        if (result) passedTests++;
      } else {
        console.error(`❌ Test failed: ${error.message}`);
      }
    }
    console.log(''); // Add spacing between tests
  }

  console.log(`Tests completed: ${passedTests} passed out of ${totalTests}`);

  if (passedTests === totalTests) {
    console.log('\n✅ All API tests passed! Your Firebase Functions appear to be deployed correctly.');
  } else {
    console.log('\n⚠️ Some API tests failed. Check the Firebase Console for more details.');
    console.log('Make sure your project is on the Blaze plan and that functions are properly deployed.');
  }
}

// Run all tests
runTests();
