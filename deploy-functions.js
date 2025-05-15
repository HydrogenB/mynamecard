const { spawn } = require('child_process');
const path = require('path');

console.log('Installing dependencies for Firebase Functions...');

// First, install dependencies
const install = spawn('npm', ['install', 'firebase-admin', 'firebase-functions', '--save'], {
  cwd: path.resolve(__dirname, 'server'),
  shell: true,
  stdio: 'inherit'
});

install.on('close', (code) => {
  if (code !== 0) {
    console.error('Dependency installation failed with code:', code);
    process.exit(code);
  }

  console.log('Building Firebase Functions...');

  // Build the functions
  const build = spawn('npm', ['run', 'build'], {
    cwd: path.resolve(__dirname, 'server'),
    shell: true,
    stdio: 'inherit'
  });

  build.on('close', (code) => {
    if (code !== 0) {
      console.error('Build failed with code:', code);
      process.exit(code);
    }

    console.log('Deploying Firebase Functions...');
    
    // Deploy only the functions
    const deploy = spawn('firebase', ['deploy', '--only', 'functions'], {
      cwd: __dirname,
      shell: true,
      stdio: 'inherit'
    });

    deploy.on('close', (deployCode) => {
      if (deployCode !== 0) {
        console.error('Deployment failed with code:', deployCode);
        process.exit(deployCode);
      }
      
      console.log('Firebase Functions deployed successfully!');
    });
  });
});
