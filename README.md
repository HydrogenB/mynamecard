# MyNameCard Application

## Project Overview
MyNameCard is a digital business card platform that allows users to create, manage, and share their digital business cards. The application follows a modern web architecture using React, TypeScript, and Tailwind CSS with a robust design system.

## Features

- Sign in with Google
- Create one free digital business card
- Generate QR codes for physical business cards
- Share your contact info via public links
- Download contacts as .vcf format

## Repository Structure
```
mynamecard/
├── apps/
│   ├── web/                  # Frontend React application
│   │   ├── public/           # Static assets
│   │   ├── src/
│   │   │   ├── assets/       # Application assets (images, icons)
│   │   │   ├── components/   # Legacy UI components
│   │   │   ├── design-system/# Design system components
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── pages/        # Page components
│   │   │   ├── utils/        # Utility functions
│   │   │   ├── App.tsx       # Main application component
│   │   │   ├── index.css     # Global styles
│   │   │   └── main.tsx      # Application entry point
│   │   ├── tailwind.config.js# Tailwind CSS configuration
│   │   └── package.json      # Frontend dependencies
│   └── api/                  # Backend API (if applicable)
├── packages/                 # Shared libraries and utilities
└── README.md                 # This file
```

## Technology Stack
- **Frontend Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Hooks (useContext)
- **Routing**: React Router v6
- **Internationalization**: Custom i18n hook
- **QR Code Generation**: qrcode.react

## Design System

### Design Foundations

The design system is built on the following foundations:

#### Colors
- **Primary**: Blue palette (#0ea5e9)
- **Secondary**: Slate palette (#64748b)
- Additional colors: white, black, red, green

#### Typography
- **Font Family**: 'Inter', sans-serif
- **Text Styles**: 
  - h1, h2, h3, h4 (headings)
  - body1, body2 (body text)
  - caption (small text)
  - button (button text)

#### Spacing
- Consistent spacing scale from 0 to 24 (0rem to 6rem)
- Breakpoints: xs, sm, md, lg, xl, 2xl
- Container widths: sm, md, lg, xl

### Components

The design system includes the following components:

#### 1. Button
- **Variants**: primary, secondary, outline, link
- **Sizes**: sm, md, lg
- **Features**: fullWidth, isLoading, icons (left/right), link functionality
- **Props**:
  ```typescript
  {
    variant?: 'primary' | 'secondary' | 'outline' | 'link';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    as?: 'button' | 'link';
    to?: string;
    external?: boolean;
  }
  ```

#### 2. Card
- **Variants**: default, outline, elevated
- **Padding**: none, sm, md, lg
- **Props**:
  ```typescript
  {
    variant?: 'default' | 'outline' | 'elevated';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    isHighlighted?: boolean;
    maxWidth?: string;
  }
  ```

#### 3. Text
- Uses typography styles (h1-h4, body1-2, etc.)
- **Features**: alignment, color, truncation
- **Props**:
  ```typescript
  {
    variant?: TextStyleKey;
    as?: ElementType;
    color?: string;
    align?: 'left' | 'center' | 'right' | 'justify';
    truncate?: boolean;
  }
  ```

#### 4. Input
- **Features**: labels, error messages, helper text, icons
- **Props**:
  ```typescript
  {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fullWidth?: boolean;
    isRequired?: boolean;
  }
  ```

#### 5. Badge
- **Variants**: primary, secondary, success, warning, error, info
- **Sizes**: sm, md, lg
- **Props**:
  ```typescript
  {
    variant?: BadgeVariant;
    size?: BadgeSize;
  }
  ```

#### 6. Spinner
- **Sizes**: xs, sm, md, lg
- **Colors**: primary, white, secondary
- **Props**:
  ```typescript
  {
    size?: SpinnerSize;
    color?: string;
  }
  ```

#### 7. Container
- **Features**: sizing, centering, fluid width, padding
- **Props**:
  ```typescript
  {
    size?: ContainerWidthKey;
    centered?: boolean;
    fluid?: boolean;
    py?: number;
    px?: number;
  }
  ```

#### 8. QRCode
- **Features**: Customizable size, downloadable
- **Props**:
  ```typescript
  {
    value: string;
    size?: number;
    includeMargin?: boolean;
    imageSettings?: {...};
    downloadable?: boolean;
    fileName?: string;
    cardPadding?: 'none' | 'sm' | 'md' | 'lg';
  }
  ```

#### 9. Other Components
- IconButton: Button displaying only an icon
- Divider: Horizontal or vertical dividers
- LanguageSwitcher: Toggle between languages

## Application Pages

### 1. Pricing Page
- Displays different pricing plans
- Highlights current plan
- "Popular" badge on recommended plan
- Login CTA for non-authenticated users

### 2. Home Page (inferred)
- Marketing landing page

### 3. Dashboard (inferred)
- User's card management interface

### 4. Card View/Edit (inferred)
- Form to create/edit digital business cards

## Authentication
- Login/Sign Up functionality via `useAuth` hook
- User state management

## Internationalization
- Multi-language support (English and Thai)
- Custom `useI18n` hook for translations
- Language switching via the LanguageSwitcher component

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

## Development Guidelines

### Adding New Components
1. Create a new folder in `src/design-system/components/[ComponentName]`
2. Create the following files:
   - `[ComponentName].tsx`: Component implementation
   - `index.ts`: Export file
3. Export the component in `src/design-system/index.ts`
4. Follow existing patterns for props, styling, and component structure

### Styling Guidelines
1. Use Tailwind CSS classes for styling
2. Follow the design token system for colors, spacing, and typography
3. Create consistent variants and sizes across related components
4. Use the existing design foundations (colors, typography, spacing)

### Code Organization
1. Keep components focused on a single responsibility
2. Implement proper TypeScript typing for components and props
3. Use React's forwardRef when creating form components
4. Follow accessibility best practices (aria attributes, keyboard navigation)

## Running the Application

### Development Mode
```bash
# Navigate to the web application
cd apps/web

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production
```bash
# Navigate to the web application
cd apps/web

# Build the application
npm run build

# Preview the built application
npm run preview
```

## Next Development Steps
1. Migrate legacy components to use the design system
2. Update CardForm to use the Input component from the design system
3. Add more complex components like DataTable, Modal, and Tabs
4. Implement theme switching (light/dark mode)
5. Add animation utilities and transitions
6. Create a Storybook implementation for component documentation

## API Integration
The application likely connects to a backend API for:
- User authentication
- Card data storage and retrieval
- Analytics

Refer to the API documentation for endpoint specifications and data formats.

## Additional Notes
- The application uses a mobile-first responsive design approach
- Form validation is handled via zod schema validation
- The UI is optimized for both desktop and mobile views
