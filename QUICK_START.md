# Quick Start Guide

This guide provides step-by-step instructions to quickly get started with the Smart Name Card application using the simplified authentication system.

## Setup

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   cd mynamecard
   npm install
   cd apps/web
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   This will start the web application at http://localhost:5173

## Authentication

The application uses a simplified authentication system:

- **Username**: `test`
- **Password**: `test`

Just enter these credentials on the login page to access all features.

## Features

After logging in, you can:

1. **Create a new card**: Click "Create New Card" on the dashboard
2. **Edit existing cards**: Click "Edit" on any card on your dashboard
3. **View your cards**: All your cards are displayed on the dashboard
4. **Share cards**: Get a public URL for any card you create
5. **Download vCard**: Generate .vcf files for easy contact sharing

## Data Storage

All data is stored in-memory during your session. This means:
- Your changes will persist while the app is running
- Data will be reset when you refresh the page or restart the server

## Development Workflow

1. **Make changes to the code**
2. **Test in the browser**
3. **No build required** - changes are applied in real-time with hot module replacement

## Project Structure

- `src/services/simpleAuthService.ts`: Authentication logic
- `src/services/simpleUserService.ts`: User profile management
- `src/services/simpleCardService.ts`: Card data management
- `src/contexts/AuthContext.tsx`: Authentication context provider
- `src/pages/`: All application pages
- `src/components/`: Reusable UI components
- `src/locales/`: Internationalization files

## Troubleshooting

- **Login issues**: Make sure you're using "test" as both username and password
- **Missing cards**: Cards are stored in-memory and will be reset on page refresh
- **Styling issues**: The app uses TailwindCSS, check the class names

## Next Steps

- Read `SIMPLIFIED_AUTH_GUIDE.md` for details on the authentication system
- Explore `FIREBASE_REMOVAL_SUMMARY.md` to understand the architecture changes
