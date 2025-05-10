# MyNameCard Application

## Project Overview
MyNameCard is a digital business card platform that allows users to create, manage, and share their digital business cards. The application follows a modern web architecture using React, TypeScript, and Tailwind CSS with a robust design system.

## Features

- Sign in with Google
- Create one free digital business card
- Generate QR codes for physical business cards
- Share your contact info via public links
- Download contacts as .vcf format
- Emoji-based icons for better accessibility and performance

## Getting Started

### Prerequisites

- Node.js 16+ and npm/pnpm
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project created in the Firebase Console

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

### Environment Setup

The Firebase configuration is already set up with the provided values in the project.

## Development Workflow

1. Create feature branches from `main`
2. Follow TDD: Write tests first, then implement
3. Ensure linting and type checking passes: `npm run lint`
4. Run tests: `npm run test`
5. Submit PR with completed checklist

## Project Structure

- `/apps/web`: React frontend application
- `/apps/functions`: Firebase Cloud Functions (if used)
- `/packages`: Shared libraries and utilities

## License

MIT

## Next Steps

1. Migrate legacy components to use the design system
2. Update CardForm to use the Input component from the design system
3. Add more complex components like DataTable, Modal, and Tabs
4. Implement theme switching (light/dark mode)
