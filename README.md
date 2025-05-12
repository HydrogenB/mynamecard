# Smart Name Card

A digital business card application that allows users to create, manage, and share their digital business cards with vCard download functionality and real-time analytics. The application is powered by Firebase services including Firestore for data persistence and Realtime Database for analytics features.

## Current Status

The project has been successfully migrated from IndexedDB to Firebase services with enhanced security and user management:

- ✅ User authentication implemented with Firebase Auth
- ✅ Proper user card limit enforcement (2 cards max for free users, configurable server-side)
- ✅ Enhanced security with Firestore rules for user ownership validation
- ✅ Transactional database operations for data consistency
- ✅ Firestore integration for card data storage and management
- ✅ Realtime Database implementation for analytics and user status tracking
- ✅ Offline persistence enabled with Firestore
- ✅ Admin configuration for card limits by plan type
- 🚧 Server-side functions (partially implemented)
- 🚧 CI/CD pipeline setup in progress

## Architecture Overview

### Tech Stack

- **Frontend**: React with TypeScript, TailwindCSS, Vite
- **Cloud Database**: Firebase Firestore & Realtime Database
- **Authentication**: Firebase Authentication
- **Server**: Express.js & Firebase Functions (for optional server-side features)
- **Internationalization**: i18next
- **Data Validation**: Zod (schemas)
- **Build Tools**: Vite, PostCSS

### Project Structure

This project is a monorepo containing:

- `apps/web`: React web application (client-side)
- `server`: Node.js server (API and server-side rendering)

## Development Setup

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

The application is configured to deploy to Firebase Hosting.

### Manual Deployment

```bash
# Build and deploy to Firebase
npm run deploy
```

### Automated Deployment

The project is set up with GitHub Actions for continuous deployment. Any push to the main branch will trigger a deployment to Firebase Hosting.

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

## Deployment Guide

### Firebase Deployment

The application is set up for deployment to Firebase using Firebase Hosting for the web app and Firebase Functions for the server-side components.

#### Prerequisites

1. Install Firebase CLI globally:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase project (if not already done):
```bash
firebase init
```

#### Deployment Steps

1. **Deploy Web App Only** (recommended for initial deployment):
```bash
npm run deploy
```
This builds the React application and deploys it to Firebase Hosting.

2. **Deploy Server Functions** (when server-side functions are ready):
```bash
npm run deploy:functions
```

3. **Deploy Everything** (web app + functions):
```bash
npm run deploy:all
```

### Deployment Configuration

- The web app is built from the `apps/web` directory using Vite
- The server functions are built from the `server` directory
- Firebase configuration is in `firebase.json`
- Firebase Functions are using Node.js 18 runtime

### Current Deployment Limitations

- Server functions are partially implemented with placeholders
- The Firebase Functions deployment requires proper setup of firebase-admin and firebase-functions packages

## Edge Cases & Handling

### 1. Data Retrieval Failures

- **Cause**: Network issues or Firebase service disruption
- **Handling**: Firestore offline persistence provides fallback, error states with appropriate messages

### 2. Missing Card Data

- **Cause**: User might access a URL for a non-existent card
- **Handling**: NotFound component displayed with clear message

### 3. Empty Required Fields

- **Cause**: Cards might be created with missing required information
- **Handling**: Form validation prevents creation, display gracefully handles missing optional fields

### 4. Non-Latin Character Support

- **Cause**: International users may use non-Latin characters in their names/information
- **Handling**: UTF-8 encoding support in vCard generation and Firestore storage

### 5. Large Photo Handling

- **Cause**: User might upload very large profile photos
- **Handling**: Image compression before storage, with option to use Firebase Storage for larger files

### 6. Authentication Failure

- **Cause**: User authentication might fail or expire
- **Handling**: Proper error messages and redirection to sign-in page

### 7. Offline Operation

- **Cause**: User might be offline when trying to access or download a card
- **Handling**: Firestore offline persistence and proper connection state handling

## Firebase Implementation

### Overview

The application leverages Firebase services for data management and real-time features:

