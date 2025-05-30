import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CardEditor from './pages/CardEditor'
import PublicCard from './pages/PublicCard'
import SignIn from './pages/SignIn'
import UserProfile from './pages/UserProfile'
import NotFound from './pages/NotFound'
import Onboarding from './pages/Onboarding'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import Navigation from './components/Navigation'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        {/* Navigation */}
        <Navigation />
        
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/create" element={
            <PrivateRoute>
              <CardEditor />
            </PrivateRoute>
          } />
          <Route path="/edit/:id" element={
            <PrivateRoute>
              <CardEditor />
            </PrivateRoute>
          } />          <Route path="/profile" element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          } />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/:slug" element={<PublicCard />} />
          <Route path="/" element={<Onboarding />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
