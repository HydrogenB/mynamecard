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
    
    // Step 1: Install Firebase tools globally if not installed
    console.log('\n📋 Checking Firebase CLI installation...');
    try {
      await runCommand('firebase', ['--version'], config.rootDir, 'Checking Firebase CLI version');
    } catch (error) {
      console.log('Firebase CLI not found, installing...');
      await runCommand('npm', ['install', '-g', 'firebase-tools'], config.rootDir, 'Installing Firebase CLI');
    }

    // Step 1.5: Verify Firebase login and project
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
    
    // Step 2: Install dependencies for server (Cloud Functions)
    await runCommand('npm', ['install', 'firebase-admin', 'firebase-functions', '--save'], config.serverDir, 'Installing server dependencies');
      // Step 3: Run verification script
    try {
      console.log('\n📋 Verifying Firebase setup...');
      const verifySetup = require('./verify-firebase-setup');
      const setupSuccess = await verifySetup();
      
      if (!setupSuccess) {
        console.warn('\n⚠️ The verification found issues with your Firebase setup.');
        console.warn('You can continue with deployment, but it might not work as expected.');
        
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const shouldContinue = await new Promise(resolve => {
          readline.question('Continue with deployment anyway? (y/N): ', answer => {
            readline.close();
            resolve(answer.toLowerCase() === 'y');
          });
        });
        
        if (!shouldContinue) {
          console.log('Deployment cancelled.');
          process.exit(1);
        }
      }
    } catch (error) {
      console.warn('\n⚠️ Error running verification script:', error.message);
      console.warn('Continuing with deployment anyway...');
    }
    
    // Step 4: Build the Cloud Functions
    await runCommand('npm', ['run', 'build:firebase'], config.serverDir, 'Building Firebase functions');
    
    // Step 5: Deploy Firestore rules
    await runCommand('firebase', ['deploy', '--only', 'firestore:rules'], config.rootDir, 'Deploying Firestore rules');
    
    // Step 6: Verify Firestore rules deployment
    console.log('\n📋 Verifying Firestore rules deployment...');
    try {
      await runCommand('firebase', ['firestore:rules', 'get'], config.rootDir, 'Checking Firestore rules');
      console.log('✅ Firestore rules deployed successfully');
    } catch (error) {
      console.warn('⚠️ Unable to verify Firestore rules. Continuing with deployment...');
    }
    
    // Step 7: Deploy Firebase Functions
    await runCommand('firebase', ['deploy', '--only', 'functions'], config.rootDir, 'Deploying Firebase functions');
    
    // Step 8: Verify Functions deployment
    console.log('\n📋 Verifying Cloud Functions deployment...');
    try {
      const funcResult = spawn('firebase', ['functions:list'], {
        cwd: config.rootDir,
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const funcOutput = await new Promise((resolve, reject) => {
        let stdout = '';
        funcResult.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        funcResult.on('close', (code) => {
          if (code !== 0) reject(new Error('Failed to list Firebase functions'));
          resolve(stdout);
        });
      });
      
      // Check if core API functions are deployed
      const requiredFunctions = ['createCard', 'getCardById', 'getUserCards', 'updateCard', 'deleteCard'];
      const missingFunctions = [];
      
      for (const func of requiredFunctions) {
        if (!funcOutput.includes(func)) {
          missingFunctions.push(func);
        }
      }
      
      if (missingFunctions.length > 0) {
        console.warn(`⚠️ Some API functions might not be deployed: ${missingFunctions.join(', ')}`);
        console.warn('This could affect the functionality of your application.');
      } else {
        console.log('✅ All core API functions are deployed');
      }
    } catch (error) {
      console.warn('⚠️ Unable to verify Cloud Functions. Continuing with deployment...');
    }
    
    // Step 9: Build and deploy the web app
    await runCommand('npm', ['ci'], config.webAppDir, 'Installing web app dependencies');
    await runCommand('npm', ['run', 'build'], config.webAppDir, 'Building web app');
    await runCommand('firebase', ['deploy', '--only', 'hosting'], config.rootDir, 'Deploying to Firebase hosting');
    
    // Get the hosting URL
    let hostingUrl = 'https://console.firebase.google.com/';
    try {
      const hostingResult = spawn('firebase', ['hosting:channel:list'], {
        cwd: config.rootDir,
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const hostingOutput = await new Promise((resolve, reject) => {
        let stdout = '';
        hostingResult.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        hostingResult.on('close', (code) => {
          resolve(stdout);
        });
      });
      
      const urlMatch = hostingOutput.match(/https:\/\/[a-z0-9-]+\.web\.app/);
      if (urlMatch) {
        hostingUrl = urlMatch[0];
      }
    } catch (error) {
      // Ignore errors, use default Firebase console URL
    }
    
    console.log('\n✨ Deployment complete! Your API-based architecture is now live.');
    console.log(`🌎 Your application is available at: ${hostingUrl}`);
    console.log('📊 Check the Firebase console for monitoring: https://console.firebase.google.com/');
    } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Execute deployment
deploy();
