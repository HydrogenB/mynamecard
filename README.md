# Smart Name Card

A digital business card application that allows users to create, manage, and share their digital business cards with vCard download functionality and real-time analytics. The application is powered by Firebase services including Firestore for data persistence and Realtime Database for analytics features.

## Current Status

The project has been successfully migrated from IndexedDB to Firebase services with enhanced security and user management:

- ✅ User authentication implemented with Firebase Auth
- ✅ Proper user card limit enforcement (2 cards max for free users, configurable server-side)
- ✅ Enhanced security with Firestore rules for user ownership validation
- ✅ Transactional database operations for data consistency
- ✅ Complete Firestore integration for card data storage, analytics and management
- ✅ Real-time status tracking with Firestore
- ✅ Offline persistence enabled with Firestore
- ✅ Admin configuration for card limits by plan type
- ✅ Environment configuration for Firebase API keys
- ✅ Server-side functions and analytics tracking
- 🚧 CI/CD pipeline setup in progress

## Architecture Overview

### Tech Stack

- **Frontend**: React with TypeScript, TailwindCSS, Vite
- **Cloud Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Server**: Express.js & Firebase Functions (for optional server-side features)
- **Internationalization**: i18next
- **Data Validation**: Zod (schemas)
- **Build Tools**: Vite, PostCSS

### Project Structure

This project is a monorepo containing:

- `apps/web`: React web application (client-side)
- `server`: Node.js server (API and server-side rendering)

## API Flow

The application follows a comprehensive API flow that integrates Firebase services:

1. **User Login**: Authentication using Firebase Auth SDK
2. **Create Card**: Creates a card document in Firestore with user ownership
3. **Edit Card**: Updates existing card documents with verification of ownership
4. **View Public Card**: Retrieves card by slug with analytics tracking
5. **Log View Analytics**: Records view events in Firestore
6. **Download vCard**: Generates and provides .vcf file with analytics tracking
7. **Share Card**: Tracks sharing events in Firestore
8. **Track User Status**: Updates user's last seen timestamp
9. **Enforce Card Limit**: Prevents users from exceeding their plan limit
10. **Upgrade Plan**: Allows users to upgrade to Pro plan for additional cards

## Development Setup

### Environment Variables

The project requires certain environment variables for Firebase configuration:

1. Create or modify `.env`, `.env.development`, and `.env.production` files with your Firebase credentials:

```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_API_URL=https://your-api-url
VITE_APP_ENV=development or production
```

2. These environment variables are used in the Firebase configuration (`src/config/firebase.ts`)

> **Important Note**: As of May 12, 2025, the Firebase API key is hard-coded directly in the configuration (`src/config/firebase.ts`) to avoid authentication errors with environment variables not loading properly. This provides a reliable fallback but should be reviewed for production security.

### Prerequisites

- Node.js (v18 or higher)
- npm (v7 or higher)

### Installation

```bash
# Install dependencies
npm install
```

### Running the Development Server

```bash
# Run both web app and server in development mode
npm run dev
```

This will start:
- The web app at http://localhost:5173
- The API server at http://localhost:3000

## Building for Production

```bash
# Build both web and server
npm run build:all

# Build only server
npm run build
```

## Firebase Deployment

The application is configured to deploy to Firebase Hosting with an API-based architecture using Firebase Cloud Functions.

### Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase account with Blaze (pay-as-you-go) plan enabled for Cloud Functions
- Node.js 16+ installed

### API-Based Deployment

For Windows users, use one of these options:

```bash
# Option 1: Using PowerShell script (recommended for Windows 11)
.\deploy-windows.ps1

# Option 2: Using Batch file
deploy-windows.bat

# Option 3: Running the Node.js script directly
node deploy-all.js
```

This will deploy:
1. Firebase Cloud Functions (API backend)
2. Firestore Rules 
3. Firebase Hosting (web frontend)

### Testing the Deployment

After deployment, run the API verification tool:

```bash
node test-api.js
```

### Automated Deployment

The project is set up with GitHub Actions for continuous deployment. Any push to the main branch will trigger a deployment to Firebase Hosting and Functions.

## Firebase Emulator

For local testing of Firebase hosting:

```bash
# Run Firebase emulator
npm run emulate
```

This will build the app and start the Firebase emulator at http://localhost:5000

## Additional Scripts

- `npm run test`: Run tests for both web app and server
- `npm run lint`: Run ESLint on the codebase
- `npm run lighthouse`: Run Lighthouse for performance testing
- `npm run e2e`: Run end-to-end tests with Playwright

## Environment Variables

- `.env.development`: Used during development
- `.env.production`: Used during production build

## Live Demo

