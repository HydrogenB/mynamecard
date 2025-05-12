#!/usr/bin/env node
/**
 * This script validates the Firebase configuration
 * It checks if all required Firebase properties are set in the configuration
 */
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Path to Firebase config file
const configPath = path.join(__dirname, '..', 'apps', 'web', 'src', 'config', 'firebase.ts');

/**
 * Check if the Firebase config file exists
 */
function checkFileExists() {
  if (!fs.existsSync(configPath)) {
    console.error(chalk.red(`❌ Firebase config file not found at: ${configPath}`));
    return false;
  }
  return true;
}

/**
 * Extract the Firebase configuration from the file
 */
function extractConfig() {
  const content = fs.readFileSync(configPath, 'utf-8');
  
  // Look for the firebaseConfig object in the file
  const configRegex = /export const firebaseConfig = ({[\s\S]*?});/m;
  const match = content.match(configRegex);
  
  if (!match || !match[1]) {
    console.error(chalk.red('❌ Could not find firebaseConfig object in the config file.'));
    return null;
  }
  
  try {
    // This is a bit of a hack but works for extracting the config
    const configStr = match[1].replace(/(\w+):/g, '"$1":');
    return JSON.parse(configStr);
  } catch (error) {
    console.error(chalk.red('❌ Failed to parse Firebase config:'));
    console.error(error);
    return null;
  }
}

/**
 * Validate the Firebase configuration
 */
function validateConfig(config) {
  const requiredProps = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];
  
  const missingProps = [];
  
  for (const prop of requiredProps) {
    if (!config[prop]) {
      missingProps.push(prop);
    }
  }
  
  if (missingProps.length > 0) {
    console.error(chalk.red(`❌ Firebase config is missing the following properties: ${missingProps.join(', ')}`));
    return false;
  }
  
  return true;
}

/**
 * Main validation function
 */
function validateFirebaseConfig() {
  console.log(chalk.blue('Validating Firebase configuration...'));
  
  if (!checkFileExists()) {
    return false;
  }
  
  const config = extractConfig();
  
  if (!config) {
    return false;
  }
  
  if (!validateConfig(config)) {
    return false;
  }
  
  console.log(chalk.green('✅ Firebase configuration is valid!'));
  console.log(chalk.green(`Project ID: ${config.projectId}`));
  
  return true;
}

// Run the validation
const isValid = validateFirebaseConfig();

if (!isValid) {
  console.log(chalk.yellow('\n⚠️ Please fix the Firebase configuration before deploying.'));
  console.log(chalk.yellow('You can use "npm run setup" to help set up the project.'));
  process.exit(1);
}

module.exports = validateFirebaseConfig;