1. **Firestore**: Primary data storage for name cards
2. **Realtime Database**: Analytics and real-time status tracking
3. **Firebase Authentication**: User account management
4. **Firebase Hosting**: Application deployment
5. **Offline Persistence**: For seamless offline usage

### Current Implementation

#### 1. Firebase Configuration

The application uses Firebase services for data storage, authentication, and real-time features. The Firebase configuration connects to both Firestore and Realtime Database.

```typescript
// apps/web/src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAnKYbr1YaEL14GtsUcnC7vEmwxx4u6SzM",
  authDomain: "mynamecard-2c393.firebaseapp.com",
  projectId: "mynamecard-2c393",
  storageBucket: "mynamecard-2c393.appspot.com",
  messagingSenderId: "428846201204",
  appId: "1:428846201204:web:05306353548d9541d94cbc",
  measurementId: "G-C78MBVW9G9",
  databaseURL: "https://mynamecard-2c393-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const database = getDatabase(app);

// Enable offline persistence for Firestore
enableIndexedDbPersistence(firestore)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firebase persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firebase persistence not supported in this browser');
    }
  });
```

Both Firestore and Realtime Database are used for different purposes:
- **Firestore**: Stores structured card data, user profiles, and settings
- **Realtime Database**: Tracks analytics, user presence, and real-time statistics

#### 2. Server Implementation

The application includes both client-side functionality and server-side features:

```typescript
// Server implementation in Express.js (server/src/index.ts)
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { generateVCard } from './services/vcardService';
import { CardData, renderCardHTML } from './services/ssrService';

const app = express();
app.use(cors());
app.use(compression());
app.use(express.json());

// API endpoints for vCard generation and server-side rendering
app.get('/api/vcf/:slug', (req, res) => {
  const { slug } = req.params;
  // Generate and return vCard data
});

// For Firebase Functions deployment (server/src/index.firebase.ts)
export const api = functions.https.onRequest(app);
```

#### 3. Database Service Architecture

The application uses two complementary Firebase database services:

1. **Firestore Service**: Core data persistence for cards
   - CRUD operations for name cards with transactional consistency
   - User-specific card management with ownership validation
   - Card limit enforcement (2 cards for free users by default)
   - Offline persistence capabilities
   
2. **Realtime Database Service**: Analytics and real-time features
   - User online status tracking
   - Card view analytics
   - Usage statistics (views, downloads, shares)
   - Real-time activity monitoring

### Firebase Data Model

```
firestore:
  cards/
  ├── {cardId}/
  │   ├── slug: string
  │   ├── firstName: string
  │   ├── lastName: string
  │   ├── organization: string
  │   ├── title: string
  │   ├── email: string
  │   ├── phone: string
  │   ├── website: string (optional)
  │   ├── address: {
  │   │   ├── street: string (optional)
  │   │   ├── city: string (optional)
  │   │   ├── state: string (optional)
  │   │   ├── postalCode: string (optional)
  │   │   └── country: string (optional)
  │   │ }
  │   ├── photo: string (optional) - Base64 or URL
  │   ├── notes: string (optional)
  │   ├── theme: string
  │   ├── userId: string - Reference to authenticated user
  │   ├── active: boolean - Card visibility status
  │   ├── createdAt: timestamp
  │   └── updatedAt: timestamp
  │
  users/
  ├── {userId}/
      ├── email: string
      ├── displayName: string
      ├── photoURL: string (optional)
      ├── plan: string ('free' | 'pro')
      ├── cardLimit: number
      ├── cardsCreated: number
      ├── createdAt: timestamp
      └── updatedAt: timestamp
  │
  admin/
  ├── card_limits/
      ├── free: number
      ├── pro: number
      └── updatedAt: timestamp

realtime-database:
  status/
  ├── {userId}/
  │   ├── isOnline: boolean
  │   ├── lastSeen: timestamp
  │   ├── displayName: string
  │   └── photoURL: string (optional)
  │
  analytics/
  ├── cardViews/
  │   ├── {cardId}/
  │       ├── {timestamp}/
  │           ├── timestamp: ISO date
  │           └── viewerInfo: { isAuthenticated, uid }
  │
  cardActivity/
  ├── {userId}/
  │   ├── {cardId}/
  │       ├── {timestamp}/
  │           ├── activity: 'view' | 'download' | 'share'
  │           └── timestamp: ISO date
  │
  cardStats/
  ├── {cardId}/
      ├── views: number
      ├── downloads: number
      ├── shares: number
      └── lastUpdated: ISO date
```

