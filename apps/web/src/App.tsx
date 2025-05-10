import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CardEditor from './pages/CardEditor'
import PublicCard from './pages/PublicCard'
import NotFound from './pages/NotFound'
import { LanguageProvider } from './contexts/LanguageContext'

function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<CardEditor />} />
        <Route path="/edit/:id" element={<CardEditor />} />
        <Route path="/:slug" element={<PublicCard />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LanguageProvider>
  )
}

export default App
