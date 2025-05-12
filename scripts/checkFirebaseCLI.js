#!/usr/bin/env node
/**
 * This script checks if Firebase CLI is installed and installs it if needed
 */
const { execSync, exec } = require('child_process');
const chalk = require('chalk');

/**
 * Check if a command exists
 */
function commandExists(command) {
  try {
    execSync(`where ${command}`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Install Firebase CLI
 */
function installFirebaseCLI() {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue('Installing Firebase CLI globally...'));
    
    exec('npm install -g firebase-tools', (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red('Error installing Firebase CLI:'));
        console.error(error.message);
        reject(error);
        return;
      }
      
      console.log(stdout);
      console.log(chalk.green('✅ Firebase CLI installed successfully!'));
      resolve();
    });
  });
}

/**
 * Check if Firebase CLI is logged in
 */
function checkFirebaseLogin() {
  try {
    execSync('firebase projects:list --json', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log(chalk.blue('Checking Firebase CLI installation...'));
  
  // Check if Firebase CLI is installed
  const isFirebaseInstalled = commandExists('firebase');
  
  if (!isFirebaseInstalled) {
    console.log(chalk.yellow('Firebase CLI is not installed.'));
    try {
      await installFirebaseCLI();
    } catch (error) {
      console.error(chalk.red('Failed to install Firebase CLI. Please install it manually:'));
      console.error(chalk.yellow('npm install -g firebase-tools'));
      process.exit(1);
    }
  } else {
    console.log(chalk.green('✅ Firebase CLI is installed.'));
  }
  
  // Check if Firebase CLI is logged in
  const isLoggedIn = checkFirebaseLogin();
  
  if (!isLoggedIn) {
    console.log(chalk.yellow('You are not logged in to Firebase.'));
    console.log(chalk.blue('Please run the following command to log in:'));
    console.log(chalk.yellow('firebase login'));
    process.exit(0);
  } else {
    console.log(chalk.green('✅ Firebase CLI is logged in.'));
  }
  
  console.log(chalk.green('✅ Firebase CLI is ready to use!'));
}

// Run the main function
main().catch(error => {
  console.error(chalk.red('An error occurred:'));
  console.error(error);
  process.exit(1);
});
