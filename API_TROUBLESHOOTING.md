# API Deployment Troubleshooting Guide

This document provides solutions for common issues encountered when deploying the API-based architecture of MyNameCard to Firebase.

## Common Deployment Issues

### 1. Firebase Functions Require Blaze Plan

**Error:** `HTTP Error: 400, Billing account for project is not found. Billing must be enabled for activation of service.`

**Solution:**
- Visit https://console.firebase.google.com/
- Select your project
- Click "Upgrade" to switch to the Blaze (pay-as-you-go) plan
- Note: The Blaze plan has a generous free tier but requires a credit card

### 2. Functions Deployment Permission Issues

**Error:** `Error: HTTP Error: 403, The caller does not have permission`

**Solution:**
- Make sure you are properly logged into Firebase CLI with `firebase login`
- Verify you have the necessary permissions (Owner or Editor) on the Firebase project
- If using a service account, ensure it has the required IAM roles

### 3. Build Failures

**Error:** `Cannot find module 'firebase-admin'` or similar dependency errors

**Solution:**
- Install the dependencies manually:
  ```bash
  cd server
  npm install firebase-admin firebase-functions --save
  ```
- If using TypeScript, ensure the build process is working correctly:
  ```bash
  npm run build:firebase
  ```

### 4. Firebase Functions Not Found After Deployment

**Problem:** Functions seem to deploy but aren't accessible

**Solution:**
- Check Firebase Console for function deployment status
- Verify region settings in both client and server code match
- Check Cloud Functions logs for runtime errors
- Run the API verification tool: `node test-api.js`

### 5. Firestore Rules Not Applied

**Problem:** Database operations fail with permission errors

**Solution:**
- Deploy Firestore rules explicitly:
  ```bash
  firebase deploy --only firestore:rules
  ```
- Verify rules in Firebase Console → Firestore → Rules
- Check that the rules are properly formatted and valid

### 6. Cloud Functions Timeout During Deployment

**Problem:** Deployment hangs or times out

**Solution:**
- Deploy functions separately:
  ```bash
  firebase deploy --only functions:createCard,functions:getUserCards
  ```
- Increase deployment timeout:
  ```bash
  firebase deploy --only functions --timeout=600000
  ```

## Verifying Successful Deployment

After deployment, verify that:

1. Functions are listed in Firebase Console
2. The API verification test passes: `node test-api.js`
3. Firestore rules are properly deployed
4. The web app can successfully call the Cloud Functions

## Getting More Help

If you continue to encounter issues:

1. Check Firebase documentation: https://firebase.google.com/docs/functions
2. Review Firebase status: https://status.firebase.google.com/
3. Inspect detailed logs in the Firebase Console
4. Try deploying from a different network environment (some corporate networks block deployments)
