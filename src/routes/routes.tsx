import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SignIn from '../pages/auth/signIn'
import SignUp from '../pages/auth/signUp'
import { NotesPage } from '../pages/notes/components/notesPage'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/notes" element={<NotesPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
