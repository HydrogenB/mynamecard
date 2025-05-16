# Smart Name Card

A digital business card application that allows users to create, manage, and share their digital business cards with vCard download functionality. The application uses a simplified authentication system and in-memory storage for easy setup and development.

## Current Status

This project has been completely refactored to use a simplified architecture without external dependencies:

- ✅ Simple authentication system (username: "test" / password: "test")
- ✅ In-memory card storage for easy development
- ✅ Basic user profile management
- ✅ No external dependencies or API keys required
- ✅ Clean codebase with fresh start approach
- ✅ Simplified data services
- ✅ Card management functionality
- ✅ Easy to understand architecture
- ✅ Development-ready environment

## Architecture Overview

### Tech Stack

- **Frontend**: React with TypeScript, TailwindCSS, Vite
- **Data Storage**: In-memory JavaScript objects
- **Authentication**: Simple in-memory auth service (username: test, password: test)
- **Server**: Express.js (for optional server-side features)
- **Internationalization**: i18next
- **Data Validation**: Zod (schemas)
- **Build Tools**: Vite, PostCSS

### Project Structure

This project is a monorepo containing:

- `apps/web`: React web application (client-side)
- `server`: Node.js server (API and server-side rendering)

## API Flow

The application uses a simplified in-memory service architecture:

1. **User Login**: Simple authentication with fixed credentials (test/test)
2. **Create Card**: Creates a card in memory with user ownership
3. **Edit Card**: Updates existing cards with verification of ownership
4. **View Public Card**: Retrieves card by slug from memory
5. **Download vCard**: Generates and provides .vcf file for contacts
6. **Share Card**: Provides sharing functionality
7. **User Profile**: Basic profile management
8. **Card Limits**: Enforces usage limits based on plan type

## Development Setup

### Simplified Configuration

This project uses a simplified architecture that doesn't require any API keys or external services:

1. No environment variables are needed for development
2. The authentication system uses a fixed username ("test") and password ("test")
3. All data is stored in-memory during the session

> **Important Note**: This application uses a standalone authentication system with in-memory storage. No database setup is required!

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
# Run the web app in development mode
cd apps/web && npm run dev
```

This will start:
- The web app at http://localhost:5173

### Authentication

To login to the application:
- Username: `test`
- Password: `test`

## Building for Production

```bash
# Build the web app
cd apps/web && npm run build
```

The built files will be available in the `apps/web/dist` directory.
```

## Deployment

This application can be deployed to any standard web hosting service that supports static sites and Node.js servers.

### Building for Deployment

```bash
# Build the entire application
npm run build
```

This will:
1. Build the web frontend (in `apps/web/dist`)
2. Build the server (in `server/dist`)

### Deployment Options

You can deploy the application to:

1. **Static hosting** (web frontend only)
   - Upload the contents of `apps/web/dist` to any static hosting service
   - Note: Without the backend, some features like vCard generation may be limited

2. **Full-stack hosting** (recommended)
   - Deploy both the web frontend and the server to a platform that supports Node.js
   - Configure the server to serve the static files from the web frontend

### Testing Your Deployment

After deployment, verify that:
1. You can access the application
2. You can log in with the test credentials
3. You can create and view cards

## Running the Complete Stack Locally

To run both the frontend and backend locally:

```bash
# Start both the web frontend and server
npm run dev
```

This will start:
- The web app at http://localhost:5173
- The API server at http://localhost:3000

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
