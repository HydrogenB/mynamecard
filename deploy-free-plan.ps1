# MyNameCard Deployment Script for Free Plan (PowerShell)
Write-Host "====================================================="
Write-Host "     MyNameCard Deployment - Firebase Free Plan      "
Write-Host "====================================================="
Write-Host ""
Write-Host "This will deploy MyNameCard to Firebase Free (Spark) Plan:"
Write-Host " 1. Firestore Rules"
Write-Host " 2. Firebase Hosting (web frontend)"
Write-Host ""
Write-Host "NOTE: Cloud Functions will NOT be deployed as they require the Blaze plan."
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
Write-Host "Starting deployment for Firebase Free Plan..." -ForegroundColor Cyan
Write-Host ""

try {
    # Run the deployment script
    node deploy-free-plan.js
    if ($LASTEXITCODE -ne 0) {
        throw "Deployment script returned error code $LASTEXITCODE"
    }
    
    # Check if deployment was successful
    Write-Host ""
    Write-Host "Deployment completed successfully!" -ForegroundColor Green
    Write-Host "Your application is now live on Firebase (free plan)."
    
    # Remind about limitations
    Write-Host ""
    Write-Host "Free Plan Limitations:" -ForegroundColor Yellow
    Write-Host "• Cloud Functions not available (requires Blaze plan)"
    Write-Host "• Authentication limited to email/password and anonymous"
    Write-Host "• Storage limited to 5GB"
    Write-Host "• Firestore limited to 1GB with 50K reads, 20K writes, and 20K deletes per day"
    
    # Suggest alternatives
    Write-Host ""
    Write-Host "Alternative Implementation:" -ForegroundColor Yellow
    Write-Host "Since Cloud Functions aren't available, your app will need to:"
    Write-Host "1. Implement logic in the client-side code"
    Write-Host "2. Rely on Firestore security rules for data protection"
    Write-Host "3. Use careful client-side validation"
}
catch {
    Write-Host "Deployment encountered errors. Please check the logs above." -ForegroundColor Red
    Write-Host "Error details: $_" -ForegroundColor Red
}

Read-Host "Press Enter to exit"
