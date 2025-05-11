# Smart Name Card

A digital business card application that allows users to create, manage, and share their digital business cards with vCard download functionality.

## Architecture Overview

### Tech Stack

- **Frontend**: React with TypeScript, TailwindCSS, Vite
- **Client-side Storage**: IndexedDB (via Dexie.js)
- **Server**: Express.js (for optional server-side functions)
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
- Secure session management
- Profile information management

### Security Rules

Access to data is protected by Firebase Security Rules:
- Firestore rules enforce user-based read/write permissions
- Realtime Database rules protect analytics and user status data
- Public cards are accessible without authentication
- User can only modify their own cards
- Notes/additional information

## Edge Cases & Handling

### 1. Data Retrieval Failures

- **Cause**: IndexedDB might be unavailable or data might be corrupted
- **Handling**: Error state display with appropriate message

### 2. Missing Card Data

- **Cause**: User might access a URL for a non-existent card
- **Handling**: NotFound component displayed with clear message

### 3. Empty Required Fields

- **Cause**: Cards might be created with missing required information
- **Handling**: Form validation prevents creation, display gracefully handles missing optional fields

### 4. Non-Latin Character Support

- **Cause**: International users may use non-Latin characters in their names/information
- **Handling**: UTF-8 encoding support in vCard generation

### 5. Large Photo Handling

- **Cause**: User might upload very large profile photos
- **Handling**: Image compression before storage, fallback for failed photo inclusion in vCard

### 6. Browser Compatibility

- **Cause**: Older browsers might not support all features
- **Handling**: Polyfills where necessary, graceful degradation for unsupported features

### 7. Offline Operation

- **Cause**: User might be offline when trying to access or download a card
- **Handling**: Proper offline detection and appropriate messaging

## Firestore Integration

### Overview

The application uses Firebase Firestore for data persistence, providing:

1. Cross-device access to cards
2. Better data durability
3. Real-time updates
4. User authentication and authorization
5. Sharing and collaboration features

### Implementation Plan

#### 1. Firebase Configuration

```typescript
// apps/web/src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
```

#### 2. Firestore Database Service

```typescript
// apps/web/src/services/firestoreService.ts
import { collection, doc, setDoc, getDoc, query, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { Card } from '../db/db';

const COLLECTION_NAME = 'cards';

export const firestoreService = {
  async createCard(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    const now = new Date();
    const newCard = {
      ...card,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = doc(collection(firestore, COLLECTION_NAME));
    await setDoc(docRef, newCard);
    
    return {
      ...newCard,
      id: docRef.id
    };
  },
  
  async getCardBySlug(slug: string): Promise<Card | null> {
    const q = query(collection(firestore, COLLECTION_NAME), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      ...doc.data() as Omit<Card, 'id'>,
      id: doc.id
    };
  },
  
  // Additional CRUD operations for cards
};
```

#### 3. Data Migration Strategy

1. Create a migration utility to move data from IndexedDB to Firestore
2. Implement version detection to trigger migration when needed
3. Provide fallback to IndexedDB when offline

### Firestore Data Model

```
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
│   ├── ownerId: string - Reference to users collection
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
    └── createdAt: timestamp
```

### Security Rules

```
service cloud.firestore {
  match /databases/{database}/documents {
    match /cards/{cardId} {
      // Anyone can read public cards
      allow read: if true;
      
      // Only authenticated owner can write
      allow write: if request.auth != null && request.auth.uid == resource.data.ownerId;
      
      // Only authenticated users can create, with ownership
      allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
    }
    
    match /users/{userId} {
      // Users can only read and write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Edge Cases with Firestore Implementation

1. **Offline Access**:
   - Solution: Enable Firestore offline persistence
   - Sync changes when connection is restored

2. **Quota Limits**:
   - Solution: Implement rate limiting and data size checks

3. **Slug Uniqueness**:
   - Solution: Use transactions to check uniqueness before writes

4. **Image Storage**:
   - Solution: Move to Firebase Storage for photos larger than 1MB

5. **Data Migration**:
   - Solution: Background task with progress indication

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
