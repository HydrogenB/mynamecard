# Simplified Authentication System

This document explains the simplified authentication system implemented in the Smart Name Card application after removing Firebase dependencies.

## Overview

The application now uses a simplified, in-memory authentication system that only accepts a fixed username and password:

- **Username**: `test`
- **Password**: `test`

This system replaces the Firebase Authentication that was previously used.

## Key Components

### 1. Simple Auth Service (`simpleAuthService.ts`)

This service handles user authentication with the following features:
- Login with fixed credentials (username: "test", password: "test")
- Logout functionality
- Current user state management

```typescript
// Example usage
import { simpleAuthService } from '../services/simpleAuthService';

// Login
await simpleAuthService.signIn("test", "test");

// Check if user is logged in
const isLoggedIn = simpleAuthService.isAuthenticated();

// Get current user
const user = simpleAuthService.currentUser;

// Logout
await simpleAuthService.signOut();
```

### 2. Simple User Service (`simpleUserService.ts`)

This service manages user profiles with the following features:
- Retrieving user profile data
- Updating user profile information

```typescript
// Example usage
import { simpleUserService } from '../services/simpleUserService';

// Get user profile
const userProfile = await simpleUserService.getUserProfile();

// Update user profile
await simpleUserService.updateUserProfile({
  displayName: "Test User",
  email: "test@example.com"
});
```

### 3. Simple Card Service (`simpleCardService.ts`)

This service handles card management with the following features:
- Creating, updating, and deleting cards
- Retrieving cards by various criteria

```typescript
// Example usage
import { simpleCardService } from '../services/simpleCardService';

// Get all cards
const cards = await simpleCardService.getUserCards();

// Create new card
const newCard = await simpleCardService.createCard({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com"
});
```

## Auth Context

The AuthContext has been updated to use the simplified authentication system:

```typescript
// Using the AuthContext
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  
  const handleLogin = async () => {
    await login("test", "test");
  };
  
  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.displayName}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

## Benefits

1. **Simplicity**: Easy to understand and modify
2. **No Configuration**: No external services or API keys required
3. **Predictable Behavior**: Fixed credentials make testing straightforward
4. **Fast Development**: Quick startup with no external dependencies

## Limitations

1. **Single User**: Only one hardcoded user is available
2. **No Persistence**: User session is lost on page refresh
3. **No Security**: Not suitable for production use
4. **In-Memory Only**: Data is lost when the application is restarted

## Future Enhancements

To improve this system, consider:

1. Adding local storage persistence for user session
2. Implementing a more robust user management system
3. Adding token-based authentication for API requests
4. Creating a configurable user database for multiple users
