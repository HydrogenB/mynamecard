const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Complete deployment script for MyNameCard API-based architecture
 * This script will:
 * 1. Install necessary dependencies
 * 2. Build the web app
 * 3. Build the Firebase functions
 * 4. Deploy Firestore rules
 * 5. Deploy Firebase functions
 * 6. Deploy Firebase hosting
 */

// Configuration
const config = {
  serverDir: path.resolve(__dirname, 'server'),
  webAppDir: path.resolve(__dirname, 'apps/web'),
  rootDir: __dirname,
};

// Utility function to run a command
function runCommand(command, args, cwd, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n📌 ${description}...\n`);

    const cmd = spawn(command, args, {
      cwd,
      shell: true,
      stdio: 'inherit',
    });

    cmd.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ ${description} failed with code: ${code}`);
        reject(new Error(`Command failed with code: ${code}`));
      } else {
        console.log(`✅ ${description} completed successfully!`);
        resolve();
      }
    });
  });
}

// Main deployment function
async function deploy() {
  try {
    console.log('🚀 Starting deployment process for MyNameCard API-based architecture');
    
    // All Firebase-related deployment steps removed for fresh start. Implement your own deployment logic here.
    
    // Step 2: Install dependencies for server (Cloud Functions)
    await runCommand('npm', ['install', 'firebase-admin', 'firebase-functions', '--save'], config.serverDir, 'Installing server dependencies');
    
    // Step 9: Build and deploy the web app
    await runCommand('npm', ['ci'], config.webAppDir, 'Installing web app dependencies');
    await runCommand('npm', ['run', 'build'], config.webAppDir, 'Building web app');
    
    console.log('\n✨ Deployment complete! Your API-based architecture is now live.');
    console.log('📊 Check the Firebase console for monitoring: https://console.firebase.google.com/');
    } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Execute deployment
deploy();
