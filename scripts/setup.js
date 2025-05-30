#!/usr/bin/env node
/**
 * This script helps set up the Smart Name Card project for development
 * It guides the user through necessary setup steps including:
 * - Installing dependencies
 * - Setting up the development environment
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
async function promptInput(message) {
  return new Promise(resolve => {
    rl.question(`${message}: `, answer => {
      resolve(answer);
    });
  });
}

/**
 * Main setup function
 */
async function setup() {
  console.log(chalk.bold.blue('\n======================================='));
  console.log(chalk.bold.blue('      Smart Name Card Setup Wizard      '));
  console.log(chalk.bold.blue('=======================================\n'));
  
  console.log(chalk.yellow('This wizard will help you set up the Smart Name Card project.\n'));
  
  // Step 1: Install dependencies
  console.log(chalk.blue('Installing dependencies...'));
  const installDeps = await confirm('Would you like to install project dependencies?');
  
  if (installDeps) {
    runCommand('npm install', 'Installing dependencies');
  }
  
  // Setup complete
  console.log(chalk.green.bold('\n✨ Setup completed successfully! ✨\n'));
  console.log(chalk.white(`You can now run ${chalk.cyan('npm run dev')} to start the development server.`));
  
  console.log(chalk.yellow(`\nLogin Information:`));
  console.log(chalk.yellow(`- Username: test`));
  console.log(chalk.yellow(`- Password: test\n`));
  
  rl.close();
}

// Run the setup
setup().catch(error => {
  console.error(chalk.red('\n❌ An error occurred:'));
  console.error(error);
  rl.close();
  process.exit(1);
});
