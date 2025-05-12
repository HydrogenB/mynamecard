#!/usr/bin/env node
/**
 * This script helps set up the Smart Name Card project for development or deployment
 * It guides the user through necessary setup steps including:
 * - Installing dependencies
 * - Configuring Firebase
 * - Initializing Firestore
 * - Setting up emulators
 */
const { execSync } = require('child_process');
const chalk = require('chalk');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
 * Prompt user for confirmation
 */
async function confirm(message) {
  return new Promise(resolve => {
    rl.question(`${message} (y/N) `, answer => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Prompt user for input
 */
async function prompt(message, defaultValue = '') {
  return new Promise(resolve => {
    const defaultText = defaultValue ? ` (default: ${defaultValue})` : '';
    rl.question(`${message}${defaultText}: `, answer => {
      resolve(answer || defaultValue);
    });
  });
}

/**
 * Check if Firebase CLI is installed
 */
function checkFirebaseCLI() {
  try {
    execSync('where firebase', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Main setup function
 */
async function setup() {
  console.log(chalk.bold.blue('\n🚀 Starting Smart Name Card project setup\n'));
  
  // Step 1: Install dependencies
  console.log(chalk.blue('\nChecking dependencies...'));
  const installDeps = await confirm('Would you like to install npm dependencies?');
  
  if (installDeps) {
    runCommand('npm install', 'Installing dependencies');
  } else {
    console.log(chalk.yellow('Skipping dependency installation.'));
  }
  
  // Step 2: Firebase CLI check
  console.log(chalk.blue('\nChecking Firebase CLI...'));
  const isFirebaseInstalled = checkFirebaseCLI();
  
  if (!isFirebaseInstalled) {
    console.log(chalk.yellow('Firebase CLI is not installed.'));
    const installFirebase = await confirm('Would you like to install Firebase CLI globally?');
    
    if (installFirebase) {
      runCommand('npm install -g firebase-tools', 'Installing Firebase CLI');
    } else {
      console.log(chalk.red('\n⚠️ Firebase CLI is required for this project.'));
      console.log(chalk.yellow('Please install it manually with: npm install -g firebase-tools'));
    }
  } else {
    console.log(chalk.green('✅ Firebase CLI is installed.'));
  }
  
  // Step 3: Firebase login
  console.log(chalk.blue('\nChecking Firebase login...'));
  const checkLogin = await confirm('Would you like to log in to Firebase?');
  
  if (checkLogin) {
    runCommand('firebase login', 'Logging in to Firebase');
  }
  
  // Step 4: Firebase project selection
  console.log(chalk.blue('\nSelecting Firebase project...'));
  const listProjects = await confirm('Would you like to list available Firebase projects?');
  
  if (listProjects) {
    runCommand('firebase projects:list', 'Listing Firebase projects');
    
    const setupProject = await confirm('Would you like to select a Firebase project for this application?');
    
    if (setupProject) {
      runCommand('firebase use --interactive', 'Selecting Firebase project');
    }
  }
  
  // Step 5: Firebase emulators setup
  console.log(chalk.blue('\nSetting up Firebase emulators...'));
  const setupEmulators = await confirm('Would you like to set up Firebase emulators for local development?');
  
  if (setupEmulators) {
    runCommand('firebase init emulators', 'Setting up Firebase emulators');
  }
  
  // Step 6: Firestore setup
  console.log(chalk.blue('\nSetting up Firestore...'));
  const setupFirestore = await confirm('Would you like to set up Firestore collections and rules?');
  
  if (setupFirestore) {
    runCommand('npm run setup:firebase', 'Setting up Firestore');
    runCommand('firebase deploy --only firestore:rules', 'Deploying Firestore rules');
  }
  
  // Step 7: Migration from Realtime Database (if needed)
  console.log(chalk.blue('\nChecking for existing Realtime Database data...'));
  const needsMigration = await confirm('Do you need to migrate data from Realtime Database to Firestore?');
  
  if (needsMigration) {
    runCommand('node scripts/migrateHelper.js', 'Running migration helper');
  }
  
  // Done
  console.log(chalk.green('\n✅ Setup process complete!'));
  console.log(chalk.blue('\nNext steps:'));
  console.log(chalk.blue('1. Run "npm run dev" to start the development server'));
  console.log(chalk.blue('2. Run "npm run emulate" to start Firebase emulators for local development'));
  console.log(chalk.blue('3. When ready, run "npm run deploy" to deploy the application'));
  
  rl.close();
}

// Run the setup
setup().catch(error => {
  console.error(chalk.red('\n❌ An error occurred:'));
  console.error(error);
  rl.close();
  process.exit(1);
});
