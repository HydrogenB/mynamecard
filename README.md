# Smart Name Card

A digital business card application that allows users to create, manage, and share their digital business cards.

## Project Structure

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
