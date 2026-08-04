import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import SupabaseBanner from './components/SupabaseBanner'
import Today from './pages/Today'
import Calendar from './pages/Calendar'
import Tasks from './pages/Tasks'
import Rituals from './pages/Rituals'
import Content from './pages/Content'
import { PrioritiesProvider } from './context/PrioritiesContext'
import { ScheduleProvider } from './context/ScheduleContext'
import { RitualsProvider } from './context/RitualsContext'
import { ContentProvider } from './context/ContentContext'

function AppProviders({ children }) {
  return (
    <PrioritiesProvider>
      <ScheduleProvider>
        <RitualsProvider>
          <ContentProvider>{children}</ContentProvider>
        </RitualsProvider>
      </ScheduleProvider>
    </PrioritiesProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <SupabaseBanner />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Today />} />
            <Route path="/jour/:date" element={<Today />} />
            <Route path="/calendrier" element={<Calendar />} />
            <Route path="/taches" element={<Tasks />} />
            <Route path="/rituels" element={<Rituals />} />
            <Route path="/contenu" element={<Content />} />
          </Routes>
        </main>
        <BottomNav />
      </AppProviders>
    </BrowserRouter>
  )
}

export default App
