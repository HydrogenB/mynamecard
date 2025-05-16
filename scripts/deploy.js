#!/usr/bin/env node
// filepath: c:\Jirad-python\mynamecard\scripts\deploy.js
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const config = {
  // Set to false to skip deploying functions (requires Blaze plan)
  deployFunctions: false,
  // Set to true to deploy hosting
  deployHosting: true,
  // Set to true to deploy Firestore rules and indexes
  deployFirestore: true,
  // Set to false to skip Firestore initialization (we'll manually initialize if needed)
  initializeFirestore: false, 
  // Set to false to skip card limits function (requires Blaze plan)
  setupCardLimits: false
};

/**
 * Run a command and log the output
 */
function runCommand(command, label) {
  console.log(chalk.blue(`\n📋 ${label}...\n`));
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(chalk.green(`\n✅ ${label} completed successfully\n`));
    return true;
  } catch (error) {
    console.error(chalk.red(`\n❌ ${label} failed\n`));
    console.error(error.message);
    return false;
  }
}

/**
 * Main deploy function
 */
async function deploy() {
  console.log(chalk.bold.blue('\n🚀 Starting Smart Name Card deployment\n'));
  
  // Check if user is logged in to Firebase
  try {
    execSync('firebase projects:list', { stdio: 'ignore' });
  } catch (error) {
    console.log(chalk.yellow('\n⚠️ You need to log in to Firebase first\n'));
    if (!runCommand('firebase login', 'Logging in to Firebase')) {
      process.exit(1);
    }
  }
  
  // Check if Firebase config is valid
  if (!runCommand('node scripts/validateFirebaseConfig.js', 'Validating Firebase configuration')) {
    process.exit(1);
  }
  
  // Build the app
  if (!runCommand('npm run build:web', 'Building web application')) {
    process.exit(1);
  }
  
  // Build functions if needed
  if (config.deployFunctions) {
    if (!runCommand('npm run build:functions', 'Building Firebase functions')) {
      process.exit(1);
    }
  }
  
  // Initialize Firestore if needed
  if (config.initializeFirestore) {
    console.log(chalk.blue('\n🔧 Setting up Firestore schema'));
    runCommand('npm run init:firestore', 'Initializing Firestore schema');
  }
  
  // Deploy Firestore rules and indexes
  if (config.deployFirestore) {
    if (!runCommand('firebase deploy --only firestore', 'Deploying Firestore rules and indexes')) {
      process.exit(1);
    }
  }
  
  // Deploy functions
  if (config.deployFunctions) {
    if (!runCommand('firebase deploy --only functions', 'Deploying Cloud Functions')) {
      process.exit(1);
    }
  }
  
  // Deploy hosting
  if (config.deployHosting) {
    if (!runCommand('firebase deploy --only hosting', 'Deploying web app')) {
      process.exit(1);
    }
  }
  
  // Set up card limits via Cloud Function if requested
  if (config.setupCardLimits) {
    console.log(chalk.blue('\n🔧 Setting up card limits configuration'));
    
    // Use the deployed cloud function to set up card limits
    try {
      const axios = require('axios');
      const projectId = process.env.FIREBASE_PROJECT_ID || require('../firebase.json').project;
      
      // Construct the URL to the initializeCardLimits function
      const functionUrl = `https://us-central1-${projectId}.cloudfunctions.net/initializeCardLimits`;
      
      console.log(`Calling function at ${functionUrl}`);
      const response = await axios.post(functionUrl, {
        adminKey: process.env.FIREBASE_ADMIN_KEY || 'admin-key'
      });
      
      console.log('Function response:', response.data);
      console.log(chalk.green('✅ Card limits configuration completed'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to set up card limits:'), error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  }
  
  console.log(chalk.green('\n✅ Deployment completed successfully!\n'));
}

// Run the deployment
deploy().catch(error => {
  console.error(chalk.red('\n❌ Deployment failed:'));
  console.error(error);
  process.exit(1);
});
