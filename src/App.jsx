import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import SupabaseBanner from './components/SupabaseBanner'
import Today from './pages/Today'
import Calendar from './pages/Calendar'
import Tasks from './pages/Tasks'
import Rituals from './pages/Rituals'
import Content from './pages/Content'
import Budget from './pages/Budget'
import Savings from './pages/Savings'
import Business from './pages/Business'
import TodoList from './pages/TodoList'
import { PrioritiesProvider } from './context/PrioritiesContext'
import { ScheduleProvider } from './context/ScheduleContext'
import { RitualsProvider } from './context/RitualsContext'
import { ContentProvider } from './context/ContentContext'
import { RecurringTasksProvider } from './context/RecurringTasksContext'
import { NoteProvider } from './context/NoteContext'
import { BudgetProvider } from './context/BudgetContext'
import { SavingsProvider } from './context/SavingsContext'
import { BusinessProvider } from './context/BusinessContext'
import { TodoProvider } from './context/TodoContext'

function AppProviders({ children }) {
  return (
    <PrioritiesProvider>
      <ScheduleProvider>
        <RitualsProvider>
          <ContentProvider>
            <RecurringTasksProvider>
              <NoteProvider>
                <BudgetProvider>
                  <SavingsProvider>
                    <BusinessProvider>
                      <TodoProvider>{children}</TodoProvider>
                    </BusinessProvider>
                  </SavingsProvider>
                </BudgetProvider>
              </NoteProvider>
            </RecurringTasksProvider>
          </ContentProvider>
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
            <Route path="/budget" element={<Budget />} />
            <Route path="/economies" element={<Savings />} />
            <Route path="/business" element={<Business />} />
            <Route path="/todo" element={<TodoList />} />
          </Routes>
        </main>
        <BottomNav />
      </AppProviders>
    </BrowserRouter>
  )
}

export default App
