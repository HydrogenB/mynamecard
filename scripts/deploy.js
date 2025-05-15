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
  // Set to true to migrate data from realtime database to Firestore (if needed)
  migrateData: false,
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
 * Main deployment function
 */
async function deploy() {
  console.log(chalk.bold.blue('\n🚀 Starting deployment process\n'));
    // Check if Firebase CLI is installed and logged in
  try {
    execSync('node scripts/checkFirebaseCLI.js', { stdio: 'inherit' });
  } catch (error) {
    console.error(chalk.red('\n❌ Firebase CLI check failed. Please make sure Firebase CLI is installed and you are logged in.'));
    process.exit(1);
  }
  
  // Validate Firebase configuration
  try {
    execSync('node scripts/validateFirebaseConfig.js', { stdio: 'inherit' });
  } catch (error) {
    console.error(chalk.red('\n❌ Firebase configuration validation failed.'));
    process.exit(1);
  }
  
  // Build the web app
  if (config.deployHosting) {
    if (!runCommand('npm run build:web', 'Building web app')) {
      process.exit(1);
    }
  }
  
  // Build the functions
  if (config.deployFunctions) {
    if (!runCommand('npm run build:functions', 'Building Cloud Functions')) {
      process.exit(1);
    }
  }
    // Initialize Firestore if needed
  if (config.initializeFirestore) {
    console.log(chalk.yellow('\n⚠️ About to initialize Firestore collections'));
    console.log(chalk.yellow('This should only be done once per project. Make sure emulators are running if testing locally.\n'));
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    await new Promise(resolve => {
      readline.question('Continue with Firestore initialization? (y/N) ', answer => {
        if (answer.toLowerCase() === 'y') {
          runCommand('npm run setup:firebase', 'Initializing Firestore collections and configuring limits');
        } else {
          console.log(chalk.yellow('Skipping Firestore initialization'));
        }
        readline.close();
        resolve();
      });
    });
  }
  
  // Migrate data if needed
  if (config.migrateData) {
    console.log(chalk.yellow('\n⚠️ About to migrate data from Realtime Database to Firestore'));
    console.log(chalk.yellow('This operation may take some time and should be performed only once.\n'));
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    await new Promise(resolve => {
      readline.question('Continue with data migration? (y/N) ', answer => {
        if (answer.toLowerCase() === 'y') {
          runCommand('npm run migrate:data', 'Migrating data to Firestore');
        } else {
          console.log(chalk.yellow('Skipping data migration'));
        }
        readline.close();
        resolve();
      });
    });
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
      
      console.log(chalk.blue(`Calling function at ${functionUrl}`));
      const response = await axios.get(functionUrl);
      
      if (response.data.success) {
        console.log(chalk.green('✅ Card limits configured successfully'));
      } else {
        console.log(chalk.yellow('⚠️ Card limits configuration returned an error'));
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to configure card limits:'), error.message);
    }
  }
  
  console.log(chalk.bold.green('\n✨ Deployment completed successfully!\n'));
}

// Run the deployment
deploy().catch(error => {
  console.error(chalk.red('\n❌ Deployment failed with an error:'));
  console.error(error);
  process.exit(1);
});
