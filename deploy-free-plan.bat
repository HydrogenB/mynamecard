@echo off
echo =====================================================
echo      MyNameCard Deployment - Firebase Free Plan
echo =====================================================
echo.
echo This will deploy MyNameCard to Firebase Free (Spark) Plan:
echo  1. Firestore Rules
echo  2. Firebase Hosting (web frontend)
echo.
echo NOTE: Cloud Functions will NOT be deployed as they require the Blaze plan.
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
echo Starting deployment for Firebase Free Plan...
echo.

:: Run the free plan deployment script
node deploy-free-plan.js

echo.
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Deployment encountered some errors. Please check the logs above.
) else (
  echo.
  echo Deployment completed successfully!
  echo Your application is now live on Firebase (free plan).
  echo.
  echo Free Plan Limitations:
  echo * Cloud Functions not available (requires Blaze plan)
  echo * Authentication limited to email/password and anonymous
  echo * Storage limited to 5GB
  echo * Firestore limited to 1GB with 50K reads, 20K writes, and 20K deletes per day
  echo.
  echo Alternative Implementation:
  echo Since Cloud Functions aren't available, your app will need to:
  echo 1. Implement logic in the client-side code
  echo 2. Rely on Firestore security rules for data protection
  echo 3. Use careful client-side validation
)

pause
