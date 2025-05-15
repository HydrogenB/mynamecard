@echo off
echo =====================================================
echo      MyNameCard API Deployment - Windows 11
echo =====================================================
echo.
echo This will deploy the API-based architecture to Firebase:
echo  1. Firebase Functions (API backend)
echo  2. Firestore Rules
echo  3. Firebase Hosting (web frontend)
echo.
echo Make sure you have Node.js installed and are logged in to Firebase.
echo.
pause

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Error: Node.js not found. Please install Node.js first.
  pause
  exit /b 1
)

:: Check for logged in Firebase account
firebase projects:list >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo You need to login to Firebase first.
  echo Running "firebase login"...
  firebase login
)

echo.
echo Checking Firebase project plan...
echo Note: Firebase Cloud Functions require the Blaze (pay-as-you-go) plan.
echo       Visit https://console.firebase.google.com/ to upgrade if needed.
echo.
set /p CONFIRM="Are you on the Blaze plan? (Y/n): "
if /i "%CONFIRM%"=="n" (
  echo Please upgrade to the Blaze plan before deploying. Exiting...
  pause
  exit /b 1
)

echo.
echo Starting deployment...
echo.

:: Run the main deployment script
node deploy-all.js

echo.
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Deployment encountered some errors. Please check the logs above.
  echo.
  echo Troubleshooting steps:
  echo 1. Ensure you're logged into Firebase with 'firebase login'
  echo 2. Verify your project is on the Blaze plan for Cloud Functions
  echo 3. Check if Firebase CLI is up to date with 'npm install -g firebase-tools'
  echo 4. Try running the commands step by step from deploy-all.js
) else (
  echo.
  echo Deployment completed successfully!
  echo Your API-based architecture is now live on Firebase.
  echo.
  echo Post-deployment steps:
  echo 1. Test the API by creating a new card in the app
  echo 2. Check Firebase Console logs if you encounter any issues
  echo 3. Monitor your Cloud Functions usage in Firebase Console
)

pause
