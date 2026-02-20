import { Dashboard } from '../pages/dashboard'
import { DashboardLayout } from '../layouts/DashboardLayout'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SignIn from '../pages/auth/SignIn'
import SignUp from '../pages/auth/SignUp'
import { NotesPage } from '../pages/notes/components/NotesPage'
import { PrivateRoute } from './PrivateRoute'
import { ToastContainer } from 'react-toastify'
import { ShoppingListPage } from '../pages/shopping'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {'Rotas publicas'}
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />

        {'Rotas privadas'}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="tasks"
            element={
              <PrivateRoute>
                <div />
              </PrivateRoute>
            }
          />
          <Route
            path="notes"
            element={
              <PrivateRoute>
                <NotesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="shopping"
            element={
              <PrivateRoute>
                <ShoppingListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="health"
            element={
              <PrivateRoute>
                <div />
              </PrivateRoute>
            }
          />
          <Route
            path="finance"
            element={
              <PrivateRoute>
                <div />
              </PrivateRoute>
            }
          />
          <Route
            path="sleep"
            element={
              <PrivateRoute>
                <div />
              </PrivateRoute>
            }
          />
          <Route
            path="ideas"
            element={
              <PrivateRoute>
                <div />
              </PrivateRoute>
            }
          />
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <div />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}

export default AppRoutes
