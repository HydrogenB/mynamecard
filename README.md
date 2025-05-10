# Smart Name Card

A web application for creating and sharing digital business cards with QR codes.

## Features

- Sign in with Google
- Create one free digital business card
- Generate QR codes for physical business cards
- Share your contact info via public links
- Download contacts as .vcf format

## Tech Stack

- React + Vite for frontend
- Firebase (Authentication, Firestore, Cloud Functions, Hosting)
- Tailwind CSS for styling
- TypeScript for type safety

## Local Development Setup

### Prerequisites

- Node.js 16+ and npm/pnpm
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project created in the Firebase Console

### Environment Setup

1. Clone the repository
2. Create `.env` files:

**Root `.env`**:
```
FIREBASE_PROJECT_ID=your-project-id
```

**Web App `.env.local`** (in `apps/web`):
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Installation

```bash
# Install dependencies
npm install

# Start web development server
npm run dev:web

# Start Firebase emulators
npm run emulators

# Start functions development
npm run dev:functions
```

## Deployment

```bash
# Deploy to Firebase
npm run deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

## Development Workflow

1. Create feature branches from `main`
2. Follow TDD: Write tests first, then implement
3. Ensure linting and type checking passes: `npm run lint`
4. Run tests: `npm run test`
5. Submit PR with completed checklist

## Project Structure

- `/apps/web`: React frontend application
- `/apps/functions`: Firebase Cloud Functions
- `/.github/workflows`: CI/CD configuration
- `/firestore.rules`: Firestore security rules
- `/firebase.json`: Firebase configuration

## License

MIT
