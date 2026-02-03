import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SignIn from '../pages/auth/signIn'
import SignUp from '../pages/auth/signUp'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
