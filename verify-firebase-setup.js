const fs = require('fs');
const path = require('path');

/**
 * Utility script to verify Firebase project configuration for API-based architecture
 */
function verifyFirebaseSetup() {
  const results = {
    errors: [],
    warnings: [],
    info: [],
    success: true
  };

  console.log('🔍 Verifying Firebase setup for API-based architecture...\n');

  // Check firebase.json
  try {
    const firebaseConfigPath = path.join(__dirname, 'firebase.json');
    if (!fs.existsSync(firebaseConfigPath)) {
      results.errors.push('firebase.json not found. Run "firebase init" to set up your project.');
      results.success = false;
    } else {
      const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
      results.info.push('Found firebase.json');

      // Check functions configuration
      if (!firebaseConfig.functions) {
        results.warnings.push('Functions configuration missing in firebase.json');
      } else {
        results.info.push('Functions configured in firebase.json');
      }

      // Check hosting configuration
      if (!firebaseConfig.hosting) {
        results.warnings.push('Hosting configuration missing in firebase.json');
      } else {
        results.info.push('Hosting configured in firebase.json');
      }

      // Check firestore configuration
      if (!firebaseConfig.firestore) {
        results.warnings.push('Firestore configuration missing in firebase.json');
      } else {
        results.info.push('Firestore configured in firebase.json');
      }
    }
  } catch (error) {
    results.errors.push(`Error reading firebase.json: ${error.message}`);
    results.success = false;
  }

  // Check firestore.rules
  try {
    const firestoreRulesPath = path.join(__dirname, 'firestore.rules');
    if (!fs.existsSync(firestoreRulesPath)) {
      results.warnings.push('firestore.rules not found. Security rules are important for API-based architecture.');
    } else {
      results.info.push('Found firestore.rules');
      
      // Read rules and check for API-centric setup
      const rulesContent = fs.readFileSync(firestoreRulesPath, 'utf8');
      if (rulesContent.includes('canCreateCard') && rulesContent.includes('return true')) {
        results.info.push('Firestore rules are configured for API-based architecture');
      } else {
        results.warnings.push('Firestore rules might not be optimized for API-based architecture');
      }
    }
  } catch (error) {
    results.errors.push(`Error reading firestore.rules: ${error.message}`);
  }

  // Check for Cloud Functions source files
  const functionsPath = path.join(__dirname, 'server', 'src', 'functions');
  try {
    if (!fs.existsSync(functionsPath)) {
      results.errors.push('Cloud Functions source directory not found');
      results.success = false;
    } else {
      const functionFiles = fs.readdirSync(functionsPath);
      results.info.push(`Found ${functionFiles.length} Cloud Function source files`);
      
      // Check for CRUD operation functions
      const requiredFunctions = ['createCard.ts', 'getCardById.ts', 'getUserCards.ts', 'updateCard.ts', 'deleteCard.ts'];
      const missingFunctions = requiredFunctions.filter(fn => !functionFiles.includes(fn));
      
      if (missingFunctions.length > 0) {
        results.warnings.push(`Missing some API functions: ${missingFunctions.join(', ')}`);
      } else {
        results.info.push('All core API functions are present');
      }
    }
  } catch (error) {
    results.errors.push(`Error checking Cloud Functions: ${error.message}`);
  }

  // Check for frontend API service
  const cloudFunctionsServicePath = path.join(__dirname, 'apps', 'web', 'src', 'services', 'cloudFunctionsService.ts');
  try {
    if (!fs.existsSync(cloudFunctionsServicePath)) {
      results.warnings.push('Cloud Functions service not found in frontend code');
    } else {
      results.info.push('Found Cloud Functions service in frontend code');
    }
  } catch (error) {
    results.errors.push(`Error checking frontend API service: ${error.message}`);
  }

  // Print results
  if (results.info.length > 0) {
    console.log('ℹ️ Information:');
    results.info.forEach(msg => console.log(`  - ${msg}`));
    console.log();
  }
  
  if (results.warnings.length > 0) {
    console.log('⚠️ Warnings:');
    results.warnings.forEach(msg => console.log(`  - ${msg}`));
    console.log();
  }
  
  if (results.errors.length > 0) {
    console.log('❌ Errors:');
    results.errors.forEach(msg => console.log(`  - ${msg}`));
    console.log();
  }
  
  if (results.success) {
    console.log('✅ Firebase setup verification completed. Your project appears to be configured correctly for API-based architecture.');
  } else {
    console.log('⚠️ Firebase setup verification completed with issues. Please fix the errors before deploying.');
  }
  
  return results.success;
}

// Run the verification if called directly
if (require.main === module) {
  const success = verifyFirebaseSetup();
  process.exit(success ? 0 : 1);
} else {
  // Export for use in other scripts
  module.exports = verifyFirebaseSetup;
}
