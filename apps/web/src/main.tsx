import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import { logEnvironmentInfo } from './config/environment'
import AuthProvider from './contexts/AuthContext'
import { databaseService } from './services/databaseService'

// Log environment info for development debugging
logEnvironmentInfo()

// Initialize the database service
if (databaseService.getCurrentUser()) {
  console.log('User is authenticated. Checking if migration is needed.')
  if (!databaseService.isMigrationComplete()) {
    console.log('Migration not completed yet. Migration can be started manually.')
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </I18nextProvider>
  </React.StrictMode>,
)