### Security Rules

#### Firestore Security Rules

```
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      
      // Allow create for authenticated users
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      
      // Allow update and delete for user's own cards
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // User data rules
    match /users/{userId} {
      // Users can only read/write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### Realtime Database Security Rules

```
{
  "rules": {
    ".read": false,
    ".write": false,
    
    "status": {
      "$uid": {
        // Only authenticated users can write their own status
        ".read": true,
        ".write": "auth !== null && auth.uid === $uid"
      }
    },
    
    "analytics": {
      "cardViews": {
        "$cardId": {
          ".read": "auth !== null",
          ".write": true
        }
      }
    },
    
    "cardActivity": {
      "$uid": {
        // Users can only read/write their own card activity
        ".read": "auth !== null && auth.uid === $uid",
        ".write": "auth !== null && auth.uid === $uid"
      }
    },
    
    "cardStats": {
      "$cardId": {
        // Anyone can read card stats, but only authenticated users can update
        ".read": true,
        ".write": "auth !== null"
      }
    }
  }
}
```

### Key Firebase Implementation Features

1. **Offline Support**:
   - Implemented Firestore offline persistence
   - App functions seamlessly offline and syncs when connection is restored

2. **Real-time Analytics**:
   - Card view tracking
   - Download and sharing statistics
   - User activity monitoring

3. **User Authentication**:
   - Email/password authentication
   - Google OAuth integration
   - User profile management

4. **Security**:
   - Comprehensive security rules for both databases
   - Data validation server-side and client-side
   - Protection against unauthorized access

## API Documentation

### Card Interface

```typescript
interface CardAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Card {
  id?: number;
  slug: string;
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  email: string;
  phone: string;
  website?: string;
  address?: CardAddress;
  photo?: string;
  notes?: string;
  theme?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### vCard Generator API

```typescript
/**
 * Generates a vCard formatted string from a card object
 * @param card The card object containing contact information
 * @returns String representation of vCard in version 3.0 format
 */
function generateVCard(card: Card): string
```

### User Authentication Service (Future)

```typescript
// apps/web/src/services/authService.ts
import { auth } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';

export const authService = {
  async register(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  },
  
  async login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  },
  
  async signOut() {
    return firebaseSignOut(auth);
  },
  
  onAuthChange(callback: (user: any) => void) {
    return onAuthStateChanged(auth, callback);
  }
};
```

## Testing Strategy

1. **Unit Tests**: For utility functions and data transformations
   - Test vCard generation with various input data
   - Test form validations
   - Test data transformations

2. **Component Tests**: For UI components and rendering logic
   - Test rendering of cards with different data
   - Test interactive elements
   - Test error states and loading states

3. **Integration Tests**: For database operations and API interactions
   - Test data flow between components
   - Test database CRUD operations
   - Test authentication flow (future)

4. **End-to-End Tests**: For complete user flows   - Create a card and verify persistence
   - Access a card via URL
   - Download vCard and verify content
   - Test offline functionality

## Conclusion

The Smart Name Card application provides a modern solution for digital business cards with vCard download functionality. The current implementation uses client-side storage with IndexedDB, which offers a fast and offline-capable experience. The planned migration to Firestore will enhance the application with cloud storage, user authentication, and cross-device synchronization while maintaining the core functionality.

This documentation covers the current architecture, implementation details, and future plans to help any developer understand and extend the application. The vCard download feature has been successfully implemented and tested with various contact management systems for compatibility.

## License

[MIT License](LICENSE)
