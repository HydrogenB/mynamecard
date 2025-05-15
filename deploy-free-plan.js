const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Deployment script for MyNameCard optimized for the Firebase Spark (free) plan.
 * This script will:
 * 1. Install necessary dependencies
 * 2. Build the web app
 * 3. Deploy Firestore rules
 * 4. Deploy Firebase hosting
 * 
 * NOTE: Cloud Functions are NOT deployed as they require the Blaze plan.
 * The frontend code will need to handle operations without Cloud Functions.
 */

// Configuration
const config = {
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
    console.log('🚀 Starting deployment process for MyNameCard (Free Plan)');
    
    // Step 1: Install Firebase tools globally if not installed
    console.log('\n📋 Checking Firebase CLI installation...');
    try {
      await runCommand('firebase', ['--version'], config.rootDir, 'Checking Firebase CLI version');
    } catch (error) {
      console.log('Firebase CLI not found, installing...');
      await runCommand('npm', ['install', '-g', 'firebase-tools'], config.rootDir, 'Installing Firebase CLI');
    }

    // Step 2: Verify Firebase login and project
    console.log('\n📋 Verifying Firebase login and project...');
    try {
      // Check current project
      console.log('Checking current Firebase project...');
      const result = spawn('firebase', ['projects:list'], {
        cwd: config.rootDir,
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const output = await new Promise((resolve, reject) => {
        let stdout = '';
        result.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        result.on('close', (code) => {
          if (code !== 0) reject(new Error('Failed to list Firebase projects'));
          resolve(stdout);
        });
      });

      // Check if mynamecard project is current
      if (!output.includes('mynamecard') && !output.includes('(current)')) {
        console.log('Warning: Project mynamecard not found or not set as current.');
        console.log('Please select the correct project:');
        await runCommand('firebase', ['use', '--interactive'], config.rootDir, 'Selecting Firebase project');
      } else {
        console.log('Firebase project verified!');
      }
    } catch (error) {
      console.log('Error verifying Firebase project, running login...');
      await runCommand('firebase', ['login'], config.rootDir, 'Firebase login');
      await runCommand('firebase', ['use', '--interactive'], config.rootDir, 'Selecting Firebase project');
    }
    
    // Step 3: Deploy Firestore rules
    await runCommand('firebase', ['deploy', '--only', 'firestore:rules'], config.rootDir, 'Deploying Firestore rules');
    
    // Step 4: Build and deploy the web app
    await runCommand('npm', ['ci'], config.webAppDir, 'Installing web app dependencies');
    await runCommand('npm', ['run', 'build'], config.webAppDir, 'Building web app');
    await runCommand('firebase', ['deploy', '--only', 'hosting'], config.rootDir, 'Deploying to Firebase hosting');
    
    console.log('\n✨ Deployment complete! Your application is now live on Firebase (free plan).');
    console.log('\n⚠️ NOTE: Cloud Functions were NOT deployed as they require the Blaze plan.');
    console.log('Your app will need to handle operations client-side or through Firestore security rules.');
    console.log('\n📊 Check the Firebase console for monitoring: https://console.firebase.google.com/');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Execute deployment
deploy();
