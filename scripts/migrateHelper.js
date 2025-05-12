#!/usr/bin/env node
/**
 * This script helps migrate data from Realtime Database to Firestore
 * It provides a guided process for the migration
 */
const { execSync } = require('child_process');
const chalk = require('chalk');
const readline = require('readline');

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
 * Main migration function
 */
async function migrate() {
  console.log(chalk.bold.blue('\n🚀 Starting migration helper\n'));
  
  // Step 1: Check if emulators should be used
  const useEmulators = await confirm('Do you want to run the migration in the Firebase emulators?');
  
  if (useEmulators) {
    console.log(chalk.blue('\nStarting Firebase emulators...'));
    // Start emulators in the background
    runCommand('start powershell -NoExit -Command "cd \\"' + process.cwd() + '\\" && firebase emulators:start"', 'Starting emulators');
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for emulators to start
  }
  
  // Step 2: Run the migration script
  console.log(chalk.blue('\nPreparing to run the migration script...'));
  console.log(chalk.yellow('⚠️ This will migrate your data from Realtime Database to Firestore.'));
  console.log(chalk.yellow('⚠️ Depending on the amount of data, this may take some time.'));
  
  const confirmMigration = await confirm('\nAre you sure you want to proceed with the migration?');
  
  if (!confirmMigration) {
    console.log(chalk.yellow('\nMigration cancelled.'));
    rl.close();
    return;
  }
  
  // Run the migration script
  const success = runCommand('npm run --prefix ./apps/web migrate-data', 'Migrating data to Firestore');
  
  if (!success) {
    console.log(chalk.red('\n❌ Migration failed. Please check the logs above for details.'));
    rl.close();
    return;
  }
  
  // Step 3: Set up Firestore collections and card limits
  console.log(chalk.blue('\nPreparing to set up Firestore collections and card limits...'));
  
  const setupFirestore = await confirm('\nWould you like to initialize the Firestore collections and card limits?');
  
  if (setupFirestore) {
    runCommand('npm run setup:firebase', 'Setting up Firestore');
  } else {
    console.log(chalk.yellow('\nSkipping Firestore setup.'));
  }
  
  console.log(chalk.green('\n✅ Migration process complete!'));
  console.log(chalk.blue('\nNext steps:'));
  console.log(chalk.blue('1. Verify that all your data has been migrated correctly'));
  console.log(chalk.blue('2. Test the application with the migrated data'));
  console.log(chalk.blue('3. Deploy the application with the updated Firebase configuration'));
  
  rl.close();
}

// Run the migration
migrate().catch(error => {
  console.error(chalk.red('\n❌ An error occurred:'));
  console.error(error);
  rl.close();
  process.exit(1);
});
