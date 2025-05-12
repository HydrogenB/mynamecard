/// <reference types="vite/client" />

// Define the structure of the environment variables
interface EnvironmentConfig {
  apiUrl: string;
  appEnv: string;
  isProduction: boolean;
  isDevelopment: boolean;
  firebaseApiKey: string;
}

// Read environment variables from Vite's import.meta.env
export const env: EnvironmentConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  isProduction: import.meta.env.VITE_APP_ENV === 'production',
  isDevelopment: import.meta.env.VITE_APP_ENV !== 'production',
  firebaseApiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB1b0fKw8PCBw-slGJa7N1cMUSNTnaxchY',
};

// Helper function to log environment info (useful for debugging)
export const logEnvironmentInfo = (): void => {
  if (env.isDevelopment) {
    console.log(`Running in ${env.appEnv} environment`);
    console.log(`API URL: ${env.apiUrl}`);
  }
};
