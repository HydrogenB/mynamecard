# MyNameCard API Deployment Script for PowerShell
Write-Host "====================================================="
Write-Host "     MyNameCard API Deployment - Windows 11         "
Write-Host "====================================================="
Write-Host ""
Write-Host "This will deploy the API-based architecture to Firebase:"
Write-Host " 1. Firebase Functions (API backend)"
Write-Host " 2. Firestore Rules"
Write-Host " 3. Firebase Hosting (web frontend)"
Write-Host ""
Write-Host "Make sure you have Node.js installed and are logged in to Firebase."
Write-Host ""
Read-Host "Press Enter to continue"

# Check for Node.js
try {
    $nodeVersion = node -v
    Write-Host "Node.js found: $nodeVersion"
}
catch {
    Write-Host "Error: Node.js not found. Please install Node.js first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check for logged in Firebase account
try {
    $firebaseProjects = firebase projects:list 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
    Write-Host "Firebase login confirmed. Found these projects:"
    Write-Host $firebaseProjects
}
catch {
    Write-Host "You need to login to Firebase first."
    Write-Host "Running 'firebase login'..."
    firebase login
}

Write-Host ""
Write-Host "Starting deployment..." -ForegroundColor Cyan
Write-Host ""

try {
    # Before starting, check project plan - Functions require Blaze plan
    Write-Host "Checking if Firebase project is on Blaze plan (required for Cloud Functions)..." -ForegroundColor Yellow
    Write-Host "Note: Firebase Cloud Functions require the Blaze (pay-as-you-go) plan." -ForegroundColor Yellow
    Write-Host "      Visit https://console.firebase.google.com/ to upgrade if needed."
    
    $confirm = Read-Host "Are you on the Blaze plan? (Y/n)"
    if ($confirm -eq "n") {
        Write-Host "Please upgrade to the Blaze plan before deploying. Exiting..." -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    # Run the deployment script
    node deploy-all.js
    if ($LASTEXITCODE -ne 0) {
        throw "Deployment script returned error code $LASTEXITCODE"
    }
    
    # Check if deployment was successful
    Write-Host ""
    Write-Host "Deployment completed successfully!" -ForegroundColor Green
    Write-Host "Your API-based architecture is now live on Firebase."
    
    # Remind about common post-deployment steps
    Write-Host ""
    Write-Host "Post-deployment steps:" -ForegroundColor Yellow
    Write-Host "1. Test the API by creating a new card in the app"
    Write-Host "2. Check Firebase Console logs if you encounter any issues"
    Write-Host "3. Monitor your Cloud Functions usage in Firebase Console"
}
catch {
    Write-Host "Deployment encountered errors. Please check the logs above." -ForegroundColor Red
    Write-Host "Error details: $_" -ForegroundColor Red
    
    # Provide troubleshooting guidance
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Ensure you're logged into Firebase with 'firebase login'"
    Write-Host "2. Verify your project is on the Blaze plan for Cloud Functions"
    Write-Host "3. Check if Firebase CLI is up to date with 'npm install -g firebase-tools'"
    Write-Host "4. Try running the commands step by step from deploy-all.js"
}

Read-Host "Press Enter to exit"