Visit the live application at [mynamecard-2c393.web.app](https://mynamecard-2c393.web.app)

## Data Flow

1. User creates a name card through the CardEditor page
2. Card data is stored in Firestore with proper user authentication and authorization
3. When a user accesses a public card via URL, the data is retrieved from Firestore
4. Firestore provides offline capability with local caching for seamless experience 
5. Card analytics (views, downloads, shares) are tracked in Firebase Realtime Database
6. User online status and activity is monitored through Firebase Realtime Database
7. The vCard download functionality generates a .vcf file on-demand client-side

## Key Components

### Database Service (apps/web/src/services/databaseService.ts)

- Provides direct Firestore integration for data persistence
- Handles CRUD operations for cards with authentication and authorization
- Supports offline operations through Firestore offline persistence
- Ensures data consistency with transaction support

### Realtime Database Service (apps/web/src/services/realtimeDbService.ts)

- Integrates with Firebase Realtime Database for real-time features
- Tracks user online status and presence
- Collects and manages analytics for card views, downloads, and shares
- Provides real-time statistics for dashboard display

### Public Card Display (apps/web/src/pages/PublicCard.tsx)

- Renders the public-facing view of a name card
- Handles vCard download functionality
- Displays QR code for easy sharing

### vCard Generator (apps/web/src/utils/vcardGenerator.ts)

- Client-side utility for generating vCard format strings according to RFC 6350
- Converts Card objects to properly formatted vCard strings
- Creates downloadable .vcf files

## vCard Implementation

The current implementation uses client-side vCard generation using the following approach:

1. A utility function in `vcardGenerator.ts` converts card data to vCard format
2. When a user clicks "Download vCard" on a public card page:
   - The card data is retrieved from Firestore
   - The vCard generator creates a vCard string according to RFC 6350
   - A Blob is created with the vCard content
   - A download link is programmatically created and clicked
   - The user receives a .vcf file named with their first and last name
   - The download event is tracked in Firebase Realtime Database for analytics

### vCard Format Details

The vCard generator creates vCards with:
- Version 3.0 compliance
- Full name and structured name fields
- Organization and title information
- Email, phone, and website details
- Physical address when available
- Photo (as base64 when available)
- Social media links (when available)

## Authentication and Security

### User Authentication

The application uses Firebase Authentication for user management:
- Email and password authentication
- Google OAuth sign-in
- Secure session management with AuthContext provider
- Automatic user profile creation and management
- Protected routes with authentication checks

### Security Rules

Access to data is protected by Firebase Security Rules:
- Comprehensive Firestore rules with helper functions for validation
- Card ownership validation to ensure users can only modify their own cards
- Card limit enforcement at the database level (default: 2 cards for free users)
- Public cards are accessible without authentication through specific queries
- Realtime Database rules protect analytics and user status data
- Server-side configuration for plan limits and features

## Analytics Implementation

The application tracks various user activities:
- Card views: When someone views a public card
- Downloads: When a vCard is downloaded
- Shares: When a card is shared via the sharing feature
- User presence: Online/offline status and last seen timestamps

These analytics are stored in Firestore and can be viewed by card owners in their dashboard.

## Plan Management

Users start with a free plan (2 card limit) and can upgrade to Pro (10 card limit):
- Card limit is enforced at both client and server sides
- Plan upgrades are processed through a secure API endpoint
- Users can manage their subscription through their profile

## Conclusion

The Smart Name Card application provides a modern solution for digital business cards with vCard download functionality. The current implementation uses Firestore for data persistence, offering cloud storage, user authentication, and cross-device synchronization while maintaining the core functionality.

This documentation covers the current architecture, implementation details, and future plans to help any developer understand and extend the application. The vCard download feature has been successfully implemented and tested with various contact management systems for compatibility.

## License

[MIT License](LICENSE)

## Troubleshooting

### Firebase API Key Error

If you encounter the error `Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)`, ensure that:

1. The Firebase API key is correctly set in your environment files:
   - `.env`
   - `.env.development` 
   - `.env.production`

2. The Firebase configuration in `src/config/firebase.ts` is correctly referencing the environment variable

3. When running locally, make sure the environment variables are being loaded properly by Vite

### Build Errors

For TypeScript errors related to the Typography component:
- Check that the `index.ts` file is properly exporting from `index.tsx` 
- Ensure there are no JSX/TSX components in `.ts` files

## Handover Notes

This project is ready for the next phase of development. The following areas require attention:

1. Complete the Firebase Functions implementation for server-side operations
2. Set up CI/CD pipeline for automated testing and deployment
3. Implement payment processing for Pro plan upgrades
4. Add comprehensive test coverage for critical components
5. Optimize image handling and storage usage
