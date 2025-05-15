# Complete Firebase Functions Setup and Deployment

This guide walks through the complete process of setting up and deploying Firebase Cloud Functions for the MyNameCard application.

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project on the Blaze plan (pay-as-you-go)
3. Node.js 16+ installed

## Step 1: Firebase Login

```bash
firebase login
```

## Step 2: Install Dependencies

```bash
# In the server directory
cd server
npm install firebase-admin firebase-functions --save
```

## Step 3: Build the Functions

```bash
# In the server directory
npm run build:firebase
```

## Step 4: Deploy the Functions

```bash
# In the project root
firebase deploy --only functions
```

## Step 5: Deploy Updated Firestore Rules

```bash
# In the project root
firebase deploy --only firestore:rules
```

## Step 6: Verify Deployment

1. Check Firebase Console > Functions section for deployed functions
2. Test card creation functionality in the app
3. Check Firebase Functions logs for any errors

## Using the Automatic Setup Script

For convenience, you can run the `deploy-functions.js` script:

```bash
# In the project root
node deploy-functions.js
```

This script will:
1. Install necessary dependencies
2. Build the Cloud Functions
3. Deploy them to Firebase

## Troubleshooting

1. **Permission errors:** Make sure your Firebase project is on the Blaze plan
2. **Build errors:** Check that dependencies are properly installed
3. **Deployment errors:** Verify Firebase CLI is updated and you're logged in correctly
4. **Runtime errors:** Check Firebase Functions logs in the Firebase Console

## Testing

After deployment, test the following operations:
- Creating a new card
- Viewing your cards
- Viewing a card by slug
- Updating a card
- Toggling card active status
- Deleting a card

## Monitoring

Monitor your Cloud Functions usage in the Firebase Console to ensure you stay within the free tier limits.
