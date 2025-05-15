# Firebase API Architecture Migration

## Overview

This document explains the architectural changes made to the MyNameCard application to fix authentication issues and improve security by transitioning from direct Firestore access to a proper server-side API approach using Firebase Cloud Functions.

## Problem Solved

New users were experiencing permission issues when trying to create cards, with the error:
"Failed to save card. Please try again.: Failed to create card: Failed to create card: Missing or insufficient permissions"

This was due to security rules in Firestore that weren't properly synchronized with user account creation.

## Solution: API-based Architecture

We've implemented an API facade pattern that abstracts all database operations through Firebase Cloud Functions:

1. **Frontend**: Uses an API facade (`cardAPI.ts`) that provides a consistent interface for all card operations
2. **Backend**: Firebase Cloud Functions that securely perform database operations with proper permissions

This approach provides several benefits:
- Better security - database rules can be much simpler
- Consistent permissions - all database access goes through server-side authentication
- Centralized business logic - validation happens on the server
- Reduced client-side complexity - the frontend just calls API methods

## Components Updated

### Frontend
- `cardAPI.ts` - API facade that abstracts backend communication
- `cloudFunctionsService.ts` - Service to interact with Firebase Cloud Functions
- `firebase.ts` - Added initialization of Firebase Functions module

### Backend
- Created Cloud Functions for all CRUD operations:
  - `createCard` - Creates a new card with proper permissions
  - `getUserCards` - Gets all cards for a user
  - `getCardById` - Gets a card by ID with permission checks
  - `getCardBySlug` - Gets a card by slug with permission checks
  - `updateCard` - Updates a card with permission checks
  - `deleteCard` - Deletes a card with permission checks

### Configuration
- `firestore.rules` - Simplified security rules
- `deploy-functions.js` - Script for deploying Firebase Functions

## Important Notes

1. **Firebase Plan Requirement**: The Cloud Functions-based approach requires the Firebase Blaze plan (pay-as-you-go) for full functionality. The free Spark plan has limitations on outbound network requests from Cloud Functions.

2. **Deployment Process**:
   - Firebase Functions need to be deployed with `node deploy-functions.js`
   - Firestore rules should be deployed with `firebase deploy --only firestore:rules`

3. **Error Handling**: If users still encounter errors related to functions, ensure:
   - Firebase CLI is installed and updated
   - The project is on the Blaze plan
   - Functions are properly deployed
   - Authentication is working correctly
